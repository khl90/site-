# Analyse des références

Méthode : les publications ont été lues via l'API publique de prévisualisation de X (`api.fxtwitter.com`), les MP4 téléchargés depuis `video.twimg.com`, puis examinés image par image avec FFmpeg : planches à 2 images/s sur toute la durée, à 10 images/s sur la première seconde et sur les passages clés. Le son n'a pas été analysé (les trois vidéos accessibles n'ont pas de piste audio).

| # | Publication | Statut | Format |
|---|---|---|---|
| 1 | @cleeeeeeeeeement — 2099798349226377546 | **regardée** | 12 s, 960×540, 30 i/s |
| 2 | @leonabboud — 2103576084499358051 | **regardée** | 15 s, 1920×1080, 60 i/s |
| 3 | @ultimaxbt — 2106761276454064147 | **inaccessible** : X renvoie « This Post was deleted by the Post author » | — |
| 4 | @samuel_yostt — 2105746669035733275 | **regardée** | 15 s, 1920×1080, 60 i/s |

## Ce que font les vidéos

**Réf. 1 (« Rerun », sombre + violet).** Première image : un mot géant, « Build », dont les lettres entrent avec un fort flou de mouvement horizontal pendant que la caméra glisse. Puis des phrases courtes dont chaque mot passe du flou au net (« Build with your people »). Une barre de recherche en forme de pilule, avec un liseré lumineux violet, se tape toute seule, puis un curseur clique. Le logo apparaît sur un mot fantôme géant en arrière-plan. L'interface du site est montrée dans un écran incliné en perspective, la caméra partant d'un gros plan sur le titre pour reculer, avec un liseré de lumière sur les bords. Inversion vers le blanc, anneaux concentriques autour d'un bouton, puis retour à l'interface.

**Réf. 2 (« Claude motion reel »).** Un point rouge tombe sur une grille sombre, rebondit en onde, s'étire en ligne qui vibre comme une corde, puis s'épaissit en bande qui balaie l'écran en orange : un seul élément graphique relie toutes les scènes. Titres massifs, ruptures de couleur franches par mot (« EVERY / SINGLE / FRAME »), compteurs (+312 %), barres et anneaux qui se dessinent, voxels 3D, particules qui forment une sphère, carte d'interface où un curseur active des interrupteurs puis un bouton se remplit (« Rendering… 100 % »), métaballes, logo final dont les lettres entrent avec du flou. Habillage « HUD » discret (numéros de scène, timecode).

**Réf. 4 (« ViralGrow », clair).** Un point orange pulse, devient une pilule blanche, des avatars y entrent un par un, puis la phrase se déploie depuis la pilule avec du flou de mouvement (« Let [avatars] AI influencers market your app / brand / product », le dernier mot change). Carrousel vertical flouté qui se pose sur un visage, éventail de téléphones, icônes de plateformes qui surgissent, carte d'analytics dont la courbe se trace, mur de téléphones incliné qui défile, puis icône → nom → slogan → bouton avec clic de curseur → URL.

## Ce qui en est retenu, et comment c'est adapté à Coltadol

1. **Un seul élément fort sur un fond vide dès la première image** (le mot « Build », le point rouge, le point orange).
   → Image 1 : une seule fenêtre ambrée s'allume dans une façade sombre, avec une onde. C'est la métaphore de la landing (« chaque fenêtre est une demande »).
2. **Un fil graphique continu d'une scène à l'autre** (le point de la réf. 2).
   → Le point de couleur. Ambre = quelqu'un attend. Le point vert du logo frappe et fait virer la ville au vert, on plonge dans la fenêtre du premier prospect (la même qu'à l'image 1), et le point vert revient pour clore le film sur le logo.
3. **Texte cinétique : lettres qui montent d'un masque, mots qui passent du flou au net.**
   → Les titres reprennent l'entrée du hero du site (GSAP SplitText, `expo.out`, lettres qui sortent d'un masque de ligne avec une légère rotation). Les phrases secondaires utilisent la mise au point mot par mot.
4. **Interface inclinée en 3D avec liseré lumineux** (réf. 1).
   → La console Coltadol arrive inclinée en perspective, avec un liseré de lumière verte qui fait le tour du cadre.
5. **Interface « jouée », pas montrée** (interrupteurs et bouton de la réf. 2, recherche tapée de la réf. 1).
   → La conversation WhatsApp s'écrit. Les mots-clés deviennent des puces de données qui volent jusqu'à leur champ, le score monte à 92, la liste se trie, la relance s'écrit puis un doigt l'envoie.
6. **Compteurs, anneaux et courbes qui se dessinent** (réf. 2 et 4).
   → Anneau de score (vert, qui passe à l'ambre au-delà de 70, la vraie règle « chaud dès 70 »), métriques du Rapport directeur, match à 100 %.
7. **Flou de mouvement sur tout ce qui bouge vite** (les trois références).
   → Un vrai flou de mouvement par sur-échantillonnage temporel (4 sous-images par image, obturateur à 180°), et non un flou simulé.
8. **Fin : logo → slogan → bouton → clic → URL** (réf. 1, 2 et 4).
   → Logo dessiné trait par trait (anneau, queue, point vert, nom qui se dévoile), « Votre responsable commercial IA. », bouton « Essai gratuit 14 jours » cliqué, `coltadol.com`.
9. **Rythme : environ un changement lisible toutes les 0,5 s, un seul point focal par plan.**
   → Groove à 120 BPM (un temps = 0,5 s) et titres tenus 1,2 à 1,6 s pour être lus sur téléphone.

**Ce qui n'est pas repris :** les compositions, les palettes (violet, orange, pêche), les voxels, métaballes, avatars et téléphones des références. Tout le visuel vient de l'identité de Coltadol : ville la nuit, ambre et vert, Bricolage Grotesque condensée.
