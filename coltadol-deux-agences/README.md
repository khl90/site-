# Coltadol — « Deux agences » (reel 9:16, 32 s, sans voix)

Une vidéo verticale dans le style du reel de référence ([@insyder.io](https://www.instagram.com/p/De9kQpyhuim/)) : décor 3D clair façon pâte à modeler, titres en haut qui s'écrivent mot à mot avec les mots-clés en pastille, deux personnages comparés, trois raisons numérotées, et une fin « commente pour recevoir le lien ». Ici les deux personnages sont deux agences immobilières, et la différence entre elles, c'est Coltadol.

| Fichier | Usage |
|---|---|
| `export/coltadol-deux-agences.mp4` | La vidéo : 1080 × 1920, 30 i/s, 32 s, H.264, sans son. |
| `export/coltadol-deux-agences-couverture.jpg` | La première image (« Voici Yasmine, »), comme couverture. |
| `export/coltadol-deux-agences-planche.jpg` | 12 images du film sur une planche. |

La vidéo est **sans son**, comme demandé : pas de voix off. Sur Instagram ou TikTok, ajoutez un son tendance directement dans l'application.

## Le déroulé

| Temps | Titre | Ce qu'on voit |
|---|---|---|
| 0–2,6 s | Voici **Yasmine**, et voici **Thomas**. | L'agence de Yasmine, puis celle de Thomas qui surgit à côté. |
| 2,7–7,4 s | Deux agences. Même rue. Mêmes biens. · Pourquoi l'agenda de **Yasmine** est plein ? | Les mêmes annonces (T3 Lyon 6e à 342 000 €, T2 Lyon 3e à 298 000 €) dans les deux vitrines, un « = », puis douze fiches de visite qui s'empilent chez Yasmine contre deux chez Thomas. |
| 7,5–15,4 s | **1 · La vitesse** — 23 h 47. Un acheteur écrit. · Yasmine répond tout de suite. · Thomas ? Le lendemain. · Répondre dans l'heure : **×7** | La nuit tombe. La même demande WhatsApp arrive dans les deux agences fermées et les vitrines s'allument en ambre (quelqu'un attend). Chez Yasmine, la réponse part et sa vitrine passe au vert ; chez Thomas, elle reste ambre jusqu'au lendemain. Puis le chiffre de l'étude. |
| 15,5–21,3 s | **2 · Les silences** — Thomas oublie ceux qui se taisent. · Yasmine reçoit une relance prête. Elle l'envoie. | Un prospect silencieux s'efface devant chez Thomas. Chez Yasmine, la carte « Relances IA » propose un message, elle appuie sur « Envoyer depuis le WhatsApp connecté ». |
| 21,4–24,9 s | **3 · Qui appeler** — À 8 h : qui appeler, quoi proposer. | Le matin. Le Rapport directeur arrive sur WhatsApp : prospects chauds (92, 74) et le bien à proposer (match à 100 %). Dans la foule, les deux prospects chauds sont éclairés. |
| 25–28,5 s | Même rue. Mêmes biens. · La différence ? Un responsable commercial IA. | Les deux agences côte à côte, puis le logo Coltadol se dessine au-dessus de l'agence de Yasmine. |
| 28,6–32 s | Commente « AGENCE » et je t'envoie le lien. | Le commentaire s'écrit et se publie, la réponse arrive en message privé avec la carte du lien : coltadol.com, « Votre responsable commercial IA. », « 14 jours gratuits, sans carte bancaire. » |

Le code couleur suit la règle de la marque : **ambre = quelqu'un attend** (Thomas, ses vitrines, ses prospects), **vert = quelqu'un a reçu une réponse** (Yasmine).

## Fidèle au produit

- Tous les textes d'interface viennent du site (`lib/landing-i18n/fr.ts` du dépôt `real-estate-saas-frontend`) : la demande « Le T3 près du parc est toujours disponible ? », la réponse de l'agent, « en attente / répondu », « Relances IA », « Silencieux depuis 3 jours », « Envoyer depuis le WhatsApp connecté », « Rien ne part sans vous », le Rapport directeur de 8 h sur WhatsApp et ses prospects prioritaires, « Match à 100 % », « Votre responsable commercial IA. », « 14 jours gratuits, sans carte bancaire. ».
- La relance est envoyée par Yasmine, jamais automatiquement, comme le produit le garantit.
- Seule la phrase de la relance à Léa D. est écrite pour le film (le site n'en donne que pour Karim B.). La carte porte « Prospect et message d'exemple. ».
- Aucun chiffre de performance n'est attribué à Coltadol. Le « ×7 » est celui de l'étude citée à l'écran : Oldroyd, McElheran et Elkington, « The Short Life of Online Sales Leads », *Harvard Business Review*, mars 2011 (1,25 million de demandes ; une entreprise qui répond dans l'heure a près de sept fois plus de chances d'avoir une vraie conversation qu'une heure plus tard).
- Une mention indique que Yasmine, Thomas et leurs agences sont fictifs ; la différence des agendas de visites est une illustration, sans chiffre.
- Couleurs (`#0b1130`, `#ffb347`, `#5ce6a5`), polices (Bricolage Grotesque, DM Sans, licences OFL dans `assets/fonts`) et logo (`assets/brand`) sont ceux de la marque.

## Comment c'est fait

Le film est un projet [HyperFrames](https://hyperframes.heygen.com) : du HTML rendu en vidéo image par image, dans Chrome sans écran, donc identique à chaque rendu.

- `compositions/world.html` : le monde 3D en Three.js (r147, dans `assets/lib`). Agences, personnages, fiches et annonces sont des volumes arrondis à la matière mate, sous un soleil à ombres douces. Le jour, la nuit et le matin changent la lumière, le sol et le ciel. Chaque image est calculée à partir du seul temps du film (ressorts en forme fermée, aucune boucle d'animation), et les bulles et étiquettes HTML sont accrochées aux objets 3D par projection.
- `compositions/titres.html` : les titres du haut, générés par `scripts/titres.mjs` (`*mot*` = pastille ambre, `~mot~` = pastille verte).
- `compositions/vitesse.html`, `silences.html`, `appeler.html`, `fin.html` : les chapitres 1, 2, 3 et la fin (cartes d'interface, ×7, commentaire, lien), animés avec GSAP.
- `assets/timeline.js` : tous les repères de temps du film, lus par chaque scène.

```bash
cd coltadol-deux-agences
npx hyperframes preview                      # aperçu dans le navigateur, modifiable
npx hyperframes snapshot --at 0,9.6,23.4     # images fixes
node scripts/titres.mjs                      # après avoir modifié un titre
npx hyperframes check                        # contrôle complet
npx hyperframes render -o export/coltadol-deux-agences.mp4 -q delivery --crf 17 --keyframe-interval 2 --max-bitrate 14M -w 4
```

Le rendu prend environ 6 minutes sur 4 cœurs, sans carte graphique.

## Notes de relecture

- Contrôle `hyperframes check` : aucune erreur. Avertissements gardés volontairement : film sans son (demandé) ; quelques textes d'interface (message de relance, réponse de l'agent) restent à l'écran moins longtemps qu'il ne faudrait pour les lire en entier, car le titre du haut porte déjà l'idée ; les petites mentions (source, « d'exemple ») sont sous 28 px.
- Le plan le plus faible : les piles de fiches « Visites » de l'intro, qui se lisent comme des piles de papier plus que comme un agenda. Avec plus de temps : des fiches au calendrier visible, et un fond sonore calé sur les apparitions.
