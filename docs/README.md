# AnalystKit Documentation

Документация фиксирует текущее состояние MVP и целевое направление развития платформы: от статического frontend на GitHub Pages к полноценной системе с backend, PostgreSQL, parser jobs, аналитикой и будущими AI-рекомендациями.

## Target Platform Artifacts

- [Целевая платформа](target-platform.md) - staged roadmap перехода к backend, PostgreSQL, jobs и собственному deployment.
- [PostgreSQL Schema v1](database-schema-v1.md) - первая нормализованная модель данных для базы знаний, вопросов, задач, вакансий, компаний и навыков.
- [Backend API v1](backend-api-v1.md) - черновой контракт API для постепенного подключения frontend к серверу.

## Current MVP Artifacts

- [Архитектура](architecture.md) - как устроен текущий статический проект, runtime, deployment и поток данных.
- [Модель данных](data-model.md) - текущая "БД": `localStorage`, seed-файлы и payload аналитики.
- [Регламент обновления](maintenance.md) - что проверять раз в неделю и как поддерживать артефакты актуальными.
- [Knowledge Architecture v2](knowledge-architecture-v2.md) - доменная структура базы знаний.
- [Skill Taxonomy v2](skill-taxonomy-v2.json) - skill graph-ready справочник навыков.

## Current Status

| Область | Состояние |
| --- | --- |
| Hosting | GitHub Pages, статические файлы из `main` |
| Backend | Bootstrap API в `apps/api`, endpoint базы знаний читает PostgreSQL через Node `pg` |
| Основное хранилище | `localStorage` браузера для frontend MVP; Neon PostgreSQL для начального server-side контура |
| Справочники | `seed-data.js`, `knowledge-tree.js`, `questions-extra.js`, `skills-stats.js` |
| База знаний | Активна, дерево со сворачиванием, поиском и сортировкой |
| Вопросы и задачи | Активны, пользовательское состояние хранится в браузере |
| Вакансионная аналитика | Парсер и dashboard есть, данные пока формируются без полноценного server-side контура |
| Логотип | `assets/sah-logo-v3.jpg` |

## Quick Start

```bash
node dev-server.js
```

После запуска сайт доступен на `http://localhost:4173/`.

## Next Engineering Step

Следующий практический шаг после этих документов - подключить frontend к API:

- оставить `GET /api/v1/knowledge/nodes` совместимым с текущим контрактом;
- добавить frontend `apiClient`;
- читать дерево из API при доступном backend;
- оставить fallback на `knowledge-tree.js` для GitHub Pages/offline.
