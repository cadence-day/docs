drop policy "activities_user_access" on "internal"."activities";

drop policy "activity_categories_admin_policy" on "internal"."activity_categories";

drop policy "activity_categories_select_policy" on "internal"."activity_categories";

drop policy "notes_delete" on "internal"."notes";

drop policy "notes_insert" on "internal"."notes";

drop policy "notes_update" on "internal"."notes";

drop policy "notes_user_access" on "internal"."notes";

drop policy "profiles_update" on "internal"."profiles";

drop policy "profiles_user_access" on "internal"."profiles";

drop policy "states_delete" on "internal"."states";

drop policy "states_insert" on "internal"."states";

drop policy "states_update" on "internal"."states";

drop policy "states_user_access" on "internal"."states";

drop policy "timeslices_delete" on "internal"."timeslices";

drop policy "timeslices_insert" on "internal"."timeslices";

drop policy "timeslices_update" on "internal"."timeslices";

drop policy "timeslices_user_access" on "internal"."timeslices";

drop policy "user_preferences_access" on "internal"."user_preferences";

drop policy "user_preferences_update" on "internal"."user_preferences";

create policy "activities_user_access"
on "internal"."activities"
as permissive
for all
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "activity_categories_admin_policy"
on "internal"."activity_categories"
as permissive
for all
to authenticated
using ((EXISTS ( SELECT 1
   FROM internal.profiles profile
  WHERE ((profile.user_id = ( SELECT auth.uid() AS uid)) AND (profile.role = 'ADMIN'::internal.user_role_enum)))));


create policy "activity_categories_select_policy"
on "internal"."activity_categories"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM internal.profiles profile
  WHERE (profile.user_id = ( SELECT auth.uid() AS uid)))));


create policy "notes_delete"
on "internal"."notes"
as permissive
for delete
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "notes_insert"
on "internal"."notes"
as permissive
for insert
to authenticated
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "notes_update"
on "internal"."notes"
as permissive
for update
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "notes_user_access"
on "internal"."notes"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "profiles_update"
on "internal"."profiles"
as permissive
for update
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "profiles_user_access"
on "internal"."profiles"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "states_delete"
on "internal"."states"
as permissive
for delete
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "states_insert"
on "internal"."states"
as permissive
for insert
to authenticated
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "states_update"
on "internal"."states"
as permissive
for update
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "states_user_access"
on "internal"."states"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "timeslices_delete"
on "internal"."timeslices"
as permissive
for delete
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "timeslices_insert"
on "internal"."timeslices"
as permissive
for insert
to authenticated
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "timeslices_update"
on "internal"."timeslices"
as permissive
for update
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));


create policy "timeslices_user_access"
on "internal"."timeslices"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "user_preferences_access"
on "internal"."user_preferences"
as permissive
for select
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id));


create policy "user_preferences_update"
on "internal"."user_preferences"
as permissive
for update
to authenticated
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));



