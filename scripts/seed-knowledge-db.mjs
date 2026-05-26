import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { createRequire } from 'node:module';
import { createPgConfig } from './db-url.mjs';

const { Client } = pg;
const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

global.window = {};
require(path.join(root, 'knowledge-tree.js'));

const sources = global.window.PREPBASE_KNOWLEDGE_SOURCES || {};
const tree = global.window.PREPBASE_KNOWLEDGE_TREE || [];

function toMarkdown(details) {
  if (!details) {
    return null;
  }

  if (Array.isArray(details)) {
    return details.filter(Boolean).join('\n\n');
  }

  return String(details);
}

function* iterateNodes(nodes, parentId = null, level = 1) {
  for (const [index, node] of nodes.entries()) {
    yield {
      node,
      parentId,
      level,
      sortOrder: index + 1,
    };

    if (Array.isArray(node.children) && node.children.length) {
      yield* iterateNodes(node.children, node.id, level + 1);
    }
  }
}

const client = new Client(createPgConfig());

try {
  await client.connect();
  await client.query('begin');

  const sourceIds = new Map();
  for (const [sourceKey, source] of Object.entries(sources)) {
    const result = await client.query(
      `
      insert into knowledge_sources (source_key, title, url, source_type)
      values ($1, $2, $3, $4)
      on conflict (source_key)
      do update set
        title = excluded.title,
        url = excluded.url,
        source_type = excluded.source_type
      returning id
      `,
      [
        sourceKey,
        source.title || sourceKey,
        source.url || null,
        'reference',
      ],
    );
    sourceIds.set(sourceKey, result.rows[0].id);
  }

  let nodesCount = 0;
  let linksCount = 0;

  for (const { node, parentId, level, sortOrder } of iterateNodes(tree)) {
    await client.query(
      `
      insert into knowledge_nodes (
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
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      on conflict (id)
      do update set
        parent_id = excluded.parent_id,
        title = excluded.title,
        slug = excluded.slug,
        summary = excluded.summary,
        content_md = excluded.content_md,
        level = excluded.level,
        sort_order = excluded.sort_order,
        category = excluded.category,
        subcategory = excluded.subcategory,
        tags = excluded.tags,
        aliases = excluded.aliases,
        keywords = excluded.keywords,
        updated_at = now()
      `,
      [
        node.id,
        parentId,
        node.title || node.id,
        node.slug || node.id,
        node.summary || null,
        toMarkdown(node.details),
        level,
        sortOrder,
        node.category || (level === 1 ? node.id : null),
        node.subcategory || null,
        node.tags || [],
        node.aliases || [],
        node.keywords || [],
      ],
    );
    nodesCount += 1;

    for (const sourceKey of node.sources || []) {
      const sourceId = sourceIds.get(sourceKey);
      if (!sourceId) {
        continue;
      }

      await client.query(
        `
        insert into knowledge_node_sources (node_id, source_id)
        values ($1, $2)
        on conflict do nothing
        `,
        [node.id, sourceId],
      );
      linksCount += 1;
    }
  }

  await client.query('commit');
  console.log(`knowledge nodes upserted: ${nodesCount}`);
  console.log(`source links ensured: ${linksCount}`);
} catch (error) {
  await client.query('rollback').catch(() => {});
  throw error;
} finally {
  await client.end();
}
