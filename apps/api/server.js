import http from 'node:http';
import { URL } from 'node:url';
import { hasDatabaseUrl } from './db.js';
import { getKnowledgeNodes } from './knowledge-repository.js';

const service = {
  name: 'sa-halper-api',
  version: '0.1.0',
};

const port = Number(process.env.PORT || 8787);
const frontendOrigin = process.env.FRONTEND_ORIGIN || '*';

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': frontendOrigin,
    'access-control-allow-methods': 'GET,POST,PATCH,OPTIONS',
    'access-control-allow-headers': 'content-type,authorization',
  });
  response.end(JSON.stringify(payload));
}

function sendNotFound(response) {
  sendJson(response, 404, {
    error: {
      code: 'not_found',
      message: 'Route not found',
      details: {},
    },
  });
}

function getMeta() {
  return {
    appName: 'SA HALPER',
    apiVersion: 'v1',
    service,
    features: {
      knowledge: true,
      questions: false,
      tasks: false,
      vacancyAnalytics: false,
      parserJobs: false,
    },
    migration: {
      database: hasDatabaseUrl() ? 'connected' : 'missing-database-url',
      staticFallback: true,
    },
  };
}

function getKnowledgeNodesFallback() {
  return {
    items: [],
    meta: {
      total: 0,
      source: 'database-url-missing',
      fallback: 'knowledge-tree.js',
      generatedAt: new Date().toISOString(),
    },
  };
}

function sendError(response, error) {
  sendJson(response, 500, {
    error: {
      code: 'internal_error',
      message: error.message || 'Internal server error',
      details: {},
    },
  });
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'access-control-allow-origin': frontendOrigin,
      'access-control-allow-methods': 'GET,POST,PATCH,OPTIONS',
      'access-control-allow-headers': 'content-type,authorization',
    });
    response.end();
    return;
  }

  const url = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);

  if (request.method === 'GET' && url.pathname === '/health') {
    sendJson(response, 200, {
      status: 'ok',
      service: service.name,
      version: service.version,
      time: new Date().toISOString(),
    });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/v1/meta') {
    sendJson(response, 200, getMeta());
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/v1/knowledge/nodes') {
    try {
      sendJson(response, 200, hasDatabaseUrl() ? await getKnowledgeNodes() : getKnowledgeNodesFallback());
    } catch (error) {
      sendError(response, error);
    }
    return;
  }

  sendNotFound(response);
});

server.listen(port, () => {
  console.log(`${service.name} ${service.version} listening on http://localhost:${port}`);
});
