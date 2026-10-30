# SPEC — « POV : 8 h »

GOAL:    un directeur d'agence se reconnaît : il se réveille, la nuit a été traitée, et à 8 h 02 il appelle déjà le bon prospect.
OUTPUT:  HyperFrames, 1080 × 1920, 30 i/s.
TIME:    22,6 s × 30 = 678 images. Pas de musique (voix off VoiceStudio plus tard), effets sur les actions.

LOOK:
  Monde 1, écran verrouillé (0 – 4,2 s) : fond d'écran = la ville de la landing à l'aube (ciel #0b1130 → #2a2f78, halo ambre rgb(255 179 71 / .30) à l'horizon, fenêtres vertes = demandes répondues pendant la nuit) ; heure Bricolage 800 à 92 % de largeur, 230 px, blanc ; notifications blanches à 94 %, rayon 44 px, Roboto 34 px.
  Monde 2, WhatsApp sombre (4,2 – 8,5 s) : fond #0b141a, motif maison en trait rgb(255 255 255 / .06), en-tête #1f2c34, bulle entrante #1f2c34, texte #e9edef, heure #8696a0, lien #53bdeb, Roboto 37 px / 50 px.
  Monde 3, la console (8,5 – 14,5 s) : nuit #0b1130, panneau #111a42, bord rgb(143 152 198 / .16), question #1a2457, réponse bord rgb(92 230 165 / .25) fond rgb(92 230 165 / .08), DM Sans 38 px, titres Bricolage.
  Monde 4, l'appel (14,5 – 18,4 s) : fond #15172b → #0b1130, nom DM Sans 600 76 px, minuterie 36 px #8f98c6, boutons ronds rgb(255 255 255 / .14), raccrocher #ff3b30.
  Titres « TikTok » : boîtes blanches, texte #0b1130, DM Sans 800 56 px, mot clé surligné en vert #5ce6a5 (répondu) ou ambre #ffb347 (attend).

OBJECTS: un téléphone (écran verrouillé, notifications WhatsApp, appli WhatsApp, écran d'appel) ; la console Coltadol (assistant) ; le logo.

MOTION:
  notification : chute 0,45 s expo.out depuis −80 px ; la pile se range en 0,4 s power3.inOut ;
  zoom par la notification : 0,55 s power3.in, elle couvre l'écran et son blanc devient l'en-tête sombre de WhatsApp ;
  iris depuis le lien : clip-path circle 0 → 1500 px en 0,4 s power2.in ;
  balayage vers l'appel : 0,25 s, flou horizontal 16 px ;
  réponse de l'assistant : mot par mot, 0,065 s d'écart ; minuterie de l'appel calculée depuis le temps du film.

SHOTS:
  0 – 3,5    Écran verrouillé, 7:59, trois notifications « Prospect qualifié » de la nuit (23:49, 01:12, 06:40). Titre : « POV : tu te réveilles. / 3 prospects déjà qualifiés. » 8:00 à 1,5 s, le « Rapport du matin » tombe à 1,8 s, la nuit se range en pile.
  3,5 – 4,2  On touche le rapport, il grandit et devient WhatsApp.
  4,2 – 8,5  Le rapport du matin en entier ; « 8 h 00 : le point du matin. » ; la caméra s'approche de « À appeler en priorité » ; on touche coltadol.com.
  8,5 – 14,3 La console : « Qui dois-je appeler en premier ? » tapé, puis la réponse de l'assistant mot pour mot (site), « Consulté » et « Lecture seule ».
  14,3 – 18  L'appel : +33 6 •• •• 41 18, la minuterie tourne. « 8 h 02 : premier appel. / Au prospect le plus chaud. »
  18 – 22,6  Fin : logo dessiné, « Votre responsable commercial IA. », Essai gratuit, mentions, coltadol.com.

BANNED: les défauts de `spec.md` (vide sombre, lueurs, dégradés violets, verre, tout centré, tout en fondu-montée, logo dans un coin, trois cartes en ligne) ; le logo WhatsApp (icône verte générique à la place) ; une relance ou un message envoyé sans humain ; l'assistant qui modifie quoi que ce soit (il lit seulement).

QA: 0 s couverture lisible ; 2,6 s rapport arrivé et pile rangée ; 6,8 s liste « À appeler en priorité » lisible ; 13 s réponse complète ; 16 s appel et titre ; 21 s fin.
