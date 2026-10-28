// Horloge du film, en secondes depuis le début. Le monde 3D, les titres et
// les scènes lisent tous ces repères : changer un temps ici décale tout ce
// qui en dépend. Les hôtes de index.html reprennent ch1, ch2, ch3 et fin.
window.CX = {
  D: 32,
  T: {
    // Intro : les deux agences
    thomasPop: 1.15, // l'agence de Thomas surgit à côté de celle de Yasmine
    cards: 3.15, // les mêmes annonces arrivent dans les deux vitrines
    equals: 3.55,
    stacks: 5.25, // les agendas de visites s'empilent
    // 1. La vitesse
    ch1: 7.5,
    nightIn: 7.6,
    nightFull: 8.35,
    msg: 8.75, // 23:47, la même demande arrive dans les deux agences
    reply: 10.45, // chez Yasmine, la réponse part tout de suite
    nextDay: 11.9, // chez Thomas, le lendemain
    stat: 13.3, // ×7
    dayIn: 14.6,
    dayFull: 15.3,
    // 2. Les silences
    ch2: 15.5,
    people: 16.05,
    ghost: 16.6, // un prospect silencieux chez Thomas…
    ghostFade: 17.75, // …qu'il oublie
    yasmineCam: 18.45,
    silent: 18.75, // le même prospect chez Yasmine
    tap: 20.2, // elle envoie la relance
    sent: 20.95,
    // 3. Qui appeler
    ch3: 21.4,
    morningIn: 21.5,
    morningFull: 22.3,
    crowd: 21.9,
    report: 22.55, // Rapport directeur de 8 h sur WhatsApp
    hot: 23.3, // les prospects chauds sortent du lot
    match: 23.85,
    same: 25.0, // même rue, mêmes biens
    fin: 26.4,
    cta: 28.6,
  },
};
