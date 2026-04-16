create table if not exists recipes (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  source_url  text,
  source_name text,
  prep_time   text,
  cook_time   text,
  servings    text,
  ingredients jsonb not null default '[]'::jsonb,
  instructions text[] not null default '{}',
  created_at  timestamptz not null default now()
);

-- No RLS needed — single personal user with anon key scoped in env
