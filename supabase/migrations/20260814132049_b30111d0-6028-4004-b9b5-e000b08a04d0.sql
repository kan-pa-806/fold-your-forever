CREATE POLICY "Fold media uploads" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'capsule-media');

CREATE POLICY "Fold media reads" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'capsule-media');