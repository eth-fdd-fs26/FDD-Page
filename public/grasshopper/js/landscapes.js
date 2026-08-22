/* ============================================================================
   landscapes.js : the five hills the grasshopper climbs.

   window.LANDSCAPES is an array of five level objects, ordered easy to hard.
   Every level is a closed form: sums of Gaussians, one linear tilt, one cosine
   ripple. Nothing here is random and nothing is fitted at run time.

   Each level carries pinned facts about its own curve (peak, range, maxima,
   maxSlope, par, demo jumps). Those numbers are not hand written. The script
   precompute/verify_landscapes.mjs recomputes every one of them from J alone
   and asserts that the pinned value matches. Run it after any edit:

     node precompute/verify_landscapes.mjs

   Fields:
     id        stable kebab case key
     name      shown in the level list
     rank      1 to 5, easy to hard
     teaches   one sentence, shown under the name
     domain    [lo, hi] in theta
     start     starting theta
     view      { halfW, halfV } : the grasshopper window, half width in theta
               and half height in J. halfV / halfW is the steepest slope that
               still fits inside that window.
     maxJump   the largest distance the jump slider allows
     J         the landscape itself, pure and finite on the whole domain
     peak      { theta, J } : the global maximum, always interior
     range     { lo, hi } : the smallest and largest J on the domain
     maxima    every interior local maximum, the global one included, by theta
     maxSlope  max |grad J| on the domain, measured with Landscape.grad
     par       steps that ideal gradient ascent needs to reach the summit,
               using the best fixed step size (see the verifier, invariant h)
     parReached  false when no step size reaches the summit inside the 60 step
               budget. On four of five levels vanilla ascent never gets there,
               which is the point of those levels: par is then the exhausted
               budget, not a target. Use demo.climb.length as the human
               benchmark when parReached is false.
     demo      { climb, stuck } : scripted [direction, distance] jump pairs.
               climb ends on the summit. stuck ends on a local maximum, or,
               where the level has only one maximum, short of the summit.
     trend     level 5 only : the ripple free part of J

   window.Landscape holds the three helpers every view needs: grad, sampleCurve
   and clamp.
   ============================================================================ */
(function () {
  "use strict";

  /* === level 1 : one Gaussian, amplitude 5, centre 6.2, width 2.5 === */
  function j1(t) {
    var u = t - 6.2;
    return 1 + 5 * Math.exp(-(u * u) / (2 * 2.5 * 2.5));
  }

  /* === level 2 : a 0.012 tilt across the whole domain plus a narrow hill at
     9.4. On the shelf the hill is numerically absent, so the slope there is
     the tilt alone: right sign, no size. === */
  function j2(t) {
    var u = t - 9.4;
    return 0.5 + 0.012 * t + 2.2 * Math.exp(-(u * u) / (2 * 1 * 1));
  }

  /* === level 3 : a modest hill at 3.4, a taller one at 8.6, valley between.
     Small steps from the start walk into the modest one. === */
  function j3(t) {
    var a = t - 3.4;
    var b = t - 8.6;
    return 0.6 +
      2.4 * Math.exp(-(a * a) / (2 * 1.3 * 1.3)) +
      3.6 * Math.exp(-(b * b) / (2 * 1.5 * 1.5));
  }

  /* === level 4 : a broad mound and a thin spike, both centred at 6.1. The
     mound has a gentle slope everywhere, the spike does not. === */
  function j4(t) {
    var u = t - 6.1;
    return 0.4 +
      2.6 * Math.exp(-(u * u) / (2 * 2.6 * 2.6)) +
      1.2 * Math.exp(-(u * u) / (2 * 0.08 * 0.08));
  }

  /* === level 5 : a broad trend at 6.4 with a cosine ripple of period 1.5 on
     top. The ripple crest sits exactly on the trend peak, so the summit is
     unambiguous and its two neighbours are a clear step below. === */
  var RIPPLE_W = 2 * Math.PI / 1.5;

  function trend5(t) {
    var u = t - 6.4;
    return 0.55 + 3 * Math.exp(-(u * u) / (2 * 2.4 * 2.4));
  }

  function j5(t) {
    return trend5(t) + 0.2 * Math.cos(RIPPLE_W * (t - 6.4));
  }

  /* === the five levels === */
  var LANDSCAPES = [
    {
      id: "one-hill",
      name: "One hill",
      rank: 1,
      teaches: "The sign of the slope under your feet tells you which way to go.",
      domain: [0, 10],
      start: 1.5,
      view: { halfW: 0.25, halfV: 0.32 },
      maxJump: 3,
      J: j1,
      peak: { theta: 6.2, J: 6 },
      range: { lo: 1.230902, hi: 6 },
      maxima: [{ theta: 6.2, J: 6 }],
      maxSlope: 1.213061,
      par: 3,
      parReached: true,
      demo: {
        climb: [[1, 1.8], [1, 1.8], [1, 1.8], [-1, 0.9]],
        stuck: [[1, 1.8], [1, 1.8]]
      }
    },
    {
      id: "long-shelf",
      name: "The long shelf",
      rank: 2,
      teaches: "A slope can point the right way and still be far too small to move you.",
      domain: [0, 12],
      start: 1.2,
      view: { halfW: 0.25, halfV: 0.36 },
      maxJump: 3,
      J: j2,
      peak: { theta: 9.405455, J: 2.812833 },
      range: { lo: 0.5, hi: 2.812833 },
      maxima: [{ theta: 9.405455, J: 2.812833 }],
      maxSlope: 1.346367,
      par: 60,
      parReached: false,
      demo: {
        climb: [[1, 1.8], [1, 1.8], [1, 1.8], [1, 1.8], [1, 1.8], [-1, 0.9]],
        stuck: [[1, 1.8], [1, 1.8], [1, 1.8], [1, 1.8], [1, 1.8]]
      }
    },
    {
      id: "two-hills",
      name: "Two hills",
      rank: 3,
      teaches: "The hill under your feet is not always the tallest one.",
      domain: [0, 12],
      start: 1.5,
      view: { halfW: 0.25, halfV: 0.38 },
      maxJump: 3,
      J: j3,
      peak: { theta: 8.598445, J: 4.200807 },
      range: { lo: 0.678501, hi: 4.200807 },
      maxima: [
        { theta: 3.414854, J: 3.008996 },
        { theta: 8.598445, J: 4.200807 }
      ],
      maxSlope: 1.45569,
      par: 60,
      parReached: false,
      demo: {
        climb: [[1, 1.8], [1, 0.23], [-1, 0.12], [1, 3], [1, 1.8], [1, 0.45]],
        stuck: [[1, 1.8], [1, 0.23], [-1, 0.12]]
      }
    },
    {
      id: "narrow-summit",
      name: "The narrow summit",
      rank: 4,
      teaches: "A step that suits gentle ground flies clean over a narrow peak.",
      domain: [0, 12],
      start: 2,
      view: { halfW: 0.25, halfV: 0.3 },
      maxJump: 3,
      J: j4,
      peak: { theta: 6.1, J: 4.2 },
      range: { lo: 0.565844, hi: 4.2 },
      maxima: [{ theta: 6.1, J: 4.2 }],
      maxSlope: 9.128736,
      par: 5,
      parReached: true,
      demo: {
        climb: [[1, 1.8], [1, 1.8], [1, 0.9], [-1, 0.45], [1, 0.06]],
        stuck: [[1, 1.8], [1, 1.8], [1, 0.9], [-1, 0.45]]
      }
    },
    {
      id: "rough-ground",
      name: "Rough ground",
      rank: 5,
      teaches: "A noisy slope reading misleads you on any single step.",
      domain: [0, 12],
      start: 1.5,
      view: { halfW: 0.25, halfV: 0.4 },
      maxJump: 3,
      J: j5,
      trend: trend5,
      peak: { theta: 6.4, J: 3.75 },
      range: { lo: 0.614791, hi: 3.75 },
      maxima: [
        { theta: 0.440737, J: 0.8846 },
        { theta: 2.029918, J: 1.292794 },
        { theta: 3.660853, J: 2.206135 },
        { theta: 5.086167, J: 3.274746 },
        { theta: 6.4, J: 3.75 },
        { theta: 7.713833, J: 3.274746 },
        { theta: 9.139147, J: 2.206135 },
        { theta: 10.770082, J: 1.292794 }
      ],
      maxSlope: 1.558224,
      par: 3,
      parReached: true,
      demo: {
        climb: [[1, 1.8], [1, 1.8], [1, 1.8], [-1, 0.9], [1, 0.45]],
        stuck: [[1, 1.8], [1, 1.8], [-1, 0.02], [1, 0.01]]
      }
    }
  ];

  /* === helpers every view needs === */
  var Landscape = {
    /* Central difference with h = 1e-4. The stencil is clamped into the
       domain, so at either end this degrades to a one sided difference. */
    grad: function (L, t) {
      var h = 1e-4;
      var lo = L.domain[0];
      var hi = L.domain[1];
      var a = t - h;
      var b = t + h;
      if (a < lo) a = lo;
      if (b > hi) b = hi;
      if (b <= a) return 0;
      return (L.J(b) - L.J(a)) / (b - a);
    },

    /* n points from a to b, both endpoints included. n is the point count and
       is treated as at least 2. */
    sampleCurve: function (L, a, b, n) {
      var out = [];
      var m = Math.max(2, Math.round(n));
      var stepSize = (b - a) / (m - 1);
      var i, t;
      for (i = 0; i < m; i++) {
        t = i === m - 1 ? b : a + i * stepSize;
        out.push({ t: t, J: L.J(t) });
      }
      return out;
    },

    clamp: function (L, t) {
      var lo = L.domain[0];
      var hi = L.domain[1];
      if (!(t > lo)) return lo;
      if (t > hi) return hi;
      return t;
    }
  };

  window.LANDSCAPES = LANDSCAPES;
  window.Landscape = Landscape;
})();
