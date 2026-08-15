-- ─── Priori — Supabase Schema ─────────────────────────────────────────────────
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run

-- ─── Tables ───────────────────────────────────────────────────────────────────

create table if not exists action_items (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete cascade not null,
  company_id       text not null,
  company_name     text,
  company_icon     text,
  category_name    text not null,
  owner            text not null,
  deadline         date not null,
  status           text not null default 'open'
                     check (status in ('open', 'in_progress', 'resolved', 'closed')),
  resolution_steps text,
  slack_channel    text,
  slack_message_ts text,
  priority_score   int,
  created_at       timestamptz default now(),
  resolved_at      timestamptz
);

create table if not exists audit_entries (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade not null,
  company_id     text not null,
  company_name   text,
  company_icon   text,
  category_name  text not null,
  decision       text not null
                   check (decision in ('acted_on', 'deprioritized', 'deferred')),
  reasoning      text not null,
  decided_by     text not null,
  priority_score int,
  created_at     timestamptz default now()
);

create table if not exists watchlist (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade not null,
  company_id   text not null,
  company_name text not null,
  company_icon text,
  app_id       text,
  app_store_id text,
  added_at     timestamptz default now(),
  unique (user_id, company_id)
);

create table if not exists alerts (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete cascade not null,
  company_id     text not null,
  company_name   text,
  company_icon   text,
  type           text not null check (type in ('spike', 'new_trend')),
  message        text not null,
  category_name  text,
  change_percent int,
  read           boolean not null default false,
  email_sent     boolean not null default false,
  slack_sent     boolean not null default false,
  created_at     timestamptz default now()
);

create table if not exists snapshots (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users(id) on delete cascade not null,
  company_id          text not null,
  health_score        float not null,
  categories          jsonb not null default '[]',
  review_count        int   not null default 0,
  avg_rating          float,
  source_breakdown    jsonb not null default '{}',
  rating_distribution jsonb not null default '{}',
  sentiment_trend     jsonb not null default '[]',
  ai_summary          jsonb,
  created_at          timestamptz default now()
);

create table if not exists slack_connections (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references auth.users(id) on delete cascade not null unique,
  team_id         text not null,
  team_name       text not null,
  access_token    text not null,
  default_channel text,
  created_at      timestamptz default now()
);

create table if not exists notification_preferences (
  user_id         uuid primary key references auth.users(id) on delete cascade,
  email_enabled   boolean not null default true,
  slack_enabled   boolean not null default true,
  email_address   text,
  alert_frequency text not null default 'instant'
                    check (alert_frequency in ('instant', 'daily_digest'))
);

-- ─── Row Level Security ────────────────────────────────────────────────────────

alter table action_items            enable row level security;
alter table audit_entries           enable row level security;
alter table watchlist               enable row level security;
alter table alerts                  enable row level security;
alter table snapshots               enable row level security;
alter table slack_connections       enable row level security;
alter table notification_preferences enable row level security;

-- Users can only see and modify their own rows
create policy "own action_items"             on action_items             for all using (auth.uid() = user_id);
create policy "own audit_entries"            on audit_entries            for all using (auth.uid() = user_id);
create policy "own watchlist"                on watchlist                for all using (auth.uid() = user_id);
create policy "own alerts"                   on alerts                   for all using (auth.uid() = user_id);
create policy "own snapshots"                on snapshots                for all using (auth.uid() = user_id);
create policy "own slack_connections"        on slack_connections        for all using (auth.uid() = user_id);
create policy "own notification_preferences" on notification_preferences for all using (auth.uid() = user_id);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

create index if not exists action_items_user_id_idx   on action_items   (user_id);
create index if not exists action_items_company_idx   on action_items   (user_id, company_id);
create index if not exists audit_entries_user_id_idx  on audit_entries  (user_id);
create index if not exists watchlist_user_id_idx      on watchlist      (user_id);
create index if not exists alerts_user_id_unread_idx  on alerts         (user_id, read);
create index if not exists snapshots_company_idx      on snapshots      (user_id, company_id, created_at desc);
