create extension if not exists pgcrypto;

create table if not exists channels (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  telegram_chat_id text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists tracking_events (
  id uuid primary key default gen_random_uuid(),
  channel_slug text not null,
  event_name text not null check (event_name in ('page_view','join_click','telegram_open','join_request','member_joined','member_left')),
  event_id text,
  telegram_user_id text,
  telegram_username text,
  invite_link text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  fbclid text,
  fbc text,
  fbp text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists tracking_events_channel_time_idx on tracking_events(channel_slug, created_at desc);
create index if not exists tracking_events_event_name_idx on tracking_events(event_name, created_at desc);

-- Keep tables private. API uses the Supabase service role key server-side.
alter table channels enable row level security;
alter table tracking_events enable row level security;
