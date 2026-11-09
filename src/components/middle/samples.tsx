import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { configFromDraft, draftFromPreset, middleTemplates, type MiddleDraft, type ProgramRow, type SampleBlock } from "@/data/middle-presets";
import { paymentsEnabled } from "@/lib/site";
import { saveVariant } from "@/lib/variants";
import { preparePhoto } from "@/lib/prepare-photo";

const samplePhotoChoices = [
  { id: "peonies", name: "Пионы", src: "/photo-samples/hero/01-bouquet-peonies.jpg" },
  { id: "shoes", name: "Туфли", src: "/photo-samples/hero/02-shoes-veil.jpg" },
  { id: "champagne", name: "Бокалы", src: "/photo-samples/hero/03-champagne.jpg" },
  { id: "dress", name: "Платье", src: "/photo-samples/hero/04-dress-window.jpg" },
  { id: "field", name: "Поле", src: "/photo-samples/hero/05-field-sunset.jpg" },
  { id: "cake", name: "Торт", src: "/photo-samples/hero/06-cake.jpg" },
  { id: "arch", name: "Арка", src: "/photo-samples/hero/07-arch-lake.jpg" },
  { id: "seal", name: "Конверт", src: "/photo-samples/hero/08-invitation-seal.jpg" },
  { id: "flower", name: "Бутоньерка", src: "/photo-samples/hero/09-boutonniere.jpg" },
  { id: "veil", name: "Фата", src: "/photo-samples/hero/10-veil-wind.jpg" },
  { id: "candles", name: "Свечи", src: "/photo-samples/hero/11-candle-table.jpg" },
  { id: "hands", name: "Руки", src: "/photo-samples/hero/12-hands-bouquet.jpg" },
  { id: "petals", name: "Лепестки", src: "/photo-samples/hero/13-aisle-petals.jpg" },
  { id: "sparks", name: "Огни", src: "/photo-samples/hero/14-sparklers.jpg" },
  { id: "car", name: "Машина", src: "/photo-samples/hero/15-vintage-car.jpg" },
];

const placePhotoChoices = [
  { id: "aisle" as const, src: "/photo-samples/place-aisle.jpg" },
  { id: "arch" as const, src: "/photo-samples/place-arch.jpg" },
  { id: "sea" as const, src: "/photo-samples/place-sea.jpg" },
];

function TemplateIcon({ id, name, active, onClick, compact }: { id: string; name: string; active: boolean; onClick: () => void; compact?: boolean }) {
  return (
    <div className={(active ? "border-2 border-burgundy" : "border border-line") + (compact ? " w-[104px] shrink-0" : " w-full") + " overflow-hidden rounded-xl bg-cream"}>
      <button type="button" className="block w-full" onClick={onClick} aria-label={name}>
        <img src={`/template-thumbs/${id}.jpg`} alt="" className="aspect-[3/4] w-full object-cover object-top" />
      </button>
      <span className="block truncate px-1 pt-1 text-center text-[11px] leading-tight">{name}</span>
      <button type="button" className="mx-1 mb-1 mt-1 min-h-7 w-[calc(100%-0.5rem)] rounded-full bg-burgundy text-[11px] text-cream" onClick={onClick}>
        Открыть
      </button>
    </div>
  );
}

function withExample(draft: MiddleDraft): MiddleDraft {
  const pick = samplePhotoChoices[Math.floor(Math.random() * samplePhotoChoices.length)];
  const place = placePhotoChoices[Math.floor(Math.random() * placePhotoChoices.length)];
  const count = 4 + Math.floor(Math.random() * 3);
  const hues: number[] = [];
  while (hues.length < count) {
    const hue = Math.floor(Math.random() * 12) * 30;
    if (!hues.includes(hue)) hues.push(hue);
  }
  return {
    ...draft,
    photo: new URL(pick.src, window.location.origin).href,
    photoPick: pick.id,
    placePhoto: new URL(place.src, window.location.origin).href,
    placePhotoPick: place.id,
    dressColors: Array.from({ length: 6 }, (_, index) => (index < hues.length ? { hex: hslToHex(hues[index], 42 + Math.floor(Math.random() * 28), 38 + Math.floor(Math.random() * 22)) } : { hex: "" })),
  };
}

const DRAFT_KEY = "aiv-middle-draft-v1";
const htmlCache = new Map<string, string>();

function loadSaved(): { templateId: string; draft: MiddleDraft } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { templateId?: string; draft?: MiddleDraft };
    if (!data.draft?.partner1 || !data.draft.shown || !data.templateId) return null;
    const preset = middleTemplates.find((item) => item.id === data.templateId);
    if (!preset) return null;
    const base = draftFromPreset(preset);
    return {
      templateId: preset.id,
      draft: {
        ...base,
        ...data.draft,
        shown: { ...base.shown, ...data.draft.shown },
        messengers: { ...base.messengers, ...data.draft.messengers },
      },
    };
  } catch {
    return null;
  }
}

function injectConfig(html: string, config: unknown) {
  const marker = "const CONFIG = ";
  const start = html.indexOf("{", html.indexOf(marker));
  let depth = 0;
  let end = start;
  for (let i = start; i < html.length; i += 1) {
    if (html[i] === "{") depth += 1;
    else if (html[i] === "}") {
      depth -= 1;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  const json = JSON.stringify(config).replace(/</g, "\\u003c");
  return `${html.slice(0, html.indexOf(marker))}const CONFIG = ${json};${html.slice(end + 2)}`;
}

function injectPhoto(html: string, draft: MiddleDraft) {
  const options = JSON.stringify({
    x: draft.photoX,
    y: draft.photoY,
    scale: draft.photoScale / 100,
    edge: 0,
    tone: draft.photoTone,
  });
  const placeOptions = JSON.stringify({ x: draft.placeX, y: draft.placeY, scale: draft.placeScale / 100 });
  const script = `<script>
(function () {
  var opt = ${options};
  var selector = ".frame img, .arch img, .cover-photo img, .frame-wrap img, .photo img";
  function place(node) {
    var extra = 48;
    var size = opt.scale * 100 + extra;
    var left = -extra / 2 + ((opt.x - 50) / 50) * (extra / 2);
    var top = -extra / 2 + ((opt.y - 50) / 50) * (extra / 2);
    node.style.setProperty("position", "absolute", "important");
    node.style.setProperty("width", size + "%", "important");
    node.style.setProperty("height", size + "%", "important");
    node.style.setProperty("left", left + "%", "important");
    node.style.setProperty("top", top + "%", "important");
    node.style.setProperty("right", "auto", "important");
    node.style.setProperty("bottom", "auto", "important");
    node.style.setProperty("max-width", "none", "important");
    node.style.setProperty("object-fit", "cover", "important");
    node.style.setProperty("object-position", "center", "important");
    node.style.setProperty("transform", "none", "important");
  }
  function paint(img) {
    place(img);
    img.style.cursor = "grab";
    img.style.touchAction = "none";
    var wrap = img.closest(".aiv-shot");
    if (!wrap) return;
    var crop = wrap.querySelector("[data-aiv-crop]");
    var rim = wrap.querySelector("[data-aiv-rim]");
    var veil = wrap.querySelector("[data-aiv-tone]");
    var fade = Math.max(0, Math.min(100, opt.edge));
    var feather = fade ? "radial-gradient(ellipse at center, #000 " + (100 - fade) + "%, transparent 100%)" : "";
    if (crop) {
      crop.style.setProperty("-webkit-mask-image", feather || "none", "important");
      crop.style.maskImage = feather;
    }
    img.style.setProperty("filter", "none", "important");
    if (rim) rim.style.opacity = "0";
    if (veil) {
      function readColor(names) {
        var style = getComputedStyle(document.documentElement);
        for (var i = 0; i < names.length; i++) {
          var value = style.getPropertyValue(names[i]).trim();
          if (value) return value;
        }
        return "";
      }
      var paper = readColor(["--bg", "--paper", "--cream", "--linen", "--white"]) || getComputedStyle(document.body).backgroundColor || "#f3efe7";
      var accent = readColor(["--acct", "--accent", "--btn", "--gold", "--ink"]) || paper;
      veil.style.zIndex = "3";
      veil.style.background = paper;
      veil.style.backgroundImage = "linear-gradient(160deg, " + paper + ", " + accent + ")";
      veil.style.opacity = String(opt.tone / 100);
    }
  }
  function bind() {
    document.querySelectorAll(selector).forEach(function (img) {
      if (img.dataset.aivBlur) return;
      var parent = img.parentElement;
      if (!parent.classList.contains("aiv-shot") && !img.closest(".aiv-shot")) {
        var wrap = document.createElement("div");
        wrap.className = "aiv-shot";
        wrap.style.cssText = "position:absolute;inset:0;overflow:hidden;z-index:1;isolation:isolate;";
        if (getComputedStyle(parent).position === "static") parent.style.position = "relative";
        var crop = document.createElement("div");
        crop.dataset.aivCrop = "1";
        crop.style.cssText = "position:absolute;inset:0;overflow:hidden;";
        var rim = document.createElement("div");
        rim.dataset.aivRim = "1";
        rim.style.cssText = "position:absolute;inset:0;overflow:hidden;pointer-events:none;opacity:0;";
        parent.insertBefore(wrap, img);
        wrap.appendChild(crop);
        crop.appendChild(img);
        var soft = img.cloneNode(true);
        soft.dataset.aivBlur = "1";
        soft.style.pointerEvents = "none";
        rim.appendChild(soft);
        wrap.appendChild(rim);
        var veil = document.createElement("div");
        veil.dataset.aivTone = "1";
        veil.style.cssText = "position:absolute;inset:0;z-index:3;pointer-events:none;mix-blend-mode:color;";
        wrap.appendChild(veil);
      }
      paint(img);
      if (img.dataset.aivDrag) return;
      img.dataset.aivDrag = "1";
      var startX = 0, startY = 0, originX = 0, originY = 0, dragging = false;
      img.addEventListener("pointerdown", function (event) {
        dragging = true;
        startX = event.clientX;
        startY = event.clientY;
        originX = opt.x;
        originY = opt.y;
        img.setPointerCapture(event.pointerId);
        img.style.cursor = "grabbing";
      });
      img.addEventListener("pointermove", function (event) {
        if (!dragging) return;
        var rect = img.getBoundingClientRect();
        opt.x = Math.min(100, Math.max(0, originX + (event.clientX - startX) / Math.max(rect.width, 1) * 80));
        opt.y = Math.min(100, Math.max(0, originY + (event.clientY - startY) / Math.max(rect.height, 1) * 80));
        paint(img);
      });
      function finish() {
        if (!dragging) return;
        dragging = false;
        img.style.cursor = "grab";
        window.parent.postMessage({ type: "aiv-photo", x: opt.x, y: opt.y }, "*");
      }
      img.addEventListener("pointerup", finish);
      img.addEventListener("pointercancel", finish);
    });
  }
  new MutationObserver(bind).observe(document.documentElement, { childList: true, subtree: true });
  bind();
  var popt = ${placeOptions};
  function paintPlace(img) {
    var parent = img.parentElement;
    if (parent && !parent.dataset.aivPlaceFrame) {
      var frame = document.createElement("div");
      frame.dataset.aivPlaceFrame = "1";
      var fill = img.style.position === "absolute" || img.style.height === "100%";
      frame.style.cssText = fill
        ? "position:absolute;inset:0;overflow:hidden;"
        : "position:relative;width:100%;aspect-ratio:16/10;overflow:hidden;border-radius:18px;margin:0 auto 28px;";
      parent.insertBefore(frame, img);
      frame.appendChild(img);
      img.style.position = "absolute";
      img.style.inset = "0";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.maxWidth = "none";
    }
    img.style.objectFit = "cover";
    img.style.objectPosition = (100 - popt.x) + "% " + (100 - popt.y) + "%";
    img.style.transform = "scale(" + popt.scale + ")";
    img.style.transformOrigin = "center";
    img.style.cursor = "grab";
    img.style.touchAction = "none";
  }
  function bindPlace() {
    document.querySelectorAll("img.aiv-place").forEach(function (img) {
      paintPlace(img);
      if (img.dataset.aivPlaceDrag) return;
      img.dataset.aivPlaceDrag = "1";
      var startX = 0, startY = 0, originX = 0, originY = 0, dragging = false;
      img.addEventListener("pointerdown", function (event) {
        dragging = true;
        startX = event.clientX;
        startY = event.clientY;
        originX = popt.x;
        originY = popt.y;
        img.setPointerCapture(event.pointerId);
      });
      img.addEventListener("pointermove", function (event) {
        if (!dragging) return;
        var rect = img.getBoundingClientRect();
        popt.x = Math.min(100, Math.max(0, originX + (event.clientX - startX) / Math.max(rect.width, 1) * 80));
        popt.y = Math.min(100, Math.max(0, originY + (event.clientY - startY) / Math.max(rect.height, 1) * 80));
        paintPlace(img);
      });
      function finish() {
        if (!dragging) return;
        dragging = false;
        window.parent.postMessage({ type: "aiv-place", x: popt.x, y: popt.y }, "*");
      }
      img.addEventListener("pointerup", finish);
      img.addEventListener("pointercancel", finish);
    });
  }
  new MutationObserver(bindPlace).observe(document.documentElement, { childList: true, subtree: true });
  bindPlace();
  window.addEventListener("message", function (event) {
    var data = event.data || {};
    if (data.type === "aiv-photo-opt") {
      opt.x = data.x; opt.y = data.y; opt.scale = data.scale; opt.tone = data.tone;
      document.querySelectorAll(selector).forEach(paint);
    }
    if (data.type === "aiv-place-opt") {
      popt.x = data.x; popt.y = data.y; popt.scale = data.scale;
      document.querySelectorAll("img.aiv-place").forEach(paintPlace);
    }
  });
})();
</script>`;
  return html.includes("</body>") ? html.replace("</body>", `${script}</body>`) : `${html}${script}`;
}

function injectFollow(html: string) {
  const script = `<script>
(function () {
  var map = {
    names: ".names, .big-names, h1",
    photo: ".cover-photo, .frame, .arch, .frame-wrap",
    date: ".s-date, .date, .coverlines",
    place: "#place, .s-place, .venue",
    words: "#words, .s-words, .words",
    program: ".s-prog, .prog, .tl",
    timer: "#count, .count, .cd",
    map: "#place, .s-place, a[href*='map']",
    dress: ".s-dress, .dress, .sw",
    gifts: ".s-gift, .gifts",
    flowers: ".s-gift, .gifts",
    kids: "[data-aiv-block='kids']",
    shoot: "[data-aiv-block='shoot']",
    contacts: ".s-contacts, .people",
    rsvp: "#rsvp-section, .s-rsvp, #rsvp",
    term: "footer"
  };
  var known = { names:1, photo:1, date:1, words:1, program:1, place:1, dress:1, gifts:1, flowers:1, kids:1, shoot:1, rsvp:1, contacts:1 };
  var style = document.createElement("style");
  style.textContent = ".aiv-phone [data-aiv-block]{cursor:pointer}[data-aiv-block].aiv-on{outline:2px solid rgba(109,29,36,.55);outline-offset:4px;border-radius:12px}";
  document.head.appendChild(style);
  function target(block) {
    var list = (map[block] || "body").split(", ");
    for (var i = 0; i < list.length; i++) {
      var el = document.querySelector(list[i]);
      if (el) return el;
    }
    return null;
  }
  function titleBlock(title) {
    var t = (title || "").toLowerCase();
    if (t.indexOf("слов") >= 0 || t.indexOf("дорог") >= 0 || t.indexOf("дараг") >= 0 || t.indexOf("о нас") >= 0 || t.indexOf("истори") >= 0 || t.indexOf("обращ") >= 0) return "words";
    if (t.indexOf("програм") >= 0 || t.indexOf("праграм") >= 0) return "program";
    if (t.indexOf("мест") >= 0 || t.indexOf("добрат") >= 0 || t.indexOf("святку") >= 0) return "place";
    if (t.indexOf("дресс") >= 0 || t.indexOf("дрэс") >= 0) return "dress";
    if (t.indexOf("подар") >= 0 || t.indexOf("падар") >= 0 || t.indexOf("пожелан") >= 0 || t.indexOf("пажад") >= 0) return "gifts";
    if (t.indexOf("ответ") >= 0 || t.indexOf("анкет") >= 0 || t.indexOf("буд") >= 0) return "rsvp";
    if (t.indexOf("связ") >= 0 || t.indexOf("кантакт") >= 0) return "contacts";
    if (t.indexOf("остал") >= 0 || t.indexOf("застал") >= 0 || t.indexOf("встреч") >= 0 || t.indexOf("дата") >= 0) return "date";
    return "";
  }
  function slideBlock(cls) {
    if (cls.indexOf("s-words") >= 0) return "words";
    if (cls.indexOf("s-date") >= 0) return "date";
    if (cls.indexOf("s-prog") >= 0) return "program";
    if (cls.indexOf("s-place") >= 0) return "place";
    if (cls.indexOf("s-dress") >= 0) return "dress";
    if (cls.indexOf("s-gift") >= 0) return "gifts";
    if (cls.indexOf("s-rsvp") >= 0) return "rsvp";
    if (cls.indexOf("s-contacts") >= 0) return "contacts";
    return "";
  }
  function lift(el) {
    if (!el.closest || !el.closest("#phone")) return;
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    el.style.zIndex = "8";
  }
  function applyHot() {
    document.querySelectorAll(".aiv-on").forEach(function (el) { el.classList.remove("aiv-on"); });
    if (!window.__aivHot || !known[window.__aivHot]) return;
    document.querySelectorAll('[data-aiv-block="' + window.__aivHot + '"]').forEach(function (el) { el.classList.add("aiv-on"); });
  }
  function tag() {
    document.querySelectorAll("[data-aiv-block]").forEach(function (el) { el.removeAttribute("data-aiv-block"); });
    document.querySelectorAll("section.s").forEach(function (sec) {
      var h2 = sec.querySelector("h2");
      var block = titleBlock(h2 ? h2.textContent : "");
      if (block) sec.setAttribute("data-aiv-block", block);
    });
    document.querySelectorAll(".gift, .gifts .card, .gcard").forEach(function (card) {
      var label = card.textContent || "";
      if (/цвет|квет/i.test(label)) card.setAttribute("data-aiv-block", "flowers");
      else if (/подар/i.test(label)) card.setAttribute("data-aiv-block", "gifts");
    });
    document.querySelectorAll(".notes .card, .details .card, .gifts .card").forEach(function (card) {
      var title = card.querySelector("h3");
      var name = title ? title.textContent || "" : "";
      if (/дет/i.test(name)) card.setAttribute("data-aiv-block", "kids");
      if (/фотосъ/i.test(name)) card.setAttribute("data-aiv-block", "shoot");
    });
    document.querySelectorAll(".frame, .arch, .frame-wrap, .cover-photo").forEach(function (el) {
      el.setAttribute("data-aiv-block", "photo");
    });
    document.querySelectorAll(".cover-photo .cap").forEach(function (el) {
      el.setAttribute("data-aiv-block", "photo");
      lift(el);
    });
    document.querySelectorAll("h1").forEach(function (el) {
      el.setAttribute("data-aiv-block", "names");
      lift(el);
    });
    document.querySelectorAll(".date").forEach(function (el) {
      el.setAttribute("data-aiv-block", "date");
      lift(el);
    });
    document.querySelectorAll(".coverlines .cl").forEach(function (el) {
      var b = el.querySelector("b");
      el.setAttribute("data-aiv-block", b && /где/i.test(b.textContent || "") ? "place" : "date");
    });
    document.querySelectorAll(".cover-meta span").forEach(function (el) {
      el.setAttribute("data-aiv-block", /\\d/.test(el.textContent || "") ? "date" : "place");
      lift(el);
    });
    document.querySelectorAll("header .place, .hero .place").forEach(function (el) {
      el.setAttribute("data-aiv-block", "place");
    });
    document.querySelectorAll("#count, .count, .cd").forEach(function (el) {
      el.setAttribute("data-aiv-block", "date");
      lift(el);
    });
    document.querySelectorAll("#phone .tag, #phone h2, #phone .mega, #phone .month, #phone .cover-meta, #phone .venue, #phone .gcard").forEach(function (el) {
      if (!el.getAttribute("data-aiv-block")) {
        var slide = el.closest(".slide");
        var block = slide ? slideBlock(slide.className) : "";
        if (block) el.setAttribute("data-aiv-block", block);
      }
      lift(el);
    });
    applyHot();
  }
  new MutationObserver(tag).observe(document.documentElement, { childList: true, subtree: true });
  tag();
  var downX = 0, downY = 0;
  document.addEventListener("pointerdown", function (event) {
    downX = event.clientX;
    downY = event.clientY;
  }, true);
  document.addEventListener("click", function (event) {
    if (Math.abs(event.clientX - downX) > 8 || Math.abs(event.clientY - downY) > 8) return;
    var node = event.target;
    if (!node || !node.closest) return;
    if (node.closest("a, button, input, textarea, select, label, form, .zone, .menu, .ctrl, .top")) return;
    var marked = node.closest("[data-aiv-block]");
    if (!marked) return;
    var block = marked.getAttribute("data-aiv-block");
    if (!known[block]) return;
    window.parent.postMessage({ type: "aiv-pick", block: block }, "*");
  }, true);
  window.addEventListener("message", function (event) {
    var data = event.data || {};
    if (data.type === "aiv-live" && window.W && window.aivPaint && data.config) {
      var live = window.W.C;
      Object.keys(live).forEach(function (key) { delete live[key]; });
      Object.assign(live, data.config);
      window.aivPaint();
      return;
    }
    if (data.type === "aiv-phone") {
      document.documentElement.classList.toggle("aiv-phone", !!data.on);
      return;
    }
    if (data.type === "aiv-hot") {
      window.__aivHot = data.block || "";
      applyHot();
      return;
    }
    if (data.type !== "aiv-scroll") return;
    if (data.mode === "restore") {
      if (typeof data.slide === "number" && data.slide >= 0 && window.STORIES && window.STORIES.go) {
        window.STORIES.go(data.slide, true);
        return;
      }
      window.scrollTo(0, data.y || 0);
      return;
    }
    var el = target(data.block);
    if (!el) return;
    var slide = el.closest(".slide");
    if (slide && window.STORIES && window.STORIES.go) {
      window.STORIES.go(Number(slide.dataset.i), true);
    } else {
      el.scrollIntoView({ block: "start", behavior: "auto" });
    }
    window.parent.postMessage({ type: "aiv-scroll-pos", y: window.scrollY, slide: window.STORIES ? window.STORIES.current : -1, atEnd: nearEnd() }, "*");
  });
  function nearEnd() {
    if (window.STORIES && typeof window.STORIES.count === "number") return window.STORIES.current >= window.STORIES.count - 1;
    var el = document.scrollingElement || document.documentElement;
    return el.scrollTop + window.innerHeight >= el.scrollHeight - 64;
  }
  window.addEventListener("scroll", function () {
    window.parent.postMessage({ type: "aiv-scroll-pos", y: window.scrollY, slide: window.STORIES ? window.STORIES.current : -1, atEnd: nearEnd() }, "*");
  }, { passive: true });
  window.addEventListener("pointerdown", function () {
    window.setTimeout(function () {
      window.parent.postMessage({ type: "aiv-scroll-user", y: window.scrollY, slide: window.STORIES ? window.STORIES.current : -1, atEnd: nearEnd() }, "*");
    }, 350);
  });
  window.setTimeout(function () {
    window.parent.postMessage({ type: "aiv-scroll-pos", y: window.scrollY, slide: window.STORIES ? window.STORIES.current : -1, atEnd: nearEnd() }, "*");
  }, 500);
})();
</script>`;
  return html.includes("</body>") ? html.replace("</body>", `${script}</body>`) : `${html}${script}`;
}

export function MiddleSamples({ onLeave }: { onLeave?: () => void }) {
  const [templateId, setTemplateId] = useState(middleTemplates[0].id);
  const [colorSlot, setColorSlot] = useState(-1);
  const [hue, setHue] = useState(140);
  const [sat, setSat] = useState(42);
  const [val, setVal] = useState(62);
  const [sheet, setSheet] = useState<string | null>(null);
  const [phone, setPhone] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  const [savedNote, setSavedNote] = useState("");
  const preset = middleTemplates.find((item) => item.id === templateId) ?? middleTemplates[0];
  const [draft, setDraft] = useState<MiddleDraft>(() => draftFromPreset(middleTemplates[0]));
  const [srcdoc, setSrcdoc] = useState("");
  const loadedRef = useRef("");
  const frameRef = useRef<HTMLIFrameElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const placeFileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef(0);
  const slideRef = useRef(-1);
  const restoreLock = useRef(false);
  const anchorRef = useRef("");
  const phoneRef = useRef(false);
  const sheetRef = useRef<string | null>(null);
  sheetRef.current = sheet;

  function chooseTemplate(id: string) {
    const next = middleTemplates.find((item) => item.id === id) ?? middleTemplates[0];
    if (next.id === templateId) return;
    scrollRef.current = 0;
    slideRef.current = -1;
    anchorRef.current = "";
    setSheet(null);
    setAtEnd(false);
    setTemplateId(next.id);
    setDraft((current) => {
      const demo = draftFromPreset(preset);
      const untouched = current.partner1 === demo.partner1 && current.partner2 === demo.partner2 && current.date === demo.date;
      return untouched ? withExample(draftFromPreset(next)) : current;
    });
  }

  useEffect(() => {
    const saved = loadSaved();
    const pick = sessionStorage.getItem("aiv-pick-template");
    if (pick) sessionStorage.removeItem("aiv-pick-template");
    const pickOk = pick && middleTemplates.some((item) => item.id === pick) ? pick : "";
    let nextId = middleTemplates[0].id;
    let nextDraft = draftFromPreset(middleTemplates[0]);
    if (saved) {
      nextId = pickOk || saved.templateId;
      nextDraft = saved.draft;
    } else {
      const picked = middleTemplates.find((item) => item.id === pickOk) ?? middleTemplates[0];
      nextId = picked.id;
      nextDraft = withExample(draftFromPreset(picked));
    }
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ templateId: nextId, draft: nextDraft }));
    setTemplateId(nextId);
    setDraft(nextDraft);
    const narrow = window.matchMedia("(max-width: 1023px)").matches;
    phoneRef.current = narrow;
    setPhone(narrow);
    if (narrow && pickOk) setInviteOpen(true);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ templateId, draft }));
  }, [hydrated, templateId, draft]);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 1023px)");
    const apply = () => {
      phoneRef.current = query.matches;
      setPhone(query.matches);
      if (!query.matches) setSheet(null);
      frameRef.current?.contentWindow?.postMessage({ type: "aiv-phone", on: query.matches }, "*");
    };
    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!phone || !hydrated) return;
    window.scrollTo(0, 0);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [phone, hydrated]);

  useEffect(() => {
    if (!phone) return;
    frameRef.current?.contentWindow?.postMessage({ type: "aiv-hot", block: sheet || "" }, "*");
  }, [phone, sheet, srcdoc]);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      if (!hydrated) return;
      if (!htmlCache.has(preset.file)) {
        const response = await fetch(preset.file);
        htmlCache.set(preset.file, await response.text());
      }
      if (cancelled) return;
      const html = injectFollow(injectPhoto(injectConfig(htmlCache.get(preset.file) ?? "", configFromDraft(preset, draft)), draft));
      const frame = frameRef.current?.contentWindow;
      if (loadedRef.current !== preset.id || !frame) {
        loadedRef.current = preset.id;
        setSrcdoc(html);
        return;
      }
      frame.postMessage({ type: "aiv-live", config: configFromDraft(preset, draft) }, "*");
      frame.postMessage({ type: "aiv-photo-opt", x: draft.photoX, y: draft.photoY, scale: draft.photoScale / 100, tone: draft.photoTone }, "*");
      frame.postMessage({ type: "aiv-place-opt", x: draft.placeX, y: draft.placeY, scale: draft.placeScale / 100 }, "*");
    }, 140);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [preset, draft, hydrated]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const data = event.data as { type?: string; x?: number; y?: number; slide?: number; block?: string; atEnd?: boolean };
      if (data?.type === "aiv-pick" && typeof data.block === "string") {
        if (!phoneRef.current) return;
        const block = data.block;
        if (sheetRef.current !== block) {
          anchorRef.current = block;
          frameRef.current?.contentWindow?.postMessage({ type: "aiv-scroll", block }, "*");
        }
        setSheet((current) => (current === block ? null : block));
        return;
      }
      if (data?.type === "aiv-scroll-pos" && typeof data.y === "number") {
        if (typeof data.atEnd === "boolean") setAtEnd(data.atEnd);
        if (restoreLock.current) return;
        scrollRef.current = data.y;
        if (typeof data.slide === "number") slideRef.current = data.slide;
        return;
      }
      if (data?.type === "aiv-scroll-user") {
        if (typeof data.atEnd === "boolean") setAtEnd(data.atEnd);
        if (restoreLock.current) return;
        if (typeof data.y === "number") scrollRef.current = data.y;
        if (typeof data.slide === "number") slideRef.current = data.slide;
        return;
      }
      if (data?.type === "aiv-place" && typeof data.x === "number" && typeof data.y === "number") {
        setDraft((current) => ({ ...current, placeX: data.x ?? current.placeX, placeY: data.y ?? current.placeY }));
        return;
      }
      if (data?.type !== "aiv-photo" || typeof data.x !== "number" || typeof data.y !== "number") return;
      setDraft((current) => ({ ...current, photoX: data.x ?? current.photoX, photoY: data.y ?? current.photoY }));
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  function pushLive() {
    const frame = frameRef.current?.contentWindow;
    if (!frame || loadedRef.current !== preset.id) return;
    frame.postMessage({ type: "aiv-live", config: configFromDraft(preset, draft) }, "*");
    frame.postMessage({ type: "aiv-photo-opt", x: draft.photoX, y: draft.photoY, scale: draft.photoScale / 100, tone: draft.photoTone }, "*");
    frame.postMessage({ type: "aiv-place-opt", x: draft.placeX, y: draft.placeY, scale: draft.placeScale / 100 }, "*");
    frame.postMessage({ type: "aiv-phone", on: phoneRef.current }, "*");
    frame.postMessage({ type: "aiv-hot", block: phoneRef.current ? sheetRef.current || "" : "" }, "*");
  }

  function restoreScroll() {
    pushLive();
    const frame = frameRef.current?.contentWindow;
    if (!frame) return;
    restoreLock.current = true;
    frame.postMessage({ type: "aiv-scroll", mode: "restore", y: scrollRef.current, slide: slideRef.current }, "*");
    window.setTimeout(() => {
      restoreLock.current = false;
    }, 400);
  }

  function focusBlock(block: string) {
    if (anchorRef.current === block) return;
    anchorRef.current = block;
    frameRef.current?.contentWindow?.postMessage({ type: "aiv-scroll", block }, "*");
  }
  const samplePhotos = samplePhotoChoices;
  const only = (block: string) => sheet !== null && sheet !== block;

  function useSample(id: string, src: string) {
    patch({ photo: new URL(src, window.location.origin).href, photoPick: id });
  }

  function paintColor(hex: string) {
    if (colorSlot < 0) return;
    patch({
      dressColors: draft.dressColors.map((item, index) => (index === colorSlot ? { hex } : item)),
    });
  }

  function toggle(key: SampleBlock) {
    setDraft((current) => ({ ...current, shown: { ...current.shown, [key]: !current.shown[key] } }));
  }

  function patch(partial: Partial<MiddleDraft>) {
    setDraft((current) => ({ ...current, ...partial }));
  }

  function patchProgram(index: number, partial: Partial<ProgramRow>) {
    setDraft((current) => ({
      ...current,
      program: current.program.map((row, rowIndex) => (rowIndex === index ? { ...row, ...partial } : row)),
    }));
  }

  if (!hydrated) {
    return <p className="px-5 py-16 text-center text-sm text-muted">Открываем черновик…</p>;
  }

  if (phone && !inviteOpen) {
    return (
      <div className="fixed inset-x-0 top-16 bottom-0 z-30 overflow-y-auto bg-paper px-3 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <h1 className="font-serif text-4xl">Каталог</h1>
        <p className="mt-2 text-sm text-muted">Нажмите образец — он откроется на весь экран. Введённое сохранится в этом телефоне.</p>
        {!paymentsEnabled ? (
          <Link to="/zakaz" search={{ tier: "middle", template: preset.name }} className="mt-4 inline-flex min-h-12 items-center bg-burgundy px-4 text-sm text-cream">
            Оплатить, 45 BYN
          </Link>
        ) : null}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {middleTemplates.map((item) => (
            <TemplateIcon
              key={item.id}
              id={item.id}
              name={item.name}
              active={item.id === preset.id}
              onClick={() => {
                chooseTemplate(item.id);
                setSheet(null);
                setInviteOpen(true);
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={phone ? "fixed inset-0 z-[90] flex flex-col bg-white" : "mt-6 grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr] lg:items-start"}>
      <div className={phone ? "flex min-h-0 w-full flex-1 flex-col" : "mx-auto w-full max-w-[420px] lg:sticky lg:top-6"}>
        <div className={phone ? "flex min-h-0 flex-1 flex-col" : "relative overflow-hidden rounded-[28px] border border-line bg-cream shadow-sm"}>
          {srcdoc ? (
            <div className={phone ? "relative min-h-0 flex-1" : "relative"}>
              {phone ? (
                <>
                  <button type="button" className="absolute top-[max(0.5rem,env(safe-area-inset-top))] left-3 z-20 min-h-10 rounded-full bg-burgundy px-4 text-sm text-cream" onClick={() => { setInviteOpen(false); setSheet(null); }}>
                    Каталог
                  </button>
                  {!paymentsEnabled ? (
                    <Link to="/zakaz" search={{ tier: "middle", template: preset.name }} className="absolute top-[max(0.5rem,env(safe-area-inset-top))] right-3 z-20 inline-flex min-h-10 items-center rounded-full bg-burgundy px-4 text-sm text-cream">
                      Оплатить
                    </Link>
                  ) : null}
                </>
              ) : null}
              <iframe ref={frameRef} title="Образец приглашения" className={phone ? "h-full w-full bg-white" : "mx-auto block w-full bg-white lg:h-[78vh] lg:min-h-[640px]"} sandbox="allow-scripts allow-popups allow-downloads allow-forms" srcDoc={srcdoc} onLoad={restoreScroll} />
              {atEnd ? (
                <button
                  type="button"
                  className="absolute bottom-4 left-1/2 z-30 min-h-11 -translate-x-1/2 rounded-full bg-burgundy px-5 text-sm text-cream shadow-md"
                  onClick={() => {
                    saveVariant({ templateId: preset.id, templateName: preset.name, partner1: draft.partner1, partner2: draft.partner2, draft });
                    setSavedNote("Вариант в кабинете. Для оплаты можно выбрать один из трёх.");
                    setSheet(null);
                  }}
                >
                  Сохранить вариант
                </button>
              ) : null}
              {savedNote ? <p className="absolute right-3 bottom-16 z-30 max-w-[16rem] rounded-2xl bg-cream px-3 py-2 text-xs text-ink shadow-md">{savedNote}</p> : null}
            </div>
          ) : (
            <div className="grid h-full place-items-center text-sm text-muted lg:h-[78vh] lg:min-h-[640px]">Открываем образец…</div>
          )}
        </div>
        <p className="mt-3 text-center text-xs text-muted max-lg:hidden">Так страницу видит гость.</p>
      </div>
      <form
        className={phone ? (sheet ? "flex max-h-[48vh] shrink-0 flex-col gap-4 overflow-y-auto border-t border-line bg-cream px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]" : "flex max-h-[42vh] shrink-0 flex-col gap-3 overflow-y-auto border-t border-line bg-cream px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]") : "flex flex-col gap-6 pb-16"}
        onSubmit={(event) => event.preventDefault()}
      >
        {sheet ? (
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-cream py-1 lg:hidden">
            <button type="button" className="min-h-10 rounded-full bg-burgundy px-4 text-sm text-cream" onClick={() => setSheet(null)}>Скрыть</button>
            <Link to="/zakaz" search={{ tier: "middle", template: preset.name }} className="text-sm text-burgundy">Заявка, 45 BYN</Link>
          </div>
        ) : null}
        <section className="flex flex-col gap-3">
          <h2 className="font-serif text-3xl">Имена, дата и город</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Имя" value={draft.partner1} onChange={(partner1) => patch({ partner1 })} />
            <Field label="Имя" value={draft.partner2} onChange={(partner2) => patch({ partner2 })} />
          </div>
          <label className="block text-sm">
            Дата
            <input className="studio-input mt-1" type="date" value={draft.date} onChange={(event) => patch({ date: event.target.value })} />
          </label>
          <Field label="Город" value={draft.city} onChange={(city) => patch({ city })} />
        </section>
        <div className={phone && !sheet ? "hidden" : "contents"}>
        <div className="grid max-h-[58vh] grid-cols-4 gap-2 overflow-y-auto pr-1 max-lg:hidden">
          {middleTemplates.map((item) => (
            <TemplateIcon key={item.id} id={item.id} name={item.name} active={item.id === preset.id} onClick={() => chooseTemplate(item.id)} />
          ))}
        </div>
        <Fill title="Имена" block="names" hidden={only("names")} onActivate={focusBlock} on={draft.shown.names} onToggle={() => toggle("names")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Имя" value={draft.partner1} onChange={(partner1) => patch({ partner1 })} />
            <Field label="Имя" value={draft.partner2} onChange={(partner2) => patch({ partner2 })} />
          </div>
        </Fill>
        <Fill title="Фото пары" block="photo" hidden={only("photo")} onActivate={focusBlock} on={draft.shown.photo} onToggle={() => toggle("photo")}>
          <p className="text-xs text-muted">Нажмите образец — он встанет на верхнее фото приглашения.</p>
          <div className="grid grid-cols-4 gap-2">
            {samplePhotos.map((item) => (
              <button key={item.id} type="button" className={draft.photoPick === item.id ? "overflow-hidden rounded-2xl border-2 border-burgundy text-left" : "overflow-hidden rounded-2xl border border-line text-left"} onClick={() => useSample(item.id, item.src)}>
                <img src={item.src} alt={item.name} className="h-20 w-full object-cover" />
                <span className="block px-1 py-1 text-center text-xs">{item.name}</span>
              </button>
            ))}
            <button type="button" className={draft.photoPick === "own" ? "flex h-full min-h-20 flex-col items-center justify-center rounded-2xl border-2 border-burgundy px-1 text-center text-xs" : "flex h-full min-h-20 flex-col items-center justify-center rounded-2xl border border-line px-1 text-center text-xs"} onClick={() => fileRef.current?.click()}>
              Своё фото
            </button>
          </div>
          <input ref={fileRef} className="hidden" type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; void preparePhoto(file).then((photo) => patch({ photo: photo.src, photoPick: "own" })); }} />
          {draft.photo ? (
            <button
              type="button"
              className="min-h-10 self-start rounded-full border border-line px-4 text-sm"
              onClick={() => {
                const image = new Image();
                image.onload = () => {
                  const canvas = document.createElement("canvas");
                  canvas.width = 40;
                  canvas.height = 40;
                  const context = canvas.getContext("2d", { willReadFrequently: true });
                  if (!context) return;
                  context.drawImage(image, 0, 0, 40, 40);
                  const data = context.getImageData(0, 0, 40, 40).data;
                  const buckets = new Map<string, number>();
                  for (let index = 0; index < data.length; index += 16) {
                    const hex = `#${[data[index], data[index + 1], data[index + 2]].map((value) => (value & 0xf0).toString(16).padStart(2, "0")).join("")}`;
                    buckets.set(hex, (buckets.get(hex) ?? 0) + 1);
                  }
                  const colors = [...buckets.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([hex]) => ({ hex }));
                  while (colors.length < 6) colors.push({ hex: "" });
                  patch({ dressColors: colors });
                };
                image.src = draft.photo;
              }}
            >
              Взять цвета с фото в дресс-код
            </button>
          ) : null}
          {draft.photo ? (
            <details className="text-sm">
              <summary className="cursor-pointer">Настроить кадр</summary>
              <div className="mt-3 flex flex-col gap-3">
                <Range label="Размер" value={draft.photoScale} min={80} max={160} suffix="%" onChange={(photoScale) => patch({ photoScale })} />
                <Range label="Ближе к цвету приглашения" value={draft.photoTone} min={0} max={100} suffix="%" onChange={(photoTone) => patch({ photoTone })} />
                <Range label="Сдвиг по горизонтали" from="влево" to="вправо" value={Math.round(draft.photoX)} min={0} max={100} onChange={(photoX) => patch({ photoX })} />
                <Range label="Сдвиг по вертикали" from="вверх" to="вниз" value={Math.round(draft.photoY)} min={0} max={100} onChange={(photoY) => patch({ photoY })} />
                <p className="text-xs text-muted">Наведите на фото в приглашении и потяните, чтобы сместить центр кадра.</p>
              </div>
            </details>
          ) : null}
        </Fill>
        <Fill title="Дата и время" block="date" hidden={only("date")} onActivate={focusBlock} on={draft.shown.date} onToggle={() => toggle("date")}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">Дата<input className="studio-input mt-1" type="date" value={draft.date} onChange={(event) => patch({ date: event.target.value })} /></label>
            <label className="block text-sm">Время<input className="studio-input mt-1" type="time" value={draft.time} onChange={(event) => patch({ time: event.target.value })} /></label>
          </div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm">Таймер до этой даты</p>
            <button type="button" aria-pressed={draft.shown.timer} className={draft.shown.timer ? "min-h-10 shrink-0 rounded-full bg-burgundy px-4 text-sm text-cream" : "min-h-10 shrink-0 rounded-full border border-line px-4 text-sm text-muted"} onClick={() => toggle("timer")}>{draft.shown.timer ? "вкл" : "выкл"}</button>
          </div>
        </Fill>
        <Fill title="Слова гостям" block="words" hidden={only("words")} onActivate={focusBlock} on={draft.shown.words} onToggle={() => toggle("words")}>
          <div className="flex flex-wrap gap-2">
            {[
              ["Официально", "Имеем честь пригласить Вас разделить с нами день нашего бракосочетания."],
              ["Тепло", "Дорогие родные и друзья! Будем рады видеть Вас рядом в самый важный день."],
              ["Современно", "Мы женимся. Приходите — без Вас праздник будет не тот."],
              ["Легко", "Собираемся праздновать. Будет вкусно, шумно и очень по-нашему."],
            ].map(([label, text]) => (
              <button key={label} type="button" className="min-h-10 rounded-full border border-line px-3 text-sm" onClick={() => patch({ intro: text })}>{label}</button>
            ))}
          </div>
          <Area label="Текст" value={draft.intro} onChange={(intro) => patch({ intro })} />
        </Fill>
        <Fill title="Программа дня" block="program" hidden={only("program")} onActivate={focusBlock} on={draft.shown.program} onToggle={() => toggle("program")}>
          <div className="space-y-3">
            {draft.program.map((row, index) => (
              <div key={index} className="grid grid-cols-[5.5rem_1fr] gap-2">
                <input className="studio-input" value={row.time} aria-label={`Время ${index + 1}`} onChange={(event) => patchProgram(index, { time: event.target.value })} />
                <input className="studio-input" value={row.title} aria-label={`Пункт ${index + 1}`} onChange={(event) => patchProgram(index, { title: event.target.value })} />
                <input className="studio-input col-span-2" value={row.text} aria-label={`Описание ${index + 1}`} onChange={(event) => patchProgram(index, { text: event.target.value })} />
                <button type="button" className="col-span-2 text-left text-sm text-muted underline" onClick={() => setDraft((current) => ({ ...current, program: current.program.filter((_, rowIndex) => rowIndex !== index) }))}>Убрать пункт</button>
              </div>
            ))}
          </div>
          <button type="button" className="min-h-10 rounded-full border border-line px-4 text-sm" onClick={() => setDraft((current) => ({ ...current, program: [...current.program, { time: "", title: "", text: "" }] }))}>Добавить пункт</button>
        </Fill>
        <Fill title="Место" block="place" hidden={only("place")} onActivate={focusBlock} on={draft.shown.place} onToggle={() => toggle("place")}>
          <Field label="Город" value={draft.city} onChange={(city) => patch({ city })} />
          <Field label="Место" value={draft.venue} onChange={(venue) => patch({ venue })} />
          <Field label="Адрес" value={draft.address} onChange={(address) => patch({ address })} />
          <Area label="Как добраться" value={draft.howToGet} onChange={(howToGet) => patch({ howToGet })} />
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm">Кнопка «Открыть на карте»</p>
            <button type="button" aria-pressed={draft.shown.map} className={draft.shown.map ? "min-h-10 shrink-0 rounded-full bg-burgundy px-4 text-sm text-cream" : "min-h-10 shrink-0 rounded-full border border-line px-4 text-sm text-muted"} onClick={() => toggle("map")}>{draft.shown.map ? "вкл" : "выкл"}</button>
          </div>
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-serif text-2xl">Фото места</h3>
            <button type="button" aria-pressed={draft.shown.placePhoto} className={draft.shown.placePhoto ? "min-h-10 shrink-0 rounded-full bg-burgundy px-4 text-sm text-cream" : "min-h-10 shrink-0 rounded-full border border-line px-4 text-sm text-muted"} onClick={() => toggle("placePhoto")}>{draft.shown.placePhoto ? "вкл" : "выкл"}</button>
          </div>
          {draft.shown.placePhoto ? (
            <>
              <div className="grid grid-cols-4 gap-2">
                {placePhotoChoices.map((item) => (
                  <button key={item.id} type="button" aria-label="Фото места" className={draft.placePhotoPick === item.id ? "h-16 overflow-hidden rounded-2xl border-2 border-burgundy" : "h-16 overflow-hidden rounded-2xl border border-line"} onClick={() => patch({ placePhoto: new URL(item.src, window.location.origin).href, placePhotoPick: item.id })}>
                    <img src={item.src} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
                <button type="button" aria-label="Своё фото" className={draft.placePhotoPick === "own" ? "flex h-16 items-center justify-center overflow-hidden rounded-2xl border-2 border-burgundy px-1 text-center text-xs" : "flex h-16 items-center justify-center overflow-hidden rounded-2xl border border-line px-1 text-center text-xs"} onClick={() => placeFileRef.current?.click()}>
                  Своё фото
                </button>
              </div>
              <p className="text-xs text-muted">Образец встаёт вместо рисунка. Выключенная кнопка убирает и рисунок, и фото. Адрес остаётся.</p>
              <input ref={placeFileRef} className="hidden" type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; void preparePhoto(file).then((photo) => patch({ placePhoto: photo.src, placePhotoPick: "own" })); }} />
              <details className="text-sm">
                <summary className="cursor-pointer">Настроить кадр</summary>
                <div className="mt-3 flex flex-col gap-3">
                  <Range label="Размер" value={draft.placeScale} min={80} max={160} suffix="%" onChange={(placeScale) => patch({ placeScale })} />
                  <Range label="Сдвиг по горизонтали" from="влево" to="вправо" value={Math.round(draft.placeX)} min={0} max={100} onChange={(placeX) => patch({ placeX })} />
                  <Range label="Сдвиг по вертикали" from="вверх" to="вниз" value={Math.round(draft.placeY)} min={0} max={100} onChange={(placeY) => patch({ placeY })} />
                </div>
              </details>
            </>
          ) : null}
        </Fill>
        <Fill title="Дресс-код" block="dress" hidden={only("dress")} onActivate={focusBlock} on={draft.shown.dress} onToggle={() => toggle("dress")}>
          <Field label="Как назвать" value={draft.dressTitle} onChange={(dressTitle) => patch({ dressTitle })} />
          <Area label="Что надеть" value={draft.dressText} onChange={(dressText) => patch({ dressText })} />
          <div className="mt-2 flex items-center justify-between gap-3">
            <h3 className="font-serif text-2xl">Цвета</h3>
            <button type="button" aria-pressed={draft.shown.palette} className={draft.shown.palette ? "min-h-10 shrink-0 rounded-full bg-burgundy px-4 text-sm text-cream" : "min-h-10 shrink-0 rounded-full border border-line px-4 text-sm text-muted"} onClick={() => toggle("palette")}>{draft.shown.palette ? "вкл" : "выкл"}</button>
          </div>
          {draft.shown.palette ? (
            <>
              <div className="grid grid-cols-6 gap-2">
                {draft.dressColors.map((item, index) => (
                  <button key={index} type="button" aria-label={`Цвет ${index + 1}`} className={colorSlot === index ? "h-14 rounded-2xl border-2 border-burgundy" : "h-14 rounded-2xl border border-dashed border-line"} style={{ background: item.hex || "transparent" }} onClick={() => {
                    if (colorSlot === index) {
                      setColorSlot(-1);
                      patch({ dressColors: draft.dressColors.map((color, colorIndex) => (colorIndex === index ? { hex: "" } : color)) });
                      return;
                    }
                    setColorSlot(index);
                    if (item.hex) {
                      const hsv = hexToHsv(item.hex);
                      setHue(hsv.h);
                      setSat(hsv.s);
                      setVal(hsv.v);
                    }
                  }} />
                ))}
              </div>
              {colorSlot >= 0 ? (
                <>
                  <Spectrum label="Оттенок" background="linear-gradient(90deg,#ff0000 0%,#ffff00 17%,#00ff00 33%,#00ffff 50%,#0000ff 67%,#ff00ff 83%,#ff0000 100%)" marker={hue / 360} onPick={(ratio) => { const next = ratio * 360; setHue(next); paintColor(hsvToHex(next, sat, val)); }} />
                  <ColorSquare hue={hue} sat={sat} val={val} onPick={(nextSat, nextVal) => { setSat(nextSat); setVal(nextVal); paintColor(hsvToHex(hue, nextSat, nextVal)); }} />
                </>
              ) : <p className="text-xs text-muted">Нажмите иконку, потом выберите оттенок. Повторное нажатие очищает её.</p>}
            </>
          ) : null}
        </Fill>
        <Fill title="Пожелания по подаркам" block="gifts" hidden={only("gifts")} onActivate={focusBlock} on={draft.shown.gifts} onToggle={() => toggle("gifts")}>
          <div className="flex flex-wrap gap-2">
            {[
              ["Путешествие", "Самый ценный подарок — ваше присутствие. Если хотите порадовать нас ещё, будем благодарны за вклад в свадебное путешествие."],
              ["Конверт", "Нам ничего не нужно, кроме вас рядом. Если захотите сделать подарок, удобнее всего конверт."],
              ["Без подарков", "Пожалуйста, не тратьтесь на подарки. Ваш приход и есть праздник."],
            ].map(([label, text]) => (
              <button key={label} type="button" className="min-h-10 rounded-full border border-line px-3 text-sm" onClick={() => patch({ gifts: text })}>{label}</button>
            ))}
          </div>
          <Area label="Подарки" value={draft.gifts} onChange={(gifts) => patch({ gifts })} />
        </Fill>
        <Fill title="Цветы" block="flowers" hidden={only("flowers")} onActivate={focusBlock} on={draft.shown.flowers} onToggle={() => toggle("flowers")}>
          <div className="flex flex-wrap gap-2">
            {[
              ["Без цветов", "Пожалуйста, не дарите цветы: на следующий день мы уезжаем. Лучше бутылка вина, которую откроем на годовщину."],
              ["Живые", "Будем рады живым цветам. Пожалуйста, без пышных корзин — так их проще забрать домой."],
              ["Вместо букета", "Вместо букета можно сделать небольшой вклад в дело, которое нам дорого."],
            ].map(([label, text]) => (
              <button key={label} type="button" className="min-h-10 rounded-full border border-line px-3 text-sm" onClick={() => patch({ flowers: text })}>{label}</button>
            ))}
          </div>
          <Area label="Текст про цветы" value={draft.flowers} onChange={(flowers) => patch({ flowers })} />
        </Fill>
        {((preset.config.details as { title?: string }[] | undefined) ?? []).some((item) => item.title === "Дети") ? (
          <Fill title="Дети" block="kids" hidden={only("kids")} onActivate={focusBlock} on={draft.shown.kids} onToggle={() => toggle("kids")}>
            <div className="flex flex-wrap gap-2">
              {[
                ["Только взрослые", "Мы очень любим детей, но этот вечер планируем провести во взрослой компании. Благодарим за понимание."],
                ["С детьми", "Дети желанны. Для малышей будет отдельный стол, а вечером — няня."],
                ["Старшие", "Будем рады детям от семи лет. Совсем маленьких, пожалуйста, оставьте с няней."],
              ].map(([label, text]) => (
                <button key={label} type="button" className="min-h-10 rounded-full border border-line px-3 text-sm" onClick={() => patch({ kids: text })}>{label}</button>
              ))}
            </div>
            <Area label="Текст" value={draft.kids} onChange={(kids) => patch({ kids })} />
          </Fill>
        ) : null}
        {((preset.config.details as { title?: string }[] | undefined) ?? []).some((item) => item.title === "Фотосъёмка") ? (
          <Fill title="Фотосъёмка" block="shoot" hidden={only("shoot")} onActivate={focusBlock} on={draft.shown.shoot} onToggle={() => toggle("shoot")}>
            <Area label="Текст" value={draft.shoot} onChange={(shoot) => patch({ shoot })} />
          </Fill>
        ) : null}
        <Fill title="Анкета гостя" block="rsvp" hidden={only("rsvp")} onActivate={focusBlock} on={draft.shown.rsvp} onToggle={() => toggle("rsvp")}>
          <p className="text-xs text-muted">Гость заполняет анкету в приглашении и не видит этот адрес. Адрес сохранится. Письма и сообщения пойдут после оплаты.</p>
          <label className="block text-sm">Ответить до<input className="studio-input mt-1" type="date" value={draft.rsvpDeadline} onChange={(event) => patch({ rsvpDeadline: event.target.value })} /></label>
          <div>
            <p className="text-sm">Куда прислать ответы. Один вариант.</p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {replyChoices.map((item) => (
                <button key={item.id} type="button" aria-pressed={draft.replyVia === item.id} className={draft.replyVia === item.id ? "flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-burgundy bg-burgundy px-1 text-xs text-cream" : "flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl border border-line px-1 text-xs"} onClick={() => patch({ replyVia: item.id, replyTo: draft.replyVia === item.id ? draft.replyTo : "" })}>
                  {item.icon}
                  {item.name}
                </button>
              ))}
            </div>
          </div>
          <Field label={replyChoices.find((item) => item.id === draft.replyVia)?.label ?? "Адрес"} value={draft.replyTo} onChange={(replyTo) => patch({ replyTo })} />
        </Fill>
        <Fill title="Ссылки в мессенджеры" block="contacts" hidden={only("contacts")} onActivate={focusBlock} on={draft.shown.contacts} onToggle={() => toggle("contacts")}>
          <p className="text-xs text-muted">Отметьте только те, где вас действительно можно найти по этому номеру.</p>
          <Field label="Телефон" value={draft.phone} onChange={(phone) => patch({ phone })} />
          <Field label="Telegram, если логин свой" value={draft.telegram} onChange={(telegram) => patch({ telegram })} />
          <div className="flex flex-wrap gap-2">
            {([["telegram", "Telegram"], ["viber", "Viber"], ["whatsapp", "WhatsApp"]] as const).map(([key, label]) => (
              <button key={key} type="button" aria-pressed={draft.messengers[key]} className={draft.messengers[key] ? "min-h-10 rounded-full bg-burgundy px-4 text-sm text-cream" : "min-h-10 rounded-full border border-line px-4 text-sm"} onClick={() => patch({ messengers: { ...draft.messengers, [key]: !draft.messengers[key] } })}>{label}</button>
            ))}
          </div>
        </Fill>
        </div>
        <p className="text-sm text-muted max-lg:hidden">Ссылка работает до дня свадьбы и ещё месяц после неё. Это уже входит в Middle.</p>
        {paymentsEnabled ? (
          <>
            <Link to="/publikaciya" className="inline-flex min-h-12 items-center justify-center bg-burgundy px-5 text-sm text-cream max-lg:hidden">
              Дальше — публикация, 45 BYN.
            </Link>
            <Link to="/zakaz" search={{ tier: "middle", template: preset.name }} className="inline-flex min-h-12 items-center justify-center border border-line px-5 text-sm max-lg:hidden">
              Или оставить заявку без оплаты
            </Link>
          </>
        ) : (
          <Link to="/zakaz" search={{ tier: "middle", template: preset.name }} className="inline-flex min-h-12 items-center justify-center bg-burgundy px-5 text-sm text-cream max-lg:hidden">
            Оплатить, 45 BYN
          </Link>
        )}
      </form>
    </div>
  );
}

function Fill({ title, on, onToggle, block, onActivate, hidden, children }: { title: string; on: boolean; onToggle: () => void; block: string; onActivate: (block: string) => void; hidden?: boolean; children: React.ReactNode }) {
  return (
    <section className={hidden ? "hidden" : "flex flex-col gap-3 border-t border-line pt-5"} onFocusCapture={() => onActivate(block)} onClick={() => onActivate(block)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif text-3xl">{title}</h2>
        <button type="button" aria-pressed={on} className={on ? "min-h-10 shrink-0 rounded-full bg-burgundy px-4 text-sm text-cream" : "min-h-10 shrink-0 rounded-full border border-line px-4 text-sm text-muted"} onClick={onToggle}>{on ? "вкл" : "выкл"}</button>
      </div>
      {on ? children : null}
    </section>
  );
}

function ColorSquare({ hue, sat, val, onPick }: { hue: number; sat: number; val: number; onPick: (sat: number, val: number) => void }) {
  function pick(event: React.PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height));
    onPick(x * 100, (1 - y) * 100);
  }
  return (
    <div
      className="relative h-44 cursor-crosshair overflow-hidden rounded-2xl border border-line"
      style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hsvToHex(hue, 100, 100)})` }}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        pick(event);
      }}
      onPointerMove={(event) => {
        if (event.buttons !== 1) return;
        pick(event);
      }}
    >
      <span className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow" style={{ left: `${sat}%`, top: `${100 - val}%` }} />
    </div>
  );
}

function Spectrum({ label, background, marker = 0, onPick }: { label: string; background: string; marker?: number; onPick: (ratio: number) => void }) {
  function pick(event: React.PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    onPick(ratio);
  }
  return (
    <label className="block text-sm">
      {label}
      <div
        className="relative mt-1 h-8 cursor-crosshair rounded-full border border-line"
        style={{ background }}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          pick(event);
        }}
        onPointerMove={(event) => {
          if (event.buttons !== 1) return;
          pick(event);
        }}
      >
        <span className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow" style={{ left: `${marker * 100}%` }} />
      </div>
    </label>
  );
}

function hsvToHex(hue: number, saturation: number, value: number) {
  const s = saturation / 100;
  const v = value / 100;
  const c = v * s;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = v - c;
  let red = 0;
  let green = 0;
  let blue = 0;
  if (hue < 60) [red, green, blue] = [c, x, 0];
  else if (hue < 120) [red, green, blue] = [x, c, 0];
  else if (hue < 180) [red, green, blue] = [0, c, x];
  else if (hue < 240) [red, green, blue] = [0, x, c];
  else if (hue < 300) [red, green, blue] = [x, 0, c];
  else [red, green, blue] = [c, 0, x];
  const channel = (channelValue: number) => Math.round((channelValue + m) * 255).toString(16).padStart(2, "0");
  return `#${channel(red)}${channel(green)}${channel(blue)}`;
}

function hexToHsv(hex: string) {
  const value = hex.replace("#", "");
  const red = Number.parseInt(value.slice(0, 2), 16) / 255;
  const green = Number.parseInt(value.slice(2, 4), 16) / 255;
  const blue = Number.parseInt(value.slice(4, 6), 16) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  let hue = 0;
  if (delta !== 0) {
    if (max === red) hue = ((green - blue) / delta) % 6;
    else if (max === green) hue = (blue - red) / delta + 2;
    else hue = (red - green) / delta + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }
  return { h: hue, s: max === 0 ? 0 : (delta / max) * 100, v: max * 100 };
}

function hslToHex(hue: number, saturation: number, lightness: number) {
  const s = saturation / 100;
  const l = lightness / 100;
  const k = (n: number) => (n + hue / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const channel = (value: number) => Math.round(255 * value).toString(16).padStart(2, "0");
  return `#${channel(f(0))}${channel(f(8))}${channel(f(4))}`;
}

const replyChoices = [
  { id: "mail" as const, name: "Почта", label: "Ваша почта", icon: <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M4 7l8 6 8-6" /></svg> },
  { id: "telegram" as const, name: "Telegram", label: "Логин Telegram", icon: <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor"><path d="M20.7 4.3 2.9 11.1c-1.2.5-1.2 1.2-.2 1.5l4.6 1.4 10.6-6.7c.5-.3 1-.1.6.2l-8.6 7.8-.3 4.6c.5 0 .7-.2 1-.5l2.4-2.3 4.9 3.6c.9.5 1.5.2 1.8-.8l3.2-15.1c.3-1.3-.5-1.9-1.2-1.5Z" /></svg> },
  { id: "viber" as const, name: "Viber", label: "Номер Viber", icon: <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor"><path d="M12.2 3C7.6 3 5 5.3 5 9.2c0 3.5 2.2 6.1 5.3 6.7l.2.1-.1 1.6c0 .6.3.8.8.5l2.3-1.2c.4.1.9.1 1.3.1 4.4 0 7.2-2.3 7.2-6.2S16.6 3 12.2 3Zm4.3 8.4c-.2.5-1.1 1-1.5 1.1-.4.1-.8.2-2.4-.5-2-.9-3.3-3-3.4-3.1-.1-.2-.8-1.1-.8-2.1s.5-1.5.7-1.7c.2-.2.4-.2.6-.2h.4c.1 0 .3 0 .5.4.2.5.6 1.6.6 1.7.1.1 0 .3-.1.4l-.3.4c-.1.1-.2.2-.1.4.2.3.7 1.1 1.5 1.8.9.8 1.7 1.1 2 .1.1-.2.3-.3.5-.2l1.1.5c.2.1.4.2.4.3.1.2 0 .8-.2 1.2Z" /></svg> },
  { id: "whatsapp" as const, name: "WhatsApp", label: "Номер WhatsApp", icon: <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor"><path d="M12 3.2A8.7 8.7 0 0 0 4.7 16.3L3.6 20.4l4.2-1.1A8.7 8.7 0 1 0 12 3.2Zm4.8 12.3c-.2.6-1.2 1.1-1.6 1.1-.4.1-.9.1-1.5-.1-.3-.1-.8-.3-1.3-.5-2.3-1-3.8-3.4-3.9-3.5-.1-.2-1-1.3-1-2.5s.6-1.8.8-2c.2-.2.5-.3.6-.3h.5c.1 0 .3 0 .4.4.2.5.6 1.7.7 1.8.1.1 0 .3-.1.5l-.4.5c-.1.1-.2.3-.1.5.2.4.8 1.3 1.7 2.1.9.8 1.7 1.1 1.9 1.2.2.1.4 0 .5-.1l.6-.7c.1-.2.3-.1.5-.1l1.8.8c.2.1.3.2.4.3.1.4 0 1-.2 1.1Z" /></svg> },
];

function Range({ label, value, min, max, suffix = "", from, to, onChange }: { label: string; value: number; min: number; max: number; suffix?: string; from?: string; to?: string; onChange: (value: number) => void }) {
  return (
    <label className="block text-sm">
      {label}{from ? "" : `: ${value}${suffix}`}
      <span className="mt-1 flex items-center gap-2">
        {from ? <span className="w-12 shrink-0 text-xs text-muted">{from}</span> : null}
        <input className="w-full" type="range" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} />
        {to ? <span className="w-12 shrink-0 text-right text-xs text-muted">{to}</span> : null}
      </span>
    </label>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm">
      {label}
      <input className="studio-input mt-1" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Area({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm">
      {label}
      <textarea className="studio-input mt-1 min-h-24" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
