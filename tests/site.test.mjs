import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("..", import.meta.url);

test("exports the British Shorthair teaching book landing screen", async () => {
  const html = await readFile(new URL("dist/client/index.html", root), "utf8");

  assert.match(html, /<html lang="zh-Hant">/);
  assert.match(html, /英國短毛貓<br\/>養育教學書/);
  assert.match(html, /我真的住進你們家了/);
  assert.match(html, /要不要跟我學怎麼把我照顧好/);
  assert.doesNotMatch(html, /布偶貓|英國長毛貓|願意帶我回家|熊|獅子/);
  assert.match(html, /assets\/our-british-shorthair-guide\.webp/);
  assert.doesNotMatch(html, /Starter Project|codex-preview/);
});

test("ships only the illustrated cat used throughout the book", async () => {
  await access(new URL("dist/client/assets/our-british-shorthair-guide.webp", root));

  const source = await readFile(new URL("app/page.tsx", root), "utf8");
  assert.doesNotMatch(source, /our-british-shorthair-(?:cover|portrait)\.webp/);
  assert.match(source, /alt="你們的英國短毛貓卡通角色"/);
});

test("prefixes generated bundles for a GitHub Pages repository subpath", async () => {
  const vite = await readFile(new URL("vite.config.ts", root), "utf8");

  assert.match(vite, /base: deploymentBasePath \? `\$\{deploymentBasePath\}\//);
});

test("includes motion accessibility and handwritten title styling", async () => {
  const css = await readFile(new URL("app/globals.css", root), "utf8");

  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /@keyframes flip-next/);
  assert.match(css, /@keyframes cat-arrive/);
  assert.match(css, /family=Iansui&family=Yusei\+Magic/);
  assert.match(css, /--font-title: "Yusei Magic"/);
});

test("contains fourteen teaching pages, reversible paw stamps, and requested swipe direction", async () => {
  const source = await readFile(new URL("app/page.tsx", root), "utf8");

  assert.match(source, /const PAGE_COUNT = 14/);
  assert.match(source, /british-shorthair-care-handbook-v1/);
  assert.match(source, /把家電和家具守好/);
  assert.match(source, /HCM 與 PKD 不一樣/);
  assert.match(source, /每月要替我留多少/);
  assert.match(source, /delta > 0 \? "next" : "prev"/);
  assert.match(source, /firstSigned: !current\.firstSigned/);
  assert.match(source, /secondSigned: !current\.secondSigned/);
  assert.match(source, /取消第一枚爪印/);
  assert.match(source, /取消第二枚爪印/);
  assert.doesNotMatch(source, /布偶貓|英國長毛貓|熊|獅子|bear|lion/);
});
