# Coltadol — publicité motion design 9:16

Une publicité verticale de 28 s pour Instagram Reels, TikTok et YouTube Shorts : 1080 × 1920, 30 i/s, H.264 + AAC, son à −14 LUFS.

| Fichier | Usage |
|---|---|
| `export/coltadol-reel.mp4` | La vidéo finale, avec sa bande-son. |
| `export/coltadol-silent.mp4` | La même sans son, pour poser un son tendance sur TikTok ou Instagram. |
| `export/coltadol-poster.jpg` | La dernière image (logo + CTA), comme couverture. |
| `export/coltadol-storyboard.jpg` | 12 images du film sur une planche. |

## Le concept : « chaque fenêtre est une demande »

La landing de Coltadol raconte déjà le produit avec une image : une ville la nuit, où chaque fenêtre qui s'allume est une demande WhatsApp. Elle est ambre tant que quelqu'un attend, et passe au vert dès que Coltadol a répondu. Le logo est la même histoire : un « C » en bulle de dialogue, ouvert à droite (une question), fermé par un point vert (la réponse). Le film prend cette métaphore au pied de la lettre, en 3D.

| Temps | Scène | Ce qu'on voit |
|---|---|---|
| 0–2 s | **Accroche** | Une seule fenêtre s'allume en ambre dans une façade sombre. Un message WhatsApp en sort (« Bonjour, le T3 à Lyon 6e est toujours disponible ? »). « 22:58 » roule jusqu'à « 23:47 ». *Votre agence est fermée.* |
| 2–7 s | **Le problème** | La caméra recule : toute une ville de fenêtres ambrées, chacune un prospect qui attend. Les bulles s'envolent vers l'objectif. *Ils écrivent à toute heure.* Les besoins se détachent en étiquettes (« budget ? », « ville ? », « achat ou location ? »). *Leurs besoins s'éparpillent.* Des fenêtres grésillent et s'éteignent. *Des prospects s'oublient.* Tout est aspiré vers un point. |
| 7–9,8 s | **La réponse** | Le point vert du logo frappe. L'anneau et la queue du « C » se dessinent, et une onde fait virer la ville au vert, fenêtre par fenêtre. *Coltadol répond. À chaque demande.* *Sur WhatsApp, jour et nuit, dans la langue du prospect.* La caméra plonge dans la fenêtre du premier prospect. |
| 9,8–14,6 s | **Qualification** | La fenêtre devient le téléphone. La conversation s'écrit et chaque information comprise (T3, Lyon 6e, achat, fin novembre, 320–350 k€) se détache en donnée qui vole vers la fiche prospect. Le score monte à 92 et l'anneau passe à l'ambre au-delà de 70 : *Prospect chaud*. *Rien ne manque*, puis la réponse IA passe à l'humain. |
| 14,6–17,5 s | **Organisation** | La fiche rejoint la console. Les autres prospects arrivent comme des lumières venues de la ville et la liste se trie par score. *Chaque prospect, classé et suivi.* |
| 17,5–20,5 s | **Relance** | Karim B. est repéré : « Sans réponse depuis 24 h ». Lead Recovery propose un message qui s'écrit, un doigt l'envoie, « ✓ Relance envoyée ». *Les silences deviennent des relances.* *Vous validez. Rien ne part sans vous.* |
| 20,5–23,8 s | **Le matin** | L'aube se lève et « 23:47 » roule jusqu'à « 08:00 ». Le Rapport directeur arrive sur WhatsApp, avec ses métriques, les prospects prioritaires et un match à 100 %. *Qui appeler. Quoi proposer.* |
| 23,8–28 s | **Fin** | Logo dessiné, *Votre responsable commercial IA.*, les 4 piliers, le bouton « Essai gratuit 14 jours » cliqué, `coltadol.com`, « Sans carte bancaire · avec votre numéro WhatsApp actuel ». |

## Fidèle à la marque et au produit

Tout vient du dépôt `real-estate-saas-frontend` (le site et la console) :

- **Couleurs** : les tokens de `app/night.css` (`--night #0b1130`, `--haze`, `--limewash`, `--lamp #ffb347` = en attente, `--signal #5ce6a5` = répondu), avec la même règle : rien d'autre n'est coloré.
- **Polices** : Bricolage Grotesque à 75 % de largeur et graisse 800 (le titre du hero), DM Sans pour le texte, IBM Plex Mono uniquement pour les clés de données. Les fichiers sont dans `assets/fonts` (licences OFL jointes).
- **Logo** : les tracés exacts de `components/coltadol-mark.tsx` (anneau, queue, point, mot-symbole vectorisé), copiés à l'identique.
- **Mouvement** : l'entrée des titres reprend celle du hero (SplitText, `expo.out`, lettres sorties d'un masque de ligne), et les surfaces reprennent `.cx-pane`.
- **Contenus** : la conversation, la fiche (Projet, Type de bien, Ville, Chambres, Budget, Urgence), la règle « Chaud dès 70, ou si l'urgence est haute », « Informations manquantes / Rien ne manque », « Réponse IA · Passée à l'humain », Lead Recovery (« Sans réponse depuis 24 h », message suggéré, « Envoyer depuis le WhatsApp connecté », « Rien ne part sans vous »), le Rapport directeur de 8 h sur WhatsApp et ses quatre métriques, « Match à 100 % · 342 000 € », les menus de la console (Vue d'ensemble, Prospects, Relances, Biens, Équipe, Assistant IA), « 14 jours gratuits, sans carte bancaire », « le numéro WhatsApp que vous publiez déjà ». Tout est repris de `lib/landing-i18n/fr.ts` et `lib/i18n/fr.ts`.
- **Honnêteté** : comme sur le site, une mention discrète indique « Conversations, prospects et chiffres d'exemple. ». Aucune statistique de performance n'est inventée. Les relances sont montrées envoyées par une personne, jamais automatiquement, comme le produit le garantit.

## Techniques

- **Rendu image par image** : une page HTML de 1080 × 1920 où chaque style est une fonction pure du temps, sans aucune animation CSS. `scripts/render.mjs` pilote Chromium en mode headless (Playwright), capture chaque image et l'envoie à FFmpeg. Le rendu est donc identique d'une machine à l'autre et se parallélise sur plusieurs processus.
- **Flou de mouvement réel** : chaque image est la moyenne de 4 sous-images réparties sur un obturateur à 180° (`tmix` de FFmpeg). Les zooms, panoramiques et titres traînent comme avec une vraie caméra.
- **Ville en 3D** : environ 120 tours en vraie perspective sont dessinées sur un canvas 2D, avec une caméra maison (lacet, tangage, roulis, focale). Il y a du brouillard atmosphérique par tour, une brume au sol, des balises d'antenne et des halos additifs sur les fenêtres. Chaque fenêtre suit un calendrier d'états (éteinte → ambre → verte, ou ambre → grésille → éteinte), et la vague verte se propage selon la distance au premier prospect. La profondeur de champ est simulée par un rendu réduit, flouté puis agrandi.
- **Interfaces en 3D CSS** : téléphone, fiche et console sont de vrais composants HTML placés dans une scène en perspective (panoramique, inclinaison, recul). Les puces de données suivent des courbes de Bézier entre des positions mesurées en direct à l'écran, avec une traînée lumineuse.
- **Lumière** : une couche canvas en fusion `screen` porte les halos, ondes de choc, étincelles, lignes de vitesse et faisceaux de balayage. Un voile sombre se place sous les grands titres, et le grain argentique est ajouté par FFmpeg (bruit temporel, ce qui évite aussi le banding des dégradés en H.264).
- **Encodage** : conversion RGB → YUV en BT.709 avec les métadonnées associées (couleurs justes sur téléphone), H.264 High en CRF 18 plafonné à 14 Mb/s, une image clé toutes les 2 s et `faststart`, ce qui correspond à ce que recompressent Instagram, TikTok et YouTube. Le master sans perte (`out/master.mkv`) est conservé : `node scripts/render.mjs --encode-only` réencode sans refaire le rendu.
- **Son** : `scripts/audio.mjs` synthétise toute la bande-son (oscillateurs, bruit, filtres, réverbération, sans aucun échantillon) à partir des repères de `src/timeline.js`. Chaque notification, onde, clic et impact tombe donc sur son image. La musique est un bourdon tendu avec une horloge, puis un groove à 120 BPM (Fa – Do – Sol – Lam) avec ducking sous la grosse caisse, et enfin un accord final sur le logo. Le mixage est normalisé à −14 LUFS.

## Reproduire le rendu

Prérequis : Node 18+, FFmpeg 6 et Playwright avec Chromium (`npm i -D playwright && npx playwright install chromium` si absent).

```bash
cd coltadol-motion
npm run build        # rendu (≈ 10 min sur 4 cœurs) → son → montage → export/
```

Les étapes séparées :

```bash
node scripts/render.mjs                   # out/coltadol-silent.mp4
node scripts/audio.mjs                    # out/soundtrack.wav
node scripts/mux.mjs                      # son à −14 LUFS + poster + storyboard → export/
```

Pour travailler :

```bash
node scripts/render.mjs --stills 0.5,7.6,13.9      # images fixes → out/stills/
node scripts/sheet.mjs out/planche.png 1,3,5,7     # planche-contact
node scripts/render.mjs --from 9 --to 15 --out essai   # une section
node scripts/render.mjs --mb 1                     # sans flou de mouvement (4× plus rapide)
```

Il y a aussi un aperçu temps réel avec barre de lecture : ouvrir `src/index.html` dans Chrome (`?t=12` pour démarrer à 12 s).

## Modifier le film

- **Timing** : tout est dans `src/timeline.js` (`T`). Les scènes et la bande-son lisent les mêmes valeurs, il n'y a donc rien d'autre à resynchroniser.
- **Textes** : les titres sont dans `src/index.html` (`data-text`, avec `*mots*` pour la couleur), et les données (conversation, fiche, prospects, relance) en tête de `src/scenes.js`.
- **Ville, caméra** : `src/city.js` (`camAt`, rangées de tours, calendrier des fenêtres).

```
src/
  index.html    la scène et les composants
  styles.css    tokens de la marque, composants
  engine.js     easings, découpe du texte, odomètre, tracés du logo
  timeline.js   l'horloge du film et les repères sonores
  city.js       la ville en 3D et sa caméra
  fx.js         lumière, particules, grain
  scenes.js     les 8 séquences
  main.js       rendu (?render) ou aperçu
scripts/        render.mjs, audio.mjs, mux.mjs, sheet.mjs
assets/         polices (OFL) et logos de la marque
docs/           analyse des références
```
