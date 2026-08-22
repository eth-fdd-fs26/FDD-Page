/* Scene 0 — five unknown machines, PLAYABLE.

   The SML original's scene 0 was a static title board: it hand built five cards
   and never attached a handler, because playing began in scene 1. When this deck
   was trimmed to one scene (Carlos, 2026-08-22) that left a board that looked
   clickable and was not. Carlos found it immediately: "I click on a machine but
   nothing happens."

   So the board is now mounted through machine-row.js, the component the playable
   scenes use, and setClickable is wired. Click a machine, or press 1 to 5, and
   you pull it: the card flashes win or no-win, its screen turns from ? into the
   running average, and the pull count goes up.

   Two departures from the original, both deliberate:
     * the five probabilities are PERMUTED on every load, so which machine is
       best cannot be memorised between runs. The multiset is unchanged, so it is
       the same problem the SML notebook poses, only shuffled.
     * a reveal button, because a bandit you never learn the truth about teaches
       nothing. It is the payoff, so it stays greyed until you have spent pulls.

   Cold-entry safe: everything is built from DATA.bandit. */
(function () {
  if (!window.scenes) window.scenes = {};

  window.scenes.scene0 = function (root) {
    const cfg = window.DATA && window.DATA.bandit;
    const Bandit = window.Bandit;
    const MachineRow = window.MachineRow;

    root.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 's0-wrap';

    /* Hero */
    const hero = document.createElement('div');
    hero.className = 'hero';
    const h1 = document.createElement('h1');
    h1.textContent = 'Five unknown machines.';
    hero.appendChild(h1);
    const sub = document.createElement('p');
    sub.className = 'subtitle';
    sub.textContent = 'You have to play. You have to learn. Both at once.';
    hero.appendChild(sub);
    const lede = document.createElement('p');
    lede.className = 'lede';
    lede.textContent =
      'Each machine pays out with a fixed but hidden probability. Every round you ' +
      'pick one and pull. You see one outcome, win or no-win, and decide what to do next.';
    hero.appendChild(lede);
    wrap.appendChild(hero);

    /* A fresh permutation of the same five probabilities on every load. */
    const seed = (Date.now() >>> 0) ^ 0x5bf03635;
    const shuffleRng = Bandit.makeRng(seed);
    const probs = cfg.probs.slice();
    for (let i = probs.length - 1; i > 0; i--) {
      const j = Math.floor(shuffleRng() * (i + 1));
      const t = probs[i]; probs[i] = probs[j]; probs[j] = t;
    }
    const bandit = Bandit.create(probs, Bandit.makeRng(seed ^ 0x9e3779b9));

    /* The board */
    const rowHost = document.createElement('div');
    wrap.appendChild(rowHost);
    const row = MachineRow.mount(rowHost, {
      K: cfg.K,
      armNames: cfg.armNames,
      trueProbs: probs,
    });

    let pulls = 0, wins = 0, revealed = false;

    function pull(arm) {
      if (revealed) return;
      const reward = bandit.pull(arm);
      pulls += 1;
      if (reward === 1) wins += 1;
      row.update(bandit);
      row.flash(arm, reward === 1 ? 'win' : 'loss');
      row.setLastChosen(arm);
      renderHud();
    }
    row.setClickable(pull);
    /* setKeyboardShortcut only STORES the handler; nothing in main.js dispatches
       to it (scene 1 registered its own listener). The hud promises "press 1 to
       5", so the listener has to be real or the promise is a lie. */
    row.setKeyboardShortcut(pull);
    function onKey(e) {
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= cfg.K) { e.preventDefault(); pull(n - 1); }
    }
    window.addEventListener('keydown', onKey);

    /* Score line */
    const hud = document.createElement('p');
    hud.className = 's0-promise';
    wrap.appendChild(hud);

    const revealBtn = document.createElement('button');
    revealBtn.type = 'button';
    revealBtn.className = 'pager-btn';
    revealBtn.textContent = 'show the true probabilities';
    revealBtn.addEventListener('click', () => {
      revealed = true;
      row.setRevealed(true);
      revealBtn.disabled = true;
      renderHud();
    });

    const btnLine = document.createElement('p');
    btnLine.className = 'footnote';
    btnLine.appendChild(revealBtn);
    wrap.appendChild(btnLine);

    function renderHud() {
      if (revealed) {
        const best = probs.indexOf(Math.max.apply(null, probs));
        hud.textContent =
          cfg.armNames[best] + ' was the best machine, at ' + probs[best].toFixed(2) + '. ' +
          'You pulled ' + pulls + ' times and won ' + wins + '.';
      } else if (pulls === 0) {
        hud.textContent =
          'Click a machine to pull it, or press 1 to 5. Nothing tells you which one ' +
          'is best; the only way to find out is to spend pulls finding out.';
      } else {
        hud.textContent =
          pulls + (pulls === 1 ? ' pull' : ' pulls') + ', ' + wins +
          (wins === 1 ? ' win' : ' wins') + '. Keep going, or reveal the answer below.';
      }
      revealBtn.disabled = revealed || pulls === 0;
    }
    renderHud();

    const foot = document.createElement('p');
    foot.className = 'footnote';
    foot.textContent = 'Reload to shuffle the machines and start again.';
    wrap.appendChild(foot);

    root.appendChild(wrap);
    return { onLeave() { window.removeEventListener('keydown', onKey); } };
  };
})();
