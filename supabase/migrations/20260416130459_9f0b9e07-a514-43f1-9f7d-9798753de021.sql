DROP POLICY "Anyone can view product images" ON storage.objects;

CREATE POLICY "Anyone can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images' AND (storage.foldername(name))[1] IS NOT NULL);