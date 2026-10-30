# Coltadol — « POV : 8 h » (9:16, 22,6 s)

Le format « POV » du playbook, tourné comme une vidéo d'écran de téléphone. Un directeur d'agence se réveille : trois prospects ont été qualifiés pendant la nuit. À 8 h, le rapport du matin arrive sur WhatsApp. Il demande à l'assistant qui appeler en premier, et à 8 h 02 il appelle le prospect le plus chaud. C'est la suite de « 23 h 47 » : le même prospect (+33 6 •• •• 41 18, score 92).

| Fichier | Usage |
|---|---|
| `export/coltadol-8h.mp4` | 1080 × 1920, 30 i/s, H.264 + AAC. Effets sonores seulement. |
| `export/coltadol-8h-muet.mp4` | La même image, sans son, pour la voix off. |
| `export/coltadol-8h-couverture.jpg` | La première image (écran verrouillé à 7:59), comme couverture. |

## Le déroulé

| Temps | Ce qu'on voit |
|---|---|
| 0 – 3,5 s | L'écran verrouillé, fond d'écran = la ville de la landing à l'aube, fenêtres vertes (répondues pendant la nuit). 7:59. **POV : tu te réveilles. 3 prospects déjà qualifiés.** Trois notifications « Prospect qualifié » de l'Agence du Parc (23:49, 01:12, 06:40). 8:00 : le « Rapport du matin » tombe, la nuit se range en pile. |
| 3,5 – 4,2 s | On touche le rapport ; la notification grandit et devient WhatsApp. |
| 4,2 – 8,5 s | Le rapport en entier : nouveaux prospects depuis minuit, prospects chauds, relances en retard, en attente de réponse, opportunités de biens, **À appeler en priorité** (surligné), lien vers la console. On touche coltadol.com. |
| 8,5 – 14,3 s | La console, Assistant IA, Lecture seule. « Qui dois-je appeler en premier ? » La réponse du site, mot pour mot, puis « Consulté : Prospects, Fiche prospect, Relances en retard ». |
| 14,3 – 18 s | L'appel au +33 6 •• •• 41 18. **8 h 02 : premier appel. Au prospect le plus chaud.** |
| 18 – 22,6 s | Logo, « Votre responsable commercial IA. », Essai gratuit, 14 jours gratuits, sans carte bancaire, coltadol.com. |

## Voix off à enregistrer (VoiceStudio)

| Début | Fin | Phrase |
|---|---|---|
| 0,3 s | 3,3 s | Sept heures cinquante-neuf. La nuit a déjà été traitée. |
| 4,6 s | 7,6 s | À huit heures, le rapport arrive sur WhatsApp : qui appeler, et pourquoi. |
| 8,8 s | 10,2 s | Une question à l'assistant… |
| 10,4 s | 13,9 s | Il lit les prospects et les relances, et répond. Il ne touche à rien. |
| 14,8 s | 17,6 s | Huit heures deux. Le premier appel est pour le bon prospect. |
| 18,8 s | 22,0 s | Coltadol. Votre responsable commercial IA. |

Son du fichier : −21,5 LUFS intégrés, crête −8,3 dB, aucun écrêtage (mesuré, pas écouté) : il reste sous une voix à −14 LUFS.

## Fidèle au produit

- Les notifications et le rapport suivent les réglages « Notifications WhatsApp » de la console (`lib/i18n/fr.ts`) : envoyés sur le WhatsApp personnel depuis le numéro connecté de l'agence ; « Prospect qualifié » avec numéro, recherche, budget et score ; « Rapport du matin » à 8 h avec nouveaux prospects depuis minuit, prospects chauds, relances en retard, en attente de réponse, opportunités de biens, les trois prospects à appeler en priorité et un lien vers la console. La mise en forme exacte des messages vient du serveur : celle du film est une illustration de ce contenu.
- La question et la réponse de l'assistant, « Consulté » et « Lecture seule » sont ceux de la landing (`tasks-assistant.tsx`). L'assistant lit, il ne modifie rien.
- Prospects, agence et chiffres sont fictifs (« Réponse d'exemple. » à l'écran) ; ce sont les mêmes que sur le site.
- Les icônes de téléphone et de WhatsApp sont génériques (pas le logo de WhatsApp).

## Comment c'est fait

Projet [HyperFrames](https://hyperframes.heygen.com), une scène par monde : `ecran.html` (écran verrouillé), `rapport.html` (WhatsApp sombre), `assistant.html` (console), `appel.html`, `fin.html`. On passe de l'un à l'autre par un objet à l'écran : la notification qui grandit, l'iris qui part du lien touché, un balayage vers l'appel, la nuit qui recouvre l'appel. Les temps sont dans `assets/timeline.js`.

```bash
cd coltadol-8h
npx hyperframes preview
npx hyperframes render -o export/coltadol-8h.mp4 -q delivery --crf 17 --keyframe-interval 2 --max-bitrate 14M -w 4
```

## Relecture

- `hyperframes check` : 0 erreur. Avertissements gardés : la notification du rapport et la réponse de l'assistant restent moins longtemps qu'il ne faut pour tout lire (le spectateur en retient l'essentiel, et le rapport est relu en entier juste après) ; l'heure « 23:49 » des cartes rangées en pile est petite pendant qu'elle disparaît.
- Le plus faible : l'écran d'appel est le seul plan sans le produit. Avec plus de temps : afficher la fiche du prospect en petit au-dessus des boutons, comme le ferait un CRM sur l'appel entrant.
