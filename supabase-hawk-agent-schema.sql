-- Enable required extensions
create extension if not exists pgcrypto;

-- HAWK Agent sessions table
create table if not exists public.hawk_agent_sessions (
  id bigserial primary key,
  msg_uid text not null,
  instruction_id text not null,
  user_id text not null,
  session_type text not null check (session_type in ('template','agent')),
  agent_status text not null default 'pending' check (agent_status in ('pending','completed','failed','cancelled')),

  -- Timestamps
  agent_start_time timestamptz default now(),
  agent_end_time timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- Template linkage for stats
  template_category text,
  template_index int,

  -- Token usage / performance
  input_tokens int,
  output_tokens int,
  total_tokens int,
  execution_time_ms int,
  memory_usage_mb int,

  -- Payloads
  metadata jsonb default '{}'::jsonb,
  agent_response jsonb,
  error_details jsonb,

  constraint hawk_agent_sessions_msg_uid_unique unique (msg_uid)
);

-- Useful indexes
create index if not exists idx_hawk_sessions_created_at on public.hawk_agent_sessions (created_at desc);
create index if not exists idx_hawk_sessions_status on public.hawk_agent_sessions (agent_status);
create index if not exists idx_hawk_sessions_template on public.hawk_agent_sessions (template_category, template_index);

-- Trigger to maintain updated_at
create or replace function public.set_timestamp_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end$$;

drop trigger if exists tr_hawk_sessions_updated_at on public.hawk_agent_sessions;
create trigger tr_hawk_sessions_updated_at
before update on public.hawk_agent_sessions
for each row execute function public.set_timestamp_updated_at();

-- Errors table (optional but referenced by services)
create table if not exists public.hawk_agent_errors (
  id bigserial primary key,
  session_id bigint not null references public.hawk_agent_sessions(id) on delete cascade,
  error_type text not null,
  error_message text not null,
  retry_count int default 0,
  created_at timestamptz default now()
);

create index if not exists idx_hawk_errors_session on public.hawk_agent_errors (session_id);

-- Minimal entity master table used by Entity service
create table if not exists public.entity_master (
  entity_id uuid default gen_random_uuid() primary key,
  entity_code text not null,
  entity_name text not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

drop trigger if exists tr_entity_master_updated_at on public.entity_master;
create trigger tr_entity_master_updated_at
before update on public.entity_master
for each row execute function public.set_timestamp_updated_at();

-- Row Level Security: enable and add permissive policies for anon/dev
alter table public.hawk_agent_sessions enable row level security;
alter table public.hawk_agent_errors enable row level security;
alter table public.entity_master enable row level security;

do $$ begin
  -- Sessions policies
  if not exists (select 1 from pg_policies where tablename='hawk_agent_sessions' and policyname='allow_read_all_sessions') then
    create policy allow_read_all_sessions on public.hawk_agent_sessions for select using (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='hawk_agent_sessions' and policyname='allow_insert_sessions') then
    create policy allow_insert_sessions on public.hawk_agent_sessions for insert with check (true);
  end if;
  if not exists (select 1 from pg_policies where tablename='hawk_agent_sessions' and policyname='allow_update_sessions') then
    create policy allow_update_sessions on public.hawk_agent_sessions for update using (true);
  end if;

  -- Errors policies
  if not exists (select 1 from pg_policies where tablename='hawk_agent_errors' and policyname='allow_rw_errors') then
    create policy allow_rw_errors on public.hawk_agent_errors for all using (true) with check (true);
  end if;

  -- Entity policies
  if not exists (select 1 from pg_policies where tablename='entity_master' and policyname='allow_rw_entity') then
    create policy allow_rw_entity on public.entity_master for all using (true) with check (true);
  end if;
end $$;

comment on table public.hawk_agent_sessions is 'Sessions for HAWK Agent Template/Agent actions with usage and result payloads';
comment on table public.hawk_agent_errors is 'Error records tied to sessions';
comment on table public.entity_master is 'Minimal entity master used by configuration';

