# The bandit problem

Five slot machines. Each pays out with a fixed but hidden probability. Every round you
pick one and pull, you see one outcome, and you decide what to do next. That is the whole
game, and it is the whole problem: **you have to play and you have to learn, at once.**

It exists here as the hands-on half of the UCT recap in the Weekend 6 LATS lecture. A tree
search picks a child the same way a player picks a machine, so the room should have felt
the trade-off before it meets the formula that resolves it.

## Provenance, and which copy is canonical

**This is a trimmed copy. The canonical version belongs to the SML course**, at
`sml-fs26/classic_rl`, working copy `~/Documents/git_sml/classic_rl/casino/`. Fix bugs
there first, then re-trim, or the two drift.

The SML original is a five scene click-through: the free play board, explore or exploit,
epsilon greedy, the trade off, and a recap. **Carlos asked for one scene only, just the
basics (2026-08-22)**, so only the board survives. Everything cut is one `git` away in the
SML repo; nothing was rewritten, only removed.

What changed, and nothing else did:

| Change | Where |
|---|---|
| `SCENES` reduced to `scene0` | `js/main.js` |
| `scene1/4/5/6` js and css deleted, and their tags | `index.html`, `js/scenes/`, `css/` |
| Pager (arrows and dots) removed: nowhere to page to | `index.html` |
| Two footer lines that pointed at the cut scenes, rewritten | `js/scenes/scene0.js` |
| Brand line and `<title>`: SML to From Data to Solutions | `index.html` |
| `precompute/` dropped: it builds the autoplay datasets the cut scenes used | (deleted) |

`data/datasets.js` is kept even though only the cut scenes read it, because it is what
`precompute/` produced and dropping it would make the SML original harder to re-trim.

## Running it

Open `index.html`. No build step, no server, no network: KaTeX is vendored under
`vendor/`, and the only URL in the source is the SVG namespace.

## Where it is published

- Served from this site at bandits/index.html (the internal fdd-hs26 Pages was retired when that repo went private)
- Linked from the official course site on the Weekend 6 page, in the schedule and in the
  resources, beside the grasshopper game.
