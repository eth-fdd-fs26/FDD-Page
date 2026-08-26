# Fly the lander

A playable LunarLander for Weekend 4. Participants fly the same environment the
PPO exercise trains on, with the eight state numbers and the reward breakdown
live on screen, so the MDP stops being notation.

Live: served from the course site at fly-the-lander/index.html

## What it is for

The lecture deck shows LunarLander as four static panels: states, actions,
transitions, rewards. This page is the same four things, moving, under the
participant's own hands. The teaching payload is the **reward breakdown**: every
step shows what the shaping paid, what the fuel cost, and what the terminal
bonus was, next to the running return.

Three things land better after five minutes of flying than after any slide:

- most of the return is earned **before** touchdown, in small shaping increments
- **doing nothing is an action**, and often the right one, because the main
  engine costs 0.30 every frame it burns
- you choose the action; the environment chooses what happens next

## Honest about the physics

`js/lander.js` carries the split explicitly:

- **The reward function is transcribed line for line** from gymnasium's
  `envs/box2d/lunar_lander.py`, and the eight observations use that
  environment's exact scalings. This is the part that matters for MDP intuition
  and it is exact.
- **The physics is not Box2D.** Box2D does not belong in a lecture page, so the
  lander is integrated directly in the normalised state space with constants
  tuned until it flies like the original.

Tuning target and result: a plain PD autopilot (`referencePilot`, the one behind
the "Watch a pilot" button) lands **19 of 24 starts with a median return of
191** in about 396 steps. The real environment's trained agent lands in 375
steps for 262, and the notebook's own reference numbers sit in the same band. So
the difficulty and the score scale are right; the trajectories are not
bit-identical to Box2D and the page says so in the fine print.

Do not use it to compare scores against the notebook.

## Files

```
index.html
css/style.css     inherited from grasshopper: theme tokens + shell
css/game.css      stage, controls, the two readout cards
js/theme.js       light/dark, 't' shortcut, ?theme= override
js/lander.js      the MDP: physics + the exact reward function
js/main.js        canvas, input, readouts
```

No build step, no CDN, no fetch. Opens from `file://`.

## Dev affordances

`?test=mid` flies the reference pilot 140 steps and freezes, so a headless
screenshot shows live readouts instead of the untouched first frame.
`?test=landed` runs it to touchdown. `?theme=dark` forces the theme. These exist
for verification, not for participants.

## Verified

- Both JS files parse.
- Reference pilot: 19/24 landings, median return 191.
- The per-step rewards sum exactly to the reported return (checked to 1e-9).
- Headless screenshots read at 1400x980 and 1280x800, light and dark.
