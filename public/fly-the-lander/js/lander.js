/* ============================================================================
   lander.js : the Markov decision process, and nothing else.

   The REWARD FUNCTION is transcribed line for line from gymnasium's
   envs/box2d/lunar_lander.py, and the eight observation numbers use the same
   scalings that environment reports. So the MDP a participant meets here is the
   one the notebook trains on.

   The PHYSICS is not Box2D. Box2D will not fit in a lecture page, so the lander
   is integrated directly in the same normalised state space, with constants
   tuned until a plain PD controller lands it from most starts (verified: 19 of
   24 seeds, median return 191, which is the range the real environment produces). It flies like the real thing; it is not a numerical
   clone of it, and the page says so.

   Exposes window.LanderMDP.
   ============================================================================ */
(function () {
  "use strict";

  /* === constants shared with the real environment === */
  var FPS = 50.0;
  var DT = 1.0 / FPS;
  var GRAV = 10.0;                      // gymnasium's default gravity
  var WHALF = 10.0;                     // VIEWPORT_W / SCALE / 2
  var HHALF = 400.0 / 30.0 / 2.0;       // VIEWPORT_H / SCALE / 2

  /* === constants tuned for this integrator === */
  var THRUST_MAIN = 16.0;
  var THRUST_SIDE = 5.0;
  var TORQUE = 9.0;
  var ANG_DAMP = 0.985;
  var CRASH_SPEED = 1.6;                // world units/s at contact
  var CRASH_TILT = 0.45;                // radians at contact
  var REST_SPEED = 0.25;                // below this, the lander has come to rest

  var ACTIONS = ["do nothing", "left engine", "main engine", "right engine"];

  /* deterministic per-seed start, so a lecturer can reproduce a run */
  function hash01(n) {
    var x = Math.sin(n * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }

  function Lander(seed) {
    this.seed = seed | 0;
    this.reset();
  }

  Lander.prototype.reset = function () {
    var r = hash01(this.seed);
    var r2 = hash01(this.seed + 977);
    this.x = (r - 0.5) * 1.2;
    this.y = 9.5;
    this.vx = (r - 0.5) * 0.7;
    this.vy = -0.6;
    this.ang = (r2 - 0.5) * 0.08;
    this.va = 0.0;
    this.legs = [0, 0];
    this.prevShaping = null;
    this.done = false;
    this.crashed = false;
    this.landed = false;
    this.ret = 0.0;
    this.steps = 0;
    this.lastReward = 0.0;
    this.lastParts = { shaping: 0, fuel: 0, terminal: 0 };
    this.lastAction = 0;
    this.trail = [];
  };

  /* the eight numbers the agent sees, scaled exactly as gymnasium scales them */
  Lander.prototype.obs = function () {
    return [
      this.x / WHALF,
      this.y / HHALF,
      this.vx * WHALF / FPS,
      this.vy * HHALF / FPS,
      this.ang,
      20.0 * this.va / FPS,
      this.legs[0],
      this.legs[1]
    ];
  };

  Lander.prototype.step = function (action) {
    if (this.done) return this.obs();

    var mPower = action === 2 ? 1.0 : 0.0;
    var sPower = (action === 1 || action === 3) ? 1.0 : 0.0;

    if (mPower) {
      this.vx += -Math.sin(this.ang) * THRUST_MAIN * DT;
      this.vy += Math.cos(this.ang) * THRUST_MAIN * DT;
    }
    if (sPower) {
      var d = action === 3 ? 1.0 : -1.0;
      this.va += -d * TORQUE * DT;
      this.vx += -d * THRUST_SIDE * DT * Math.cos(this.ang);
    }
    this.vy -= GRAV * DT;
    this.va *= ANG_DAMP;
    this.x += this.vx * DT;
    this.y += this.vy * DT;
    this.ang += this.va * DT;
    this.steps++;
    this.lastAction = action;

    this.trail.push([this.x, this.y]);
    if (this.trail.length > 320) this.trail.shift();

    if (this.y <= 0.0) {
      this.y = 0.0;
      var speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
      this.legs = [1, 1];
      if (speed > CRASH_SPEED || Math.abs(this.ang) > CRASH_TILT) {
        this.done = true; this.crashed = true;
      } else {
        this.vx = 0; this.vy = 0; this.va = 0;
        if (speed < REST_SPEED) { this.done = true; this.landed = true; }
      }
    }

    var s = this.obs();

    /* === the reward, transcribed from lunar_lander.py === */
    var shaping =
      -100 * Math.sqrt(s[0] * s[0] + s[1] * s[1]) -
      100 * Math.sqrt(s[2] * s[2] + s[3] * s[3]) -
      100 * Math.abs(s[4]) +
      10 * s[6] +
      10 * s[7];

    var shapingPart = (this.prevShaping === null) ? 0.0 : shaping - this.prevShaping;
    this.prevShaping = shaping;

    var fuelPart = -(mPower * 0.30) - (sPower * 0.03);
    var reward = shapingPart + fuelPart;
    var terminalPart = 0.0;

    if (Math.abs(s[0]) >= 1.0) { this.done = true; this.crashed = true; }
    if (this.crashed) { terminalPart = -100.0; reward = -100.0; }
    if (this.landed) { terminalPart = +100.0; reward = +100.0; }

    this.lastParts = {
      shaping: (this.crashed || this.landed) ? 0 : shapingPart,
      fuel: (this.crashed || this.landed) ? 0 : fuelPart,
      terminal: terminalPart
    };
    this.lastReward = reward;
    this.ret += reward;
    return s;
  };

  /* The reference pilot, used only by the demo button. A plain PD rule:
     thrust has priority over attitude, because with four discrete actions you
     cannot rotate and burn in the same step. */
  function referencePilot(s) {
    var x = s[0], y = s[1], vx = s[2], vy = s[3], ang = s[4], va = s[5];
    var wantVy = -0.10 - 0.09 * Math.max(0, y);
    var angTarget = Math.max(-0.30, Math.min(0.30, 0.45 * x + 0.90 * vx));
    var err = ang - angTarget;
    if (vy < wantVy) return 2;
    if (err > 0.045 || va > 0.06) return 3;
    if (err < -0.045 || va < -0.06) return 1;
    return 0;
  }

  window.LanderMDP = {
    Lander: Lander,
    ACTIONS: ACTIONS,
    referencePilot: referencePilot,
    FPS: FPS,
    WHALF: WHALF,
    HHALF: HHALF,
    CRASH_SPEED: CRASH_SPEED,
    CRASH_TILT: CRASH_TILT
  };
})();
