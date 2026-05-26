import { query } from './db.js';

function toCamelNode(row) {
  return {
    id: row.id,
    parentId: row.parent_id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    contentMd: row.content_md,
    level: row.level,
    sortOrder: row.sort_order,
    category: row.category,
    subcategory: row.subcategory,
    tags: row.tags || [],
    aliases: row.aliases || [],
    keywords: row.keywords || [],
    children: [],
  };
}

function sortTree(items) {
  items.sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }
    return left.title.localeCompare(right.title, 'ru');
  });

  items.forEach((item) => sortTree(item.children));
}

export function buildKnowledgeTree(rows) {
  const byId = new Map();
  const roots = [];

  rows.forEach((row) => {
    const node = toCamelNode(row);
    byId.set(node.id, node);
  });

  byId.forEach((node) => {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId).children.push(node);
      return;
    }
    roots.push(node);
  });

  sortTree(roots);
  return roots;
}

export async function getKnowledgeNodes() {
  const rows = await query(`
    select
      id,
      parent_id,
      title,
      slug,
      summary,
      content_md,
      level,
      sort_order,
      category,
      subcategory,
      tags,
      aliases,
      keywords
    from knowledge_nodes
    where is_published = true
    order by level, sort_order, title
  `);

  return {
    items: buildKnowledgeTree(rows),
    meta: {
      total: rows.length,
      source: 'postgres',
      generatedAt: new Date().toISOString(),
    },
  };
}
