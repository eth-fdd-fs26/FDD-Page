/* ============================================================================
   game.js : state, controls, verdict.

   The player has two levers, direction and distance, and one piece of
   evidence, the patch of ground under the grasshopper's feet. Everything the
   player is not entitled to (the summit, the peak height, the whole landscape)
   stays hidden until the flag is planted or the landscape switch is thrown.
   Par is the one number that is public from the start, because a par you
   cannot see is not a par. The three switches are the only way to buy more
   information, and all three start off.

   API
     window.Game.mount(root) -> {
       setLevel(idx), setReveal(bool), setHints({grad, tangent}),
       jump(dir, dist), commit(), reset(), replayDemo(kind)
     }

   js/main.js calls exactly those. replayDemo applies a pinned demo sequence
   instantly, with no animation, and leaves the log, the trail and the turn
   count fully populated.
   ============================================================================ */
(function () {
  "use strict";

  var LS = window.Landscape;

  /* === small helpers === */

  function trim(v) {
    var s = v.toFixed(2);
    if (s.indexOf(".") >= 0) s = s.replace(/0+$/, "").replace(/\.$/, "");
    return s;
  }

  function mono(s) {
    return '<span class="mono">' + s + "</span>";
  }

  function dirWord(delta) {
    return delta >= 0 ? "right" : "left";
  }

  /* Par is the step count ideal ascent needs with the best fixed step size.
     On two levels no step size reaches the summit inside the 60 step budget,
     so landscapes.js marks them parReached false and the honest benchmark is
     the scripted climb instead. */
  function parOf(L) {
    return L.parReached ? L.par : L.demo.climb.length;
  }

  function bestKey(L) {
    return "grasshopper-best-" + L.id;
  }

  function readBest(L) {
    try {
      var v = parseInt(window.localStorage.getItem(bestKey(L)), 10);
      return Number.isFinite(v) ? v : null;
    } catch (e) {
      return null;
    }
  }

  function writeBest(L, n) {
    try {
      window.localStorage.setItem(bestKey(L), String(n));
    } catch (e) {
      /* file:// or private mode : the score simply does not persist */
    }
  }

  /* === the page furniture, built once === */

  function template() {
    return [
      '<div class="section-rule"><span class="section-kicker">The game</span></div>',
      '<div class="game-grid">',
      '<div class="game-main">',
      '<div class="card">',
      '<div class="card-head">',
      '<h3 class="card-title">What the grasshopper sees</h3>',
      '<span class="card-note" data-el="levelnote"></span>',
      "</div>",
      '<div class="card-body lv-body">',
      '<div class="lv-scroll"><div class="lv-host" data-el="lvhost"></div></div>',
      '<p class="caption lv-caption" data-el="lvcaption"></p>',
      "</div>",
      "</div>",
      '<div class="card game-world" data-el="worldcard">',
      '<div class="card-head"><h3 class="card-title">The whole landscape</h3>',
      '<span class="card-note">The grasshopper never sees this</span></div>',
      '<div class="card-body wv-body">',
      '<div class="wv-cover" data-el="wvcover">',
      '<p class="wv-cover-line">You cannot see this yet.</p>',
      '<p class="wv-cover-sub">Flip <em>Show the whole landscape</em> on the right when you want ',
      "to look at the terrain you are standing on. The grasshopper never gets that option.</p>",
      "</div>",
      '<div class="wv-scroll is-hidden" data-el="wvscroll">',
      '<div class="wv-host" data-el="wvhost"></div></div>',
      '<p class="caption wv-caption is-hidden" data-el="wvcaption"></p>',
      "</div>",
      "</div>",
      '<div class="card verdict-card is-hidden" data-el="verdictcard">',
      '<div class="card-head"><h3 class="card-title">The verdict</h3></div>',
      '<div class="card-body">',
      '<div class="verdict" data-el="verdict"></div>',
      '<div class="verdict-actions" data-el="verdictactions"></div>',
      "</div>",
      "</div>",
      "</div>",

      /* Controls first, the level list under them. The sidebar is taller than
         a laptop viewport and it is sticky, so whatever sits at the top of it
         is what stays on screen: that has to be the loop the player is in
         (jump, plant, the three switches, the log), not the level picker,
         which is used once per level and names the current level in the card
         head of the main column anyway. */
      '<aside class="game-side">',
      '<div class="card">',
      '<div class="card-head"><h3 class="card-title">Your move</h3></div>',
      '<div class="card-body">',

      '<div class="kpi-row">',
      '<div class="kpi"><div class="kpi-value" data-el="kpiJumps">0</div><div class="kpi-label">Jumps</div></div>',
      '<div class="kpi"><div class="kpi-value" data-el="kpiHeight">0</div><div class="kpi-label">Height (J)</div></div>',
      '<div class="kpi"><div class="kpi-value" data-el="kpiTheta">0</div><div class="kpi-label">Position (theta)</div></div>',
      "</div>",

      '<div class="control-group side-gap">',
      '<div class="control-label"><span>Direction</span></div>',
      '<div class="seg">',
      '<button type="button" class="seg-btn" data-dir="-1" aria-pressed="false">',
      '<span class="seg-arrow">&#8592;</span>Left</button>',
      '<button type="button" class="seg-btn" data-dir="1" aria-pressed="true">',
      'Right<span class="seg-arrow">&#8594;</span></button>',
      "</div>",
      "</div>",

      '<div class="control-group">',
      '<div class="control-label"><span>Distance</span>',
      '<span class="control-value" data-el="distval">0.50</span></div>',
      '<div class="slider-row">',
      '<input type="range" class="slider" data-el="slider" min="0.01" max="3" step="0.01" value="0.5"',
      ' aria-label="Jump distance">',
      '<input type="number" class="num-input" data-el="num" min="0.01" max="3" step="0.01" value="0.50"',
      ' aria-label="Jump distance in numbers">',
      "</div>",
      '<div class="chip-row" data-el="chips"></div>',
      "</div>",

      '<div class="side-actions" data-el="actions">',
      '<button type="button" class="btn btn-primary btn-block" data-act="jump">Jump</button>',
      '<button type="button" class="btn btn-block" data-act="commit">Plant the flag here</button>',
      "</div>",
      '<p class="side-status is-hidden" data-el="sidestatus"></p>',

      '<div class="switch-block">',
      '<button type="button" class="switch-row" role="switch" aria-checked="false" data-sw="reveal">',
      '<span class="switch-track"><span class="switch-knob"></span></span>',
      '<span class="switch-label">Show the whole landscape</span></button>',
      '<button type="button" class="switch-row" role="switch" aria-checked="false" data-sw="tangent">',
      '<span class="switch-track"><span class="switch-knob"></span></span>',
      '<span class="switch-label">Show the slope line</span></button>',
      '<button type="button" class="switch-row" role="switch" aria-checked="false" data-sw="grad">',
      '<span class="switch-track"><span class="switch-knob"></span></span>',
      '<span class="switch-label">Show the gradient</span></button>',
      "</div>",

      '<button type="button" class="btn btn-ghost btn-block" data-act="reset">Start this level again</button>',

      '<div class="log">',
      '<div class="log-head"><span>Jump log</span><span data-el="logcount"></span></div>',
      '<div class="log-list" data-el="loglist"></div>',
      "</div>",

      "</div>",
      "</div>",

      '<div class="card">',
      '<div class="card-head"><h3 class="card-title">Levels</h3></div>',
      '<div class="card-body level-body"><div class="level-list" data-el="levels"></div></div>',
      "</div>",

      '<p class="kbd-hint"><kbd>&#8592;</kbd> <kbd>&#8594;</kbd> set the direction, ',
      "<kbd>Enter</kbd> jumps, <kbd>r</kbd> starts the level again, ",
      "<kbd>l</kbd> shows the landscape.</p>",
      "</aside>",
      "</div>"
    ].join("");
  }

  /* === the mount === */

  function mount(root) {
    var levels = window.LANDSCAPES;

    var state = {
      levelIdx: 0,
      theta: levels[0].start,
      turns: 0,
      trail: [levels[0].start],
      log: [],
      dir: 1,
      dist: 0.5,
      reveal: false,
      hints: { grad: false, tangent: false },
      committed: false,
      verdict: null,
      flying: false
    };

    root.classList.add("game");
    root.innerHTML = template();

    function el(name) {
      return root.querySelector('[data-el="' + name + '"]');
    }

    function level() {
      return levels[state.levelIdx];
    }

    var local = window.LocalView.create(el("lvhost"), {});
    var world = window.WorldView.create(el("wvhost"), {});

    var slider = el("slider");
    var num = el("num");

    /* === state transitions === */

    function clampDist(v) {
      var L = level();
      if (!Number.isFinite(v)) return state.dist;
      if (v < 0.01) return 0.01;
      if (v > L.maxJump) return L.maxJump;
      return Math.round(v * 100) / 100;
    }

    function resetLevelState() {
      var L = level();
      state.theta = L.start;
      state.turns = 0;
      state.trail = [L.start];
      state.log = [];
      state.committed = false;
      state.verdict = null;
      state.dir = 1;
      state.dist = Math.min(0.5, L.maxJump);
    }

    function setLevel(idx) {
      if (!Number.isFinite(idx)) return;
      idx = Math.round(idx);
      if (idx < 0) idx = 0;
      if (idx > levels.length - 1) idx = levels.length - 1;
      local.cancel();
      state.flying = false;
      state.levelIdx = idx;
      resetLevelState();
      render();
    }

    function reset() {
      local.cancel();
      state.flying = false;
      resetLevelState();
      render();
    }

    function setReveal(on) {
      state.reveal = !!on;
      render();
    }

    function setHints(h) {
      h = h || {};
      if ("grad" in h) state.hints.grad = !!h.grad;
      if ("tangent" in h) state.hints.tangent = !!h.tangent;
      render();
    }

    function setDir(d) {
      state.dir = d < 0 ? -1 : 1;
      render();
    }

    function setDist(v) {
      state.dist = clampDist(v);
      render();
    }

    function jump(dir, dist) {
      if (state.flying || state.committed) return;
      var L = level();
      var d = dir < 0 ? -1 : 1;
      var s = clampDist(dist);
      var from = state.theta;
      var to = LS.clamp(L, from + d * s);
      state.dir = d;
      state.dist = s;
      state.flying = true;
      renderChrome();
      local.animateJump(from, to, function () {
        state.flying = false;
        state.theta = to;
        state.turns += 1;
        state.trail.push(to);
        state.log.push({ dir: d, dist: s, theta: to, J: L.J(to) });
        render();
      });
    }

    function commit() {
      if (state.committed || state.flying) return;
      var L = level();
      state.committed = true;
      state.verdict = judge(L, state.theta, state.turns);
      if (state.verdict.kind === "good") {
        var b = readBest(L);
        if (b === null || state.turns < b) writeBest(L, state.turns);
      }
      render();
    }

    function replayDemo(kind) {
      var L = level();
      var script = (L.demo && L.demo[kind === "stuck" ? "stuck" : "climb"]) || [];
      local.cancel();
      state.flying = false;
      resetLevelState();
      var i, d, s, to;
      for (i = 0; i < script.length; i++) {
        d = script[i][0] < 0 ? -1 : 1;
        s = clampDist(script[i][1]);
        to = LS.clamp(L, state.theta + d * s);
        state.theta = to;
        state.turns += 1;
        state.trail.push(to);
        state.log.push({ dir: d, dist: s, theta: to, J: L.J(to) });
        state.dir = d;
        state.dist = s;
      }
      render();
    }

    /* === the verdict === */

    function judge(L, theta, turns) {
      var jt = L.J(theta);
      var span = L.range.hi - L.range.lo;
      var rel = span > 0 ? (L.peak.J - jt) / span : 0;
      var g = LS.grad(L, theta);
      var flat = 0.01 * L.maxSlope;
      var pct = span > 0 ? ((jt - L.range.lo) / span) * 100 : 100;
      var toPeak = L.peak.theta - theta;

      var v = { kind: "bad", title: "", body: "", J: jt, pct: pct, turns: turns };

      if (rel <= 0.01) {
        v.kind = "good";
        v.title = "You are on the summit.";
        v.body = "Nothing on this landscape stands higher than the ground under your feet.";
        return v;
      }

      if (Math.abs(g) <= flat) {
        v.kind = "warn";
        /* which flat thing is this : a lesser summit, or a shelf that only
           feels like one? */
        var near = null;
        var bestGap = Infinity;
        var i, gap;
        for (i = 0; i < L.maxima.length; i++) {
          gap = Math.abs(L.maxima[i].theta - theta);
          if (gap < bestGap) {
            bestGap = gap;
            near = L.maxima[i];
          }
        }
        var tol = Math.max(0.35, L.view.halfW * 2);
        /* Nearness in theta alone is not enough. On a rippled landscape a
           valley floor sits well inside tol of the crest beside it, and
           calling that floor a summit is the one thing this verdict must
           never do. The slope has to be turning over, not turning up. */
        var curv = LS.grad(L, theta + 0.01) - LS.grad(L, theta - 0.01);
        if (near && bestGap <= tol && curv < 0 &&
            Math.abs(near.theta - L.peak.theta) > 1e-6) {
          v.title = "You are on a summit, but not the highest one.";
          v.body = "The hill under your feet tops out at J = " + near.J.toFixed(2) +
            ". The true summit is " + Math.abs(toPeak).toFixed(2) + " further " +
            dirWord(toPeak) + " and stands " + (L.peak.J - jt).toFixed(2) + " higher.";
        } else {
          v.title = "You are on flat ground, but not on a summit.";
          v.body = "The slope here reads " + (g >= 0 ? "+" : "") + g.toFixed(3) +
            ", small enough to feel flat, and this is not the top. The summit is " +
            Math.abs(toPeak).toFixed(2) + " further " + dirWord(toPeak) +
            " and stands " + (L.peak.J - jt).toFixed(2) + " higher.";
        }
        return v;
      }

      v.kind = "bad";
      v.title = "You stopped on a slope.";
      v.body = "Uphill was still to the " + dirWord(g) + ", where the ground was rising at " +
        Math.abs(g).toFixed(2) + " per unit of theta.";
      return v;
    }

    /* === rendering === */

    /* Both lists below are rebuilt from innerHTML only when their SET of rows
       changes, which is never during play. Selecting a level or a distance
       therefore updates classes in place: rebuilding would destroy the very
       button the player just activated and drop keyboard focus to <body>. */

    function levelMeta(L) {
      var best = readBest(L);
      return '<span class="level-par">Par ' + parOf(L) + "</span>" +
        (best === null ? "" : '<span class="level-best">Best ' + best + "</span>");
    }

    function renderLevels() {
      var host = el("levels");
      var i, L;
      if (host.children.length !== levels.length) {
        var out = [];
        for (i = 0; i < levels.length; i++) {
          L = levels[i];
          out.push(
            '<button type="button" class="level-row" data-level="' + i + '">' +
            '<span class="level-rank">' + L.rank + "</span>" +
            '<span class="level-main"><span class="level-name">' + L.name + "</span>" +
            '<span class="level-teaches">' + L.teaches + "</span></span>" +
            '<span class="level-meta"></span></button>'
          );
        }
        host.innerHTML = out.join("");
      }
      for (i = 0; i < levels.length; i++) {
        host.children[i].classList.toggle("is-current", i === state.levelIdx);
        host.children[i].querySelector(".level-meta").innerHTML = levelMeta(levels[i]);
      }
    }

    function renderChips() {
      var L = level();
      var presets = [0.05, 0.2, 0.5, 1, 2, L.maxJump];
      var host = el("chips");
      var wanted = [];
      var i, v, seen = {};
      for (i = 0; i < presets.length; i++) {
        v = presets[i];
        if (v > L.maxJump || seen[v]) continue;
        seen[v] = true;
        wanted.push(v);
      }
      var same = host.children.length === wanted.length;
      for (i = 0; same && i < wanted.length; i++) {
        same = Number(host.children[i].getAttribute("data-dist")) === wanted[i];
      }
      if (!same) {
        var out = [];
        for (i = 0; i < wanted.length; i++) {
          out.push('<button type="button" class="chip" data-dist="' + wanted[i] + '">' +
            trim(wanted[i]) + "</button>");
        }
        host.innerHTML = out.join("");
      }
      for (i = 0; i < wanted.length; i++) {
        host.children[i].classList.toggle("is-on", Math.abs(wanted[i] - state.dist) < 1e-9);
      }
    }

    function renderLog() {
      var list = el("loglist");
      var i, e, out;
      if (!state.log.length) {
        list.innerHTML = '<div class="log-empty">No jumps yet.</div>';
      } else {
        out = [];
        for (i = 0; i < state.log.length; i++) {
          e = state.log[i];
          out.push('<div class="log-row"><span class="log-turn">' + (i + 1) + "</span>" +
            '<span class="log-dir">' + (e.dir > 0 ? "&#8594;" : "&#8592;") + "</span>" +
            '<span class="log-dist">' + e.dist.toFixed(2) + "</span>" +
            '<span class="log-height">J ' + e.J.toFixed(2) + "</span></div>");
        }
        list.innerHTML = out.join("");
        list.scrollTop = list.scrollHeight;
      }
      el("logcount").textContent = state.turns === 1 ? "1 jump" : state.turns + " jumps";
    }

    function renderVerdict() {
      var card = el("verdictcard");
      var L = level();
      if (!state.committed || !state.verdict) {
        card.classList.add("is-hidden");
        el("verdict").className = "verdict";
        el("verdict").innerHTML = "";
        el("verdictactions").innerHTML = "";
        return;
      }
      var v = state.verdict;
      card.classList.remove("is-hidden");
      el("verdict").className = "verdict " + v.kind;
      el("verdict").innerHTML =
        '<p class="verdict-title">' + v.title + "</p>" +
        '<p class="verdict-body">' + v.body + "</p>" +
        '<p class="verdict-stats">Jumps used: ' + mono(String(v.turns)) +
        ", par " + mono(String(parOf(L))) + ". Height " + mono("J = " + v.J.toFixed(2)) +
        ", summit " + mono("J = " + L.peak.J.toFixed(2)) + ". You got " +
        mono(v.pct.toFixed(1) + " percent") + " of the way up.</p>";

      var acts = ['<button type="button" class="btn" data-act="retry">Try this level again</button>'];
      if (state.levelIdx < levels.length - 1) {
        acts.push('<button type="button" class="btn btn-primary" data-act="next">Next level</button>');
      }
      el("verdictactions").innerHTML = acts.join("");
    }

    function renderChrome() {
      var L = level();
      var showWorld = state.reveal || state.committed;

      el("levelnote").textContent =
        "Level " + (state.levelIdx + 1) + " of " + levels.length + " : " + L.name;

      var a = state.theta - L.view.halfW;
      var b = state.theta + L.view.halfW;
      el("lvcaption").textContent =
        "You can see " + trim(2 * L.view.halfW) + " units of ground: theta from " +
        a.toFixed(2) + " to " + b.toFixed(2) + ". Nothing beyond.";

      el("wvcaption").textContent = state.committed
        ? "The amber band is all the grasshopper could see. The dotted trail is every place it stood. The amber dot is the highest point on the landscape."
        : "The amber band is all the grasshopper can see. The dotted trail is every place it has stood.";

      el("kpiJumps").textContent = String(state.turns);
      el("kpiHeight").textContent = L.J(state.theta).toFixed(2);
      el("kpiTheta").textContent = state.theta.toFixed(2);

      var segs = root.querySelectorAll("[data-dir]");
      var i;
      for (i = 0; i < segs.length; i++) {
        segs[i].setAttribute("aria-pressed",
          String(Number(segs[i].getAttribute("data-dir")) === state.dir));
      }

      slider.max = String(L.maxJump);
      if (document.activeElement !== slider) slider.value = String(state.dist);
      if (document.activeElement !== num) num.value = state.dist.toFixed(2);
      num.max = String(L.maxJump);
      el("distval").textContent = state.dist.toFixed(2);
      renderChips();

      /* Once the flag is planted both of these are dead, and two grey pills
         stacked on top of each other are the loudest thing in the sidebar.
         The whole slot becomes one quiet line of state instead, and the live
         actions live in the verdict card. */
      var jumpBtn = root.querySelector('[data-act="jump"]');
      var commitBtn = root.querySelector('[data-act="commit"]');
      jumpBtn.disabled = state.flying;
      commitBtn.disabled = state.flying;
      el("actions").classList.toggle("is-hidden", state.committed);
      el("sidestatus").classList.toggle("is-hidden", !state.committed);
      if (state.committed) {
        el("sidestatus").innerHTML = "Flag planted at theta " +
          mono(state.theta.toFixed(2)) + ", height " + mono("J = " +
          L.J(state.theta).toFixed(2)) + ". The verdict is below the landscape.";
      }

      var sw = root.querySelectorAll("[data-sw]");
      for (i = 0; i < sw.length; i++) {
        var key = sw[i].getAttribute("data-sw");
        var on = key === "reveal" ? state.reveal : !!state.hints[key];
        sw[i].setAttribute("aria-checked", String(on));
      }

      /* The card itself always stands in the left column, so the page keeps its
         shape and the reader keeps being told that a landscape is there. Only
         its contents swap: the cover while the toggle is off, the plot once it
         is on. */
      el("wvcover").classList.toggle("is-hidden", showWorld);
      el("wvscroll").classList.toggle("is-hidden", !showWorld);
      el("wvcaption").classList.toggle("is-hidden", !showWorld);

      renderLevels();
      renderLog();
      renderVerdict();
    }

    /* The world card is only display:none while it is hidden, so rendering it
       anyway would leave the full profile of the current level sitting in the
       DOM for anyone who opens the inspector. It is drawn the first time it is
       actually shown, and wiped on the way back out. */
    var worldDrawn = false;

    function renderViews() {
      var L = level();
      local.render({ L: L, theta: state.theta, hints: state.hints });
      if (state.reveal || state.committed) {
        world.render({
          L: L,
          theta: state.theta,
          trail: state.trail,
          committed: state.committed
        });
        worldDrawn = true;
      } else if (worldDrawn) {
        world.clear();
        worldDrawn = false;
      }
    }

    function render() {
      renderChrome();
      renderViews();
    }

    /* === events === */

    root.addEventListener("click", function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var n;
      if ((n = t.closest("[data-level]"))) { setLevel(Number(n.getAttribute("data-level"))); return; }
      if ((n = t.closest("[data-dir]"))) { setDir(Number(n.getAttribute("data-dir"))); return; }
      if ((n = t.closest("[data-dist]"))) { setDist(Number(n.getAttribute("data-dist"))); return; }
      if ((n = t.closest("[data-sw]"))) {
        var key = n.getAttribute("data-sw");
        if (key === "reveal") setReveal(!state.reveal);
        else if (key === "grad") setHints({ grad: !state.hints.grad });
        else if (key === "tangent") setHints({ tangent: !state.hints.tangent });
        return;
      }
      if ((n = t.closest("[data-act]"))) {
        var act = n.getAttribute("data-act");
        if (act === "jump") jump(state.dir, state.dist);
        else if (act === "commit") commit();
        else if (act === "reset" || act === "retry") reset();
        else if (act === "next") setLevel(state.levelIdx + 1);
      }
    });

    slider.addEventListener("input", function () {
      setDist(parseFloat(slider.value));
    });
    num.addEventListener("input", function () {
      var v = parseFloat(num.value);
      if (Number.isFinite(v)) setDist(v);
    });
    num.addEventListener("change", function () {
      setDist(parseFloat(num.value));
      num.value = state.dist.toFixed(2);
    });

    window.addEventListener("keydown", function (e) {
      var t = e.target;
      if (t && t.tagName && /^(input|textarea|select)$/i.test(t.tagName)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "ArrowLeft") { e.preventDefault(); setDir(-1); }
      else if (e.key === "ArrowRight") { e.preventDefault(); setDir(1); }
      else if (e.key === "Enter") {
        if (t && t.tagName === "BUTTON") return;   /* the button click handles it */
        e.preventDefault();
        jump(state.dir, state.dist);
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        reset();
      } else if (e.key === "l" || e.key === "L") {
        e.preventDefault();
        setReveal(!state.reveal);
      }
    });

    resetLevelState();
    render();

    return {
      setLevel: setLevel,
      setReveal: setReveal,
      setHints: setHints,
      jump: jump,
      commit: commit,
      reset: reset,
      replayDemo: replayDemo
    };
  }

  window.Game = { mount: mount };
})();
