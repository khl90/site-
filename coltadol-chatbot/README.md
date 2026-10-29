# Coltadol — « C'est juste un chatbot ? » (slideshow, 6 slides)

Le format n° 2 du playbook : le carrousel TikTok « quelqu'un doute, puis on lui montre ». La slide 1 pose l'objection que les directeurs d'agence font en premier (c'est la première question de la FAQ du site). Les slides 2 à 5 y répondent chacune avec un vrai écran du produit. La slide 6 retourne la question.

| Fichier | Usage |
|---|---|
| `export/carrousel/slide-1.png` … `slide-6.png` | Les 6 images 1080 × 1920 pour le **mode photo TikTok** (carrousel). |
| `export/carrousel-instagram-4x5/slide-1.png` … | Les mêmes en 1080 × 1350 pour le **carrousel Instagram** (tout le contenu tient dans le cadre 4:5). |
| `export/coltadol-chatbot.mp4` | La version vidéo : 1080 × 1920, 30 i/s, 22 s, les slides défilent comme un carrousel. Effets sonores seulement. |
| `export/coltadol-chatbot-muet.mp4` | La même, sans aucun son, pour la voix off. |

## Les slides

| # | Texte (style TikTok) | L'écran du produit |
|---|---|---|
| 1 | **« C'est juste un chatbot ? »** · La première question des directeurs d'agence. · Ma réponse en 4 slides → | Le « C » ouvert du logo, en ambre : une question qui attend. |
| 2 | 1. Il ne répond pas juste. Il **qualifie** chaque prospect. | La fiche prospect : champs, score 92, Prospect chaud, Qualifié, Réponse IA passée à l'humain. |
| 3 | 2. Il repère les prospects restés **sans réponse.** | Relances IA : Karim B., « Prospect chaud sans réponse de l'agence depuis 26 heures. », le message suggéré, « Envoyer depuis le WhatsApp connecté », « Rien ne part sans vous. » |
| 4 | 3. Il trouve **le bien** à proposer à chacun. | Le moteur de matching : T3 avec balcon, Lyon 6e, 93/93 points, la surface « Non mentionné, retiré du calcul », Match à 100 %. |
| 5 | 4. Chaque matin à 8 h, il dit **qui appeler.** | Le Rapport directeur, « Sur WhatsApp à 8 h » : 12 nouveaux prospects, 3 chauds, 2 relances en retard, les prospects prioritaires (92, 74, 61). |
| 6 | Toujours « juste un chatbot » ? | Le « C » revient et le point vert tombe dedans (la réponse) : logo, « Votre responsable commercial IA. », Essai gratuit, 14 jours gratuits, sans carte bancaire, coltadol.com. |

**Légende à publier avec le carrousel** (exemple) : « On me demande toujours si Coltadol, c'est "juste un chatbot". Voilà ce qu'il fait après avoir répondu. Essai gratuit 14 jours, lien en bio. »

## Voix off pour la version vidéo (VoiceStudio)

| Début | Fin | Phrase |
|---|---|---|
| 0,3 s | 2,9 s | On me pose toujours la même question. Alors voilà ma réponse. |
| 3,7 s | 6,4 s | D'abord, chaque conversation devient une fiche, avec un score. |
| 7,3 s | 10,0 s | Ensuite, personne n'est oublié : il prépare la relance, vous l'envoyez. |
| 10,9 s | 13,6 s | Il classe vos biens pour chaque acheteur. |
| 14,5 s | 17,2 s | Et à huit heures, votre point du matin arrive sur WhatsApp. |
| 18,4 s | 21,5 s | Coltadol. Quatorze jours pour juger par vous-même. |

## Fidèle au produit

- Tous les textes d'interface viennent de `lib/landing-i18n/fr.ts` et des composants de la landing (`qualify-demo.tsx`, `lead-recovery.tsx`, `match-engine.tsx`, `director-report.tsx`) du dépôt `real-estate-saas-frontend` : poids des critères (25, 20, 20, 20, 8, surface retirée), seuil de 60 %, chiffres du rapport, message de relance de Karim B.
- La relance est envoyée par une personne (« Rien ne part sans vous. »), jamais seule.
- Chaque slide porte une mention « … d'exemple » : prospects, biens et chiffres fictifs, comme sur le site.

## Comment c'est fait

Projet [HyperFrames](https://hyperframes.heygen.com). Une composition par slide (`compositions/s1.html` … `s6.html`), chacune entre par la droite et sort par la gauche ; `compositions/fond.html` porte la nuit et la ville de la landing, qui glisse d'un cran à chaque balayage. Les temps sont dans `assets/timeline.js`.

```bash
cd coltadol-chatbot
npx hyperframes preview
npx hyperframes render -o export/coltadol-chatbot.mp4 -q delivery --crf 17 --keyframe-interval 2 --max-bitrate 14M -w 4
npx hyperframes snapshot --at 3.15,6.75,10.35,13.95,17.55,21.9 --no-end -o .hyperframes/stills   # les 6 images au repos
```

## Relecture

- `hyperframes check` : 0 erreur. Avertissements gardés : en vidéo, certains textes de carte (message suggéré, règle du score) restent moins longtemps qu'il ne faut pour tout lire ; dans le carrousel, chacun lit à son rythme.
- Le son (souffles, pops, impact sur le logo) a été mesuré, pas écouté.
- Le plus faible : la slide 1 n'a qu'un seul élément qui bouge en vidéo (la promesse). Avec plus de temps : faire tracer le « C » ambre au lancement.
