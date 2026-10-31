#!/usr/bin/env node
/**
 * Собирает веб-часть игры в папку tauri/web — её Tauri упаковывает в приложение.
 *
 * Единый источник правды остаётся в корне репозитория (index.html, css/, js/),
 * поэтому копия — это просто «дистрибутив», её не редактируют и не коммитят.
 *
 * Запускается автоматически (beforeDevCommand / beforeBuildCommand),
 * вручную: node tauri/scripts/prepare-web.mjs
 */
import { cp, mkdir, rm, readFile, writeFile, stat } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..', '..');          // корень репозитория
const out = resolve(here, '..', 'web');           // tauri/web

const COPY = [
  'index.html',
  'manifest.webmanifest',
  'css',
  'js',
  'icons',
];

// В нативной оболочке service worker не нужен: файлы уже лежат на устройстве,
// а старый кеш после обновления приложения только мешает.
const SKIP_FILES = new Set(['sw.js']);

async function exists(path) {
  try { await stat(path); return true; } catch { return false; }
}

async function copyTree(from, to) {
  await cp(from, to, {
    recursive: true,
    force: true,
    filter: (src) => {
      const name = src.split(/[\\/]/).pop();
      if (SKIP_FILES.has(name)) return false;
      if (name === '.DS_Store' || name === 'Thumbs.db') return false;
      return true;
    },
  });
}

function fail(message) {
  console.error(`\n✖ prepare-web: ${message}\n`);
  process.exit(1);
}

async function main() {
  if (!(await exists(join(root, 'index.html')))) {
    fail(`не найден index.html в ${root} — запускай скрипт из папки tauri/ репозитория игры`);
  }

  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });

  for (const item of COPY) {
    const src = join(root, item);
    if (!(await exists(src))) continue;
    await copyTree(src, join(out, item));
  }

  // Маленькая метка сборки — удобно проверить в «Настройках», что приложение обновилось.
  const pkg = JSON.parse(await readFile(join(here, '..', 'package.json'), 'utf8'));
  const version = JSON.parse(
    await readFile(join(here, '..', 'src-tauri', 'tauri.conf.json'), 'utf8'),
  ).version ?? pkg.version;

  await writeFile(
    join(out, 'build-info.json'),
    `${JSON.stringify({ app: 'SquirrelBeatingGame', version, builtAt: new Date().toISOString(), shell: 'tauri' }, null, 2)}\n`,
  );

  console.log(`✔ веб-часть собрана в ${out} (версия ${version})`);
}

main().catch((err) => fail(err?.stack || String(err)));
