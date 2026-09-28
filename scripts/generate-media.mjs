import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, extname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDirectory = join(dirname(fileURLToPath(import.meta.url)), '..');
const mediaFolders = [
  { name: 'Images', type: 'image', collection: 'projects', extensions: new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.webp']) },
  { name: 'Videos', type: 'video', collection: 'projects', extensions: new Set(['.m4v', '.mov', '.mp4', '.ogv', '.webm']) },
  { name: 'GUI Images', type: 'image', collection: 'gui', extensions: new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.webp']) },
  { name: 'GUI Videos', type: 'video', collection: 'gui', extensions: new Set(['.m4v', '.mov', '.mp4', '.ogv', '.webm']) }
];

async function collectFiles(directory, extensions) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...await collectFiles(path, extensions));
    } else if (entry.isFile() && extensions.has(extname(entry.name).toLowerCase())) {
      files.push(path);
    }
  }

  return files;
}

function createTitle(relativePath) {
  const filename = relativePath.split('/').at(-1);
  const basename = filename.slice(0, -extname(filename).length);
  const screenshot = basename.match(/^Screenshot\s+(\d{4})-(\d{2})-(\d{2})\s+(\d{2})(\d{2})/i);

  if (screenshot) {
    const [, year, month, day, hours, minutes] = screenshot;
    const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    const dateLabel = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC'
    }).format(date);
    const hour = Number(hours);
    const timeLabel = `${hour % 12 || 12}:${minutes} ${hour >= 12 ? 'PM' : 'AM'}`;
    return `Environment Study · ${dateLabel} · ${timeLabel}`;
  }

  return basename
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase());
}

async function main() {
  const configPath = join(rootDirectory, 'site-config.json');
  const config = JSON.parse(await readFile(configPath, 'utf8'));
  const collections = { projects: [], gui: [] };

  for (const folder of mediaFolders) {
    const directory = join(rootDirectory, folder.name);

    for (const file of await collectFiles(directory, folder.extensions)) {
      const path = relative(rootDirectory, file).split(sep).join('/');
      const details = config.projectDetails?.[path] || {};

      collections[folder.collection].push({
        path,
        type: folder.type,
        title: details.title || createTitle(path),
        description: details.description || ''
      });
    }
  }

  for (const projects of Object.values(collections)) {
    projects.sort((first, second) => {
      if (first.type !== second.type) return first.type === 'image' ? -1 : 1;
      return first.path.localeCompare(second.path, undefined, { numeric: true, sensitivity: 'base' });
    });
  }

  const outputPath = join(rootDirectory, 'media-index.json');
  await writeFile(outputPath, `${JSON.stringify(collections, null, 2)}\n`);
  const mediaCount = Object.values(collections).reduce((total, projects) => total + projects.length, 0);
  console.log(`Indexed ${mediaCount} media file${mediaCount === 1 ? '' : 's'} to ${outputPath}`);
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});