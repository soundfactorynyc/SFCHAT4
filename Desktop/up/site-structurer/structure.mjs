#!/usr/bin/env node
// Simple, safe site structurer: drops your existing site into a clean layout.
// Usage: node structure.mjs --src "/path/to/site" --apply   (omit --apply for dry-run)

import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import fg from "fast-glob";
import fse from "fs-extra";

const args = new Set(process.argv.slice(2));
const getVal = (k)=>{const i=process.argv.indexOf(k);return i>-1?process.argv[i+1]:null};
const SRC = getVal("--src") || process.env.SRC || "";
const APPLY = args.has("--apply");

if(!SRC) { console.error("Missing --src \"/path/to/site\""); process.exit(1); }

const ROOT = process.cwd();
const DEST = {
  pages:  path.join(ROOT, "public"),
  css:    path.join(ROOT, "public", "assets", "css"),
  img:    path.join(ROOT, "public", "assets", "img"),
  data:   path.join(ROOT, "public", "assets", "data"),
  utils:  path.join(ROOT, "src", "utils"),
  main:   path.join(ROOT, "src")
};
const ORG = {
  root: path.join(ROOT, ".organizer"),
  inbox: path.join(ROOT, ".organizer", "inbox"),
  quarantine: path.join(ROOT, ".organizer", "quarantine")
};

await Promise.all([
  ...Object.values(DEST).map(d=>fse.ensureDir(d)),
  ...Object.values(ORG).map(d=>fse.ensureDir(d))
]);

function ext(p){ return path.extname(p).toLowerCase(); }
function base(p){ return path.basename(p); }
function stem(p){ return path.basename(p, path.extname(p)); }

function classify(abs) {
  const e = ext(abs);
  if ([".png",".jpg",".jpeg",".gif",".svg",".webp",".avif"].includes(e)) return {bucket:"img"};
  if (e === ".css") return {bucket:"css"};
  if (e === ".json" || e === ".geojson") return {bucket:"data"};
  if (e === ".html" || e === ".htm") return {bucket:"page"};
  if ([".js",".mjs",".ts"].includes(e)) {
    // guess main files
    const n = base(abs).toLowerCase();
    if (n === "main.js" || n === "main.mjs") return {bucket:"main", name:"main.js"};
    if (n === "bus.js"  || n === "bus.mjs")  return {bucket:"main", name:"bus.js"};
    return {bucket:"utils"};
  }
  return {bucket:"unknown"};
}

function targetFor(abs) {
  const c = classify(abs);
  const name = base(abs);
  switch (c.bucket) {
    case "img":   return { dir: DEST.img,   filename: name };
    case "css":   return { dir: DEST.css,   filename: name };
    case "data":  return { dir: DEST.data,  filename: name };
    case "page":  return { dir: DEST.pages, filename: /index\.html?$/i.test(name) ? "index.html" : name };
    case "main":  return { dir: DEST.main,  filename: c.name || name };
    case "utils": return { dir: DEST.utils, filename: name };
    default:      return { dir: ORG.quarantine, filename: name };
  }
}

function safeDest(dir, filename){
  const cand = path.join(dir, filename);
  if (!fs.existsSync(cand)) return cand;
  const withSuffix = path.join(dir, `${stem(filename)}-${Date.now().toString().slice(-6)}${ext(filename)}`);
  return withSuffix;
}

function planLine(from, to, apply){ console.log(`${apply?"MOVE":"PLAN"}  ${path.relative(ROOT,from)} -> ${path.relative(ROOT,to)}`); }

async function copySiteIntoInbox(src) {
  const stamp = new Date().toISOString().replace(/[:.]/g,"-");
  const inbox = path.join(ORG.inbox, `import-${stamp}`);
  await fse.copy(src, inbox, {
    overwrite: false,
    errorOnExist: false,
    filter: (p) => !/\/node_modules\/|\/\.git\/|\/dist\/|\/build\/|\/\.organizer\//.test(p)
  });
  return inbox;
}

async function run() {
  console.log(`\nStructuring site from: ${SRC}`);
  const inbox = await copySiteIntoInbox(SRC);
  console.log(`Imported to: ${path.relative(ROOT, inbox)}\n`);

  const files = await fg(["**/*.*"], { cwd: inbox, dot: true, onlyFiles: true });
  const moves = [];
  const quarantined = [];
  for (const rel of files) {
    const abs = path.join(inbox, rel);
    const { dir, filename } = targetFor(abs);
    const to = safeDest(dir, filename);

    // remember quarantines
    if (dir === ORG.quarantine) quarantined.push(abs);

    planLine(abs, to, APPLY);
    if (APPLY) {
      await fse.ensureDir(path.dirname(to));
      await fse.move(abs, to, { overwrite: false });
    }
    moves.push({ from: abs, to });
  }

  console.log("\n========== SUMMARY ==========");
  console.log(`Analyzed: ${files.length}`);
  const counts = { pages:0, css:0, img:0, data:0, utils:0, main:0, quarantine:0 };
  for (const m of moves) {
    const d = path.dirname(m.to);
    if (d.startsWith(DEST.pages)) counts.pages++;
    else if (d.startsWith(DEST.css)) counts.css++;
    else if (d.startsWith(DEST.img)) counts.img++;
    else if (d.startsWith(DEST.data)) counts.data++;
    else if (d.startsWith(DEST.utils)) counts.utils++;
    else if (d.startsWith(DEST.main)) counts.main++;
    else if (d.startsWith(ORG.quarantine)) counts.quarantine++;
  }
  console.log(`Pages: ${counts.pages}  CSS: ${counts.css}  Images: ${counts.img}  Data: ${counts.data}  JS utils: ${counts.utils}  JS main: ${counts.main}  Quarantine: ${counts.quarantine}`);
  if (counts.quarantine > 0) {
    console.log("⚠️  Some files were not recognized safely. Check .organizer/quarantine/");
  }
  console.log(`Mode: ${APPLY? "APPLY (files moved)":"DRY-RUN (no changes)"}\n`);
}

run().catch(e => { console.error("ERROR:", e.message); process.exit(1); });
