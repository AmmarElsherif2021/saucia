create table public.user_profiles (
  id uuid not null default auth.uid (),
  display_name text null,
  phone_number text null,
  avatar_url text null,
  is_admin boolean not null default false,
  loyalty_points integer not null default 0,
  notes text null,
  language character(2) not null default 'en'::bpchar,
  age integer null,
  gender text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  last_login timestamp with time zone null,
  email text null default ''::text,
  google_id text null default ''::text,
  account_status text not null default 'active'::text,
  timezone text not null default 'Asia/Riyadh'::text,
  phone_verified boolean not null default false,
  email_verified boolean not null default false,
  profile_completed boolean not null default false,
  constraint user_profiles_pkey primary key (id),
  constraint user_profiles_id_key unique (id),
  constraint user_profiles_age_check check (
    (
      (age > 0)
      and (age < 150)
    )
  ),
  constraint user_profiles_gender_check check (
    (
      gender = any (
        array[
          'male'::text,
          'female'::text,
          'other'::text,
          'prefer_not_to_say'::text
        ]
      )
    )
  ),
  constraint user_profiles_language_check check (
    (
      language = any (array['en'::bpchar, 'ar'::bpchar])
    )
  ),
  constraint user_profiles_loyalty_points_check check ((loyalty_points >= 0))
) TABLESPACE pg_default;

create index IF not exists idx_user_profiles_phone on public.user_profiles using btree (phone_number) TABLESPACE pg_default
where
  (phone_number is not null);

create index IF not exists idx_user_profiles_language on public.user_profiles using btree (language) TABLESPACE pg_default;

create index IF not exists idx_user_profiles_last_login on public.user_profiles using btree (last_login desc) TABLESPACE pg_default;

create index IF not exists idx_user_profiles_email on public.user_profiles using btree (email) TABLESPACE pg_default;

create index IF not exists idx_user_profiles_google_id on public.user_profiles using btree (google_id) TABLESPACE pg_default;

create trigger trigger_update_timestamp_user_profiles BEFORE
update on user_profiles for EACH row
execute FUNCTION update_timestamp ();

# auth.users columns:
UID, Dispaly name, Phone, Phone, Providers, Provider type, Created at, Last sign in at
