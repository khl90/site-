# Coltadol — « 23 h 47 » (conversation WhatsApp, 9:16, 26,5 s)

Le format n° 1 du playbook : une conversation WhatsApp qui s'écrit à l'écran, ouverte directement sur un message. Un acheteur écrit à une agence à 23 h 47 et elle lui répond dans la minute. « Qui a répondu ? » La photo de profil de l'agence s'ouvre sur une ville endormie : une seule fenêtre est verte. C'était Coltadol, et la conversation est devenue une fiche prospect.

| Fichier | Usage |
|---|---|
| `export/coltadol-23h47.mp4` | 1080 × 1920, 30 i/s, H.264 + AAC. Effets sonores seulement (pas de musique, pas de voix). |
| `export/coltadol-23h47-muet.mp4` | La même image, sans aucun son : pour poser la voix off (VoiceStudio) et un son tendance. |
| `export/coltadol-23h47-couverture.jpg` | La première image (« 23 h 47. L'agence est fermée. »), comme couverture. |
| `export/coltadol-23h47-planche.jpg` | 12 images du film sur une planche. |

## Le déroulé

| Temps | Ce qu'on voit |
|---|---|
| 0 – 2,1 s | Le WhatsApp de l'acheteur. Son message est déjà parti : « Bonjour, le T3 près du parc est toujours disponible ? ». L'agence a été vue pour la dernière fois à 19:02. En gros : **23 h 47. L'agence est fermée.** Puis les coches passent au bleu, l'agence est « en ligne » et « écrit… ». |
| 2,1 – 12,8 s | La conversation du site, mot pour mot : une question à la fois (acheter ou louer, budget), l'acheteur tape au clavier, les mots compris se surlignent en vert, puis le récapitulatif : « Un conseiller va vous contacter rapidement. » |
| 12,8 – 14,6 s | **Qui a répondu ?** La caméra pousse vers la photo de l'agence, qui grandit jusqu'à couvrir l'écran. |
| 14,6 – 17,3 s | La photo est la ville de la landing, la nuit. Tout dort. **L'agence dormait.** Une seule fenêtre est verte. **Coltadol a répondu.** D'autres fenêtres s'allument en ambre et passent au vert. |
| 17,3 – 21,8 s | La fenêtre verte grandit et devient la fiche : champs cochés, score 24 → 58 → 92, Prospect chaud, Rien ne manque, Nouveau → Qualifié, Réponse IA → Passée à l'humain. |
| 21,8 – 26,5 s | Le logo se dessine. **Votre responsable commercial IA.** · Essai gratuit · 14 jours gratuits, sans carte bancaire. · coltadol.com |

## Voix off à enregistrer (VoiceStudio)

Écrite pour ne jamais répéter mot pour mot ce qui est écrit à l'écran. Environ 2,2 mots par seconde ; chaque phrase tient dans sa fenêtre.

| Début | Fin | Phrase |
|---|---|---|
| 0,3 s | 1,9 s | Un acheteur écrit. |
| 2,3 s | 4,3 s | Et l'agence lui répond. Tout de suite. |
| 4,6 s | 9,6 s | Une question à la fois : acheter ou louer, quand, et pour quel budget. |
| 10,0 s | 12,5 s | Puis le récapitulatif, et un conseiller qui rappellera. |
| 14,8 s | 16,0 s | Personne n'était au bureau. |
| 16,3 s | 17,2 s | C'était Coltadol. |
| 18,0 s | 21,4 s | Score quatre-vingt-douze. Prospect chaud. Prêt pour votre équipe. |
| 22,6 s | 25,6 s | Coltadol. Essayez-le quatorze jours, gratuitement. |

Mixage conseillé : voix à −14 LUFS, les effets du fichier `coltadol-23h47.mp4` en dessous (ils sont déjà à −21,6 LUFS intégrés, crête −6,7 dB), ou la version muette avec un son tendance très bas.

## Fidèle au produit

- La conversation, les champs de la fiche, le score et ses étapes (24, 58, 92), la règle « Chaud dès 70, ou si l'urgence est haute », « Informations manquantes / Rien ne manque », « Réponse IA · Active / Passée à l'humain », « Nouveau / Qualifié » : tout vient de `lib/landing-i18n/fr.ts` et `components/landing/qualify-demo.tsx` du dépôt `real-estate-saas-frontend`.
- La ville reprend `components/landing/facade.tsx` : trois plans de tours, ambre = quelqu'un attend, vert = répondu, rien d'autre n'est coloré.
- L'agent ne promet ni prix ni visite : il annonce un conseiller et se tait, comme le produit.
- « Agence du Parc » est une agence fictive ; une mention à l'écran indique « Conversation et prospect d'exemple. ».
- L'écran WhatsApp est redessiné (Roboto, couleurs de l'appli) ; le motif du fond est original (maisons, clés, bulles), sans le motif de WhatsApp.

## Comment c'est fait

Projet [HyperFrames](https://hyperframes.heygen.com) : du HTML rendu image par image dans Chrome sans écran, donc identique à chaque rendu.

- `compositions/chat.html` : l'écran WhatsApp. La saisie, le clavier, les coches et le statut sont calculés à partir du seul temps du film ; les bulles et le fil qui monte sont des tweens GSAP.
- `compositions/nuit.html` : la ville (canvas carré de 2220 px, pour que le disque de l'avatar reste un vrai cercle en grandissant), les titres de la nuit, la fenêtre qui devient la fiche, la fiche.
- `compositions/fin.html` : le logo (tracés exacts de `components/coltadol-mark.tsx`), l'accroche, l'essai gratuit.
- `assets/timeline.js` : tous les repères de temps.
- Sons : bibliothèque HyperFrames (Pixabay, licence libre, voir `assets/sfx/CREDITS.md`).

```bash
cd coltadol-23h47
npx hyperframes preview                 # aperçu modifiable dans le navigateur
npx hyperframes check                   # contrôle complet
npx hyperframes render -o export/coltadol-23h47.mp4 -q delivery --crf 17 --keyframe-interval 2 --max-bitrate 14M -w 4
ffmpeg -i export/coltadol-23h47.mp4 -an -c:v copy export/coltadol-23h47-muet.mp4
```
