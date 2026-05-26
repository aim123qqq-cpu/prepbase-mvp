create extension if not exists pgcrypto;

create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  display_name text,
  role text not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table knowledge_nodes (
  id text primary key,
  parent_id text references knowledge_nodes(id) on delete cascade,
  title text not null,
  slug text not null unique,
  summary text,
  content_md text,
  level int not null default 1,
  sort_order int not null default 0,
  category text,
  subcategory text,
  complexity text,
  market_demand text,
  interview_weight int,
  tags text[] not null default '{}',
  aliases text[] not null default '{}',
  keywords text[] not null default '{}',
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index knowledge_nodes_parent_idx on knowledge_nodes(parent_id, sort_order);
create index knowledge_nodes_search_idx on knowledge_nodes using gin (
  to_tsvector('russian', coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(content_md, ''))
);

create table knowledge_edges (
  id uuid primary key default gen_random_uuid(),
  source_node_id text not null references knowledge_nodes(id) on delete cascade,
  target_node_id text not null references knowledge_nodes(id) on delete cascade,
  relation_type text not null check (relation_type in ('prerequisite', 'related', 'advanced')),
  weight int not null default 1,
  created_at timestamptz not null default now(),
  unique (source_node_id, target_node_id, relation_type)
);

create table knowledge_sources (
  id uuid primary key default gen_random_uuid(),
  source_key text unique,
  title text not null,
  url text,
  source_type text,
  created_at timestamptz not null default now()
);

create table knowledge_node_sources (
  node_id text not null references knowledge_nodes(id) on delete cascade,
  source_id uuid not null references knowledge_sources(id) on delete cascade,
  primary key (node_id, source_id)
);

create table interview_questions (
  id text primary key,
  title text,
  question text not null,
  answer_md text,
  difficulty text,
  frequency text,
  practical_weight int,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table question_knowledge_nodes (
  question_id text not null references interview_questions(id) on delete cascade,
  node_id text not null references knowledge_nodes(id) on delete cascade,
  primary key (question_id, node_id)
);

create table user_question_progress (
  user_id uuid not null references users(id) on delete cascade,
  question_id text not null references interview_questions(id) on delete cascade,
  status text not null default 'new',
  notes_md text,
  last_reviewed_at timestamptz,
  next_review_at timestamptz,
  primary key (user_id, question_id)
);

create table user_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  knowledge_node_id text references knowledge_nodes(id) on delete set null,
  title text not null,
  description_md text,
  status text not null default 'todo',
  priority text not null default 'medium',
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table companies (
  id text primary key,
  name text not null,
  normalized_name text not null,
  logo_url text,
  hh_url text,
  source text not null default 'hh',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table areas (
  id text primary key,
  name text not null,
  parent_id text references areas(id)
);

create table roles (
  id text primary key,
  name text not null,
  aliases text[] not null default '{}'
);

create table skills (
  id text primary key,
  name text not null,
  normalized_name text not null unique,
  category text,
  aliases text[] not null default '{}',
  keywords text[] not null default '{}',
  market_demand text,
  complexity text,
  interview_weight int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table parser_runs (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  status text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  total_found int not null default 0,
  total_saved int not null default 0,
  error_message text,
  meta jsonb not null default '{}'
);

create table vacancies (
  id text primary key,
  parser_run_id uuid references parser_runs(id) on delete set null,
  company_id text references companies(id) on delete set null,
  area_id text references areas(id) on delete set null,
  title text not null,
  url text not null,
  description_md text,
  published_at timestamptz,
  archived boolean not null default false,
  salary_from int,
  salary_to int,
  salary_currency text,
  source text not null default 'hh',
  raw jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table vacancy_skills (
  vacancy_id text not null references vacancies(id) on delete cascade,
  skill_id text not null references skills(id) on delete cascade,
  confidence numeric(4, 3) not null default 1,
  source text not null default 'parser',
  primary key (vacancy_id, skill_id)
);

create table vacancy_roles (
  vacancy_id text not null references vacancies(id) on delete cascade,
  role_id text not null references roles(id) on delete cascade,
  primary key (vacancy_id, role_id)
);

create table skill_stats (
  id uuid primary key default gen_random_uuid(),
  skill_id text not null references skills(id) on delete cascade,
  vacancies_count int not null,
  companies_count int not null,
  period_from timestamptz,
  period_to timestamptz,
  generated_at timestamptz not null default now()
);

create table company_stats (
  id uuid primary key default gen_random_uuid(),
  company_id text not null references companies(id) on delete cascade,
  vacancies_count int not null,
  top_skills jsonb not null default '[]',
  roles jsonb not null default '{}',
  areas jsonb not null default '{}',
  first_published_at timestamptz,
  last_published_at timestamptz,
  generated_at timestamptz not null default now()
);
