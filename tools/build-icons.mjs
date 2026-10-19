#!/usr/bin/env node
/**
 * Regenerates assets/icons/*.svg and assets/brand.css from simple-icons.
 *
 * Setup (outside this project):
 *   mkdir -p /tmp/ry-scratch && cd /tmp/ry-scratch
 *   npm init -y && npm install simple-icons
 *
 * Run from the project root:
 *   node tools/build-icons.mjs
 *   SIMPLE_ICONS_DIR=/path/to/node_modules/simple-icons node tools/build-icons.mjs
 *
 * Brand colours below 3:1 contrast against the page background are lightened
 * (blended towards white) until they reach 3:1, so every icon stays legible.
 * Tools absent from simple-icons get a neutral monogram instead of a copied logo.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const siDir =
  process.env.SIMPLE_ICONS_DIR ||
  "/tmp/ry-scratch/node_modules/simple-icons";
const outIcons = path.join(root, "assets", "icons");
const outBrandCss = path.join(root, "assets", "brand.css");
const BG = "#0a0d14";

const icons = [
  // group, file, simple-icons slug, display name
  ["platform", "docker", "docker", "Docker"],
  ["platform", "kubernetes", "kubernetes", "Kubernetes"],
  ["platform", "rancher", "rancher", "Rancher"],
  ["platform", "helm", "helm", "Helm"],
  ["platform", "linux", "linux", "Linux"],
  ["platform", "vmware", "vmware", "VMware ESXi"],
  ["platform", "traefik", "traefikproxy", "Traefik"],
  ["platform", "nginx", "nginx", "nginx"],
  ["platform", "minio", "minio", "MinIO"],
  ["platform", "ceph", "ceph", "Ceph"],

  ["automation", "gitlab", "gitlab", "GitLab"],
  ["automation", "gitlab-ci", "gitlab", "GitLab CI/CD"],
  ["automation", "git", "git", "Git"],
  ["automation", "ansible", "ansible", "Ansible"],
  ["automation", "terraform", "terraform", "Terraform"],
  ["automation", "bash", "gnubash", "Shell scripting (Bash)"],

  ["observability", "prometheus", "prometheus", "Prometheus"],
  ["observability", "grafana", "grafana", "Grafana"],
  ["observability", "elasticsearch", "elasticsearch", "Elasticsearch"],

  ["data", "python", "python", "Python"],
  ["data", "postgresql", "postgresql", "PostgreSQL"],
  ["data", "mysql", "mysql", "MySQL"],
  ["data", "keras", "keras", "Keras (for ML/DL)"],
];

const monograms = [
  ["platform", "haproxy", "HA", "HAProxy"],
  ["platform", "keepalived", "KP", "Keepalived"],
  ["automation", "argocd", "AC", "Argo CD"],
  ["automation", "gitops", "GO", "GitOps"],
  ["automation", "nexus", "NX", "Nexus Repository"],
  ["observability", "loki", "LO", "Loki"],
  ["observability", "alloy", "AL", "Alloy"],
  ["observability", "zabbix", "ZB", "Zabbix"],
  ["data", "csharp", "C#", "C#"],
  ["data", "mssql", "SQL", "Microsoft SQL Server"],
];

const neutral = "#9aa7bc";

function hexToRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminance([r, g, b]) {
  const f = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const bg = hexToRgb(BG);

function readable(hex) {
  let rgb = hexToRgb(hex);
  let t = 0;
  while (contrast(rgb, bg) < 3 && t < 1) {
    t += 0.04;
    rgb = rgb.map((c) => Math.round(c + (255 - c) * t));
  }
  return "#" + rgb.map((c) => c.toString(16).padStart(2, "0")).join("");
}

const toHex = (rgb) => "#" + rgb.map((c) => c.toString(16).padStart(2, "0")).join("");

const data = JSON.parse(
  fs.readFileSync(path.join(siDir, "data", "simple-icons.json"), "utf8"),
);
const bySlug = new Map(data.map((i) => [i.slug, i]));

fs.mkdirSync(outIcons, { recursive: true });
const brandRules = [];

for (const [group, file, slug, title] of icons) {
  const meta = bySlug.get(slug);
  if (!meta) throw new Error(`simple-icons has no slug "${slug}" (${title})`);
  const rawPath = fs.readFileSync(path.join(siDir, "icons", `${slug}.svg`), "utf8");
  const d = rawPath.match(/<path[^>]*\sd="([^"]+)"/)?.[1];
  if (!d) throw new Error(`no path found in ${slug}.svg`);
  const colour = readable("#" + meta.hex);
  fs.writeFileSync(
    path.join(outIcons, `${file}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="presentation"><path fill="${colour}" d="${d}"/></svg>\n`,
  );
  brandRules.push(`.brand--${file}{--brand:${colour}}`);
}

for (const [group, file, label, title] of monograms) {
  const small = label.length > 2;
  fs.writeFileSync(
    path.join(outIcons, `${file}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="presentation">` +
      `<rect x="1.25" y="1.25" width="21.5" height="21.5" rx="5" fill="none" stroke="${neutral}" stroke-width="1.1"/>` +
      `<text x="12" y="12" fill="${neutral}" font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="${small ? 7.4 : 8.6}" font-weight="600" letter-spacing=".2" text-anchor="middle" dominant-baseline="central">${label}</text></svg>\n`,
  );
  brandRules.push(`.brand--${file}{--brand:${neutral}}`);
}

const header =
  "/* Generated by tools/build-icons.mjs. Do not edit by hand. */\n" +
  "/* Brand colours are lightened where needed to reach 3:1 on #0a0d14. */\n";
fs.writeFileSync(outBrandCss, header + brandRules.join("\n") + "\n");

console.log(`wrote ${icons.length + monograms.length} icons to assets/icons/`);
console.log(`wrote ${brandRules.length} brand rules to assets/brand.css`);
for (const r of brandRules) console.log("  " + r);
