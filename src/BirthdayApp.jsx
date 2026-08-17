import React, { useState, useEffect, useRef, useCallback, useMemo, useImperativeHandle } from "react";

/* ============================================================
   Wishcraft — a personal birthday gift, delivered as a link
   Design system: Fraunces (display) + Manrope (interface)
   ============================================================ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700;800&display=swap');

.wc, .wc *, .wc *::before, .wc *::after { box-sizing: border-box; }
.wc {
  --font-display: "Fraunces", "Iowan Old Style", Georgia, serif;
  --font-ui: "Manrope", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --r-lg: 28px; --r-md: 20px; --r-sm: 14px;
  font-family: var(--font-ui);
  -webkit-font-smoothing: antialiased;
  -webkit-tap-highlight-color: transparent;
  min-height: 100dvh;
}
:where(.wc) button { font: inherit; color: inherit; border: 0; background: none; cursor: pointer; }
:where(.wc) input, :where(.wc) textarea, :where(.wc) select { font: inherit; color: inherit; }
:where(.wc) img { display: block; max-width: 100%; }
:where(.wc) a { color: inherit; }
.wc :focus-visible { outline: 2px solid currentColor; outline-offset: 3px; border-radius: 6px; }
.wc-grain::after {
  content: ""; position: absolute; inset: 0; pointer-events: none; opacity: .35;
  background-image: url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E");
  mix-blend-mode: overlay;
}

/* ---------- Birthday experience ---------- */
.bd {
  position: relative; overflow-x: hidden;
  background: radial-gradient(120% 70% at 50% 0%, var(--bg-b) 0%, var(--bg-a) 62%);
  color: var(--ink); min-height: 100dvh;
}
.bd-shell { max-width: 560px; margin: 0 auto; position: relative; z-index: 2; padding: 0 22px; }
.bd-canvas { position: fixed; inset: 0; z-index: 3; pointer-events: none; }
.bd-amb { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.bd-blob { position: absolute; border-radius: 50%; filter: blur(60px); opacity: .55; animation: drift 22s ease-in-out infinite; }
@keyframes drift {
  0%,100% { transform: translate3d(0,0,0) scale(1); }
  50% { transform: translate3d(0,-40px,0) scale(1.12); }
}
.bd-star { position: absolute; width: 2px; height: 2px; border-radius: 50%; background: var(--ink); animation: twinkle 4s ease-in-out infinite; }
@keyframes twinkle { 0%,100% { opacity: .12; } 50% { opacity: .9; } }

/* Sealed intro */
.bd-contained .seal-wrap { min-height: 100%; padding: 34px 22px; }
.bd-contained .final { padding-bottom: 70px; }
.seal-wrap {
  position: relative; z-index: 4; min-height: 100dvh; display: flex; flex-direction: column;
  align-items: center; justify-content: center; text-align: center; padding: 40px 26px calc(40px + env(safe-area-inset-bottom));
  background: radial-gradient(90% 55% at 50% 38%, rgba(255,255,255,.07), rgba(4,3,10,0) 70%), #06040d;
  color: #fff;
}
.seal-eyebrow { font-size: 11px; letter-spacing: .34em; text-transform: uppercase; opacity: .5; font-weight: 700; }
.seal-medal {
  width: 168px; height: 168px; border-radius: 50%; display: grid; place-items: center; position: relative; margin: 34px 0 30px;
  background: radial-gradient(70% 70% at 30% 25%, rgba(255,255,255,.22), rgba(255,255,255,.03));
  box-shadow: 0 0 0 1px rgba(255,255,255,.14), 0 30px 80px -20px var(--glow), inset 0 1px 0 rgba(255,255,255,.35);
  animation: breathe 4.4s ease-in-out infinite; backdrop-filter: blur(8px);
}
.seal-medal .mono { font-family: var(--font-display); font-size: 62px; font-weight: 600; line-height: 1; opacity: .95; }
.seal-ring { position: absolute; inset: -16px; border-radius: 50%; border: 1px dashed rgba(255,255,255,.22); animation: spin 34s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes breathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.045); } }
.seal-title { font-family: var(--font-display); font-size: 30px; line-height: 1.18; font-weight: 400; letter-spacing: -.01em; max-width: 15ch; }
.seal-sub { margin-top: 14px; font-size: 14.5px; line-height: 1.6; opacity: .58; max-width: 30ch; }
.seal-btn {
  margin-top: 38px; padding: 19px 30px; border-radius: 999px; font-weight: 800; font-size: 16px; color: #0b0714;
  background: linear-gradient(120deg, var(--accent), var(--accent-2));
  box-shadow: 0 18px 44px -12px var(--glow), inset 0 1px 0 rgba(255,255,255,.45);
  transition: transform .18s cubic-bezier(.2,.9,.3,1.4), box-shadow .3s;
  animation: pulse 2.8s ease-in-out infinite; width: 100%; max-width: 340px;
}
.seal-btn:active { transform: scale(.96); }
@keyframes pulse { 0%,100% { box-shadow: 0 18px 44px -12px var(--glow); } 50% { box-shadow: 0 22px 62px -8px var(--glow); } }
.seal-foot { margin-top: 22px; font-size: 12px; opacity: .35; letter-spacing: .06em; }
.wash { position: fixed; z-index: 60; border-radius: 50%; pointer-events: none; background: linear-gradient(140deg, var(--accent), var(--accent-2)); animation: washOut .62s cubic-bezier(.7,0,.3,1) forwards; }
@keyframes washOut { from { transform: scale(0); } to { transform: scale(var(--wash-scale, 40)); } }

/* Hero */
.hero { padding: 74px 0 20px; text-align: center; position: relative; }
.hero-frame { position: relative; width: 216px; height: 216px; margin: 0 auto 30px; }
.hero-frame img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; box-shadow: 0 30px 70px -24px var(--glow), 0 0 0 1px var(--hair); }
.hero-halo { position: absolute; inset: -26px; border-radius: 50%; background: conic-gradient(from 0deg, var(--accent), var(--accent-2), var(--accent)); filter: blur(24px); opacity: .5; animation: spin 16s linear infinite; z-index: -1; }
.hero-eyebrow { font-size: 12px; letter-spacing: .32em; text-transform: uppercase; font-weight: 700; color: var(--accent); }
.hero-name { font-family: var(--font-display); font-size: clamp(52px, 17vw, 78px); line-height: .92; font-weight: 600; letter-spacing: -.035em; margin: 12px 0 0; }
.hero-name em { font-style: italic; font-weight: 300; }
.hero-line { margin: 20px auto 0; font-size: 16px; line-height: 1.65; color: var(--muted); max-width: 26ch; }
.hero-age { display: inline-flex; align-items: center; gap: 8px; margin-top: 24px; padding: 9px 16px; border-radius: 999px; font-size: 12.5px; font-weight: 700; letter-spacing: .04em; background: var(--card); border: 1px solid var(--hair); backdrop-filter: blur(12px); }
.scroll-cue { margin: 40px auto 0; width: 26px; height: 42px; border-radius: 999px; border: 1px solid var(--hair); position: relative; }
.scroll-cue span { position: absolute; left: 50%; top: 9px; width: 4px; height: 4px; border-radius: 50%; background: var(--accent); animation: cue 1.9s ease-in-out infinite; }
@keyframes cue { 0% { transform: translate(-50%,0); opacity: 0; } 30% { opacity: 1; } 100% { transform: translate(-50%,18px); opacity: 0; } }

/* Sections */
.sect { padding: 58px 0; }
.sect-label { font-size: 11px; letter-spacing: .32em; text-transform: uppercase; font-weight: 700; color: var(--accent); margin-bottom: 18px; display: flex; align-items: center; gap: 10px; }
.sect-label::after { content: ""; flex: 1; height: 1px; background: var(--hair); }
.card {
  background: var(--card); border: 1px solid var(--hair); border-radius: var(--r-lg);
  backdrop-filter: blur(18px); box-shadow: 0 24px 60px -32px rgba(0,0,0,.55);
}
.msg { padding: 30px 26px 32px; }
.msg-body { font-family: var(--font-display); font-size: 19.5px; line-height: 1.62; font-weight: 300; white-space: pre-wrap; letter-spacing: -.005em; }
.msg-body .lead { font-size: 23px; font-weight: 600; display: block; margin-bottom: 14px; }
.msg-sign { margin-top: 26px; padding-top: 18px; border-top: 1px solid var(--hair); font-size: 13px; color: var(--muted); display: flex; justify-content: space-between; align-items: center; }
.quote { margin-top: 22px; padding: 22px 24px; border-radius: var(--r-md); background: linear-gradient(140deg, var(--accent), var(--accent-2)); color: #0b0714; font-family: var(--font-display); font-size: 18px; line-height: 1.5; font-weight: 600; box-shadow: 0 20px 44px -22px var(--glow); }
.caret { display: inline-block; width: 2px; height: 1em; background: var(--accent); vertical-align: -2px; animation: blink .9s steps(2) infinite; }
@keyframes blink { 50% { opacity: 0; } }

/* Memories */
.rail { display: flex; gap: 14px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 4px 22px 18px; margin: 0 -22px; scrollbar-width: none; }
.rail::-webkit-scrollbar { display: none; }
.memo { flex: 0 0 78%; max-width: 320px; scroll-snap-align: center; border-radius: var(--r-lg); overflow: hidden; position: relative; aspect-ratio: 3/4; box-shadow: 0 26px 60px -28px rgba(0,0,0,.6); border: 1px solid var(--hair); }
.memo img { width: 100%; height: 100%; object-fit: cover; }
.memo-cap { position: absolute; left: 0; right: 0; bottom: 0; padding: 46px 20px 20px; color: #fff; background: linear-gradient(to top, rgba(6,4,13,.86), rgba(6,4,13,0)); font-size: 15px; font-weight: 600; line-height: 1.4; }
.memo-idx { position: absolute; top: 16px; left: 16px; font-size: 11px; font-weight: 800; letter-spacing: .12em; color: #fff; background: rgba(8,6,16,.42); backdrop-filter: blur(8px); padding: 6px 10px; border-radius: 999px; }
.dots { display: flex; gap: 6px; justify-content: center; margin-top: 4px; }
.dot { width: 6px; height: 6px; border-radius: 50%; background: var(--hair); transition: all .3s; }
.dot.on { width: 20px; background: var(--accent); }

/* Timeline */
.tl { position: relative; padding-left: 28px; }
.tl::before { content: ""; position: absolute; left: 5px; top: 6px; bottom: 6px; width: 1px; background: linear-gradient(var(--accent), var(--accent-2), transparent); opacity: .6; }
.tl-item { position: relative; padding-bottom: 30px; }
.tl-item::before { content: ""; position: absolute; left: -27px; top: 6px; width: 11px; height: 11px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 4px var(--bg-a), 0 0 18px var(--glow); }
.tl-year { font-family: var(--font-display); font-size: 26px; font-weight: 600; letter-spacing: -.02em; }
.tl-text { margin-top: 4px; font-size: 15.5px; line-height: 1.55; color: var(--muted); }

/* Final */
.final { text-align: center; padding: 76px 0 118px; position: relative; }
.final-kicker { font-family: var(--font-display); font-size: 27px; line-height: 1.32; font-weight: 300; letter-spacing: -.01em; }
.final-stack { margin: 30px 0; display: grid; gap: 7px; font-size: 17px; font-weight: 600; }
.final-stack span { opacity: 0; animation: rise .7s cubic-bezier(.2,.8,.3,1) forwards; }
@keyframes rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
.final-big { font-family: var(--font-display); font-size: clamp(34px, 10.5vw, 46px); line-height: 1.08; font-weight: 600; letter-spacing: -.03em; margin-top: 34px; }
.final-big b { display: block; background: linear-gradient(110deg, var(--accent), var(--accent-2)); -webkit-background-clip: text; background-clip: text; color: transparent; font-weight: 600; }
.final-from { margin-top: 30px; font-size: 13px; color: var(--muted); letter-spacing: .04em; }
.replay { margin-top: 26px; padding: 13px 22px; border-radius: 999px; font-size: 13.5px; font-weight: 700; border: 1px solid var(--hair); background: var(--card); backdrop-filter: blur(10px); }

/* Music pill */
.music { white-space: nowrap; position: fixed; z-index: 40; right: 16px; bottom: calc(18px + env(safe-area-inset-bottom)); display: flex; align-items: center; gap: 10px; padding: 11px 15px; border-radius: 999px; background: var(--card); border: 1px solid var(--hair); backdrop-filter: blur(16px); font-size: 12.5px; font-weight: 700; color: var(--ink); box-shadow: 0 16px 40px -18px rgba(0,0,0,.6); max-width: calc(100vw - 32px); }
.music .label { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.music .eq { flex: 0 0 auto; display: flex; align-items: flex-end; gap: 2px; height: 14px; }
.music .eq i { width: 3px; height: 6px; background: var(--accent); border-radius: 2px; animation: eq .9s ease-in-out infinite; }
.music .eq i:nth-child(2) { animation-delay: .18s; } .music .eq i:nth-child(3) { animation-delay: .36s; }
@keyframes eq { 0%,100% { height: 4px; } 50% { height: 14px; } }
.music.paused .eq i { animation-play-state: paused; height: 5px; opacity: .5; }
.music-x { opacity: .45; font-size: 15px; line-height: 1; padding: 2px 2px 2px 4px; }

/* reveal */
.rv { opacity: 0; transform: translateY(24px); transition: opacity .8s cubic-bezier(.2,.8,.3,1), transform .8s cubic-bezier(.2,.8,.3,1); }
.rv.in { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) {
  .wc *, .wc *::before, .wc *::after { animation-duration: .001ms !important; animation-iteration-count: 1 !important; transition-duration: .001ms !important; }
  .rv { opacity: 1; transform: none; }
}

/* ---------- Admin (deliberately calm: the gift is the star) ---------- */
.ad { --paper: #f7f4ef; --ink-1: #17141f; --ink-2: #6b6478; --line: #e7e1d8; --brand: #5b3df5; --brand-soft: #efeaff; --ok: #12805c; --warn: #b4530a;
  background: var(--paper); color: var(--ink-1); min-height: 100dvh; }
.ad-top { position: sticky; top: 0; z-index: 30; background: rgba(247,244,239,.86); backdrop-filter: blur(14px); border-bottom: 1px solid var(--line); }
.ad-top-in { max-width: 1180px; margin: 0 auto; padding: 14px 18px; display: flex; align-items: center; gap: 12px; }
.ad-logo { font-family: var(--font-display); font-size: 19px; font-weight: 600; letter-spacing: -.02em; display: flex; align-items: center; gap: 9px; }
.ad-logo i { width: 26px; height: 26px; border-radius: 9px; background: linear-gradient(135deg, #ff5c9d, #5b3df5); display: grid; place-items: center; font-size: 13px; font-style: normal; }
.ad-wrap { max-width: 1180px; margin: 0 auto; padding: 22px 18px 110px; }
.ad-h1 { font-family: var(--font-display); font-size: 30px; font-weight: 600; letter-spacing: -.028em; line-height: 1.1; }
.ad-sub { color: var(--ink-2); font-size: 14.5px; margin-top: 6px; line-height: 1.5; }
.stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 11px; margin: 22px 0 26px; }
.stat { background: #fff; border: 1px solid var(--line); border-radius: 20px; padding: 16px 16px 15px; }
.stat b { font-family: var(--font-display); font-size: 30px; font-weight: 600; letter-spacing: -.03em; display: block; line-height: 1; }
.stat span { font-size: 12.5px; color: var(--ink-2); display: block; margin-top: 7px; font-weight: 600; }
.stat.hi { background: linear-gradient(140deg, #1b1330, #3a1f5c); color: #fff; border-color: transparent; }
.stat.hi span { color: rgba(255,255,255,.68); }
.ad-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 26px 0 12px; }
.ad-h2 { font-size: 13px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: var(--ink-2); }
.search { display: flex; align-items: center; gap: 9px; background: #fff; border: 1px solid var(--line); border-radius: 14px; padding: 12px 14px; }
.search input { border: 0; outline: 0; background: none; width: 100%; font-size: 15px; }
.chips { display: flex; gap: 8px; overflow-x: auto; padding: 12px 0 2px; scrollbar-width: none; }
.chips::-webkit-scrollbar { display: none; }
.chip { flex: 0 0 auto; padding: 9px 14px; border-radius: 999px; font-size: 13px; font-weight: 700; border: 1px solid var(--line); background: #fff; color: var(--ink-2); }
.chip.on { background: var(--ink-1); border-color: var(--ink-1); color: #fff; }
.blist { display: grid; gap: 11px; }
@media (min-width: 720px) { .blist { grid-template-columns: 1fr 1fr; } .stats { grid-template-columns: repeat(4, 1fr); } }
.bcard { display: flex; align-items: center; gap: 13px; background: #fff; border: 1px solid var(--line); border-radius: 20px; padding: 13px; text-align: left; width: 100%; transition: transform .16s, box-shadow .2s; }
.bcard:active { transform: scale(.985); }
.bcard:hover { box-shadow: 0 12px 30px -18px rgba(20,10,50,.4); }
.bcard img { width: 54px; height: 54px; border-radius: 16px; object-fit: cover; flex: 0 0 auto; }
.bcard-nm { font-weight: 800; font-size: 15.5px; letter-spacing: -.01em; }
.bcard-mt { font-size: 12.8px; color: var(--ink-2); margin-top: 3px; }
.pill { display: inline-flex; align-items: center; gap: 5px; padding: 5px 10px; border-radius: 999px; font-size: 11.5px; font-weight: 800; letter-spacing: .01em; }
.pill.today { background: #ffe9f2; color: #b1195e; }
.pill.up { background: #efeaff; color: #4a2ecf; }
.pill.done { background: #eef1ee; color: #5a6b60; }
.btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 15px 20px; border-radius: 15px; font-weight: 800; font-size: 15px; transition: transform .16s, opacity .2s; }
.btn:active { transform: scale(.97); }
.btn-p { background: var(--ink-1); color: #fff; }
.btn-a { background: linear-gradient(135deg, #ff5c9d, #5b3df5); color: #fff; box-shadow: 0 14px 30px -14px rgba(91,61,245,.7); }
.btn-s { background: #fff; border: 1px solid var(--line); color: var(--ink-1); }
.btn-d { background: #fff; border: 1px solid #f2d6d6; color: #b3261e; }
.btn:disabled { opacity: .5; pointer-events: none; }
.btn-w { width: 100%; }
.fab { position: fixed; right: 16px; bottom: calc(78px + env(safe-area-inset-bottom)); z-index: 35; padding: 16px 22px; border-radius: 999px; }
.top-nav { display: none; gap: 4px; }
.top-nav button { padding: 9px 14px; border-radius: 12px; font-size: 13.5px; font-weight: 700; color: var(--ink-2); }
.top-nav button.on { background: var(--ink-1); color: #fff; }
.nav { position: fixed; left: 0; right: 0; bottom: 0; z-index: 36; display: flex; background: rgba(255,255,255,.92); backdrop-filter: blur(16px); border-top: 1px solid var(--line); padding: 9px 8px calc(9px + env(safe-area-inset-bottom)); }
.nav button { flex: 1; display: grid; gap: 4px; justify-items: center; padding: 7px 0; font-size: 10.5px; font-weight: 700; color: var(--ink-2); border-radius: 12px; }
.nav button.on { color: var(--brand); }
.nav svg { width: 21px; height: 21px; }
@media (min-width: 1000px) { .nav { display: none; } .top-nav { display: flex; } .ad-wrap { padding-bottom: 60px; } .fab { bottom: 22px; } }
.form { display: grid; gap: 16px; }
.form-bar { position: sticky; top: 56px; z-index: 25; display: flex; align-items: center; gap: 10px; padding: 12px 0 16px; margin: -8px 0 6px; background: linear-gradient(var(--paper) 82%, rgba(247,244,239,0)); }
.fgroup { background: #fff; border: 1px solid var(--line); border-radius: 22px; padding: 18px; }
.fgroup h3 { font-size: 12px; font-weight: 800; letter-spacing: .13em; text-transform: uppercase; color: var(--ink-2); margin: 0 0 15px; }
.field { display: grid; gap: 7px; margin-bottom: 14px; }
.field:last-child { margin-bottom: 0; }
.field label { font-size: 13px; font-weight: 700; }
.field .hint { font-size: 12px; color: var(--ink-2); font-weight: 500; }
.inp { width: 100%; padding: 14px 15px; border-radius: 14px; border: 1px solid var(--line); background: #fdfcfa; outline: 0; font-size: 15.5px; transition: border-color .2s, box-shadow .2s; }
.inp:focus { border-color: var(--brand); box-shadow: 0 0 0 4px var(--brand-soft); }
.inp.bad { border-color: #d9534f; box-shadow: 0 0 0 4px #fdecea; }
textarea.inp { min-height: 132px; resize: vertical; line-height: 1.6; }
.err { font-size: 12.5px; color: #b3261e; font-weight: 700; }
.two { display: grid; gap: 14px; grid-template-columns: 1fr 1fr; }
.swatches { display: grid; grid-template-columns: repeat(auto-fit, minmax(96px, 1fr)); gap: 9px; }
.sw { border-radius: 16px; padding: 11px; border: 1.5px solid var(--line); background: #fff; display: grid; gap: 8px; justify-items: start; }
.sw.on { border-color: var(--ink-1); box-shadow: 0 0 0 3px rgba(23,20,31,.08); }
.sw i { height: 34px; width: 100%; border-radius: 10px; display: block; }
.sw span { font-size: 12.5px; font-weight: 700; }
.seg { display: flex; gap: 6px; background: #f1ede6; padding: 5px; border-radius: 14px; }
.seg button { flex: 1; padding: 10px 6px; border-radius: 10px; font-size: 12.5px; font-weight: 700; color: var(--ink-2); }
.seg button.on { background: #fff; color: var(--ink-1); box-shadow: 0 2px 6px rgba(20,10,50,.08); }
.thumbs { display: flex; gap: 10px; overflow-x: auto; padding-bottom: 6px; scrollbar-width: none; }
.thumbs::-webkit-scrollbar { display: none; }
.thumb { flex: 0 0 128px; }
.thumb .im { position: relative; border-radius: 14px; overflow: hidden; aspect-ratio: 3/4; border: 1px solid var(--line); }
.thumb img { width: 100%; height: 100%; object-fit: cover; }
.thumb .rm { position: absolute; top: 6px; right: 6px; width: 26px; height: 26px; border-radius: 50%; background: rgba(10,8,20,.62); color: #fff; display: grid; place-items: center; font-size: 15px; backdrop-filter: blur(6px); }
.thumb .cap { width: 100%; margin-top: 7px; padding: 8px 9px; border-radius: 10px; border: 1px solid var(--line); font-size: 12px; background: #fdfcfa; outline: 0; }
.drop { border: 1.5px dashed #d8d0c4; border-radius: 16px; padding: 22px; text-align: center; background: #fdfcfa; }
.drop b { display: block; font-size: 14px; }
.drop span { font-size: 12.5px; color: var(--ink-2); }
.phone-col { display: flex; justify-content: center; }
@media (min-width: 1000px) { .phone-col { position: sticky; top: 92px; } }
.phone { width: 336px; border-radius: 42px; padding: 11px; background: #16121f; box-shadow: 0 40px 80px -40px rgba(20,10,50,.6); }
.phone-scr { border-radius: 32px; overflow: hidden; height: 660px; overflow-y: auto; position: relative; background: #000; scrollbar-width: none; }
.phone-scr::-webkit-scrollbar { display: none; }
.phone-notch { position: absolute; z-index: 5; top: 10px; left: 50%; transform: translateX(-50%); width: 96px; height: 26px; border-radius: 999px; background: #16121f; }
.split { display: grid; gap: 26px; }
@media (min-width: 1000px) { .split { grid-template-columns: minmax(0,1fr) 336px; align-items: start; } }
.sheet { position: fixed; inset: 0; z-index: 70; display: flex; align-items: flex-end; justify-content: center; background: rgba(14,10,26,.55); backdrop-filter: blur(4px); animation: fade .25s ease; padding: 0; }
@media (min-width: 640px) { .sheet { align-items: center; padding: 24px; } }
@keyframes fade { from { opacity: 0; } }
.sheet-in { background: #fff; width: 100%; max-width: 460px; border-radius: 28px 28px 0 0; padding: 24px 20px calc(24px + env(safe-area-inset-bottom)); animation: up .34s cubic-bezier(.2,.9,.3,1); max-height: 92dvh; overflow-y: auto; }
@media (min-width: 640px) { .sheet-in { border-radius: 28px; } }
@keyframes up { from { transform: translateY(40px); opacity: .4; } }
.grip { width: 40px; height: 4px; border-radius: 99px; background: #e3ddd3; margin: -6px auto 16px; }
.link-box { display: flex; align-items: center; gap: 10px; background: #f7f4ef; border: 1px solid var(--line); border-radius: 14px; padding: 13px 14px; font-size: 13.5px; font-weight: 700; word-break: break-all; }
.toast { position: fixed; z-index: 90; left: 50%; transform: translateX(-50%); bottom: calc(94px + env(safe-area-inset-bottom)); background: #17141f; color: #fff; padding: 13px 18px; border-radius: 14px; font-size: 13.5px; font-weight: 700; display: flex; gap: 9px; align-items: center; box-shadow: 0 18px 40px -18px rgba(0,0,0,.6); animation: up .3s cubic-bezier(.2,.9,.3,1); max-width: 90vw; }
.skel { background: linear-gradient(90deg, #efeae2 25%, #f7f4ef 50%, #efeae2 75%); background-size: 200% 100%; animation: sh 1.3s infinite; border-radius: 16px; }
@keyframes sh { to { background-position: -200% 0; } }
.empty { text-align: center; padding: 46px 22px; background: #fff; border: 1px solid var(--line); border-radius: 24px; }
.empty h3 { font-family: var(--font-display); font-size: 22px; font-weight: 600; margin: 16px 0 6px; letter-spacing: -.02em; }
.empty p { color: var(--ink-2); font-size: 14px; line-height: 1.55; max-width: 34ch; margin: 0 auto 20px; }
.login { min-height: 100dvh; display: grid; place-items: center; padding: 26px; background: radial-gradient(90% 60% at 50% 0%, #201641, #0b0817); }
.login-card { width: 100%; max-width: 380px; background: rgba(255,255,255,.055); border: 1px solid rgba(255,255,255,.11); border-radius: 30px; padding: 30px 24px; backdrop-filter: blur(20px); color: #fff; box-shadow: 0 40px 90px -40px rgba(0,0,0,.8); }
.login-card .inp { background: rgba(255,255,255,.07); border-color: rgba(255,255,255,.14); color: #fff; }
.login-card .inp:focus { border-color: #ff5c9d; box-shadow: 0 0 0 4px rgba(255,92,157,.18); }
.login-card .inp::placeholder { color: rgba(255,255,255,.36); }
.spin { width: 17px; height: 17px; border-radius: 50%; border: 2px solid rgba(255,255,255,.28); border-top-color: #fff; animation: spin .7s linear infinite; }
.err-page { min-height: 100dvh; display: grid; place-items: center; text-align: center; padding: 30px; background: radial-gradient(90% 60% at 50% 0%, #221743, #08060f); color: #fff; }

/* ---------- scroll progress ---------- */
.prog { position: fixed; top: 0; left: 0; right: 0; height: 3px; z-index: 45; background: transparent; }
.prog i { display: block; height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent-2)); transition: width .12s linear; box-shadow: 0 0 12px var(--glow); }

/* ---------- countdown lock ---------- */
.lock { position: relative; z-index: 4; min-height: 100dvh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px 26px; color: #fff; background: radial-gradient(90% 55% at 50% 34%, rgba(255,255,255,.06), rgba(4,3,10,0) 70%), #06040d; }
.lock-ring { width: 96px; height: 96px; border-radius: 50%; display: grid; place-items: center; font-size: 36px; background: rgba(255,255,255,.05); box-shadow: 0 0 0 1px rgba(255,255,255,.12), 0 24px 60px -20px var(--glow); animation: breathe 4.4s ease-in-out infinite; }
.clock { display: flex; gap: 8px; margin: 30px 0 6px; }
.clock div { min-width: 66px; padding: 13px 8px; border-radius: 18px; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1); }
.clock b { font-family: var(--font-display); font-size: 27px; font-weight: 600; display: block; line-height: 1; font-variant-numeric: tabular-nums; }
.clock span { font-size: 9.5px; letter-spacing: .18em; text-transform: uppercase; opacity: .5; display: block; margin-top: 7px; font-weight: 700; }

/* ---------- cake ---------- */
.cake-wrap { text-align: center; }
.cake { width: 100%; max-width: 300px; margin: 6px auto 0; display: block; overflow: visible; }
.flame { transform-origin: center bottom; animation: flick 1.5s ease-in-out infinite; }
.flame.out { animation: none; opacity: 0; transform: scaleY(.2); transition: opacity .4s, transform .4s; }
@keyframes flick { 0%,100% { transform: scale(1) rotate(-2deg); } 50% { transform: scale(1.14, 1.2) rotate(2deg); } }
.smoke { opacity: 0; }
.smoke.on { animation: puff 1.6s ease-out forwards; }
@keyframes puff { 0% { opacity: .6; transform: translateY(0) scale(.6); } 100% { opacity: 0; transform: translateY(-34px) scale(1.5); } }
.cake-hint { margin-top: 20px; font-size: 14.5px; color: var(--muted); min-height: 22px; }
.cake-btn { margin-top: 16px; padding: 13px 22px; border-radius: 999px; font-size: 13.5px; font-weight: 700; border: 1px solid var(--hair); background: var(--card); backdrop-filter: blur(10px); }
.wish-done { font-family: var(--font-display); font-size: 25px; font-weight: 600; letter-spacing: -.02em; animation: rise .7s cubic-bezier(.2,.8,.3,1) both; }

/* ---------- scratch ---------- */
.scratch { position: relative; margin-top: 22px; border-radius: var(--r-md); overflow: hidden; }
.scratch canvas { position: absolute; inset: 0; width: 100%; height: 100%; z-index: 2; touch-action: none; cursor: grab; transition: opacity .5s; }
.scratch.done canvas { opacity: 0; pointer-events: none; }
.scratch-tip { position: absolute; inset: 0; z-index: 3; display: grid; place-items: center; pointer-events: none; font-size: 12.5px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; color: rgba(12,8,20,.62); transition: opacity .35s; }
.scratch.done .scratch-tip { opacity: 0; }

/* ---------- quick create ---------- */
.quick { max-width: 520px; margin: 0 auto; }
.q-photo { width: 118px; height: 118px; border-radius: 50%; margin: 0 auto; display: grid; place-items: center; position: relative; border: 2px dashed #d8d0c4; background: #fff; overflow: hidden; }
.q-photo img { width: 100%; height: 100%; object-fit: cover; }
.q-photo .edit { position: absolute; right: -2px; bottom: -2px; width: 36px; height: 36px; border-radius: 50%; background: var(--ink-1); color: #fff; display: grid; place-items: center; box-shadow: 0 6px 16px -6px rgba(0,0,0,.5); }
.q-big { width: 100%; padding: 18px 18px; border-radius: 18px; border: 1px solid var(--line); background: #fff; outline: 0; font-size: 20px; font-weight: 700; letter-spacing: -.02em; text-align: center; }
.q-big::placeholder { font-weight: 500; color: #b8b0a4; }
.q-big:focus { border-color: var(--brand); box-shadow: 0 0 0 4px var(--brand-soft); }
.q-chips { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
.q-chips button { padding: 10px 15px; border-radius: 999px; font-size: 13.5px; font-weight: 700; border: 1px solid var(--line); background: #fff; color: var(--ink-2); }
.q-chips button.on { background: var(--ink-1); border-color: var(--ink-1); color: #fff; }
.q-note { text-align: center; font-size: 13px; color: var(--ink-2); line-height: 1.55; }
`;

/* ============================ THEMES ============================ */
const THEMES = {
  rose: { name: "Rose", note: "Pink, purple, soft white",
    bgA: "#fdf2f7", bgB: "#f0e6ff", ink: "#2c1226", muted: "#7c5e73", card: "rgba(255,255,255,.66)",
    hair: "rgba(44,18,38,.10)", accent: "#ff4d94", accent2: "#8b5cf6", glow: "rgba(255,77,148,.42)", dark: false },
  midnight: { name: "Midnight", note: "Navy, purple, glowing particles",
    bgA: "#05081c", bgB: "#171338", ink: "#ecf0ff", muted: "#98a3cc", card: "rgba(255,255,255,.06)",
    hair: "rgba(255,255,255,.12)", accent: "#8ea2ff", accent2: "#d08bff", glow: "rgba(142,162,255,.5)", dark: true },
  sunset: { name: "Sunset", note: "Orange, pink, purple",
    bgA: "#1c0819", bgB: "#5d1a3c", ink: "#fff2ea", muted: "#e3aec1", card: "rgba(255,255,255,.08)",
    hair: "rgba(255,255,255,.14)", accent: "#ff9450", accent2: "#ff4d84", glow: "rgba(255,120,90,.5)", dark: true },
  ocean: { name: "Ocean", note: "Blue, cyan, white",
    bgA: "#eff8ff", bgB: "#d6f1fb", ink: "#062637", muted: "#4a7590", card: "rgba(255,255,255,.7)",
    hair: "rgba(6,38,55,.10)", accent: "#0891d1", accent2: "#22cfd6", glow: "rgba(8,145,209,.35)", dark: false },
  forest: { name: "Forest", note: "Green, emerald, gold",
    bgA: "#04140e", bgB: "#0d3123", ink: "#effaf3", muted: "#9dc9b2", card: "rgba(255,255,255,.07)",
    hair: "rgba(255,255,255,.13)", accent: "#3ad999", accent2: "#e8c35e", glow: "rgba(58,217,153,.42)", dark: true },
};
const themeVars = (t) => ({
  "--bg-a": t.bgA, "--bg-b": t.bgB, "--ink": t.ink, "--muted": t.muted,
  "--card": t.card, "--hair": t.hair, "--accent": t.accent, "--accent-2": t.accent2, "--glow": t.glow,
});
const RELATIONSHIPS = ["Friend", "Best Friend", "Brother", "Sister", "Cousin", "Partner", "Colleague", "Mentor"];
const BACKDROPS = { aurora: "Aurora", stars: "Starfield", blobs: "Soft blobs" };
const SPARKS = { confetti: "Confetti", hearts: "Hearts", fireworks: "Fireworks" };

/* ============================ UTILS ============================ */
const slugify = (s) => (s || "").toLowerCase().trim().replace(/['’.]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
function uniqueSlug(base, list, selfId) {
  const taken = new Set(list.filter((p) => p.id !== selfId).map((p) => p.slug));
  let s = base || "friend", n = 2;
  while (taken.has(s)) { s = base + "-" + n; n++; }
  return s;
}
const pad = (n) => String(n).padStart(2, "0");
const todayISO = () => { const d = new Date(); return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
function parseDate(iso) { const [y, m, d] = (iso || "2000-01-01").split("-").map(Number); return { y, m, d }; }
function birthdayInfo(iso) {
  const { y, m, d } = parseDate(iso);
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const thisYear = new Date(now.getFullYear(), m - 1, d);
  const days = Math.round((thisYear - now) / 86400000);
  const turning = now.getFullYear() - y;
  const label = new Date(2000, m - 1, d).toLocaleDateString("en-US", { month: "long", day: "numeric" });
  if (days === 0) return { status: "today", days: 0, turning, label, when: "Birthday today" };
  if (days < 0) return { status: "done", days, turning: turning + 1, label, when: "Celebrated " + Math.abs(days) + (Math.abs(days) === 1 ? " day ago" : " days ago") };
  return { status: "up", days, turning, label, when: days === 1 ? "Birthday tomorrow" : "In " + days + " days" };
}
const ordinal = (n) => { const s = ["th", "st", "nd", "rd"], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };

/* deterministic pseudo-random so generated artwork is stable per seed */
function rngFrom(seed) {
  let h = 2166136261;
  for (let i = 0; i < String(seed).length; i++) { h ^= String(seed).charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h += 0x6d2b79f5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
/* Generated keepsake artwork — always loads, never a broken image */
function artwork(seed, themeKey = "rose", mono = "") {
  const t = THEMES[themeKey] || THEMES.rose;
  const r = rngFrom(seed);
  const cols = [t.accent, t.accent2, t.accent, t.accent2, t.dark ? t.bgB : t.accent];
  let blobs = "";
  for (let i = 0; i < 5; i++) {
    const cx = 60 + r() * 280, cy = 60 + r() * 380, rr = 90 + r() * 150;
    blobs += `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${rr.toFixed(0)}" fill="${cols[i % cols.length]}" opacity="${(0.32 + r() * 0.4).toFixed(2)}"/>`;
  }
  const monoEl = mono ? `<text x="200" y="300" text-anchor="middle" font-family="Fraunces,Georgia,serif" font-size="150" font-weight="600" fill="${t.dark ? "#ffffff" : "#ffffff"}" opacity=".92">${mono}</text>` : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520" width="400" height="520">
<defs><filter id="b" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="46"/></filter>
<filter id="g"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3"/><feColorMatrix type="saturate" values="0"/></filter>
<linearGradient id="v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient></defs>
<rect width="400" height="520" fill="${t.dark ? "#0a0714" : "#f3ecf7"}"/><g filter="url(#b)">${blobs}</g>
<rect width="400" height="520" fill="url(#v)"/><rect width="400" height="520" filter="url(#g)" opacity=".16"/>${monoEl}</svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}
const initials = (n) => (n || "?").trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();

/* image downscale so uploads stay small enough to store */
function readImage(file) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(new Error("read"));
    fr.onload = () => {
      const img = new Image();
      img.onerror = () => resolve(fr.result);
      img.onload = () => {
        const max = 900, scale = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        try { resolve(c.toDataURL("image/jpeg", 0.72)); } catch (e) { resolve(fr.result); }
      };
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  });
}


/* ============================ AUTO-WRITER ============================
   Turns a name + relationship into a first draft you can then edit.
   Nothing here is random at read time: the same seed always writes the
   same page, so a rewrite is a deliberate act, not a surprise on reload. */
const BUCKET = { "Best Friend": "close", Friend: "friend", Brother: "sib", Sister: "sib", Cousin: "sib",
  Partner: "love", Colleague: "work", Mentor: "work" };

const WORDS = {
  close: {
    sub: ["The one I call first, every single time.", "Half my best stories have you in them.", "Some people are family without the paperwork.", "Still the best decision I ever accidentally made."],
    open: ["Another year older, another year more impossible to replace.", "Another year, and you are still the person who makes ordinary days worth remembering.", "One more year of you, which is the only kind of year I recommend."],
    mid: ["Thank you for being one of the people who makes life a little more fun, a little more crazy and a lot more memorable.", "Thank you for the terrible ideas, the honest advice, and for never once making me explain myself.", "You have this way of turning a normal evening into something I end up telling people about for years."],
    close2: ["I hope this year brings you everything you have been quietly hoping for.", "Here is to a year that treats you as well as you treat everyone else.", "May this year be kinder to you than you are hard on yourself."],
    quote: ["Some friendships don't need explaining. Ours is one of them.", "You are my favourite kind of trouble.", "Everyone should get one friend like you. Sorry, I got the only one."],
    fin: ["Here's to another year of terrible ideas and brilliant memories.", "Here's to another year of us, unedited.", "Here's to another year of stories nobody else would believe."],
  },
  friend: {
    sub: ["You make ordinary days better without trying.", "The easiest person in every room.", "Genuinely one of the good ones.", "Loudest laugh, biggest heart."],
    open: ["Another year older, another year more amazing.", "A whole new year, and you are still exactly the right amount of ridiculous.", "Another year of you being quietly excellent at existing."],
    mid: ["Thank you for making life a little more fun, a little more crazy and a lot more memorable.", "Thank you for showing up, for the check-ins, and for laughing at things nobody else finds funny.", "You are one of those people who make a room feel easier the moment you walk in."],
    close2: ["I hope this year brings you everything you have been wishing for.", "I hope this year is generous with you.", "Wishing you a year with more of whatever makes you feel like yourself."],
    quote: ["The world is better with you being loud in it.", "Good people are rare. You are one of them.", "You make ordinary days worth remembering."],
    fin: ["Here's to another year of memories.", "Here's to a year that deserves you.", "Here's to more of the good stuff."],
  },
  sib: {
    sub: ["My favourite person to argue with.", "Half my childhood is just you in the background.", "Older, wiser, still impossible.", "Built-in best friend, no returns accepted."],
    open: ["Another year older, and somehow still the same person who used to hide my things.", "Another year, and you have grown into someone I genuinely look up to, which is deeply annoying.", "One more year of you being the person who knows all my worst stories."],
    mid: ["Thank you for the years of noise, arguments and the kind of loyalty that never had to be asked for.", "Thank you for never making a big deal out of anything, especially my mistakes.", "We did not choose each other, and I would still choose you now."],
    close2: ["I hope this year goes easy on you and gives you a lot to celebrate.", "Go be impossible somewhere new this year.", "May this year bring you everything you have been working towards."],
    quote: ["Same house, same chaos, same people. Lucky me.", "You knew me before I knew myself.", "Nobody else would put up with either of us."],
    fin: ["Here's to another year of us.", "Here's to another year of arguing about nothing.", "Here's to a year that treats you well."],
  },
  love: {
    sub: ["My favourite person, on my favourite day.", "Every good thing about this year has your name on it.", "Still the best part of every ordinary day."],
    open: ["Another year of you, which is the only thing I ever really wanted more of.", "A whole year older and somehow you keep getting better at being you.", "Another year, and I still catch myself being lucky about it."],
    mid: ["Thank you for the small things nobody sees: the patience, the quiet, the way you make hard days lighter.", "Thank you for being home, whatever room we happen to be in.", "You make the ordinary parts of life feel like something worth having."],
    close2: ["I hope this year gives you every single thing you have been quietly hoping for.", "Here is to a year that is as good to you as you are to everyone else.", "I hope this year feels like it was made for you."],
    quote: ["Of all the days in the year, this one is my favourite.", "You, always.", "Everything is better with you in it."],
    fin: ["Here's to another year, side by side.", "Here's to all the years after this one.", "Here's to a year that looks like you."],
  },
  work: {
    sub: ["The reason our team survived last year.", "Calm in every crisis, always.", "Quietly the best of us."],
    open: ["Another year older, and still the most composed person in any meeting.", "Another year, and somehow you still make the hard weeks look manageable.", "Wishing you a birthday as steady and good as you are."],
    mid: ["Working with you made a hard year feel a lot lighter.", "Thank you for the patience, the good judgement, and for making the work feel worth doing.", "You raise the standard for everyone around you without ever making it feel like pressure."],
    close2: ["Wishing you a year with fewer deadlines and far more of whatever makes you happy.", "I hope this year brings you the recognition you keep not asking for.", "Here is to a year that gives you some time back."],
    quote: ["Good colleagues are luck. Good people are rarer.", "Everything runs better when you are in the room.", "Thanks for making the hard weeks easier."],
    fin: ["Here's to a year that gives back.", "Here's to another good year ahead.", "Here's to the year you deserve."],
  },
};
const CAPTIONS = ["One of my favourite memories.", "Never forgetting this one.", "That crazy day.", "This one still makes me laugh.", "Proof it happened.", "A good day, start to finish.", "No notes. Perfect."];

function autoCopy(name, relationship, seed) {
  const w = WORDS[BUCKET[relationship] || "friend"];
  const r = rngFrom(seed || "seed");
  const pick = (arr) => arr[Math.floor(r() * arr.length)];
  const first = (name || "friend").trim().split(/\s+/)[0];
  return {
    subtitle: pick(w.sub),
    message: `Dear ${first},\n\n${pick(w.open)}\n\n${pick(w.mid)}\n\n${pick(w.close2)}\n\nHappy Birthday.`,
    quote: pick(w.quote),
    finalNote: pick(w.fin),
  };
}
const autoCaption = (i, seed) => { const r = rngFrom(seed + i); return CAPTIONS[Math.floor(r() * CAPTIONS.length)]; };

/* ============================ SAMPLE DATA ============================ */
const mk = (o) => ({
  id: o.id, slug: o.slug, name: o.name, nickname: o.nickname || "", date: o.date, relationship: o.relationship || "Friend",
  theme: o.theme || "rose", backdrop: o.backdrop || "aurora", spark: o.spark || "confetti",
  subtitle: o.subtitle, message: o.message, quote: o.quote || "", finalNote: o.finalNote || "",
  music: o.music !== false, cake: o.cake !== false, scratch: o.scratch !== false,
  lockUntilBirthday: Boolean(o.lockUntilBirthday), from: o.from || "Aarav",
  photo: o.photo || artwork(o.slug + "-p", o.theme || "rose", initials(o.name)),
  memories: (o.memories || []).map((m, i) => ({ id: o.slug + "-m" + i, src: m.src || artwork(o.slug + "-m" + i, o.theme || "rose"), caption: m.caption })),
  timeline: o.timeline || [], createdAt: o.createdAt, views: o.views || 0,
});

const SAMPLE = [
  mk({ id: "p1", slug: "rahul-sharma", name: "Rahul Sharma", nickname: "Rahu", date: "1999-08-17", relationship: "Best Friend",
    theme: "rose", backdrop: "aurora", spark: "confetti", createdAt: "2026-08-10", views: 38,
    subtitle: "You deserve all the happiness in the world.",
    message: "Dear Rahul,\n\nAnother year older, another year more amazing.\n\nThank you for being one of the people who makes life a little more fun, a little more crazy and a lot more memorable.\n\nI hope this year brings you everything you have been wishing for.\n\nHappy Birthday.",
    quote: "Some friendships don't need explaining. Ours is one of them.",
    finalNote: "Here is to another year of terrible ideas and brilliant memories.",
    memories: [ { caption: "That crazy day at Nahargarh." }, { caption: "One of my favourite memories." }, { caption: "Never forgetting this one." }, { caption: "3am chai, obviously." } ],
    timeline: [ { year: "2019", text: "First day of college. You stole my chair." }, { year: "2022", text: "That legendary Goa trip." }, { year: "2024", text: "You moved cities. We still talked daily." }, { year: "2026", text: "Still here. Still annoying each other." } ] }),
  mk({ id: "p2", slug: "harsh", name: "Harsh Mehta", nickname: "Harshu", date: "2000-08-18", relationship: "Friend",
    theme: "midnight", backdrop: "stars", spark: "fireworks", createdAt: "2026-08-12", views: 4,
    subtitle: "The calmest person in every group chat crisis.",
    message: "Harsh,\n\nYou are the person everyone calls when things go sideways, and somehow you always pick up.\n\nThis year, I hope someone shows up for you the way you show up for everyone else.\n\nHappy Birthday.",
    quote: "Quietly the best of us.",
    memories: [ { caption: "The night we got lost in Udaipur." }, { caption: "You, winning at cards. Again." } ],
    timeline: [ { year: "2021", text: "Met at that awful open mic." }, { year: "2023", text: "Road trip with no plan." }, { year: "2026", text: "Still no plan. Still fun." } ] }),
  mk({ id: "p3", slug: "ananya", name: "Ananya Iyer", nickname: "Anu", date: "2001-08-23", relationship: "Sister",
    theme: "sunset", backdrop: "blobs", spark: "hearts", createdAt: "2026-08-14", views: 0,
    subtitle: "My favourite person to argue with.",
    message: "Anu,\n\nYou grew up into someone I genuinely look up to, which is annoying because I am supposed to be the older one.\n\nHappy Birthday. Go be impossible somewhere new this year.",
    quote: "Half my childhood is just you in the background, laughing.",
    memories: [ { caption: "Diwali, before the sweets ran out." }, { caption: "You at your first exhibition." }, { caption: "Terrace, monsoon, 2024." } ],
    timeline: [ { year: "2005", text: "You arrived and took over the house." }, { year: "2024", text: "Your first solo exhibition." }, { year: "2026", text: "Officially cooler than me." } ] }),
  mk({ id: "p4", slug: "priya", name: "Priya Nair", nickname: "", date: "1998-09-02", relationship: "Colleague",
    theme: "ocean", backdrop: "blobs", spark: "confetti", createdAt: "2026-08-15", views: 0, music: false, lockUntilBirthday: true,
    subtitle: "The reason our team survived last quarter.",
    message: "Priya,\n\nWorking with you made a hard year feel a lot lighter.\n\nWishing you a year with fewer deadlines and far more of whatever makes you happy.\n\nHappy Birthday.",
    memories: [ { caption: "Team offsite, Kochi." }, { caption: "Launch day. We made it." } ],
    timeline: [] }),
  mk({ id: "p5", slug: "devansh", name: "Devansh Kapoor", nickname: "Dev", date: "1997-07-29", relationship: "Brother",
    theme: "forest", backdrop: "aurora", spark: "hearts", createdAt: "2026-07-20", views: 61,
    subtitle: "Older, wiser, still terrible at cricket.",
    message: "Dev,\n\nThanks for being the one who never makes a big deal out of anything, especially my mistakes.\n\nHappy Birthday, bhai.",
    quote: "You taught me how to lose gracefully. Mostly at cricket.",
    memories: [ { caption: "Rishikesh, the year everything changed." }, { caption: "Dad's old camera, your hands." } ],
    timeline: [ { year: "2015", text: "You left for university." }, { year: "2020", text: "The year we actually became friends." }, { year: "2026", text: "Still calling you first." } ] }),
];

/* ============================ STORE ============================ */
const STORE_KEY = "wishcraft:profiles:v1";
function useProfiles() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const ready = useRef(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      let data = SAMPLE;
      try {
        const res = await window.storage.get(STORE_KEY);
        const parsed = JSON.parse(res.value);
        if (Array.isArray(parsed) && parsed.length) data = parsed;
      } catch (e) { /* first run or storage unavailable — seed with samples */ }
      await new Promise((r) => setTimeout(r, 620));
      if (!alive) return;
      setList(data); setLoading(false); ready.current = true;
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!ready.current) return;
    (async () => {
      try { await window.storage.set(STORE_KEY, JSON.stringify(list)); setFailed(false); }
      catch (e) { setFailed(true); }
    })();
  }, [list]);

  return { list, setList, loading, failed };
}

/* ============================ SMALL PARTS ============================ */
const Icon = ({ d, size = 20, fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);
const I = {
  home: "M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5",
  plus: "M12 5v14M5 12h14",
  cake: "M4 21h16M5 21v-7a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v7M9 8V5m3 3V4m3 4V5",
  link: "M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1",
  copy: "M9 9h10v10H9zM5 15V5h10",
  edit: "M4 20h4L20 8l-4-4L4 16v4z",
  trash: "M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13",
  back: "M15 5l-7 7 7 7",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4-4",
  check: "M4 12.5 9 17.5 20 6.5",
  eye: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  x: "M6 6l12 12M18 6 6 18",
  send: "M21 3 3 10.5l7 3 3 7L21 3z",
  spark: "M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3z",
  photo: "M4 5h16v14H4zM4 15l4.5-4.5 4 4L16 11l4 4",
  gift: "M4 11h16v10H4zM2 7h20v4H2zM12 7v14M12 7S9.5 3 7.5 4 8 7 12 7zM12 7s2.5-4 4.5-3S16 7 12 7z",
};
function Toast({ msg, tone }) {
  if (!msg) return null;
  return <div className="toast" role="status"><Icon d={tone === "bad" ? I.x : I.check} size={16} /> {msg}</div>;
}
function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { el.classList.add("in"); return; }
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { el.classList.add("in"); io.unobserve(el); } }), { threshold: 0.16, rootMargin: "0px 0px -40px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}
const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ============================ CELEBRATION CANVAS ============================ */
const Celebration = React.forwardRef(function Celebration({ theme, spark = "confetti", ambient = true, contained = false }, api) {
  const ref = useRef(null);
  const parts = useRef([]);
  const raf = useRef(0);
  const last = useRef(0);
  const spawnAt = useRef(0);

  const colors = useMemo(() => [theme.accent, theme.accent2, theme.dark ? "#ffffff" : "#f4b63f", theme.accent2], [theme]);

  const add = useCallback((kind, x, y, n, power) => {
    const arr = parts.current;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = (0.5 + Math.random()) * power;
      arr.push({
        kind, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (kind === "confetti" ? 3 : 0),
        life: 0, max: kind === "float" ? 320 : 150 + Math.random() * 110,
        size: kind === "confetti" ? 5 + Math.random() * 6 : 4 + Math.random() * 7,
        rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.24,
        c: colors[(Math.random() * colors.length) | 0], sway: Math.random() * 6.28,
      });
    }
    if (arr.length > 620) arr.splice(0, arr.length - 620);
  }, [colors]);

  /* burst(kind, clientX, clientY, small) — call it from anywhere on the page */
  const fire = useCallback((kind, cx, cy, small) => {
    if (reduced()) return;
    const c = ref.current; if (!c) return;
    const box = c.getBoundingClientRect();
    const w = c.clientWidth, h = c.clientHeight;
    const at = cx != null;
    const x = at ? cx - box.left : w / 2, y = at ? cy - box.top : h * 0.52;
    const k = kind || spark;
    const n = small ? 0.32 : 1;
    if (k === "fireworks") {
      const rounds = small ? 1 : 4;
      for (let i = 0; i < rounds; i++)
        setTimeout(() => add("spark", at ? x : w * (0.2 + Math.random() * 0.6), at ? y : h * (0.16 + Math.random() * 0.34), Math.round(46 * (small ? 0.5 : 1)), 6.5), i * 240);
    } else if (k === "hearts") {
      add("heart", x, y, Math.round(40 * n) + 6, 4.2);
    } else {
      add("confetti", x, y, Math.round(90 * n) + 8, small ? 5 : 7);
      if (!small) {
        setTimeout(() => add("confetti", w * 0.22, h * 0.42, 44, 6), 220);
        setTimeout(() => add("confetti", w * 0.78, h * 0.42, 44, 6), 360);
      }
    }
  }, [add, spark]);

  useImperativeHandle(api, () => ({ burst: fire }), [fire]);

  useEffect(() => {
    if (reduced()) return;
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = c.clientWidth * dpr; c.height = c.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    window.addEventListener("resize", fit);

    const heart = (g, x, y, s, rot, alpha, col) => {
      g.save(); g.translate(x, y); g.rotate(rot); g.scale(s / 16, s / 16); g.globalAlpha = alpha; g.fillStyle = col;
      g.beginPath(); g.moveTo(0, 4);
      g.bezierCurveTo(-9, -4, -6, -13, 0, -8);
      g.bezierCurveTo(6, -13, 9, -4, 0, 4);
      g.fill(); g.restore();
    };

    const loop = (t) => {
      raf.current = requestAnimationFrame(loop);
      const dt = Math.min(34, t - (last.current || t)); last.current = t;
      const w = c.clientWidth, h = c.clientHeight;
      ctx.clearRect(0, 0, w, h);

      if (ambient && t - spawnAt.current > 520) {
        spawnAt.current = t;
        const p = parts.current;
        p.push({
          kind: spark === "hearts" ? "floatHeart" : "float",
          x: Math.random() * w, y: h + 14, vx: (Math.random() - 0.5) * 0.22, vy: -(0.25 + Math.random() * 0.42),
          life: 0, max: 460, size: 3 + Math.random() * 5, rot: 0, vr: 0.004,
          c: colors[(Math.random() * colors.length) | 0], sway: Math.random() * 6.28,
        });
      }

      const arr = parts.current;
      for (let i = arr.length - 1; i >= 0; i--) {
        const p = arr[i];
        p.life += dt / 16.7;
        const k = p.life / p.max;
        if (k >= 1) { arr.splice(i, 1); continue; }
        p.sway += 0.03;
        if (p.kind === "confetti") { p.vy += 0.16; p.vx *= 0.992; p.vy *= 0.995; p.rot += p.vr; }
        else if (p.kind === "spark") { p.vy += 0.09; p.vx *= 0.975; p.vy *= 0.975; }
        else if (p.kind === "heart") { p.vy += 0.05; p.vx *= 0.985; p.vy *= 0.985; }
        else { p.x += Math.sin(p.sway) * 0.35; }
        p.x += p.vx * (dt / 16.7); p.y += p.vy * (dt / 16.7);
        const drift = p.kind === "float" || p.kind === "floatHeart";
        const alpha = drift ? Math.sin(k * Math.PI) * (p.kind === "floatHeart" ? 0.3 : 0.8) : 1 - k * k;

        if (p.kind === "confetti") {
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = alpha; ctx.fillStyle = p.c;
          ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.62); ctx.restore();
        } else if (p.kind === "heart" || p.kind === "floatHeart") {
          heart(ctx, p.x, p.y, p.size * (p.kind === "floatHeart" ? 0.75 : 1.9), Math.sin(p.sway) * 0.2, alpha, p.c);
        } else {
          ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = p.c;
          if (p.kind === "spark") { ctx.shadowBlur = 12; ctx.shadowColor = p.c; }
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size / 2, 0, 6.283); ctx.fill(); ctx.restore();
        }
      }
    };
    raf.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", fit); };
  }, [ambient, colors, spark]);

  if (reduced()) return null;
  return <canvas ref={ref} className="bd-canvas" style={contained ? { position: "absolute" } : undefined} aria-hidden="true" />;
});

/* ============================ AMBIENT BACKDROP ============================ */
function Backdrop({ theme, kind, contained }) {
  const stars = useMemo(() => {
    const r = rngFrom(kind + theme.accent);
    return Array.from({ length: 46 }, () => ({ l: r() * 100, t: r() * 100, d: (r() * 4).toFixed(2), s: r() > 0.86 ? 3 : 2 }));
  }, [kind, theme]);
  const style = contained ? { position: "absolute" } : undefined;
  if (kind === "stars") {
    return (
      <div className="bd-amb" style={style} aria-hidden="true">
        {stars.map((s, i) => <span key={i} className="bd-star" style={{ left: s.l + "%", top: s.t + "%", width: s.s, height: s.s, animationDelay: s.d + "s", background: i % 4 === 0 ? theme.accent : theme.ink }} />)}
        <div className="bd-blob" style={{ width: 340, height: 340, left: "-16%", top: "6%", background: theme.accent, opacity: .22 }} />
        <div className="bd-blob" style={{ width: 300, height: 300, right: "-14%", top: "44%", background: theme.accent2, opacity: .2, animationDelay: "-8s" }} />
      </div>
    );
  }
  if (kind === "blobs") {
    return (
      <div className="bd-amb" style={style} aria-hidden="true">
        <div className="bd-blob" style={{ width: 300, height: 300, left: "-18%", top: "4%", background: theme.accent }} />
        <div className="bd-blob" style={{ width: 280, height: 280, right: "-16%", top: "28%", background: theme.accent2, animationDelay: "-6s" }} />
        <div className="bd-blob" style={{ width: 320, height: 320, left: "6%", top: "62%", background: theme.accent, opacity: .4, animationDelay: "-12s" }} />
      </div>
    );
  }
  return (
    <div className="bd-amb" style={style} aria-hidden="true">
      <div className="bd-blob" style={{ width: "130%", height: 420, left: "-15%", top: "-12%", background: `linear-gradient(100deg, ${theme.accent}, ${theme.accent2})`, opacity: .38, filter: "blur(80px)" }} />
      <div className="bd-blob" style={{ width: "120%", height: 380, left: "-10%", top: "46%", background: `linear-gradient(260deg, ${theme.accent2}, ${theme.accent})`, opacity: .26, filter: "blur(90px)", animationDelay: "-9s" }} />
    </div>
  );
}

/* ============================ MUSIC ============================ */
function useSong() {
  const ctxRef = useRef(null), gainRef = useRef(null), timer = useRef(null), step = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  const stop = useCallback(() => {
    clearInterval(timer.current); timer.current = null;
    if (gainRef.current) { try { gainRef.current.gain.linearRampToValueAtTime(0.0001, ctxRef.current.currentTime + 0.4); } catch (e) {} }
    setPlaying(false);
  }, []);

  const start = useCallback(() => {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!ctxRef.current) {
        ctxRef.current = new AC();
        gainRef.current = ctxRef.current.createGain();
        gainRef.current.connect(ctxRef.current.destination);
      }
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") ctx.resume();
      gainRef.current.gain.setValueAtTime(0.0001, ctx.currentTime);
      gainRef.current.gain.linearRampToValueAtTime(muted ? 0.0001 : 0.16, ctx.currentTime + 1.1);
      const scale = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21];
      const play = () => {
        const n = scale[step.current % scale.length] + (step.current % 20 > 9 ? -5 : 0);
        const f = 261.63 * Math.pow(2, n / 12);
        [f, f * 2].forEach((freq, i) => {
          const o = ctx.createOscillator(), g = ctx.createGain();
          o.type = i ? "sine" : "triangle"; o.frequency.value = freq;
          g.gain.setValueAtTime(0.0001, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(i ? 0.06 : 0.2, ctx.currentTime + 0.05);
          g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.9);
          o.connect(g); g.connect(gainRef.current); o.start(); o.stop(ctx.currentTime + 2);
        });
        step.current++;
      };
      play();
      clearInterval(timer.current);
      timer.current = setInterval(play, 620);
      setPlaying(true);
    } catch (e) { setPlaying(false); }
  }, [muted]);

  useEffect(() => {
    if (!gainRef.current || !ctxRef.current) return;
    try { gainRef.current.gain.linearRampToValueAtTime(muted ? 0.0001 : 0.16, ctxRef.current.currentTime + 0.25); } catch (e) {}
  }, [muted]);

  useEffect(() => () => { clearInterval(timer.current); try { ctxRef.current && ctxRef.current.close(); } catch (e) {} }, []);
  return { playing, muted, setMuted, start, stop };
}

function MusicPill({ song, onClose }) {
  return (
    <div className={"music" + (song.playing && !song.muted ? "" : " paused")}>
      <span className="eq" aria-hidden="true"><i /><i /><i /></span>
      <button className="label" onClick={() => (song.playing ? song.stop() : song.start())} style={{ fontWeight: 800 }}>
        {song.playing ? (song.muted ? "Muted" : "♫ Playing your birthday song") : "♫ Play the song"}
      </button>
      {song.playing && (
        <button onClick={() => song.setMuted(!song.muted)} aria-label={song.muted ? "Unmute" : "Mute"} style={{ opacity: .6, display: "flex" }}>
          <Icon d={song.muted ? "M11 5 6 9H3v6h3l5 4V5zM22 9l-6 6M16 9l6 6" : "M11 5 6 9H3v6h3l5 4V5zM16 9a4 4 0 0 1 0 6"} size={16} />
        </button>
      )}
      <button className="music-x" onClick={onClose} aria-label="Hide music player">×</button>
    </div>
  );
}


/* ============================ COUNTDOWN LOCK ============================ */
function LockScreen({ p, theme }) {
  const target = useMemo(() => {
    const { m, d } = parseDate(p.date);
    const now = new Date();
    let t = new Date(now.getFullYear(), m - 1, d, 0, 0, 0);
    if (t < now) t = new Date(now.getFullYear() + 1, m - 1, d, 0, 0, 0);
    return t;
  }, [p.date]);
  const [left, setLeft] = useState(() => target - new Date());
  useEffect(() => {
    const i = setInterval(() => setLeft(target - new Date()), 1000);
    return () => clearInterval(i);
  }, [target]);
  const ms = Math.max(0, left);
  const dd = Math.floor(ms / 86400000), hh = Math.floor(ms / 3600000) % 24,
        mm = Math.floor(ms / 60000) % 60, ss = Math.floor(ms / 1000) % 60;
  const first = p.nickname || p.name.split(" ")[0];
  return (
    <div className="lock wc-grain">
      <div className="lock-ring">🔒</div>
      <h1 className="seal-title" style={{ marginTop: 28 }}>Not yet, {first}</h1>
      <p className="seal-sub">Someone left something here for you. It opens itself the moment your birthday starts.</p>
      <div className="clock">
        {[[dd, "Days"], [hh, "Hours"], [mm, "Mins"], [ss, "Secs"]].map(([v, l]) => (
          <div key={l}><b>{pad(v)}</b><span>{l}</span></div>
        ))}
      </div>
      <p className="seal-foot" style={{ marginTop: 20 }}>Keep this link. Come back on {birthdayInfo(p.date).label}.</p>
    </div>
  );
}

/* ============================ BLOW OUT THE CANDLES ============================ */
function useBreath(onBlow) {
  const stopRef = useRef(null);
  const cb = useRef(onBlow);
  cb.current = onBlow;
  const stop = useCallback(() => { if (stopRef.current) { stopRef.current(); stopRef.current = null; } }, []);
  const start = useCallback(async () => {
    if (stopRef.current) return true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AC = window.AudioContext || window.webkitAudioContext;
      const ctx = new AC();
      const src = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser(); an.fftSize = 512;
      src.connect(an);
      const buf = new Uint8Array(an.fftSize);
      let raf = 0, last = 0;
      const tick = () => {
        an.getByteTimeDomainData(buf);
        let sum = 0;
        for (let i = 0; i < buf.length; i++) { const v = (buf[i] - 128) / 128; sum += v * v; }
        const rms = Math.sqrt(sum / buf.length);
        if (rms > 0.13 && performance.now() - last > 300) { last = performance.now(); cb.current(); }
        raf = requestAnimationFrame(tick);
      };
      tick();
      stopRef.current = () => {
        cancelAnimationFrame(raf);
        stream.getTracks().forEach((t) => t.stop());
        try { ctx.close(); } catch (e) {}
      };
      return true;
    } catch (e) { return false; }
  }, []);
  useEffect(() => stop, [stop]);
  return { start, stop };
}

function CakeMoment({ p, theme, onWish }) {
  const rv = useReveal();
  const N = 5;
  const [lit, setLit] = useState(() => Array(N).fill(true));
  const [mic, setMic] = useState("idle"); // idle | on | denied
  const [done, setDone] = useState(false);
  const blowOne = useCallback(() => {
    setLit((l) => { const i = l.indexOf(true); if (i < 0) return l; const n = [...l]; n[i] = false; return n; });
  }, []);
  const breath = useBreath(blowOne);
  const out = lit.filter((v) => !v).length;

  useEffect(() => {
    if (out === N && !done) {
      setDone(true);
      breath.stop();
      onWish && onWish();
    }
  }, [out, done, onWish, breath]);

  const first = p.nickname || p.name.split(" ")[0];
  const cx = (i) => 66 + i * 42;
  return (
    <section className="sect rv cake-wrap" ref={rv}>
      <p className="sect-label">Make a wish</p>
      <svg className="cake" viewBox="0 0 300 250" role="img" aria-label="Birthday cake">
        {lit.map((on, i) => (
          <g key={i} onClick={() => on && blowOne()} style={{ cursor: on ? "pointer" : "default" }}>
            {on && <rect x={cx(i) - 20} y="62" width="40" height="46" fill="transparent" />}
            <rect x={cx(i) - 4} y="96" width="8" height="42" rx="4" fill={i % 2 ? theme.accent2 : theme.accent} opacity=".9" />
            <g className={"flame" + (on ? "" : " out")} style={{ transformBox: "fill-box", animationDelay: i * 0.2 + "s" }}>
              <ellipse cx={cx(i)} cy="84" rx="7" ry="13" fill={theme.accent2} opacity=".45" />
              <ellipse cx={cx(i)} cy="86" rx="4" ry="9" fill="#ffd166" />
            </g>
            <circle className={"smoke" + (on ? "" : " on")} cx={cx(i)} cy="86" r="5" fill={theme.ink} opacity=".25" style={{ transformBox: "fill-box", transformOrigin: "center" }} />
          </g>
        ))}
        <rect x="34" y="138" width="232" height="46" rx="16" fill={theme.accent} opacity=".92" />
        <rect x="34" y="176" width="232" height="48" rx="16" fill={theme.accent2} opacity=".92" />
        <rect x="22" y="218" width="256" height="12" rx="6" fill={theme.ink} opacity=".14" />
        {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={48 + i * 41} cy="160" r="4.5" fill="#fff" opacity=".55" />)}
      </svg>

      {done ? (
        <p className="wish-done" style={{ marginTop: 18 }}>Wish made ✨</p>
      ) : (
        <>
          <p className="cake-hint">{out === 0 ? "Tap the flames — or use your breath." : `${N - out} to go…`}</p>
          <button className="cake-btn" onClick={async () => {
            if (mic === "on") return;
            const ok = await breath.start();
            setMic(ok ? "on" : "denied");
          }}>
            {mic === "on" ? "🎤 Listening — blow!" : mic === "denied" ? "No mic — tap the flames" : "🎤 Blow into your mic"}
          </button>
        </>
      )}
      {!done && (
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 14 }}>
          {lit.map((on, i) => on && (
            <button key={i} onClick={blowOne} aria-label="Blow out a candle"
              style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--card)", border: "1px solid var(--hair)", fontSize: 17 }}>🕯️</button>
          ))}
        </div>
      )}
      {done && <p className="hero-line" style={{ marginTop: 12 }}>Whatever you wished for, {first} — I hope it shows up early.</p>}
    </section>
  );
}

/* ============================ SCRATCH TO REVEAL ============================ */
function ScratchQuote({ text, theme }) {
  const wrap = useRef(null), cvs = useRef(null);
  const cells = useRef(new Set());
  const [done, setDone] = useState(reduced());
  const drawing = useRef(false);

  useEffect(() => {
    if (done) return;
    const c = cvs.current, box = wrap.current;
    if (!c || !box) return;
    const w = box.clientWidth, h = box.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = w * dpr; c.height = h * dpr;
    const g = c.getContext("2d");
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const grad = g.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, theme.accent); grad.addColorStop(1, theme.accent2);
    g.fillStyle = grad; g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = "destination-out";
  }, [done, theme]);

  const scratch = (e) => {
    if (done || !drawing.current) return;
    const c = cvs.current, box = c.getBoundingClientRect();
    const x = e.clientX - box.left, y = e.clientY - box.top;
    const g = c.getContext("2d");
    g.beginPath(); g.arc(x, y, 26, 0, 6.283); g.fill();
    cells.current.add(Math.floor(x / (box.width / 12)) + ":" + Math.floor(y / (box.height / 5)));
    if (cells.current.size > 26) setDone(true);
  };

  return (
    <div className={"scratch" + (done ? " done" : "")} ref={wrap}>
      <div className="quote" style={{ marginTop: 0 }}>“{text}”</div>
      {!done && (
        <>
          <canvas ref={cvs}
            onPointerDown={(e) => { drawing.current = true; e.currentTarget.setPointerCapture(e.pointerId); scratch(e); }}
            onPointerMove={scratch}
            onPointerUp={() => { drawing.current = false; }}
            onPointerCancel={() => { drawing.current = false; }} />
          <span className="scratch-tip">Scratch to reveal</span>
        </>
      )}
    </div>
  );
}

/* ============================ SCROLL PROGRESS ============================ */
function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const on = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      setPct(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); };
  }, []);
  return <div className="prog" aria-hidden="true"><i style={{ width: pct + "%" }} /></div>;
}

/* ============================ BIRTHDAY EXPERIENCE ============================ */
function SurpriseIntro({ p, theme, onOpen }) {
  const [going, setGoing] = useState(false);
  const btn = useRef(null);
  const [wash, setWash] = useState(null);
  const open = () => {
    if (going) return;
    setGoing(true);
    const r = btn.current ? btn.current.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const rad = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy)) * 1.15;
    setWash({ cx, cy, rad });
    setTimeout(onOpen, reduced() ? 60 : 620);
  };
  return (
    <div className="seal-wrap wc-grain">
      <p className="seal-eyebrow">A private link</p>
      <div className="seal-medal">
        <span className="seal-ring" />
        <span className="mono" style={{ color: theme.accent }}>{initials(p.nickname || p.name)}</span>
      </div>
      <h1 className="seal-title">Hey… someone special has a surprise for you 👀</h1>
      <p className="seal-sub">This page was made for one person only. If your name is {p.nickname || p.name.split(" ")[0]}, you are in the right place.</p>
      <button ref={btn} className="seal-btn" onClick={open}>Open your birthday surprise 🎁</button>
      <p className="seal-foot">Best opened with sound on</p>
      {wash && !reduced() && (
        <span className="wash" style={{ left: wash.cx - 10, top: wash.cy - 10, width: 20, height: 20, "--wash-scale": wash.rad / 10 }} />
      )}
    </div>
  );
}

function Hero({ p, theme }) {
  const info = birthdayInfo(p.date);
  const first = (p.nickname || p.name.split(" ")[0]);
  return (
    <header className="hero">
      <div className="hero-frame">
        <span className="hero-halo" />
        <img src={p.photo} alt={p.name} />
      </div>
      <p className="hero-eyebrow">Happy Birthday ❤️</p>
      <h1 className="hero-name">{first}</h1>
      <p className="hero-line">{p.subtitle}</p>
      <div className="hero-age">
        <Icon d={I.cake} size={15} /> {info.status === "today" && info.turning > 0 ? `${ordinal(info.turning)} trip around the sun` : `${info.label} · ${info.when}`}
      </div>
      <div className="scroll-cue" aria-hidden="true"><span /></div>
    </header>
  );
}

function MessageCard({ p, theme }) {
  const ref = useReveal();
  const [n, setN] = useState(0);
  const [seen, setSeen] = useState(false);
  const body = p.message || "";
  const lines = body.split("\n");
  const lead = lines[0];
  const rest = lines.slice(1).join("\n").replace(/^\n+/, "");

  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (reduced()) { setN(rest.length); setSeen(true); return; }
    const io = new IntersectionObserver((es) => { if (es[0].isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(el); return () => io.disconnect();
  }, [rest.length]);

  useEffect(() => {
    if (!seen || n >= rest.length) return;
    const t = setTimeout(() => setN((v) => Math.min(rest.length, v + 3)), 12);
    return () => clearTimeout(t);
  }, [seen, n, rest.length]);

  return (
    <section className="sect rv" ref={ref} onClick={() => setN(rest.length)}>
      <p className="sect-label">The message</p>
      <div className="card msg">
        <div className="msg-body">
          <span className="lead" style={{ color: theme.accent }}>{lead}</span>
          {rest.slice(0, n)}
          {n < rest.length && <span className="caret" />}
        </div>
        <div className="msg-sign">
          <span>With love, {p.from}</span>
          <span>{p.relationship}</span>
        </div>
      </div>
      {p.quote && (p.scratch === false
        ? <div className="quote">“{p.quote}”</div>
        : <ScratchQuote text={p.quote} theme={theme} />)}
    </section>
  );
}

function MemoryGallery({ p }) {
  const ref = useReveal();
  const rail = useRef(null);
  const [i, setI] = useState(0);
  if (!p.memories || !p.memories.length) return null;
  const onScroll = () => {
    const el = rail.current; if (!el) return;
    const card = el.firstChild; if (!card) return;
    const w = card.getBoundingClientRect().width + 14;
    setI(Math.round(el.scrollLeft / w));
  };
  return (
    <section className="sect rv" ref={ref}>
      <p className="sect-label">Memories · swipe</p>
      <div className="rail" ref={rail} onScroll={onScroll}>
        {p.memories.map((m, idx) => (
          <figure className="memo" key={m.id || idx}>
            <img src={m.src} alt={m.caption || "Memory"} loading="lazy" />
            <span className="memo-idx">{pad(idx + 1)} / {pad(p.memories.length)}</span>
            {m.caption && <figcaption className="memo-cap">{m.caption}</figcaption>}
          </figure>
        ))}
      </div>
      <div className="dots">{p.memories.map((_, idx) => <span key={idx} className={"dot" + (idx === i ? " on" : "")} />)}</div>
    </section>
  );
}

function Timeline({ p }) {
  const ref = useReveal();
  if (!p.timeline || !p.timeline.length) return null;
  return (
    <section className="sect rv" ref={ref}>
      <p className="sect-label">How we got here</p>
      <div className="tl">
        {p.timeline.map((t, idx) => (
          <div className="tl-item" key={idx}>
            <div className="tl-year">{t.year}</div>
            <div className="tl-text">{t.text}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalWish({ p, theme, onCelebrate, onReplay }) {
  const ref = useRef(null);
  const fired = useRef(false);
  const first = p.nickname || p.name.split(" ")[0];
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver((es) => {
      if (es[0].isIntersecting && !fired.current) { fired.current = true; onCelebrate && onCelebrate(); }
    }, { threshold: 0.45 });
    io.observe(el); return () => io.disconnect();
  }, [onCelebrate]);
  const rv = useReveal();
  return (
    <section className="final rv" ref={rv}>
      <div ref={ref}>
        <p className="final-kicker">{p.finalNote || "Here's to another year of memories."}</p>
        <div className="final-stack">
          <span style={{ animationDelay: ".05s" }}>Keep smiling.</span>
          <span style={{ animationDelay: ".22s" }}>Keep dreaming.</span>
          <span style={{ animationDelay: ".39s" }}>Keep being you.</span>
        </div>
        <h2 className="final-big">Happy Birthday,<b>{first} ❤️</b></h2>
        <p className="final-from">Made for you by {p.from}</p>
        <button className="replay" onClick={onReplay}>Play it again 🎉</button>
      </div>
    </section>
  );
}

function BirthdayExperience({ p, contained = false, startOpen = false, withMusic = true }) {
  const theme = THEMES[p.theme] || THEMES.rose;
  const locked = Boolean(p.lockUntilBirthday) && !contained && !startOpen && birthdayInfo(p.date).status === "up";
  const [open, setOpen] = useState(startOpen);
  const [showMusic, setShowMusic] = useState(true);
  const song = useSong();
  const scroller = useRef(null);
  const cel = useRef(null);

  const celebrate = useCallback((kind, x, y, small) => {
    if (cel.current) cel.current.burst(kind, x, y, small);
  }, []);
  /* a tap anywhere throws a small handful of confetti */
  const tap = (e) => {
    if (!open) return;
    if (e.target.closest("button, a, input, textarea, .rail, .scratch")) return;
    celebrate(null, e.clientX, e.clientY, true);
  };
  const onOpen = () => {
    setOpen(true);
    celebrate();
    if (p.music) song.start();
    if (contained && scroller.current) scroller.current.scrollTop = 0;
  };
  const replay = () => {
    celebrate();
    const el = contained ? scroller.current : window;
    if (el && el.scrollTo) el.scrollTo({ top: 0, behavior: reduced() ? "auto" : "smooth" });
  };

  return (
    <div className={"wc bd wc-grain" + (contained ? " bd-contained" : "")} ref={scroller}
      style={{ ...themeVars(theme), height: contained ? "100%" : undefined, minHeight: contained ? "100%" : undefined, overflowY: contained ? "auto" : undefined }}>
      <Backdrop theme={theme} kind={p.backdrop} contained={contained} />
      <Celebration ref={cel} theme={theme} spark={p.spark} ambient={open} contained={contained} />
      {open && !contained && <ScrollProgress />}
      {locked ? (
        <LockScreen p={p} theme={theme} />
      ) : !open ? (
        <SurpriseIntro p={p} theme={theme} onOpen={onOpen} />
      ) : (
        <div className="bd-shell" onClick={tap}>
          <Hero p={p} theme={theme} />
          <MessageCard p={p} theme={theme} />
          <MemoryGallery p={p} />
          <Timeline p={p} />
          {p.cake !== false && <CakeMoment p={p} theme={theme} onWish={() => celebrate("fireworks")} />}
          <FinalWish p={p} theme={theme} onCelebrate={celebrate} onReplay={replay} />
        </div>
      )}
      {open && p.music && showMusic && withMusic && <MusicPill song={song} onClose={() => { song.stop(); setShowMusic(false); }} />}
    </div>
  );
}

/* ============================ ADMIN: LOGIN ============================ */
function AdminLogin({ onIn }) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const submit = () => {
    if (busy) return;
    if (!code.trim()) { setErr("Enter your passcode to continue."); return; }
    setBusy(true); setErr("");
    setTimeout(() => {
      if (code.trim() === "1234") onIn();
      else { setBusy(false); setErr("That passcode doesn't match. Try 1234 for the demo."); }
    }, 850);
  };
  return (
    <div className="wc login">
      <div className="login-card">
        <div className="ad-logo" style={{ color: "#fff" }}><i>🎁</i> Wishcraft</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 27, fontWeight: 600, letterSpacing: "-.03em", margin: "22px 0 6px", lineHeight: 1.15 }}>
          Sign in to your gift studio
        </h1>
        <p style={{ fontSize: 14, lineHeight: 1.55, color: "rgba(255,255,255,.55)", margin: "0 0 22px" }}>
          Only you can create and edit pages. Friends just need the link.
        </p>
        <div className="field">
          <label htmlFor="pc">Passcode</label>
          <input id="pc" className={"inp" + (err ? " bad" : "")} type="password" inputMode="numeric" placeholder="••••"
            value={code} onChange={(e) => { setCode(e.target.value); setErr(""); }}
            onKeyDown={(e) => e.key === "Enter" && submit()} autoComplete="one-time-code" />
          {err ? <span className="err" style={{ color: "#ff9aa8" }}>{err}</span> : <span className="hint" style={{ color: "rgba(255,255,255,.42)" }}>Demo passcode: 1234</span>}
        </div>
        <button className="btn btn-a btn-w" onClick={submit} disabled={busy} style={{ marginTop: 6 }}>
          {busy ? <><span className="spin" /> Signing in</> : "Sign in"}
        </button>
      </div>
    </div>
  );
}

/* ============================ ADMIN: DASHBOARD ============================ */
function StatusPill({ info }) {
  if (info.status === "today") return <span className="pill today">🎂 Today</span>;
  if (info.status === "up") return <span className="pill up">⏳ {info.days === 1 ? "Tomorrow" : "In " + info.days + " days"}</span>;
  return <span className="pill done">✓ Completed</span>;
}

function BirthdayCard({ p, onOpen }) {
  const info = birthdayInfo(p.date);
  return (
    <button className="bcard" onClick={() => onOpen(p)}>
      <img src={p.photo} alt="" />
      <span style={{ flex: 1, minWidth: 0 }}>
        <span className="bcard-nm" style={{ display: "block" }}>{p.name}</span>
        <span className="bcard-mt" style={{ display: "block" }}>{info.label} · /{p.slug}</span>
      </span>
      <StatusPill info={info} />
    </button>
  );
}

function Skeletons() {
  return (
    <>
      <div className="stats">{[0, 1, 2, 3].map((i) => <div key={i} className="skel" style={{ height: 92 }} />)}</div>
      <div className="blist">{[0, 1, 2, 3].map((i) => <div key={i} className="skel" style={{ height: 80, borderRadius: 20 }} />)}</div>
    </>
  );
}

function Dashboard({ list, loading, onOpen, onNew, storageFailed }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const stats = useMemo(() => {
    const infos = list.map((p) => birthdayInfo(p.date));
    return {
      total: list.length,
      today: infos.filter((i) => i.status === "today").length,
      week: infos.filter((i) => i.status === "up" && i.days <= 7).length,
      views: list.reduce((a, p) => a + (p.views || 0), 0),
    };
  }, [list]);

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return list
      .filter((p) => (!term || (p.name + " " + p.nickname + " " + p.slug).toLowerCase().includes(term)))
      .filter((p) => filter === "all" || birthdayInfo(p.date).status === filter)
      .sort((a, b) => {
        const ia = birthdayInfo(a.date), ib = birthdayInfo(b.date);
        const rank = (i) => (i.status === "today" ? -1 : i.status === "up" ? i.days : 9000 - i.days);
        return rank(ia) - rank(ib);
      });
  }, [list, q, filter]);

  const nextUp = list.map((p) => ({ p, i: birthdayInfo(p.date) })).filter((x) => x.i.status !== "done").sort((a, b) => a.i.days - b.i.days)[0];

  if (loading) return <div className="ad-wrap"><div className="skel" style={{ height: 34, width: 220, marginBottom: 22 }} /><Skeletons /></div>;

  return (
    <div className="ad-wrap">
      <h1 className="ad-h1">Your birthday pages</h1>
      <p className="ad-sub">
        {stats.today > 0
          ? `${nextUp.p.name.split(" ")[0]}'s birthday is today — the link is live and waiting.`
          : nextUp ? `Next up: ${nextUp.p.name.split(" ")[0]}, ${nextUp.i.when.toLowerCase()}.` : "Nothing on the calendar yet."}
      </p>
      {storageFailed && (
        <div style={{ marginTop: 14, padding: "12px 14px", borderRadius: 14, background: "#fff6e8", border: "1px solid #f2dfc0", fontSize: 13, fontWeight: 600, color: "#7a4d05" }}>
          Changes aren't saving right now. They'll stay on screen but may be lost when you close this tab.
        </div>
      )}

      {list.length === 0 ? (
        <div className="empty" style={{ marginTop: 24 }}>
          <div style={{ fontSize: 40 }}>🎁</div>
          <h3>No pages yet</h3>
          <p>Make the first one. It takes about two minutes, and your friend gets a link that feels like a real gift.</p>
          <button className="btn btn-a" onClick={onNew}><Icon d={I.plus} size={18} /> Create a birthday page</button>
        </div>
      ) : (
      <>
      <div className="stats">
        <div className="stat hi"><b>{stats.today}</b><span>Birthday today</span></div>
        <div className="stat"><b>{stats.week}</b><span>This week</span></div>
        <div className="stat"><b>{stats.total}</b><span>Friends saved</span></div>
        <div className="stat"><b>{stats.views}</b><span>Page opens</span></div>
      </div>

      <div className="search">
        <Icon d={I.search} size={17} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search a name or link" aria-label="Search birthdays" />
        {q && <button onClick={() => setQ("")} aria-label="Clear search"><Icon d={I.x} size={16} /></button>}
      </div>
      <div className="chips">
        {[["all", "All"], ["today", "🎂 Today"], ["up", "⏳ Upcoming"], ["done", "✓ Completed"]].map(([k, l]) => (
          <button key={k} className={"chip" + (filter === k ? " on" : "")} onClick={() => setFilter(k)}>{l}</button>
        ))}
      </div>

      <div className="ad-row"><span className="ad-h2">{shown.length} {shown.length === 1 ? "page" : "pages"}</span></div>

      {shown.length === 0 ? (
        <div className="empty">
          <div style={{ fontSize: 34 }}>🔍</div>
          <h3>Nothing matches</h3>
          <p>No page fits “{q || "this filter"}”. Try another name, or clear the filter.</p>
          <button className="btn btn-s" onClick={() => { setQ(""); setFilter("all"); }}>Show all pages</button>
        </div>
      ) : (
        <div className="blist">{shown.map((p) => <BirthdayCard key={p.id} p={p} onOpen={onOpen} />)}</div>
      )}
      </>
      )}
    </div>
  );
}

/* ============================ SHARE / MANAGE SHEET ============================ */
function ShareSheet({ p, onClose, onEdit, onDelete, onOpenPage, toast, fresh }) {
  const [confirm, setConfirm] = useState(false);
  const url = "wishcraft.gift/birthday/" + p.slug;
  const full = (typeof location !== "undefined" ? location.origin + location.pathname : "") + "#/birthday/" + p.slug;
  const info = birthdayInfo(p.date);
  const copy = async () => {
    try { await navigator.clipboard.writeText(full); toast("Link copied. Go make someone's day."); }
    catch (e) { toast("Couldn't copy — long-press the link to copy it.", "bad"); }
  };
  return (
    <div className="sheet" onClick={onClose} role="dialog" aria-modal="true">
      <div className="sheet-in" onClick={(e) => e.stopPropagation()}>
        <div className="grip" />
        {fresh && (
          <div style={{ textAlign: "center", marginBottom: 18 }}>
            <div style={{ fontSize: 34 }}>🎉</div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 23, fontWeight: 600, letterSpacing: "-.02em", margin: "8px 0 4px" }}>Birthday page created</h2>
            <p style={{ fontSize: 13.5, color: "var(--ink-2)", margin: 0 }}>Send this link to {p.name.split(" ")[0]} on the big day.</p>
          </div>
        )}
        {!fresh && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <img src={p.photo} alt="" style={{ width: 48, height: 48, borderRadius: 14, objectFit: "cover" }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 16 }}>{p.name}</div>
              <div style={{ fontSize: 12.5, color: "var(--ink-2)" }}>{info.label} · {info.when}</div>
            </div>
            <StatusPill info={info} />
          </div>
        )}

        <div className="link-box"><Icon d={I.link} size={16} /> <span style={{ flex: 1 }}>{url}</span></div>
        <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
          <button className="btn btn-p btn-w" onClick={copy}><Icon d={I.copy} size={17} /> Copy link</button>
          <div className="two">
            <button className="btn btn-s" onClick={() => onOpenPage(p)}><Icon d={I.eye} size={17} /> Open page</button>
            <button className="btn btn-s" onClick={() => onEdit(p)}><Icon d={I.edit} size={17} /> Edit</button>
          </div>
          <a className="btn btn-s btn-w" href={"https://wa.me/?text=" + encodeURIComponent("I made something for you 🎁 " + full)} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
            <Icon d={I.send} size={17} /> Send on WhatsApp
          </a>
        </div>

        {!confirm ? (
          <button className="btn btn-d btn-w" style={{ marginTop: 10 }} onClick={() => setConfirm(true)}><Icon d={I.trash} size={17} /> Delete page</button>
        ) : (
          <div style={{ marginTop: 14, padding: 14, borderRadius: 16, background: "#fff5f4", border: "1px solid #f2d6d6" }}>
            <b style={{ fontSize: 14 }}>Delete {p.name}'s page?</b>
            <p style={{ fontSize: 13, color: "var(--ink-2)", margin: "6px 0 12px", lineHeight: 1.5 }}>The link stops working immediately. This can't be undone.</p>
            <div className="two">
              <button className="btn btn-s" onClick={() => setConfirm(false)}>Keep it</button>
              <button className="btn btn-d" onClick={() => onDelete(p)}>Delete</button>
            </div>
          </div>
        )}
        <button className="btn btn-s btn-w" style={{ marginTop: 10 }} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

/* ============================ ADMIN: FORM ============================ */

/* ============================ QUICK CREATE ============================
   Three things only: who, when, and a photo. Everything else is written
   for them, and every word of it stays editable on the next screen. */
function QuickCreate({ list, onContinue, onManual, toast }) {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [rel, setRel] = useState("Friend");
  const [from, setFrom] = useState("Aarav");
  const [photo, setPhoto] = useState("");
  const [shots, setShots] = useState([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const fileOne = useRef(null), fileMany = useRef(null);

  const pick = async (e, many) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try {
      if (many) {
        const srcs = await Promise.all(files.slice(0, 8).map(readImage));
        setShots((s) => [...s, ...srcs]);
      } else setPhoto(await readImage(files[0]));
    } catch (x) { toast("That image wouldn't load. Try a JPG or PNG.", "bad"); }
    e.target.value = "";
  };

  const go = () => {
    if (!name.trim()) { setErr("Who is this for?"); return; }
    if (!date) { setErr("Pick their birthday."); return; }
    setErr(""); setBusy(true);
    const seed = name + date + Date.now();
    const written = autoCopy(name, rel, seed);
    setTimeout(() => {
      setBusy(false);
      onContinue({
        ...emptyDraft(), name: name.trim(), date, relationship: rel, from, seed,
        photo: photo || artwork(name, "rose", initials(name)),
        memories: shots.map((src, i) => ({ id: "m" + i, src, caption: autoCaption(i, seed) })),
        ...written,
      });
    }, 620);
  };

  const preview = photo || (name ? artwork(name, "rose", initials(name)) : "");
  return (
    <div className="ad-wrap">
      <div className="quick">
        <h1 className="ad-h1" style={{ textAlign: "center" }}>Who is it for?</h1>
        <p className="ad-sub" style={{ textAlign: "center", marginBottom: 26 }}>Three answers and I'll write the rest. You can change every word after.</p>

        <button className="q-photo" onClick={() => fileOne.current.click()} aria-label="Add a photo">
          {preview ? <img src={preview} alt="" /> : <span style={{ fontSize: 30 }}>📷</span>}
          <span className="edit"><Icon d={I.photo} size={16} /></span>
        </button>
        <input ref={fileOne} type="file" accept="image/*" hidden onChange={(e) => pick(e, false)} />
        <p className="q-note" style={{ margin: "12px 0 22px" }}>{photo ? "Looking good." : "Tap to add their photo — optional, artwork fills in otherwise."}</p>

        <div className="field">
          <input className="q-big" value={name} placeholder="Their name" onChange={(e) => { setName(e.target.value); setErr(""); }} />
        </div>
        <div className="field">
          <input className="q-big" type="date" value={date} onChange={(e) => { setDate(e.target.value); setErr(""); }} />
        </div>
        <div className="field">
          <div className="q-chips">
            {RELATIONSHIPS.map((r) => (
              <button key={r} className={rel === r ? "on" : ""} onClick={() => setRel(r)}>{r}</button>
            ))}
          </div>
        </div>
        <div className="field">
          <label htmlFor="qf" style={{ textAlign: "center" }}>Signed by</label>
          <input id="qf" className="inp" style={{ textAlign: "center" }} value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>

        <div className="field">
          <button className="btn btn-s btn-w" onClick={() => fileMany.current.click()}>
            <Icon d={I.photo} size={17} /> {shots.length ? `${shots.length} memory photo${shots.length > 1 ? "s" : ""} added` : "Add memory photos (optional)"}
          </button>
          <input ref={fileMany} type="file" accept="image/*" multiple hidden onChange={(e) => pick(e, true)} />
          {shots.length > 0 && (
            <div className="thumbs" style={{ marginTop: 10 }}>
              {shots.map((src, i) => (
                <div className="thumb" key={i} style={{ flex: "0 0 84px" }}>
                  <div className="im"><img src={src} alt="" />
                    <button className="rm" onClick={() => setShots(shots.filter((_, j) => j !== i))} aria-label="Remove">×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {err && <p className="err" style={{ textAlign: "center" }}>{err}</p>}
        <button className="btn btn-a btn-w" style={{ marginTop: 8 }} onClick={go} disabled={busy}>
          {busy ? <><span className="spin" /> Writing it</> : <><Icon d={I.spark} size={18} /> Write the page for me</>}
        </button>
        <button className="btn btn-s btn-w" style={{ marginTop: 10 }} onClick={onManual}>I'll write it myself</button>
      </div>
    </div>
  );
}

const emptyDraft = () => ({
  id: "", slug: "", name: "", nickname: "", date: todayISO(), relationship: "Friend",
  theme: "rose", backdrop: "aurora", spark: "confetti", subtitle: "", message: "", quote: "",
  finalNote: "", music: true, cake: true, scratch: true, lockUntilBirthday: false,
  from: "Aarav", photo: "", memories: [], timeline: [], views: 0, seed: "",
});

function PhotoUploader({ draft, set, toast }) {
  const fileMain = useRef(null), fileMore = useRef(null);
  const pick = async (e, multi) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try {
      if (multi) {
        const srcs = await Promise.all(files.slice(0, 8).map(readImage));
        set({ memories: [...draft.memories, ...srcs.map((src, i) => ({ id: "m" + Date.now() + i, src, caption: "" }))] });
      } else {
        set({ photo: await readImage(files[0]) });
      }
    } catch (err) { toast("That image wouldn't load. Try a JPG or PNG.", "bad"); }
    e.target.value = "";
  };
  const art = (multi) => {
    const seed = Math.random().toString(36).slice(2);
    if (multi) set({ memories: [...draft.memories, { id: "m" + Date.now(), src: artwork(seed, draft.theme), caption: "" }] });
    else set({ photo: artwork(seed, draft.theme, initials(draft.name || "?")) });
  };
  const preview = draft.photo || artwork(draft.name || "new", draft.theme, initials(draft.name || "?"));
  return (
    <>
      <div className="field">
        <label>Profile photo</label>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <img src={preview} alt="" style={{ width: 72, height: 72, borderRadius: 22, objectFit: "cover", border: "1px solid var(--line)" }} />
          <div style={{ display: "grid", gap: 8, flex: 1 }}>
            <button className="btn btn-s" style={{ padding: "11px 14px", fontSize: 13.5 }} onClick={() => fileMain.current.click()}><Icon d={I.photo} size={16} /> Upload photo</button>
            <button className="btn btn-s" style={{ padding: "11px 14px", fontSize: 13.5 }} onClick={() => art(false)}><Icon d={I.spark} size={16} /> Use generated artwork</button>
          </div>
        </div>
        <input ref={fileMain} type="file" accept="image/*" hidden onChange={(e) => pick(e, false)} />
      </div>

      <div className="field">
        <label>Memory photos</label>
        <span className="hint">Swipe-through cards on the birthday page. Add a caption to each one.</span>
        {draft.memories.length > 0 && (
          <div className="thumbs">
            {draft.memories.map((m, i) => (
              <div className="thumb" key={m.id || i}>
                <div className="im">
                  <img src={m.src} alt="" />
                  <button className="rm" onClick={() => set({ memories: draft.memories.filter((_, j) => j !== i) })} aria-label="Remove photo">×</button>
                </div>
                <input className="cap" placeholder="Caption…" value={m.caption}
                  onChange={(e) => set({ memories: draft.memories.map((x, j) => (j === i ? { ...x, caption: e.target.value } : x)) })} />
              </div>
            ))}
          </div>
        )}
        <div className="drop" style={{ marginTop: draft.memories.length ? 10 : 0 }}>
          <b>Add memories</b>
          <span>JPG or PNG, up to 8 at a time</span>
          <div className="two" style={{ marginTop: 12 }}>
            <button className="btn btn-s" style={{ padding: "11px 12px", fontSize: 13 }} onClick={() => fileMore.current.click()}>Upload</button>
            <button className="btn btn-s" style={{ padding: "11px 12px", fontSize: 13 }} onClick={() => art(true)}>Artwork</button>
          </div>
        </div>
        <input ref={fileMore} type="file" accept="image/*" multiple hidden onChange={(e) => pick(e, true)} />
      </div>
    </>
  );
}

function ThemeSelector({ value, onChange }) {
  return (
    <div className="swatches">
      {Object.entries(THEMES).map(([k, t]) => (
        <button key={k} className={"sw" + (value === k ? " on" : "")} onClick={() => onChange(k)} aria-pressed={value === k}>
          <i style={{ background: `linear-gradient(135deg, ${t.accent}, ${t.accent2})` }} />
          <span>{t.name}</span>
        </button>
      ))}
    </div>
  );
}

function BirthdayForm({ initial, list, onSave, onCancel, toast, onPreviewFull }) {
  const isEdit = Boolean(initial && initial.id);
  const [draft, setDraft] = useState(() => (initial ? { ...emptyDraft(), ...initial } : emptyDraft()));
  const [errs, setErrs] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));

  const slug = useMemo(() => uniqueSlug(slugify(draft.nickname || draft.name), list, draft.id), [draft.name, draft.nickname, list, draft.id]);

  const [live, setLive] = useState(draft);
  useEffect(() => { const t = setTimeout(() => setLive(draft), 320); return () => clearTimeout(t); }, [draft]);

  const previewProfile = useMemo(() => ({
    ...live, slug: slug || "preview",
    name: live.name || "Your friend",
    subtitle: live.subtitle || "Add a subtitle and it appears right here.",
    message: live.message || "Dear friend,\n\nStart typing the message and it appears here, exactly as they'll see it.",
    photo: live.photo || artwork(live.name || "new", live.theme, initials(live.name || "?")),
    memories: live.memories.length ? live.memories : [],
  }), [live, slug]);

  const save = () => {
    const e = {};
    if (!draft.name.trim()) e.name = "A name is needed — it's the whole page.";
    if (!draft.date) e.date = "Pick the birthday date.";
    if (draft.message.trim().length < 12) e.message = "Write at least a line or two.";
    if (!draft.subtitle.trim()) e.subtitle = "One short line under the name.";
    setErrs(e);
    if (Object.keys(e).length) { toast("A few fields still need you.", "bad"); return; }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      onSave({
        ...draft, slug,
        id: draft.id || "p" + Date.now(),
        createdAt: draft.createdAt || todayISO(),
        photo: draft.photo || artwork(draft.name, draft.theme, initials(draft.name)),
        memories: draft.memories.map((m, i) => ({ ...m, id: m.id || "m" + i })),
        timeline: draft.timeline.filter((t) => t.year || t.text),
      }, !isEdit);
    }, 700);
  };

  return (
    <div className="ad-wrap">
      <div className="form-bar">
        <button className="btn btn-s" style={{ padding: "10px 14px", fontSize: 13.5 }} onClick={onCancel}><Icon d={I.back} size={16} /> Back</button>
        <span style={{ flex: 1 }} />
        <button className="btn btn-a" style={{ padding: "11px 18px", fontSize: 14 }} onClick={save} disabled={saving}>
          {saving ? <><span className="spin" /> Saving</> : isEdit ? "Save changes" : "Create page"}
        </button>
      </div>
      <h1 className="ad-h1">{isEdit ? "Edit " + draft.name.split(" ")[0] + "'s page" : "Create a birthday page"}</h1>
      <p className="ad-sub">Everything here shows up in the preview as you type.</p>

      <div className="split" style={{ marginTop: 22 }}>
        <div className="form">
          <div className="fgroup">
            <h3>Basics</h3>
            <div className="field">
              <label htmlFor="nm">Name</label>
              <input id="nm" className={"inp" + (errs.name ? " bad" : "")} value={draft.name} onChange={(e) => set({ name: e.target.value })} placeholder="Rahul Sharma" />
              {errs.name && <span className="err">{errs.name}</span>}
            </div>
            <div className="two">
              <div className="field">
                <label htmlFor="nk">Nickname</label>
                <input id="nk" className="inp" value={draft.nickname} onChange={(e) => set({ nickname: e.target.value })} placeholder="Rahu" />
              </div>
              <div className="field">
                <label htmlFor="dt">Birthday</label>
                <input id="dt" type="date" className={"inp" + (errs.date ? " bad" : "")} value={draft.date} onChange={(e) => set({ date: e.target.value })} />
              </div>
            </div>
            {errs.date && <span className="err">{errs.date}</span>}
            <div className="field">
              <label htmlFor="rel">Relationship</label>
              <select id="rel" className="inp" value={draft.relationship} onChange={(e) => set({ relationship: e.target.value })}>
                {RELATIONSHIPS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="field">
              <label htmlFor="fr">Signed by</label>
              <input id="fr" className="inp" value={draft.from} onChange={(e) => set({ from: e.target.value })} placeholder="Your name" />
            </div>
            <div className="field">
              <label>Link</label>
              <div className="link-box" style={{ fontWeight: 700 }}><Icon d={I.link} size={15} /> wishcraft.gift/birthday/{slug || "…"}</div>
              <span className="hint">Made from the nickname or name. Duplicates get a number.</span>
            </div>
          </div>

          <div className="fgroup">
            <h3>What it says</h3>
            <div className="field">
              <label htmlFor="sb">Subtitle</label>
              <input id="sb" className={"inp" + (errs.subtitle ? " bad" : "")} value={draft.subtitle} onChange={(e) => set({ subtitle: e.target.value })} placeholder="You deserve all the happiness in the world." />
              {errs.subtitle && <span className="err">{errs.subtitle}</span>}
            </div>
            <div className="field">
              <label htmlFor="ms" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                Birthday message
                <button onClick={() => {
                  const seed = draft.name + Date.now();
                  set({ seed, ...autoCopy(draft.name || "friend", draft.relationship, seed) });
                  toast("Rewritten — edit anything you like");
                }} style={{ marginLeft: "auto", fontSize: 12.5, fontWeight: 800, color: "var(--brand)", display: "flex", alignItems: "center", gap: 5 }}>
                  <Icon d={I.spark} size={14} /> Rewrite it for me
                </button>
              </label>
              <textarea id="ms" className={"inp" + (errs.message ? " bad" : "")} value={draft.message} onChange={(e) => set({ message: e.target.value })}
                placeholder={"Dear Rahul,\n\nAnother year older, another year more amazing…"} />
              <span className="hint">Line breaks are kept. The first line becomes the greeting.</span>
              {errs.message && <span className="err">{errs.message}</span>}
            </div>
            <div className="field">
              <label htmlFor="qt">Special quote</label>
              <input id="qt" className="inp" value={draft.quote} onChange={(e) => set({ quote: e.target.value })} placeholder="Some friendships don't need explaining." />
            </div>
            <div className="field">
              <label htmlFor="fn">Closing line</label>
              <input id="fn" className="inp" value={draft.finalNote} onChange={(e) => set({ finalNote: e.target.value })} placeholder="Here's to another year of memories." />
            </div>
          </div>

          <div className="fgroup">
            <h3>Photos</h3>
            <PhotoUploader draft={draft} set={set} toast={toast} />
          </div>

          <div className="fgroup">
            <h3>Timeline</h3>
            <span className="hint" style={{ display: "block", marginBottom: 12 }}>Optional. A few years, a few lines each.</span>
            {draft.timeline.map((t, i) => (
              <div key={i} style={{ display: "flex", gap: 9, marginBottom: 10, alignItems: "center" }}>
                <input className="inp" style={{ width: 92, flex: "0 0 92px" }} value={t.year} placeholder="2024"
                  onChange={(e) => set({ timeline: draft.timeline.map((x, j) => (j === i ? { ...x, year: e.target.value } : x)) })} />
                <input className="inp" value={t.text} placeholder="What happened"
                  onChange={(e) => set({ timeline: draft.timeline.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)) })} />
                <button onClick={() => set({ timeline: draft.timeline.filter((_, j) => j !== i) })} aria-label="Remove row" style={{ color: "var(--ink-2)", padding: 6 }}><Icon d={I.trash} size={17} /></button>
              </div>
            ))}
            <button className="btn btn-s btn-w" style={{ padding: "12px", fontSize: 14 }} onClick={() => set({ timeline: [...draft.timeline, { year: "", text: "" }] })}>
              <Icon d={I.plus} size={16} /> Add a year
            </button>
          </div>

          <div className="fgroup">
            <h3>Look and feel</h3>
            <div className="field">
              <label>Theme</label>
              <ThemeSelector value={draft.theme} onChange={(t) => set({ theme: t })} />
              <span className="hint">{THEMES[draft.theme].note}</span>
            </div>
            <div className="field">
              <label>Background</label>
              <div className="seg">{Object.entries(BACKDROPS).map(([k, l]) => (
                <button key={k} className={draft.backdrop === k ? "on" : ""} onClick={() => set({ backdrop: k })}>{l}</button>))}</div>
            </div>
            <div className="field">
              <label>Celebration</label>
              <div className="seg">{Object.entries(SPARKS).map(([k, l]) => (
                <button key={k} className={draft.spark === k ? "on" : ""} onClick={() => set({ spark: k })}>{l}</button>))}</div>
            </div>
            <div className="field">
              <label>Extras</label>
              <div style={{ display: "grid", gap: 8 }}>
                {[["cake", "Candles they blow out", "A cake near the end. Tap the flames, or blow into the mic."],
                  ["scratch", "Scratch off the quote", "The quote hides under a panel they rub away."],
                  ["lockUntilBirthday", "Lock until the big day", "Early visitors see a countdown instead of the page."]].map(([k, label, hint]) => (
                  <button key={k} onClick={() => set({ [k]: !draft[k] })}
                    style={{ display: "flex", gap: 12, alignItems: "flex-start", textAlign: "left", padding: "13px 14px", borderRadius: 14, border: "1px solid " + (draft[k] ? "#17141f" : "var(--line)"), background: draft[k] ? "#17141f" : "#fff", color: draft[k] ? "#fff" : "var(--ink-1)" }}>
                    <span style={{ marginTop: 1 }}>{draft[k] ? "✓" : "○"}</span>
                    <span>
                      <b style={{ fontSize: 14 }}>{label}</b>
                      <span style={{ display: "block", fontSize: 12.5, opacity: .66, marginTop: 3, lineHeight: 1.45 }}>{hint}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div className="field">
              <label>Music</label>
              <div className="seg">
                <button className={draft.music ? "on" : ""} onClick={() => set({ music: true })}>Play a soft melody</button>
                <button className={!draft.music ? "on" : ""} onClick={() => set({ music: false })}>No music</button>
              </div>
              <span className="hint">Starts only after they tap open — never before.</span>
            </div>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            <button className="btn btn-a btn-w" onClick={save} disabled={saving}>
              {saving ? <><span className="spin" /> Saving</> : isEdit ? "Save changes" : "Create page"}
            </button>
            <button className="btn btn-s btn-w" onClick={() => onPreviewFull(previewProfile)}><Icon d={I.eye} size={17} /> Preview as your friend</button>
          </div>
        </div>

        <div className="phone-col">
          <div className="phone">
            <div className="phone-notch" />
            <div className="phone-scr">
              <BirthdayExperience p={previewProfile} contained startOpen withMusic={false} />
            </div>
            <p style={{ textAlign: "center", color: "rgba(255,255,255,.5)", fontSize: 11.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", margin: "12px 0 2px" }}>Live preview</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================ NOT FOUND ============================ */
function NotFound({ onHome }) {
  return (
    <div className="wc err-page">
      <div style={{ maxWidth: 360 }}>
        <div style={{ fontSize: 44 }}>🎈</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 600, letterSpacing: "-.03em", margin: "16px 0 10px" }}>This link doesn't lead anywhere</h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,.6)", margin: "0 0 26px" }}>
          The page may have been deleted, or the link picked up a typo on the way here. Ask whoever sent it to share it again.
        </p>
        <button className="btn btn-a" onClick={onHome}>Go to the studio</button>
      </div>
    </div>
  );
}

/* ============================ APP ============================ */
export default function App() {
  const { list, setList, loading, failed } = useProfiles();
  const [authed, setAuthed] = useState(false);
  const firstRoute = useRef((typeof window !== "undefined" ? window.location.hash : "").replace(/^#\/?/, "").split("/").filter(Boolean));
  const [view, setView] = useState(() => (firstRoute.current[0] === "birthday" && firstRoute.current[1] ? "birthday" : "dash"));  // dash | quick | form | account | birthday
  const [slug, setSlug] = useState(() => (firstRoute.current[0] === "birthday" ? firstRoute.current[1] || "" : ""));
  const [editing, setEditing] = useState(null);
  const [sheet, setSheet] = useState(null);
  const [fresh, setFresh] = useState(false);
  const [fullPreview, setFullPreview] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const counted = useRef({});

  const toast = useCallback((msg, tone) => {
    setToastMsg({ msg, tone });
    clearTimeout(toast._t);
    toast._t = setTimeout(() => setToastMsg(null), 2600);
  }, []);

  const goHash = (h) => { try { window.location.hash = h; } catch (e) {} };

  useEffect(() => {
    const read = () => {
      const parts = (window.location.hash || "").replace(/^#\/?/, "").split("/").filter(Boolean);
      if (parts[0] === "birthday" && parts[1]) { setSlug(parts[1]); setView("birthday"); }
      else if (parts[0] === "new") { setEditing(null); setView("quick"); }
      else if (parts.length === 0) setView("dash");
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  const openPage = (p) => { setSheet(null); setSlug(p.slug); setView("birthday"); goHash("/birthday/" + p.slug); window.scrollTo(0, 0); };
  const backToStudio = () => { setView("dash"); setSheet(null); goHash("/"); window.scrollTo(0, 0); };

  const save = (profile, isNew) => {
    setList((l) => (isNew ? [profile, ...l] : l.map((x) => (x.id === profile.id ? profile : x))));
    setEditing(null);
    setView("dash");
    setSheet(profile);
    setFresh(isNew);
    toast(isNew ? "Page created 🎉" : "Changes saved");
  };
  const remove = (p) => {
    setList((l) => l.filter((x) => x.id !== p.id));
    setSheet(null);
    toast(p.name.split(" ")[0] + "'s page deleted");
  };

  /* public birthday link — no sign-in needed */
  if (view === "birthday") {
    const p = list.find((x) => x.slug === slug);
    if (loading) {
      return (
        <div className="wc" style={{ minHeight: "100dvh", display: "grid", placeItems: "center", background: "#06040d", color: "#fff" }}>
          <style dangerouslySetInnerHTML={{ __html: CSS }} />
          <div style={{ textAlign: "center" }}>
            <div className="seal-medal" style={{ width: 96, height: 96, "--glow": "rgba(255,92,157,.5)" }}><span className="mono" style={{ fontSize: 34 }}>🎁</span></div>
            <p style={{ fontSize: 12.5, letterSpacing: ".3em", textTransform: "uppercase", opacity: .5, marginTop: 22 }}>Unwrapping</p>
          </div>
        </div>
      );
    }
    if (!p) return (<><style dangerouslySetInnerHTML={{ __html: CSS }} /><NotFound onHome={backToStudio} /></>);
    if (!counted.current[p.id]) {
      counted.current[p.id] = true;
      setTimeout(() => setList((l) => l.map((x) => (x.id === p.id ? { ...x, views: (x.views || 0) + 1 } : x))), 60);
    }
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <BirthdayExperience p={p} key={p.id} />
        {authed && (
          <button className="btn btn-s" onClick={backToStudio}
            style={{ position: "fixed", top: 14, left: 14, zIndex: 50, padding: "10px 14px", fontSize: 13, background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.2)", color: "#fff", backdropFilter: "blur(12px)" }}>
            <Icon d={I.back} size={15} /> Studio
          </button>
        )}
      </>
    );
  }

  if (!authed) return (<><style dangerouslySetInnerHTML={{ __html: CSS }} /><AdminLogin onIn={() => setAuthed(true)} /></>);

  return (
    <div className="wc ad">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <header className="ad-top">
        <div className="ad-top-in">
          <div className="ad-logo" style={{ flex: 1 }}><i>🎁</i> Wishcraft</div>
          <div className="top-nav">
            <button className={view === "dash" ? "on" : ""} onClick={() => setView("dash")}>Pages</button>
            <button className={view === "quick" || view === "form" ? "on" : ""} onClick={() => { setEditing(null); setView("quick"); }}>Create</button>
            <button className={view === "account" ? "on" : ""} onClick={() => setView("account")}>Account</button>
          </div>
          <span style={{ fontSize: 12.5, color: "var(--ink-2)", fontWeight: 700, marginLeft: 8 }}>{new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
        </div>
      </header>

      {view === "dash" && (
        <Dashboard list={list} loading={loading} storageFailed={failed}
          onOpen={(p) => { setFresh(false); setSheet(p); }}
          onNew={() => { setEditing(null); setView("quick"); }} />
      )}
      {view === "quick" && (
        <QuickCreate list={list} toast={toast}
          onContinue={(draft) => { setEditing(draft); setView("form"); window.scrollTo(0, 0); }}
          onManual={() => { setEditing(null); setView("form"); window.scrollTo(0, 0); }} />
      )}
      {view === "form" && (
        <BirthdayForm initial={editing} list={list} toast={toast}
          onSave={save} onCancel={() => { setEditing(null); setView(editing && editing.id ? "dash" : "quick"); }}
          onPreviewFull={(p) => setFullPreview(p)} />
      )}
      {view === "account" && (
        <div className="ad-wrap">
          <h1 className="ad-h1">Account</h1>
          <p className="ad-sub">One studio, one passcode, unlimited gifts.</p>
          <div className="fgroup" style={{ marginTop: 20 }}>
            <h3>Storage</h3>
            <p style={{ fontSize: 14, lineHeight: 1.55, color: "var(--ink-2)", margin: 0 }}>
              {failed ? "Not saving right now — changes stay on screen only." : "Pages and photos are saved automatically."}
            </p>
          </div>
          <div className="fgroup" style={{ marginTop: 14 }}>
            <h3>Sample content</h3>
            <p style={{ fontSize: 14, lineHeight: 1.55, color: "var(--ink-2)", margin: "0 0 14px" }}>Reset everything back to the five example friends.</p>
            <button className="btn btn-s btn-w" onClick={() => { setList(SAMPLE); toast("Sample pages restored"); }}>Restore sample pages</button>
          </div>
          <button className="btn btn-d btn-w" style={{ marginTop: 14 }} onClick={() => { setAuthed(false); setView("dash"); }}>Sign out</button>
        </div>
      )}

      {view === "dash" && !loading && list.length > 0 && (
        <button className="btn btn-a fab" onClick={() => { setEditing(null); setView("quick"); }}><Icon d={I.plus} size={19} /> New page</button>
      )}

      <nav className="nav">
        <button className={view === "dash" ? "on" : ""} onClick={() => setView("dash")}><Icon d={I.home} /> Pages</button>
        <button className={view === "quick" || view === "form" ? "on" : ""} onClick={() => { setEditing(null); setView("quick"); }}><Icon d={I.plus} /> Create</button>
        <button className={view === "account" ? "on" : ""} onClick={() => setView("account")}><Icon d={I.gift} /> Account</button>
      </nav>

      {sheet && (
        <ShareSheet p={sheet} fresh={fresh} toast={toast}
          onClose={() => setSheet(null)}
          onEdit={(p) => { setSheet(null); setEditing(p); setView("form"); window.scrollTo(0, 0); }}
          onDelete={remove} onOpenPage={openPage} />
      )}

      {fullPreview && (
        <div style={{ position: "fixed", inset: 0, zIndex: 80, background: "#06040d" }}>
          <div style={{ position: "absolute", inset: 0, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
            <BirthdayExperience p={fullPreview} key={fullPreview.theme + fullPreview.backdrop + fullPreview.spark} />
          </div>
          <button className="btn" onClick={() => setFullPreview(null)}
            style={{ position: "fixed", top: 14, right: 14, zIndex: 90, padding: "10px 16px", fontSize: 13, background: "rgba(255,255,255,.16)", border: "1px solid rgba(255,255,255,.24)", color: "#fff", backdropFilter: "blur(12px)" }}>
            Close preview
          </button>
        </div>
      )}

      <Toast msg={toastMsg && toastMsg.msg} tone={toastMsg && toastMsg.tone} />
    </div>
  );
}
