// Une nuit en 33 secondes. La caméra traverse la ville de 19 h à 8 h ;
// H est l'heure de la nuit (19 → 32, soit 8 h le lendemain) au centre de l'écran.
(function () {
  const PX_PER_H = 640;
  const X0 = 960; // 19 h 00 au centre de l'écran quand la caméra est à 0
  const smooth = (p) => p * p * (3 - 2 * p);

  // Segments de caméra : [t0, t1, H0, H1] (ease in-out) ; entre deux segments, la caméra tient
  const SEG = [
    [0.8, 10.2, 19.034, 23.783], // l'horloge marque 19:02 avec le titre, puis la caméra part jusqu'à Lyon, 23 h 47
    [10.2, 15.0, 23.783, 23.95], // la caméra dérive à peine pendant la fiche
    [15.0, 19.0, 23.95, 30.667], // la fin de la nuit, jusqu'à 6 h 40
    [19.0, 22.0, 30.667, 32.0], // l'aube, jusqu'à 8 h 00
  ];
  function H(t) {
    if (t <= SEG[0][0]) return SEG[0][2];
    for (let i = 0; i < SEG.length; i++) {
      const [t0, t1, h0, h1] = SEG[i];
      if (t >= t0 && t <= t1) return h0 + (h1 - h0) * smooth((t - t0) / (t1 - t0));
      const next = SEG[i + 1];
      if (t > t1 && (!next || t < next[0])) return h1;
    }
    return SEG[SEG.length - 1][3];
  }
  // Le premier instant où la caméra atteint l'heure h (recherche par dichotomie, segment par segment)
  function tAt(h) {
    for (const [t0, t1, h0, h1] of SEG) {
      if (h >= h0 && h <= h1) {
        let a = t0;
        let b = t1;
        for (let k = 0; k < 40; k++) {
          const m = (a + b) / 2;
          if (H(m) < h) a = m;
          else b = m;
        }
        return (a + b) / 2;
      }
    }
    return 0;
  }

  // Les demandes de la nuit : celles de la landing (« Demandes ce soir »), mot pour mot
  const EQ = [
    { h: 20.233, time: "20:14", city: "Montréal", text: "Une location meublée, c'est possible ?", secs: 2 },
    { h: 21.633, time: "21:38", city: "Lisbonne", text: "Je peux visiter samedi matin ?", secs: 5 },
    { h: 22.85, time: "22:51", city: "Dubaï", text: "L'appartement près de la marina est toujours libre ?", secs: 3 },
    { h: 23.783, time: "23:47", city: "Lyon", text: "Le T3 près du parc est toujours disponible ?", secs: 4 },
    { h: 25.2, time: "01:12", city: "Casablanca", text: "Le prix est-il négociable ?", secs: 4 },
    { h: 27.083, time: "03:05", city: "Manchester", text: "Vous avez quelque chose avec jardin sous 400 000 ?", secs: 3 },
    { h: 29.933, time: "05:56", city: "Oran", text: "Vous avez une villa F4 à louer ?", secs: 3 },
  ];
  EQ.forEach((e) => {
    e.x = X0 + (e.h - 19) * PX_PER_H;
    e.t = tAt(e.h - 0.12); // la bulle s'ouvre juste avant que son heure passe au centre
  });

  window.N = {
    PX_PER_H,
    X0,
    W: X0 * 2 + 13 * PX_PER_H, // 10 240 px de ville
    H,
    tAt,
    camX: (t) => (H(t) - 19) * PX_PER_H,
    EQ,
    // Les inserts produit
    fiche: 10.45,
    ficheOut: 14.7,
    relance: 19.0,
    relanceOut: 21.9,
    rapport: 22.0,
    rapportOut: 25.4,
    payoff: 25.5,
    end: 28.6,
    total: 33.2,
  };
})();
