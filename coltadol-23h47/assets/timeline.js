// Tous les repères de temps du film, en secondes. Chaque scène les lit ici,
// pour que la conversation, la ville et la fin restent calées entre elles.
window.T = {
  // Le crochet : la question est déjà envoyée, l'agence est « fermée »
  hookOut: 1.85,
  read1: 0.95, // b1 lu (coches bleues), l'agence passe « en ligne »
  typing1: 1.2, // « écrit… »
  a1: 2.1,

  // L'acheteur répond : saisie, envoi, mots notés
  b2Type: 3.5,
  b2Send: 4.35,
  b2Mark: [4.8, 5.1],
  typing2: 5.45,
  a2: 6.15,

  b3Type: 6.95,
  b3Send: 7.8,
  b3Mark: [8.2, 8.45],
  typing3: 8.85,
  a3: 9.75,

  // « Qui a répondu ? », puis on entre dans la photo de l'agence
  question: 12.85,
  zoom: 13.9,
  zoomEnd: 14.55,

  // La ville endormie
  night1: 14.75, // « L'agence dormait. »
  night2: 16.15, // « Coltadol a répondu. »
  others: 16.35, // d'autres fenêtres s'allument puis répondent
  morph: 17.3, // la fenêtre devient la fiche
  card: 17.75,
  cardOut: 21.75,

  // Fin
  end: 21.8,
  total: 26.5,
};
