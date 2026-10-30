# Coltadol — « Une nuit » (film de lancement 16:9, 33 s)

Le format « vidéo de lancement en motion design » du playbook, pour X, LinkedIn et YouTube. Une nuit entière en 33 secondes. La caméra traverse la ville de la landing de 19 h à 8 h, une horloge tourne en haut à droite. Les demandes d'exemple du site s'allument en ambre (quelqu'un attend), puis passent au vert avec « répondu en N s ». À 23 h 47, la demande de Lyon devient une fiche prospect ; à l'aube, une relance ; à 8 h, le rapport. Enfin la caméra recule : toute la nuit est verte. « Aucun prospect sans réponse. »

| Fichier | Usage |
|---|---|
| `export/coltadol-lancement-16x9.mp4` | 1920 × 1080, 30 i/s, H.264 + AAC. Effets sonores seulement. |
| `export/coltadol-lancement-16x9-muet.mp4` | La même image, sans son, pour la voix off. |
| `export/coltadol-lancement-16x9-couverture.jpg` | La première image (« 19 h 02. Les agences ferment. »). |
| `export/coltadol-lancement-16x9-planche.jpg` | 9 images du film. |

## Le déroulé

| Temps | Ce qu'on voit |
|---|---|
| 0 – 3 s | La ville au crépuscule, l'horloge à 19:02. **19 h 02. Les agences ferment.** |
| 3 – 10 s | La caméra part dans la nuit. **Les acheteurs, eux, écrivent toute la nuit.** Montréal 20:14, Lisbonne 21:38, Dubaï 22:51, Lyon 23:47 : chaque bulle sort d'une fenêtre ambre, puis la fenêtre passe au vert avec « Montréal, répondu en 2 s ». **Coltadol répond à chacun.** |
| 10,4 – 15 s | La bulle de Lyon devient la fiche : champs cochés, score 92, Prospect chaud, Qualifié. **Une conversation devient un prospect qualifié.** |
| 15 – 19 s | Casablanca 01:12, Manchester 03:05, Oran 05:56. **De jour comme de nuit.** |
| 19 – 22 s | L'aube. Relances IA : Karim B., le message suggéré, « Envoyer depuis le WhatsApp connecté ». **Les prospects qui se taisent vous reviennent.** |
| 22 – 25,4 s | 8:00. Le Rapport directeur. **Chaque matin, une page : qui appeler et quoi proposer.** |
| 25,5 – 28,6 s | La caméra recule et repasse la nuit : toutes les fenêtres sont vertes. **Aucun prospect sans réponse.** |
| 28,6 – 33,2 s | Logo, « Votre responsable commercial IA. », Essai gratuit, 14 jours gratuits, sans carte bancaire, coltadol.com. |

Tous les titres sont des phrases du site : `qualify.title`, `recovery.title`, `director.title`, `promise.headline`, `hero.title`.

## Voix off à enregistrer (VoiceStudio)

| Début | Fin | Phrase |
|---|---|---|
| 0,4 s | 2,9 s | Dix-neuf heures. Les agences ferment leurs portes. |
| 3,4 s | 6,4 s | Mais les acheteurs continuent d'écrire, toute la nuit. |
| 6,8 s | 9,8 s | À chaque message, une réponse. En quelques secondes, sur WhatsApp. |
| 10,8 s | 14,4 s | Il pose les bonnes questions, et vous laisse une fiche prête : budget, délai, score. |
| 15,4 s | 18,6 s | Lyon, Casablanca, Manchester… Personne n'attend jusqu'au matin. |
| 19,3 s | 21,8 s | Ceux qui se taisent ? Il vous prépare la relance. |
| 22,3 s | 25,2 s | Et à huit heures, vous savez qui appeler. |
| 26,0 s | 28,4 s | Pas un seul prospect sans réponse. |
| 29,4 s | 32,6 s | Coltadol. Votre responsable commercial IA. Essai gratuit. |

Son du fichier : −22,7 LUFS intégrés, crête −8,9 dB, aucun écrêtage (mesuré, pas écouté).

## Fidèle au produit

- Les demandes, villes et délais (« Lyon, répondu en 4 s »…) sont ceux de la landing (`hero.enquiries`, `answeredIn`), qui les présente comme des messages d'illustration ; les heures de la nuit sont ajoutées pour le film.
- La fiche, la relance et le rapport sont les mêmes écrans que dans les vidéos 9:16, repris de la landing et de la console.
- La ville reprend `components/landing/facade.tsx` (trois plans de tours, ambre = attend, vert = répondu) ; le ciel passe du crépuscule à la nuit puis à l'aube.
- Mentions « … d'exemple » sur chaque écran de produit.

## Comment c'est fait

Projet [HyperFrames](https://hyperframes.heygen.com) en 1920 × 1080.

- `assets/timeline.js` : la courbe de la caméra (l'heure de la nuit en fonction du temps du film), les 7 demandes et les temps des inserts. Les temps des bulles et de leurs sons en découlent.
- `compositions/monde.html` : la ville de toute la nuit (une toile de 10 240 px peinte une fois), les fenêtres qui s'allument et le recul final (dessinés image par image), les bulles, l'horloge.
- `compositions/fiche.html`, `relance.html`, `rapport.html` : les écrans du produit.
- `compositions/titres.html`, `compositions/fin.html`.

```bash
cd coltadol-lancement
npx hyperframes preview
npx hyperframes render -o export/coltadol-lancement-16x9.mp4 -q delivery --crf 17 --keyframe-interval 2 --max-bitrate 14M -w 4
```

## Relecture

- `hyperframes check` : 0 erreur. Avertissements gardés : les bulles de 01:12 et 03:05 passent vite (c'est le montage de la fin de nuit) ; les petits textes des cartes (étiquettes, 24 px une fois réduites) ; le message de relance s'écrit sans laisser le temps de tout lire.
- Le plus faible : pendant le recul (25,5 – 27 s), la ville remonte encore un peu avant de se poser en bas. Avec plus de temps : une musique qui s'ouvre sur ce recul.
