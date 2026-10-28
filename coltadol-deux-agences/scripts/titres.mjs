// Génère compositions/titres.html à partir de la liste ci-dessous.
// *mots* = pastille ambre (en attente, Thomas), ~mots~ = pastille verte (répondu, Yasmine).
// Usage : node scripts/titres.mjs
import { writeFileSync } from "node:fs";

const TITRES = [
  [0, 1.12, "Voici ~Yasmine,~"],
  [1.15, 2.6, "et voici *Thomas.*"],
  [2.7, 5.05, "Deux agences. Même rue. Mêmes biens."],
  [5.1, 7.4, "Pourquoi l'agenda de ~Yasmine~ est plein ?"],
  [8.55, 10.4, "*23 h 47.* Un acheteur écrit."],
  [10.45, 11.85, "~Yasmine~ répond tout de suite."],
  [11.9, 13.25, "*Thomas ?* Le lendemain."],
  [13.3, 15.45, "Répondre ~dans l'heure~ :"],
  [16.5, 18.6, "*Thomas* oublie ceux qui se taisent."],
  [18.65, 20.15, "~Yasmine~ reçoit une relance prête."],
  [20.2, 21.35, "Elle ~l'envoie.~"],
  [22.4, 24.95, "À ~8 h~ : qui appeler, quoi proposer."],
  [25.0, 26.35, "Même rue. Mêmes biens."],
  [26.4, 28.55, "La différence ? Un ~responsable commercial IA.~"],
  [28.6, 32, "Commente ~« AGENCE »~ et je t'envoie le lien."],
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Découpe en jetons : un mot, ou une pastille entière (plusieurs mots).
function tokens(text) {
  const out = [];
  const re = /\*([^*]+)\*|~([^~]+)~|(\S+)/g;
  let m;
  while ((m = re.exec(text))) {
    if (m[1]) out.push({ text: m[1], pill: "a" });
    else if (m[2]) out.push({ text: m[2], pill: "g" });
    else out.push({ text: m[3] });
  }
  return out;
}

// Titres posés sur le ciel de nuit : encre claire (limewash)
const NUIT = (a) => a >= 8.4 && a < 13.3;

const groups = TITRES.map(([a, b, text], i) => {
  const id = `t${String(i + 1).padStart(2, "0")}`;
  const spans = tokens(text)
    .map((tk, j) => {
      const cls = tk.pill ? `w pill pill-${tk.pill}` : "w";
      return `<span id="${id}-w${j}" class="${cls}">${esc(tk.text).replace(/ /g, "&nbsp;")}</span>`;
    })
    .join(" ");
  return { id, a, b, n: tokens(text).length, html: spans, nuit: NUIT(a) };
});

const html = `<template>
  <style>
    @font-face {
      font-family: "Bricolage";
      src: url("assets/fonts/bricolage-grotesque-latin-standard-normal.woff2") format("woff2-variations");
      font-weight: 200 800;
      font-stretch: 75% 100%;
    }
    @font-face {
      font-family: "DM Sans";
      src: url("assets/fonts/dm-sans-latin-standard-normal.woff2") format("woff2-variations");
      font-weight: 100 1000;
    }
    #root {
      position: absolute;
      inset: 0;
      pointer-events: none;
    }
    .titre {
      position: absolute;
      left: 0;
      top: 236px;
      width: 1080px;
      padding: 0 70px;
      text-align: center;
    }
    .ligne {
      font: 800 70px/1.16 "Bricolage", sans-serif;
      letter-spacing: -0.015em;
      color: var(--color-ink, #0b1130);
    }
    .ligne.nuit {
      color: #eef0fa;
    }
    .w {
      display: inline-block;
      opacity: 0;
    }
    .pill {
      padding: 0.02em 0.26em 0.06em;
      margin: 0 0.02em;
      border-radius: 0.42em;
      color: #0b1130;
      box-shadow: 0 8px 22px rgb(11 17 48 / 0.16);
    }
    .pill-a {
      background: var(--color-lamp, #ffb347);
    }
    .pill-g {
      background: var(--color-signal, #5ce6a5);
    }
    #titres-note {
      position: absolute;
      left: 0;
      width: 1080px;
      top: 1252px;
      text-align: center;
    }
    #titres-note span {
      display: inline-block;
      font: 600 24px/1 "DM Sans", sans-serif;
      color: #5d6480;
      background: rgb(255 255 255 / 0.86);
      padding: 11px 20px;
      border-radius: 999px;
      box-shadow: 0 4px 14px rgb(11 17 48 / 0.08);
    }
  </style>
  <div id="root" data-composition-id="titres" data-width="1080" data-height="1920">
${groups
  .map(
    (g) => `    <div id="${g.id}" class="clip titre" data-start="${g.a}" data-duration="${+(g.b - g.a).toFixed(2)}" data-track-index="0">
      <div id="${g.id}-l" class="ligne${g.nuit ? " nuit" : ""}">${g.html}</div>
    </div>`,
  )
  .join("\n")}
    <div id="titres-note" class="clip" data-start="2.9" data-duration="4.5" data-track-index="1" data-layout-allow-caption-zone>
      <span id="titres-note-s">Illustration : Yasmine, Thomas et leurs agences sont fictifs.</span>
    </div>
  </div>
  <script>
    (function () {
      const tl = gsap.timeline({ paused: true });
      const GROUPS = ${JSON.stringify(groups.map((g) => ({ id: g.id, a: g.a, b: g.b, n: g.n, nuit: g.nuit })))};
      const GREY = "#9ea3bd";
      const INK = "#0b1130";
      GROUPS.forEach((g, gi) => {
        for (let j = 0; j < g.n; j++) {
          const el = "#" + g.id + "-w" + j;
          // la toute première image montre déjà le premier mot (vignette du reel)
          const at = g.a === 0 ? -0.2 : g.a + 0.04 + j * 0.085;
          const isPill = document.querySelector(el).classList.contains("pill");
          if (at < 0) {
            tl.set(el, { opacity: 1, filter: "blur(0px)", color: INK }, 0);
          } else if (isPill) {
            tl.fromTo(el, { opacity: 0, scale: 0.55, filter: "blur(6px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.38, ease: "back.out(2.2)" }, at);
          } else {
            tl.fromTo(el, { opacity: 0, filter: "blur(7px)", color: GREY }, { opacity: 1, filter: "blur(0px)", duration: 0.14, ease: "power2.out" }, at);
            tl.to(el, { color: g.nuit ? "#eef0fa" : INK, duration: 0.14, ease: "none" }, Math.max(0, at + 0.15));
          }
        }
        // sortie : la ligne se floute et s'efface (sauf la dernière, qui tient jusqu'au bout)
        if (gi < GROUPS.length - 1) {
          tl.fromTo("#" + g.id + "-l", { opacity: 1, filter: "blur(0px)" }, { opacity: 0, filter: "blur(8px)", duration: 0.15, ease: "power2.in" }, g.b - 0.16);
        }
      });
      tl.fromTo("#titres-note-s", { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.3, ease: "power3.out" }, 2.95);
      tl.to("#titres-note-s", { opacity: 0, duration: 0.15, ease: "power2.in" }, 7.25);
      window.__timelines["titres"] = tl;
    })();
  </script>
</template>
`;

writeFileSync(new URL("../compositions/titres.html", import.meta.url), html);
console.log(`compositions/titres.html : ${groups.length} titres`);
