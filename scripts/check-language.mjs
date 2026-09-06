import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const pagesRoot = new URL('../src/pages/', import.meta.url);
const publishableExtensions = new Set(['.astro', '.md', '.mdx']);
const chineseText = /[\u3400-\u4dbf\u4e00-\u9fff]/u;
const failures = [];

async function inspect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await inspect(path);
      continue;
    }
    if (!publishableExtensions.has(extname(entry.name))) continue;

    const source = await readFile(path, 'utf8');
    if (!chineseText.test(source)) continue;

    const hasEnglishMode = source.includes('data-lang="en"');
    const hasChineseMode = source.includes('data-lang="zh"');
    const usesBilingualLayout = source.includes('ThaiCueNote');
    if ((!hasEnglishMode || !hasChineseMode) && !usesBilingualLayout) {
      failures.push(relative(pagesRoot.pathname, path));
    }
  }
}

await inspect(pagesRoot.pathname);

if (failures.length) {
  console.error('Language consistency check failed. Chinese content requires complete English and Chinese modes:');
  failures.forEach((file) => console.error(`- ${file}`));
  process.exit(1);
}

console.log('Language consistency check passed.');
