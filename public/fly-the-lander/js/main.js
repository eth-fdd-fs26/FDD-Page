/* ============================================================================
   main.js : canvas rendering, keyboard and touch input, and the live readouts.
   The MDP itself lives in lander.js and is never reached into from here except
   through step() and obs().
   ============================================================================ */
(function () {
  "use strict";

  var M = window.LanderMDP;
  var canvas = document.getElementById("stage");
  var ctx = canvas.getContext("2d");

  var STATE_ROWS = [
    ["x", "how far left or right of the pad"],
    ["y", "how high above the pad"],
    ["vx", "sideways speed"],
    ["vy", "falling speed"],
    ["angle", "tilt"],
    ["spin", "how fast the tilt is changing"],
    ["leg 1", "touching the ground"],
    ["leg 2", "touching the ground"]
  ];

  var seed = 1;
  var game = new M.Lander(seed);
  var held = 0;          // action currently requested by the player
  var demo = false;
  var raf = null;

  /* === colours read from the stylesheet, so the theme toggle works === */
  function css(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  /* === build the state table once === */
  (function buildStateTable() {
    var t = document.getElementById("state-table");
    STATE_ROWS.forEach(function (row, i) {
      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td class="sname">' + row[0] + "</td>" +
        '<td class="sdesc">' + row[1] + "</td>" +
        '<td class="sval" id="s' + i + '">0.00</td>';
      t.appendChild(tr);
    });
  })();

  /* === drawing === */
  function worldToPx(wx, wy) {
    // world x in [-10, 10], y in [0, 13.33] maps into the canvas with a margin
    var padY = 46;
    var px = canvas.width / 2 + (wx / M.WHALF) * (canvas.width / 2 - 18);
    var py = canvas.height - padY - (wy / (M.HHALF * 1.55)) * (canvas.height - padY - 20);
    return [px, py];
  }

  function drawGround() {
    var padY = 46;
    var y = canvas.height - padY;
    ctx.strokeStyle = css("--rule-strong");
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();

    // the landing pad, between the flags
    var padHalf = (0.22 / 1.0) * (canvas.width / 2 - 18);
    ctx.strokeStyle = css("--green");
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - padHalf, y);
    ctx.lineTo(canvas.width / 2 + padHalf, y);
    ctx.stroke();

    [-1, 1].forEach(function (side) {
      var fx = canvas.width / 2 + side * padHalf;
      ctx.strokeStyle = css("--faint");
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(fx, y); ctx.lineTo(fx, y - 26); ctx.stroke();
      ctx.fillStyle = css("--amber");
      ctx.beginPath();
      ctx.moveTo(fx, y - 26); ctx.lineTo(fx + side * 13, y - 21); ctx.lineTo(fx, y - 16);
      ctx.closePath(); ctx.fill();
    });
  }

  function drawTrail() {
    if (game.trail.length < 2) return;
    ctx.strokeStyle = css("--purple");
    ctx.globalAlpha = 0.30;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (var i = 0; i < game.trail.length; i++) {
      var p = worldToPx(game.trail[i][0], game.trail[i][1]);
      if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function drawLander() {
    var p = worldToPx(game.x, game.y);
    ctx.save();
    ctx.translate(p[0], p[1]);
    ctx.rotate(-game.ang);

    // exhaust first, so the body sits on top
    if (!game.done && game.lastAction === 2) {
      ctx.fillStyle = css("--amber");
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.moveTo(-6, 9); ctx.lineTo(6, 9); ctx.lineTo(0, 9 + 16 + Math.random() * 8);
      ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
    }
    if (!game.done && (game.lastAction === 1 || game.lastAction === 3)) {
      var d = game.lastAction === 3 ? 1 : -1;
      ctx.fillStyle = css("--amber");
      ctx.globalAlpha = 0.75;
      ctx.beginPath();
      ctx.moveTo(d * 10, -2); ctx.lineTo(d * 10, 4); ctx.lineTo(d * (10 + 11), 1);
      ctx.closePath(); ctx.fill();
      ctx.globalAlpha = 1;
    }

    ctx.fillStyle = game.crashed ? css("--red") : css("--blue");
    ctx.strokeStyle = css("--ink");
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-11, -9); ctx.lineTo(11, -9); ctx.lineTo(13, 3);
    ctx.lineTo(0, 10); ctx.lineTo(-13, 3);
    ctx.closePath(); ctx.fill(); ctx.stroke();

    ctx.strokeStyle = game.legs[0] ? css("--green") : css("--ink");
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-9, 6); ctx.lineTo(-15, 15); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(9, 6); ctx.lineTo(15, 15); ctx.stroke();
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGround();
    drawTrail();
    drawLander();
  }

  /* === readouts === */
  function fmt(v, d) { return (v >= 0 ? "+" : "") + v.toFixed(d === undefined ? 2 : d); }

  function updatePanels() {
    var s = game.obs();
    for (var i = 0; i < 8; i++) {
      var el = document.getElementById("s" + i);
      el.textContent = (i >= 6) ? (s[i] ? "yes" : "no") : fmt(s[i]);
      el.classList.toggle("on", i >= 6 && !!s[i]);
    }
    var p = game.lastParts;
    document.getElementById("r-shaping").textContent = fmt(p.shaping);
    document.getElementById("r-fuel").textContent = fmt(p.fuel);
    document.getElementById("r-terminal").textContent = fmt(p.terminal);
    document.getElementById("row-terminal").classList.toggle("live", p.terminal !== 0);
    document.getElementById("r-step").textContent = fmt(game.lastReward);
    document.getElementById("r-return").textContent = fmt(game.ret, 1);
    document.getElementById("step-count").textContent = "step " + game.steps;

    var pct = Math.max(0, Math.min(1, (game.ret + 200) / 400));
    var meter = document.getElementById("meter");
    meter.style.width = (pct * 100).toFixed(1) + "%";
    meter.classList.toggle("good", game.ret >= 200);
    meter.classList.toggle("bad", game.ret < 0);

    var v = document.getElementById("verdict");
    if (game.done) {
      v.hidden = false;
      v.className = "verdict " + (game.landed ? "ok" : "no");
      v.textContent = game.landed
        ? "Landed. Return " + game.ret.toFixed(1) + " over " + game.steps + " steps."
        : (game.steps >= 1000
            ? "Out of time at 1000 steps, still flying. Return " + game.ret.toFixed(1) + "."
            : "Crashed. Return " + game.ret.toFixed(1) + " over " + game.steps + " steps.");
    } else {
      v.hidden = true;
    }
  }

  /* === loop === */
  function tick() {
    if (!game.done) {
      var a = demo ? M.referencePilot(game.obs()) : held;
      game.step(a);
      if (game.steps >= 1000) game.done = true;
    }
    draw();
    updatePanels();
    raf = requestAnimationFrame(tick);
  }

  /* === input === */
  var keyToAction = { ArrowLeft: 1, ArrowUp: 2, ArrowRight: 3, a: 1, w: 2, d: 3, A: 1, W: 2, D: 3 };

  window.addEventListener("keydown", function (e) {
    var t = e.target;
    if (t && t.tagName && /^(input|textarea|select)$/i.test(t.tagName)) return;
    var a = keyToAction[e.key];
    if (a) { held = a; demo = false; e.preventDefault(); }
  });
  window.addEventListener("keyup", function (e) {
    var a = keyToAction[e.key];
    if (a && held === a) held = 0;
  });

  Array.prototype.forEach.call(document.querySelectorAll(".keycap"), function (b) {
    var a = parseInt(b.getAttribute("data-act"), 10);
    function on(e) { held = a; demo = false; b.classList.add("down"); e.preventDefault(); }
    function off() { if (held === a) held = 0; b.classList.remove("down"); }
    b.addEventListener("mousedown", on);
    b.addEventListener("touchstart", on, { passive: false });
    window.addEventListener("mouseup", off);
    b.addEventListener("touchend", off);
    b.addEventListener("mouseleave", off);
  });

  function newDescent() {
    seed++;
    game = new M.Lander(seed);
    held = 0;
    document.getElementById("verdict").hidden = true;
  }
  document.getElementById("btn-reset").addEventListener("click", function () {
    demo = false; newDescent();
  });
  document.getElementById("btn-demo").addEventListener("click", function () {
    newDescent(); demo = true;
  });

  /* === dev affordances for headless capture (not user features) === */
  var params = new URLSearchParams(window.location.search);
  var test = params.get("test");
  if (test === "mid") {
    // fly the reference pilot part way down and freeze, so a screenshot shows
    // a live readout rather than the untouched initial frame
    for (var i = 0; i < 140 && !game.done; i++) game.step(M.referencePilot(game.obs()));
  } else if (test === "landed") {
    while (!game.done && game.steps < 1000) game.step(M.referencePilot(game.obs()));
  }
  if (test) { draw(); updatePanels(); } else { tick(); }

  window.Theme.onChange(function () { draw(); });
})();
