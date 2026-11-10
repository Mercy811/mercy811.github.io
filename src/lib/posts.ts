type NoteFields = Record<string, unknown>;

type NoteModule = {
  frontmatter?: NoteFields;
  note?: NoteFields;
};

export interface Post {
  title: string;
  description: string;
  summary?: string;
  date: string;
  published: string;
  year: string;
  day: string;
  month: string;
  order: number;
  project: string;
  projectHref?: string;
  topic?: string;
  readingTime?: string;
  href: string;
  source: string;
}

export interface ProjectGroup {
  project: string;
  slug: string;
  href?: string;
  external: boolean;
  posts: Post[];
}

export interface YearGroup {
  year: string;
  posts: Post[];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const thoughtModules = import.meta.glob<NoteModule>('../pages/thoughts/**/*.md', { eager: true });
const projectNoteModules = import.meta.glob<NoteModule>('../pages/projects/**/notes/**/*.{md,astro}', { eager: true });

function publishedDate(source: string, value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const year = value.getUTCFullYear();
    const month = String(value.getUTCMonth() + 1).padStart(2, '0');
    const day = String(value.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  const text = typeof value === 'string' ? value.trim() : '';
  const match = text.match(/^(\d{4}-\d{2}-\d{2})(?:T.*)?$/);
  if (match) return match[1];
  throw new Error(`${source} is missing published. Use a YYYY-MM-DD date.`);
}

function requireText(source: string, field: string, value: unknown) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${source} is missing ${field}. Add it before publishing.`);
  }
  return value.trim();
}

function optionalText(value: unknown) {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined;
}

function hrefFromPath(path: string) {
  const route = path.replace(/^\.\.\/pages/, '').replace(/\.(md|mdx|astro)$/, '');
  return route.endsWith('/index') ? route.slice(0, -'index'.length) : `${route}/`;
}

function loadPost(path: string, module: NoteModule): Post {
  const source = path.replace(/^\.\.\//, 'src/');
  const data = module.frontmatter ?? module.note;
  if (!data) {
    throw new Error(`${source} must export front matter or a note object so it can join the thoughts index.`);
  }

  const published = publishedDate(source, data.published);
  const monthIndex = Number(published.slice(5, 7)) - 1;
  const day = Number(published.slice(8, 10));
  if (monthIndex < 0 || monthIndex > 11 || day < 1 || day > 31) {
    throw new Error(`${source} has an invalid published date: ${published}.`);
  }

  const order = data.order ?? 0;
  if (typeof order !== 'number' || Number.isNaN(order)) {
    throw new Error(`${source} has a non-numeric order. Use a number, or omit it.`);
  }

  const projectHref = optionalText(data.projectHref);
  if (projectHref && !/^(https?:\/\/|\/)/.test(projectHref)) {
    throw new Error(`${source} has projectHref "${projectHref}". Use a site path or an absolute http(s) URL.`);
  }

  return {
    title: requireText(source, 'title', data.title),
    description: requireText(source, 'description', data.description),
    summary: optionalText(data.summary),
    date: requireText(source, 'date', data.date),
    published,
    year: published.slice(0, 4),
    day: published.slice(8, 10),
    month: MONTHS[monthIndex],
    order,
    project: requireText(source, 'project', data.project),
    projectHref,
    topic: optionalText(data.topic),
    readingTime: optionalText(data.readingTime),
    href: hrefFromPath(path),
    source,
  };
}

function byNewest(a: Post, b: Post) {
  const byDate = b.published.localeCompare(a.published);
  if (byDate !== 0) return byDate;
  const byOrder = b.order - a.order;
  if (byOrder !== 0) return byOrder;
  return a.title.localeCompare(b.title);
}

function loadPosts() {
  const modules = { ...thoughtModules, ...projectNoteModules };
  const posts = Object.entries(modules).map(([path, module]) => loadPost(path, module));
  const hrefs = new Set<string>();
  for (const post of posts) {
    if (hrefs.has(post.href)) throw new Error(`Two notes resolve to ${post.href}. Rename one of them.`);
    hrefs.add(post.href);
  }
  return posts.sort(byNewest);
}

let cached: Post[] | undefined;

export function getPosts() {
  cached ??= loadPosts();
  return cached;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function groupPostsByProject(posts: Post[]): ProjectGroup[] {
  const groups = new Map<string, Post[]>();
  for (const post of posts) {
    const list = groups.get(post.project);
    if (list) list.push(post);
    else groups.set(post.project, [post]);
  }

  return [...groups.entries()]
    .map(([project, items]) => {
      const sorted = [...items].sort(byNewest);
      const hrefs = [...new Set(sorted.map((item) => item.projectHref).filter((href): href is string => Boolean(href)))];
      if (hrefs.length > 1) {
        throw new Error(`Project "${project}" has conflicting projectHref values (${hrefs.join(', ')}). Use the same link on every note in the project.`);
      }
      const href = hrefs[0];
      return {
        project,
        slug: slugify(project),
        href,
        external: Boolean(href && /^https?:\/\//.test(href)),
        posts: sorted,
      };
    })
    .sort((a, b) => byNewest(a.posts[0], b.posts[0]) || a.project.localeCompare(b.project));
}

export function groupPostsByYear(posts: Post[]): YearGroup[] {
  const years: YearGroup[] = [];
  for (const post of posts) {
    const last = years.at(-1);
    if (!last || last.year !== post.year) years.push({ year: post.year, posts: [post] });
    else last.posts.push(post);
  }
  return years;
}

export function padCount(value: number) {
  return String(value).padStart(2, '0');
}

export function noteCountLabel(count: number) {
  return `${padCount(count)} ${count === 1 ? 'note' : 'notes'}`;
}

export function teaser(post: Post) {
  return post.summary ?? post.description;
}

export function metaLine(post: Post, parts: Array<'project' | 'topic' | 'date' | 'readingTime'> = ['date', 'readingTime']) {
  const values = {
    project: post.project,
    topic: post.topic,
    date: post.date,
    readingTime: post.readingTime,
  };
  return parts.map((part) => values[part]).filter((part): part is string => Boolean(part)).join(' · ');
}
