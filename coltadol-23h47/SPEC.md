# SPEC — « 23 h 47 »

GOAL:    le spectateur (agent ou directeur d'agence) se dit « l'agence dormait et le prospect a quand même eu sa réponse » et retient le nom Coltadol.
OUTPUT:  HyperFrames, 1080 × 1920, 30 i/s.
TIME:    26 s × 30 = 780 images. Pas de musique : la voix off (VoiceStudio) sera l'horloge plus tard, donc chaque temps laisse de la place à une phrase.

LOOK:
  Monde 1, le WhatsApp de l'acheteur (0 – 14,5 s)
    fond #efeae2, motif maison de 240 px (maisons, clés, bulles) en trait #d6cbb9 de 2 px ;
    en-tête blanc #ffffff de 0 à 330 px, barre de saisie de 1222 à 1322 px, clavier AZERTY #e3e5e8 de 1340 à 1920 px (zone de légende TikTok : décor seulement) ;
    bulles : Roboto 400 40 px / 1,32, sortantes #d9fdd3 à droite, entrantes #ffffff à gauche, rayon 22 px, ombre 0 2 px 1 px rgb(11 20 26 / .13) ;
    heure dans la bulle 28 px #667781 ; coches #8696a0 puis #53bdeb ; « écrit… » #1daa61.
    Titres « TikTok » : boîtes encre #0b1130, texte #eef0fa, Bricolage 800 à 80 % de largeur, 150 px puis 84 px, rayon 20 px.
    Surligneur des mots compris : #5ce6a5 à 55 %, balayé de gauche à droite.
  Monde 2, la nuit de la marque (14,5 – 26 s)
    ciel #0b1130 avec un halo ambre rgb(255 179 71 / .10) au ras de l'horizon (radial, pas de dégradé linéaire) ;
    trois plans de tours (#18225c, #0e1542, #060a22) dessinés comme la façade de la landing, fenêtres froides à 11–20 % ;
    une seule fenêtre verte #5ce6a5 ; ambre #ffb347 = quelqu'un attend ; rien d'autre n'est coloré ;
    texte #eef0fa, secondaire #8f98c6 ; titres Bricolage 800 80 % 128 px, tracking −2 % ;
    fiche : panneau #111a42, bord rgb(143 152 198 / .16), rayon 48 px, DM Sans, chiffres Bricolage, clés en IBM Plex Mono.

OBJECTS:
  le téléphone de l'acheteur = l'écran entier de WhatsApp (en-tête, bulles, coches, barre de saisie, clavier) ;
  l'agence = sa photo de profil, qui est la ville de nuit en miniature ;
  la demande = une fenêtre allumée (ambre en attente, verte répondue), règle de la landing ;
  la fiche prospect = le dossier de la section « Une conversation devient un prospect qualifié » (champs, anneau de score avec repère à 70, Prospect chaud, Réponse IA).

MOTION:
  arrivée des bulles : 0,32 s expo.out, échelle 0,92 → 1 depuis le coin de la queue, montée du fil 0,3 s power3.out ;
  saisie : texte révélé à vitesse constante, une touche du clavier marquée par image ;
  titres : mot par mot, flou 8 px → 0 en 0,14 s, 0,07 s d'écart, puis immobiles ; sortie flou + fondu 0,18 s ;
  zoom : 0,3 s de poussée vers l'avatar (power2.in), puis l'avatar couvre l'écran en 0,5 s (power3.in), fond WhatsApp flouté à 14 px ;
  la fenêtre devient la fiche en 0,5 s (power3.inOut), la ville plonge (×2,4, flou 12 px) ;
  score : compte 0 → 24 → 58 → 92 en power2.out, l'anneau suit ;
  logo : anneau tracé 0,55 s, queue 0,3 s back.out, point vert elastic.out(1, .45).

SHOTS:
  0 – 2,1     WhatsApp : message de l'acheteur déjà envoyé, « vu aujourd'hui à 19:02 », titre « 23 h 47. / L'agence est fermée. » ; à 0,95 s lu + « en ligne », à 1,2 s « écrit… ». Son : rien, puis notification à 2,1 s.
  2,1 – 9,75  Conversation : 3 réponses de l'agence, 2 réponses de l'acheteur tapées au clavier, mots compris surlignés en vert. Sons : notification / ping, clavier, envoi.
  9,75 – 12,85 Récapitulatif de l'agent (« Un conseiller va vous contacter rapidement. ») tenu.
  12,85 – 14,55 « Qui a répondu ? », poussée vers la photo de l'agence, qui s'ouvre et couvre l'écran. Son : souffle qui monte.
  14,55 – 17,3 La ville endort tout sauf une fenêtre verte. « L'agence dormait. » puis « Coltadol a répondu. » ; quelques fenêtres s'allument en ambre et passent au vert.
  17,3 – 21,75 La fenêtre verte grandit et devient la fiche : champs cochés, score 92, Prospect chaud, Nouveau → Qualifié, Réponse IA → Passée à l'humain. Son : souffle, pop sur « Prospect chaud ».
  21,8 – 26   Fin : le logo se dessine, « Votre responsable commercial IA. », « Essai gratuit », « 14 jours gratuits, sans carte bancaire. », coltadol.com. Impact sur le point vert.

BANNED: un vide sombre avec de petites choses au milieu ; lueurs, particules, orbes ; dégradés violets ou bleus, cartes en verre ; papier crème, serif, étiquettes mono en capitales ; tout centré ; tout en fondu-montée ; texte qui bouge pendant la lecture ; logo dans un coin ; trois cartes en ligne ; titre sur une capture assombrie ; l'IA qui fixe une visite ou promet un prix (le produit ne le fait pas) ; une relance envoyée sans humain.

QA:
  0 s     image de couverture lisible : WhatsApp, message de l'acheteur, titre complet ;
  2,4 s   la réponse de l'agence est arrivée, coches bleues ;
  9,9 s   récapitulatif lisible, mots surlignés dans les bulles de l'acheteur ;
  14,2 s  zoom en cours, aucune coupure ;
  15,8 s  ville endormie, une fenêtre verte, titre lisible ;
  20,5 s  fiche complète : 92, Prospect chaud, Qualifié, Passée à l'humain ;
  24,5 s  logo, accroche, bouton, mention.
