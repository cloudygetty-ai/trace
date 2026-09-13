-- The reporter already types a last-seen location and the client already sends
-- it as `last_seen_loc`, but there was nowhere to put it: lost_reports carried
-- only a geography point. Posters and alerts need a human-readable place, so
-- the typed label is persisted alongside the point.
alter table lost_reports add column if not exists last_seen_label text;

comment on column lost_reports.last_seen_label is
  'Free-text place as typed by the reporter ("Riverside Park, Main St"). The geography point stays authoritative for proximity search; this is for display.';
