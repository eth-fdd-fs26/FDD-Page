# Grasshopper

An interactive game and explainer for **gradient ascent**, built as the intuition-first opener for
the policy-gradient part of the reinforcement-learning weekend.

You are a grasshopper on a landscape. There is a highest point somewhere and you want to stand on
it. You cannot see the landscape: only a few centimetres of ground around your feet. Each turn you
choose a direction (left or right) and a distance, you jump, and you look down again. The game is
won by reaching the summit; the score is how many jumps it took.

The point of the game is that the two things a player learns by feel are exactly the two things the
update rule does:

```
theta  <-  theta  +  alpha * grad J(theta)
```

Go the way the slope points. Go further when it is steeper. The explanation section below the game
names the pieces (`theta` for position, `J` for the landscape, `grad J` for the slope, `alpha` for
the jump intensity) and then hands the same notation over to REINFORCE, where `theta` becomes the
policy parameters, `J(theta)` becomes the expected return, and `grad J` has to be estimated from
sampled episodes instead of measured.

## Running it

Open `index.html` in a browser. No build step, no server, no network: d3 and KaTeX are vendored
under `vendor/`.

## The five levels

Each level exists to make one failure mode of gradient ascent unmissable.

| # | Level | What it teaches |
|---|---|---|
| 1 | One hill | The sign of the slope is the direction to go |
| 2 | The long shelf | A near-zero slope still points the right way, but a small step will not move you |
| 3 | Two hills | Ascent walks to the nearest summit, not the best one: a local maximum |
| 4 | The narrow summit | A step size that suited gentle ground overshoots a sharp peak, and you oscillate |
| 5 | Rough ground | The slope you measure is contaminated: the REINFORCE case |

## Layout

```
index.html
css/
  style.css        theme tokens (light default + dark), page shell, shared class vocabulary
  game.css         game area
  explain.css      explanation area
js/
  theme.js         light/dark toggle, 't' shortcut
  landscapes.js    the five levels: J, pinned peak/range/maxima/par, demo jump sequences
  localview.js     what the grasshopper sees (fixed scale, hopper always centred)
  worldview.js     the whole landscape, trail, visible-window band, summit after commit
  game.js          state, controls, verdict
  explain.js       the explanation section and its four figures
  main.js          boot and URL hooks
precompute/
  verify_landscapes.mjs   recomputes and asserts every pinned value in landscapes.js
vendor/            d3, katex (never a CDN)
```

### The one rule that matters in `localview.js`

The vertical scale of the grasshopper's window is **fixed per level**, in J units per pixel, and
the grasshopper always sits at the exact centre of the panel. It never auto-fits to the visible
window. If it did, a dead-flat shelf would look as steep as a cliff and levels 2 and 4 would stop
teaching anything.

## Verifying the levels

```
node precompute/verify_landscapes.mjs
```

It reads `js/landscapes.js` as the single source of truth, recomputes the peak, range, local
maxima, maximum slope, par and demo sequences numerically, and asserts every pinned value plus the
per-level invariants (the shelf really is flat, the two-hill trap really traps naive ascent, the
second-best summit really is far enough below the best one for the "you are on the summit" test to
be unambiguous).

## URL hooks

`?level=N` is a real deep link for the lecturer. The rest are dev affordances for headless
screenshots, not user features:

| Parameter | Effect |
|---|---|
| `?level=1..5` | Select a level |
| `?theme=dark` | Force a theme |
| `?test=revealed` | Landscape toggle on |
| `?test=hints` | Slope line and gradient readout on |
| `?test=played` | Replay the level's scripted climb |
| `?test=committed` | Replay the climb, then plant the flag |
| `?test=stuck` | Replay the sequence that ends short of the summit, then commit (the losing verdict) |
