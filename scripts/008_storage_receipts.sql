-- Create bucket (run once in SQL editor as service role)
insert into storage.buckets (id, name, public) values ('receipts', 'receipts', false)
  on conflict (id) do nothing;

-- Allow users to manage files under a folder named by their user_id
create policy "Receipts read own"
  on storage.objects for select
  using (bucket_id = 'receipts' and split_part(name, '/', 1) = auth.uid()::text);

create policy "Receipts write own"
  on storage.objects for insert
  with check (bucket_id = 'receipts' and split_part(name, '/', 1) = auth.uid()::text);

create policy "Receipts update own"
  on storage.objects for update
  using (bucket_id = 'receipts' and split_part(name, '/', 1) = auth.uid()::text)
  with check (bucket_id = 'receipts' and split_part(name, '/', 1) = auth.uid()::text);

create policy "Receipts delete own"
  on storage.objects for delete
  using (bucket_id = 'receipts' and split_part(name, '/', 1) = auth.uid()::text);
