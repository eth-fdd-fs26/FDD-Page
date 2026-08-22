/* ============================================================================
   main.js : boot file.
   Mounts the game and the explanation section, then applies the URL test
   hooks. Everything here is a DEV AFFORDANCE for headless screenshots except
   ?level=, which is a legitimate deep link a lecturer can use mid-lecture.

   URL parameters (query string or hash, both accepted):
     ?level=N        select level N, 1-based           (user-facing deep link)
     ?theme=dark     force a theme                     (handled in theme.js)
     ?test=revealed  turn the landscape toggle on
     ?test=hints     turn the slope-line and gradient readouts on
     ?test=played    replay the level's scripted demo jumps
     ?test=committed replay the demo jumps, then plant the flag
     ?test=stuck     replay the scripted jumps that end short of the summit,
                     then plant the flag, which is the losing verdict
   ============================================================================ */
(function () {
  "use strict";

  function params() {
    var q = window.location.search || "";
    var h = (window.location.hash || "").replace(/^#/, "");
    return new URLSearchParams(q.replace(/^\?/, "") + "&" + h);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var p = params();

    var gameRoot = document.getElementById("game-root");
    var explainRoot = document.getElementById("explain-root");

    var game = null;
    if (window.Game && typeof window.Game.mount === "function") {
      game = window.Game.mount(gameRoot);
      window.grasshopperGame = game;
    }
    if (window.Explain && typeof window.Explain.mount === "function") {
      window.Explain.mount(explainRoot);
    }
    if (!game) return;

    var lvl = parseInt(p.get("level"), 10);
    if (Number.isFinite(lvl) && lvl >= 1) game.setLevel(lvl - 1);

    var test = p.get("test");
    if (!test) return;

    if (test === "revealed") {
      game.setReveal(true);
    } else if (test === "hints") {
      game.setHints({ grad: true, tangent: true });
    } else if (test === "played" || test === "committed" || test === "stuck") {
      game.replayDemo(test === "stuck" ? "stuck" : "climb");
      game.setReveal(true);
      /* stuck plants the flag too: the whole point of that sequence is the
         verdict it earns, and there is no other way to reach it from a URL */
      if (test === "committed" || test === "stuck") game.commit();
    }
  });
})();
