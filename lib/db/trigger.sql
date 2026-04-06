create or replace function update_total_creatives() returns trigger as $$
begin
  if (TG_OP = 'UPDATE') and new.published = 1 and old.published = 0 then
    update users set total_creatives = total_creatives + 1 where id = new.author_id;
  elsif (TG_OP = 'UPDATE') and new.published = 0 and old.published = 1 then
    update users set total_creatives = total_creatives - 1 where id = new.author_id;
  elsif (TG_OP = 'DELETE') and old.published = 1 then
    update users set total_creatives = total_creatives - 1 where id = old.author_id;
  elsif (TG_OP = 'INSERT') and new.published = 1 then
    update users set total_creatives = total_creatives + 1 where id = new.author_id;
  end if;
  return null;
end;
$$ language plpgsql;

create or replace trigger _002_update_total_creatives
after insert or update or delete on creatives 
for each row execute function update_total_creatives();

create or replace function update_total_chapters() returns trigger as $$
begin
  if (TG_OP = 'UPDATE') and new.published = 1 and old.published = 0 then
    update creatives set total_chapters = total_chapters + 1 where id = new.creative_id;
  elsif (TG_OP = 'UPDATE') and new.published = 0 and old.published = 1 then
    update creatives set total_chapters = total_chapters - 1 where id = new.creative_id;
  elsif (TG_OP = 'DELETE') and old.published = 1 then
    update creatives set total_chapters = total_chapters - 1 where id = old.creative_id;
  elsif (TG_OP = 'INSERT') and new.published = 1 then
    update creatives set total_chapters = total_chapters + 1 where id = new.creative_id;
  end if;
  return null;
end;
$$ language plpgsql;

create or replace trigger _002_update_total_chapters
after insert or update or delete on chapters
for each row execute function update_total_chapters();
