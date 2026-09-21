-- BAHA TRACKER initial production schema
create extension if not exists pgcrypto;

create type public.app_role as enum ('user','responder','admin');
create type public.flood_depth as enum ('none','ankle','calf','knee','waist','chest','unknown');
create type public.verification_status as enum ('unverified','verified','disputed','flagged');
create type public.sos_status as enum ('pending','received','acknowledged','responding','resolved','cancelled');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '' check (char_length(full_name) <= 100),
  phone text check (phone is null or char_length(phone) <= 30),
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.vehicle_types (
  id uuid primary key default gen_random_uuid(), slug text not null unique,
  name text not null, description text, active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.passability_rules (
  id uuid primary key default gen_random_uuid(),
  vehicle_type_id uuid not null references public.vehicle_types(id) on delete cascade,
  caution_depth public.flood_depth not null, max_depth public.flood_depth not null,
  explanation text not null default 'Avoid moving water and follow official road closures.',
  active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(vehicle_type_id)
);

create table public.flood_reports (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  location_name text not null check (char_length(location_name) between 2 and 160),
  depth public.flood_depth not null, description text check (description is null or char_length(description) <= 1000),
  photo_path text, observed_at timestamptz not null,
  verification_status public.verification_status not null default 'unverified',
  is_public boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  check (observed_at <= now() + interval '5 minutes'),
  check (photo_path is null or photo_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|png|webp)$')
);

create table public.report_verifications (
  id uuid primary key default gen_random_uuid(), report_id uuid not null references public.flood_reports(id) on delete cascade,
  verifier_id uuid not null references public.profiles(id) on delete cascade,
  status public.verification_status not null, note text check (note is null or char_length(note) <= 500),
  created_at timestamptz not null default now(), unique(report_id,verifier_id)
);

create table public.sos_alerts (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  latitude double precision check (latitude is null or latitude between -90 and 90),
  longitude double precision check (longitude is null or longitude between -180 and 180),
  emergency_type text not null check (emergency_type in ('medical','stranded','flood_rescue','evacuation','vehicle_breakdown','other')),
  immediate_needs text[] not null default '{}', description text check (description is null or char_length(description) <= 1000),
  status public.sos_status not null default 'pending', assigned_responder_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), resolved_at timestamptz,
  check ((latitude is null) = (longitude is null))
);

create table public.sos_status_history (
  id uuid primary key default gen_random_uuid(), alert_id uuid not null references public.sos_alerts(id) on delete cascade,
  from_status public.sos_status, to_status public.sos_status not null,
  changed_by uuid references public.profiles(id) on delete set null,
  note text check (note is null or char_length(note) <= 500), created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) <= 120), body text not null check (char_length(body) <= 500),
  type text not null default 'system', entity_id uuid, read_at timestamptz, created_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key, actor_id uuid references public.profiles(id) on delete set null,
  action text not null, entity_type text not null, entity_id uuid, metadata jsonb not null default '{}',
  ip_hash text, created_at timestamptz not null default now()
);

create index flood_reports_map_idx on public.flood_reports(observed_at desc) where is_public = true;
create index flood_reports_geo_idx on public.flood_reports(latitude,longitude);
create index flood_reports_user_idx on public.flood_reports(user_id,created_at desc);
create index sos_alerts_active_idx on public.sos_alerts(status,created_at) where status not in ('resolved','cancelled');
create index sos_alerts_user_idx on public.sos_alerts(user_id,created_at desc);
create index notifications_user_idx on public.notifications(user_id,created_at desc);
create index audit_logs_created_idx on public.audit_logs(created_at desc);

create or replace function public.set_updated_at() returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at = now(); return new; end $$;
create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger rules_updated before update on public.passability_rules for each row execute function public.set_updated_at();
create trigger reports_updated before update on public.flood_reports for each row execute function public.set_updated_at();
create trigger sos_updated before update on public.sos_alerts for each row execute function public.set_updated_at();

create or replace function public.current_role() returns public.app_role language sql stable security definer set search_path = '' as $$
  select role from public.profiles where id = auth.uid()
$$;
revoke all on function public.current_role() from public;
grant execute on function public.current_role() to authenticated, anon;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin insert into public.profiles(id,full_name) values(new.id,coalesce(new.raw_user_meta_data->>'full_name','')); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.protect_profile_role() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if old.role is distinct from new.role and public.current_role() <> 'admin' then raise exception 'Only administrators may assign roles'; end if;
  return new;
end $$;
create trigger protect_role before update on public.profiles for each row execute function public.protect_profile_role();

create or replace function public.guard_report_frequency() returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if exists(select 1 from public.flood_reports where user_id=new.user_id and created_at>now()-interval '2 minutes') then raise exception 'A recent flood report already exists'; end if;
  return new;
end $$;
create trigger report_frequency before insert on public.flood_reports for each row execute function public.guard_report_frequency();

create or replace function public.protect_report_moderation() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if public.current_role() <> 'admin' then
    new.verification_status = old.verification_status;
    new.is_public = old.is_public;
    new.user_id = old.user_id;
  end if;
  return new;
end $$;
create trigger protect_report_fields before update on public.flood_reports for each row execute function public.protect_report_moderation();

create or replace function public.guard_sos_frequency() returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if exists(select 1 from public.sos_alerts where user_id=new.user_id and created_at>now()-interval '1 minute') then raise exception 'A recent SOS alert already exists'; end if;
  return new;
end $$;
create trigger sos_frequency before insert on public.sos_alerts for each row execute function public.guard_sos_frequency();

create or replace function public.track_sos_status() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_op='INSERT' then
    insert into public.sos_status_history(alert_id,to_status,changed_by) values(new.id,new.status,auth.uid());
  elsif old.status is distinct from new.status then
    insert into public.sos_status_history(alert_id,from_status,to_status,changed_by) values(new.id,old.status,new.status,auth.uid());
    insert into public.notifications(user_id,title,body,type,entity_id) values(new.user_id,'SOS status updated','Your alert is now '||replace(new.status::text,'_',' ')||'.','sos_status',new.id);
  end if; return new;
end $$;
create trigger sos_history after insert or update on public.sos_alerts for each row execute function public.track_sos_status();

create or replace function public.audit_sensitive_change() returns trigger language plpgsql security definer set search_path = '' as $$
declare entity uuid; act text;
begin
 entity=coalesce(new.id,old.id); act=lower(tg_op)||'_'||tg_table_name;
 insert into public.audit_logs(actor_id,action,entity_type,entity_id,metadata) values(auth.uid(),act,tg_table_name,entity,'{}');
 return coalesce(new,old);
end $$;
create trigger audit_reports after update or delete on public.flood_reports for each row execute function public.audit_sensitive_change();
create trigger audit_profiles after update on public.profiles for each row execute function public.audit_sensitive_change();
create trigger audit_rules after update on public.passability_rules for each row execute function public.audit_sensitive_change();

alter table public.profiles enable row level security;
alter table public.vehicle_types enable row level security;
alter table public.passability_rules enable row level security;
alter table public.flood_reports enable row level security;
alter table public.report_verifications enable row level security;
alter table public.sos_alerts enable row level security;
alter table public.sos_status_history enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles own read" on public.profiles for select to authenticated using(id=auth.uid() or public.current_role()='admin');
create policy "profiles own update" on public.profiles for update to authenticated using(id=auth.uid() or public.current_role()='admin') with check(id=auth.uid() or public.current_role()='admin');
create policy "vehicle types public read" on public.vehicle_types for select to anon,authenticated using(active or public.current_role()='admin');
create policy "vehicle types admin" on public.vehicle_types for all to authenticated using(public.current_role()='admin') with check(public.current_role()='admin');
create policy "rules public read" on public.passability_rules for select to anon,authenticated using(active or public.current_role()='admin');
create policy "rules admin" on public.passability_rules for all to authenticated using(public.current_role()='admin') with check(public.current_role()='admin');
create policy "public reports read" on public.flood_reports for select to anon,authenticated using((is_public and verification_status<>'flagged') or user_id=auth.uid() or public.current_role() in ('responder','admin'));
create policy "users insert reports" on public.flood_reports for insert to authenticated with check(user_id=auth.uid() and verification_status='unverified');
create policy "users update own reports" on public.flood_reports for update to authenticated using(user_id=auth.uid() or public.current_role()='admin') with check(user_id=auth.uid() or public.current_role()='admin');
create policy "admins delete reports" on public.flood_reports for delete to authenticated using(public.current_role()='admin');
create policy "verification authorized read" on public.report_verifications for select to authenticated using(public.current_role() in ('responder','admin') or exists(select 1 from public.flood_reports r where r.id=report_id and r.user_id=auth.uid()));
create policy "verification responder write" on public.report_verifications for insert to authenticated with check(public.current_role() in ('responder','admin') and verifier_id=auth.uid());
create policy "sos private read" on public.sos_alerts for select to authenticated using(user_id=auth.uid() or public.current_role() in ('responder','admin'));
create policy "users create sos" on public.sos_alerts for insert to authenticated with check(user_id=auth.uid() and status='pending');
create policy "responders update sos" on public.sos_alerts for update to authenticated using(public.current_role() in ('responder','admin')) with check(public.current_role() in ('responder','admin'));
create policy "sos history private read" on public.sos_status_history for select to authenticated using(public.current_role() in ('responder','admin') or exists(select 1 from public.sos_alerts s where s.id=alert_id and s.user_id=auth.uid()));
create policy "notifications own read" on public.notifications for select to authenticated using(user_id=auth.uid() or public.current_role()='admin');
create policy "notifications own update" on public.notifications for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "audit admin read" on public.audit_logs for select to authenticated using(public.current_role()='admin');

insert into public.vehicle_types(slug,name) values ('bicycle','Bicycle'),('motorcycle','Motorcycle'),('tricycle','Tricycle'),('sedan','Sedan'),('suv','SUV'),('jeepney','Jeepney'),('delivery_vehicle','Delivery vehicle'),('other','Other');
insert into public.passability_rules(vehicle_type_id,caution_depth,max_depth,explanation)
select id, case when slug in ('suv','jeepney') then 'calf'::public.flood_depth else 'ankle'::public.flood_depth end,
case when slug in ('suv','jeepney') then 'knee'::public.flood_depth else 'calf'::public.flood_depth end,
'Informational threshold only. Moving water, hidden damage, and changing conditions can make any crossing unsafe.' from public.vehicle_types;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('flood-photos','flood-photos',false,5242880,array['image/jpeg','image/png','image/webp']) on conflict(id) do update set public=false,file_size_limit=5242880,allowed_mime_types=excluded.allowed_mime_types;
create policy "photo owner upload" on storage.objects for insert to authenticated with check(bucket_id='flood-photos' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "photo owner and authorized read" on storage.objects for select to authenticated using(bucket_id='flood-photos' and ((storage.foldername(name))[1]=auth.uid()::text or public.current_role() in ('responder','admin')));
create policy "photo owner delete" on storage.objects for delete to authenticated using(bucket_id='flood-photos' and ((storage.foldername(name))[1]=auth.uid()::text or public.current_role()='admin'));

alter publication supabase_realtime add table public.flood_reports;
alter publication supabase_realtime add table public.sos_alerts;
alter publication supabase_realtime add table public.notifications;

-- Bootstrap the first admin only from the SQL editor after registration:
-- update public.profiles set role='admin' where id=(select id from auth.users where email='you@example.com');
