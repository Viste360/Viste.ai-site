-- The nutrition API uses the signed-in user's JWT so database RLS remains the
-- final authorization boundary. A user can only append messages to their own
-- private transcript; updates and deletes remain unavailable.

grant insert on public.nutrition_messages to authenticated;

drop policy if exists nutrition_messages_insert_own on public.nutrition_messages;
create policy nutrition_messages_insert_own on public.nutrition_messages
for insert to authenticated
with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);
