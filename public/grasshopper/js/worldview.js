/* ============================================================================
   worldview.js : the truth.

   The whole domain in one 740 by 280 panel: the real profile, the sliver the
   grasshopper can currently see, and every position it has visited. This is
   the view the player is not entitled to, so the game only mounts it when the
   landscape switch is on or the flag has been planted.

   The summit is NOT marked until the player commits. Before that the panel
   shows where you have been, never where you should have gone.

   API
     window.WorldView.create(hostEl, opts) -> { render(state), clear() }

     state = { L, theta, trail: [theta...], committed: bool }

   clear() empties every path in the panel. The game calls it whenever the card
   goes back into hiding, so a landscape the player has not earned is not left
   sitting in the DOM behind a display:none.

   Colours: every fill and stroke comes from a class in css/style.css or
   css/game.css. Nothing here writes a colour.
   ============================================================================ */
(function () {
  "use strict";

  var W = 740;
  var H = 280;
  var M = { top: 16, right: 18, bottom: 32, left: 46 };
  var SAMPLES = 901;

  function fmt1(v) {
    return v.toFixed(1);
  }

  function create(hostEl, opts) {
    opts = opts || {};

    var svg = d3.select(hostEl).append("svg")
      .attr("class", "wv-svg")
      .attr("width", W)
      .attr("height", H)
      .attr("viewBox", "0 0 " + W + " " + H)
      .attr("role", "img")
      .attr("aria-label", "The whole landscape, which the grasshopper cannot see");

    var pw = W - M.left - M.right;
    var ph = H - M.top - M.bottom;
    var x0 = M.left;
    var y0 = M.top;
    var x1 = x0 + pw;
    var y1 = y0 + ph;

    svg.append("rect").attr("class", "sky")
      .attr("x", x0).attr("y", y0).attr("width", pw).attr("height", ph);

    var groundPath = svg.append("path").attr("class", "ground-world");
    var band = svg.append("rect").attr("class", "window-band")
      .attr("y", y0).attr("height", ph);
    var curvePath = svg.append("path").attr("class", "curve wv-curve");
    var bandEdges = svg.append("path").attr("class", "window-edge");

    var gAxis = svg.append("g").attr("class", "wv-axis");
    var gTrail = svg.append("g").attr("class", "wv-trail");
    var trailLine = gTrail.append("path").attr("class", "trail-line");
    var gDots = gTrail.append("g");
    var gHopper = svg.append("g").attr("class", "wv-hopper");
    gHopper.append("circle").attr("class", "hopper-ring lv-halo").attr("r", 6.4);
    gHopper.append("circle").attr("class", "hopper-body").attr("r", 4.8);
    var gMarks = svg.append("g").attr("class", "wv-marks");

    var line = d3.line()
      .x(function (d) { return d.px; })
      .y(function (d) { return d.py; });

    var area = d3.area()
      .x(function (d) { return d.px; })
      .y0(y1)
      .y1(function (d) { return d.py; });

    function render(state) {
      if (!state || !state.L) return;
      var L = state.L;
      var span = L.range.hi - L.range.lo;

      var x = d3.scaleLinear().domain(L.domain).range([x0, x1]);
      var y = d3.scaleLinear()
        .domain([L.range.lo - 0.10 * span, L.range.hi + 0.18 * span])
        .range([y1, y0]);

      /* === the profile === */
      var raw = window.Landscape.sampleCurve(L, L.domain[0], L.domain[1], SAMPLES);
      var pts = new Array(raw.length);
      var i;
      for (i = 0; i < raw.length; i++) {
        pts[i] = { px: x(raw[i].t), py: y(raw[i].J) };
      }
      groundPath.attr("d", area(pts));
      curvePath.attr("d", line(pts));

      /* === the sliver the grasshopper can see === */
      var bl = x(window.Landscape.clamp(L, state.theta - L.view.halfW));
      var br = x(window.Landscape.clamp(L, state.theta + L.view.halfW));
      band.attr("x", bl).attr("width", Math.max(1, br - bl));
      bandEdges.attr("d",
        "M " + bl + " " + y0 + " L " + bl + " " + y1 +
        " M " + br + " " + y0 + " L " + br + " " + y1);

      /* === axes === */
      gAxis.selectAll("*").remove();
      gAxis.append("line").attr("class", "axis-line")
        .attr("x1", x0).attr("y1", y1).attr("x2", x1).attr("y2", y1);

      var xt = x.ticks(Math.min(13, Math.round(L.domain[1] - L.domain[0]) + 1));
      xt.forEach(function (t) {
        gAxis.append("line").attr("class", "axis-line")
          .attr("x1", x(t)).attr("y1", y1).attr("x2", x(t)).attr("y2", y1 + 4);
        gAxis.append("text").attr("class", "axis-ink")
          .attr("x", x(t)).attr("y", y1 + 16)
          .attr("text-anchor", "middle")
          .text(String(t));
      });
      gAxis.append("text").attr("class", "axis-title")
        .attr("x", x1).attr("y", y1 + 28)
        .attr("text-anchor", "end")
        .text("position theta");

      y.ticks(3).forEach(function (v) {
        gAxis.append("line").attr("class", "axis-line")
          .attr("x1", x0 - 4).attr("y1", y(v)).attr("x2", x0).attr("y2", y(v));
        gAxis.append("text").attr("class", "axis-ink")
          .attr("x", x0 - 7).attr("y", y(v) + 3.5)
          .attr("text-anchor", "end")
          .text(fmt1(v));
      });
      /* inside the plot, anchored start : outside and anchored end it runs off
         the left edge of the panel and gets clipped */
      gAxis.append("text").attr("class", "axis-title")
        .attr("x", x0 + 5).attr("y", y0 + 12)
        .attr("text-anchor", "start")
        .text("height J");

      /* === the trail === */
      var trail = state.trail || [];
      var tp = trail.map(function (t) {
        return { px: x(t), py: y(L.J(t)) };
      });
      trailLine.attr("d", tp.length > 1 ? line(tp) : null);

      var dots = gDots.selectAll("circle").data(tp);
      dots.exit().remove();
      dots.enter().append("circle").attr("class", "trail-dot")
        .merge(dots)
        .attr("cx", function (d) { return d.px; })
        .attr("cy", function (d) { return d.py; })
        .attr("r", function (d, k) { return Math.min(6, 2.6 + 0.22 * k); });

      /* === where the grasshopper stands === */
      gHopper
        .attr("display", null)
        .attr("transform",
          "translate(" + x(state.theta) + "," + y(L.J(state.theta)) + ")");

      /* === after the flag is planted, and only then, the truth === */
      gMarks.selectAll("*").remove();
      if (!state.committed) return;

      /* The label rides at the top of the panel on a dashed leader, so it
         never fights the flag when the player finishes next to the summit. */
      var sx = x(L.peak.theta);
      var sy = y(L.peak.J);
      var fx = x(state.theta);
      var fy = y(L.J(state.theta));
      var ly = y0 + 15;

      /* A player who solved the level lands on the summit, which puts the
         amber summit dot and the green position dot on the same point, where
         the green ring slices the amber disc and the pair reads as a smudge.
         Inside a few pixels they become ONE marker instead: an amber disc
         with a green centre, and the flagpole rises out of it. */
      var fused = Math.abs(sx - fx) < 6 && Math.abs(sy - fy) < 6;
      gMarks.append("line").attr("class", "peak-mark")
        .attr("x1", sx).attr("y1", sy - (fused ? 10 : 7))
        .attr("x2", sx).attr("y2", ly + 4);
      if (fused) {
        gHopper.attr("display", "none");
        gMarks.append("circle").attr("class", "peak-dot")
          .attr("cx", sx).attr("cy", sy).attr("r", 7.6);
        gMarks.append("circle").attr("class", "hopper-body")
          .attr("cx", sx).attr("cy", sy).attr("r", 3.8);
      } else {
        gMarks.append("circle").attr("class", "peak-dot")
          .attr("cx", sx).attr("cy", sy).attr("r", 4.6);
      }

      /* the label goes on the side the flag is not on, never off the right
         edge, and never on top of the amber window band */
      var right = fx < sx;
      if (sx > x1 - 80) right = false;
      if (sx < x0 + 80) right = true;
      if (sx >= bl - 8 && sx <= br + 8) right = br + 84 < x1;
      var lx = right ? Math.max(sx, br) + 8 : Math.min(sx, bl) - 8;
      gMarks.append("text").attr("class", "peak-ink")
        .attr("x", lx).attr("y", ly)
        .attr("text-anchor", right ? "start" : "end")
        .text("the summit");

      /* the pole is drawn last, so it covers the dashed leader over its own
         length and the flag reads as planted in the marker rather than as
         floating above it */
      var side = fx > x1 - 34 ? -1 : 1;
      gMarks.append("line").attr("class", "flag-pole")
        .attr("x1", fx).attr("y1", fy).attr("x2", fx).attr("y2", fy - 26);
      gMarks.append("path").attr("class", "flag-cloth")
        .attr("d",
          "M " + fx + " " + (fy - 26) +
          " L " + (fx + side * 14) + " " + (fy - 21.5) +
          " L " + fx + " " + (fy - 17) + " Z");
    }

    function clear() {
      groundPath.attr("d", null);
      curvePath.attr("d", null);
      bandEdges.attr("d", null);
      trailLine.attr("d", null);
      band.attr("width", 0);
      gDots.selectAll("circle").remove();
      gAxis.selectAll("*").remove();
      gMarks.selectAll("*").remove();
      gHopper.attr("display", "none");
    }

    return { render: render, clear: clear };
  }

  window.WorldView = { create: create };
})();
