// Classement en ligne (Supabase). La clé ci-dessous est la clé publique du projet :
// elle est prévue pour figurer dans le code. Les droits sont limités côté serveur
// aux deux fonctions définies dans supabase/classement.sql.
(() => {
  'use strict';

  const BASE = 'https://ljhnaceryfwuhdowouus.supabase.co/rest/v1/rpc/';
  const KEY = 'sb_publishable_Q-8szvuK1BKJpx3y4WCAkA_1MWkfFvN';

  async function rpc(fn, body) {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 8000);
    try {
      const res = await fetch(BASE + fn, {
        method: 'POST',
        headers: { apikey: KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: ctl.signal,
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const txt = await res.text();
      return txt ? JSON.parse(txt) : null;
    } finally {
      clearTimeout(timer);
    }
  }

  window.Online = {
    // Envoie le meilleur score d'un mode ; le serveur ne garde que le plus haut.
    submit: (player, mode, score) => rpc('submit_score', {
      p_player: player.id, p_name: player.name, p_mode: mode, p_score: score, p_grp: player.grp || null,
    }),
    // Top 50 d'un mode : monde entier si grp est vide, sinon ce groupe.
    top: (mode, grp, playerId) => rpc('get_leaderboard', {
      p_mode: mode, p_grp: grp || null, p_player: playerId || null,
    }),
  };
})();
