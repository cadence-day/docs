drop trigger if exists "trigger_log_note_interaction" on "internal"."notes";

drop trigger if exists "trigger_log_state_interaction" on "internal"."states";

drop trigger if exists "trigger_log_timeslice_interaction" on "internal"."timeslices";

alter table "internal"."timeslices" drop constraint "timeslices_state_id_fkey";

alter table "internal"."timeslices" add constraint "timeslices_state_id_fkey" FOREIGN KEY (state_id) REFERENCES internal.states(id) ON UPDATE CASCADE ON DELETE CASCADE;

alter table "internal"."timeslices" validate constraint "timeslices_state_id_fkey";
