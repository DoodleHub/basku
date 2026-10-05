-- Grocery lists, grocery items and recipes, each owned by one user.

create table public.grocery_lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 200),
  created_at timestamptz not null default clock_timestamp(),
  -- Target for the composite FK below, so items always share their list's owner.
  unique (id, user_id)
);

create index grocery_lists_user_id_created_at_idx
  on public.grocery_lists (user_id, created_at);

create table public.grocery_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 200),
  quantity text not null default '' check (char_length(quantity) <= 100),
  checked boolean not null default false,
  -- clock_timestamp() keeps rows from one bulk insert in insertion order.
  created_at timestamptz not null default clock_timestamp(),
  foreign key (list_id, user_id)
    references public.grocery_lists (id, user_id) on delete cascade
);

create index grocery_items_list_id_user_id_created_at_idx
  on public.grocery_items (list_id, user_id, created_at);
create index grocery_items_user_id_idx on public.grocery_items (user_id);

create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 200),
  minutes integer not null default 0 check (minutes between 0 and 10000),
  image_url text check (char_length(image_url) <= 2048),
  instructions text not null default '' check (char_length(instructions) <= 20000),
  -- [{ id, name, quantity }]; always read and written with the recipe.
  ingredients jsonb not null default '[]'::jsonb
    check (jsonb_typeof(ingredients) = 'array'),
  created_at timestamptz not null default clock_timestamp()
);

create index recipes_user_id_created_at_idx
  on public.recipes (user_id, created_at);

-- Row level security: each user sees and changes only their own rows.

alter table public.grocery_lists enable row level security;
alter table public.grocery_items enable row level security;
alter table public.recipes enable row level security;

create policy "Owners can read grocery lists" on public.grocery_lists
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Owners can create grocery lists" on public.grocery_lists
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Owners can update grocery lists" on public.grocery_lists
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Owners can delete grocery lists" on public.grocery_lists
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Owners can read grocery items" on public.grocery_items
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Owners can create grocery items" on public.grocery_items
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Owners can update grocery items" on public.grocery_items
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Owners can delete grocery items" on public.grocery_items
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Owners can read recipes" on public.recipes
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Owners can create recipes" on public.recipes
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Owners can update recipes" on public.recipes
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "Owners can delete recipes" on public.recipes
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Data API access: signed-in users only.

revoke all on public.grocery_lists, public.grocery_items, public.recipes from anon;
grant select, insert, update, delete
  on public.grocery_lists, public.grocery_items, public.recipes to authenticated;

-- Recipe photos. Public-read bucket (paths are random UUIDs); writes are
-- limited to the uploader's own "<user id>/" folder.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('recipe-images', 'recipe-images', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp']);

create policy "Owners can read recipe images" on storage.objects
  for select to authenticated
  using (bucket_id = 'recipe-images'
         and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Owners can upload recipe images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'recipe-images'
              and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Owners can update recipe images" on storage.objects
  for update to authenticated
  using (bucket_id = 'recipe-images'
         and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'recipe-images'
              and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Owners can delete recipe images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'recipe-images'
         and (storage.foldername(name))[1] = (select auth.uid())::text);
