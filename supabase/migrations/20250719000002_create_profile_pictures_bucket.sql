-- Create a bucket for profile pictures
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-pictures', 'profile-pictures', false);

-- Enable RLS on the bucket
CREATE POLICY "Users can view their own profile pictures" ON storage.objects
FOR SELECT USING (
    bucket_id = 'profile-pictures' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to upload their own profile pictures
CREATE POLICY "Users can upload their own profile pictures" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'profile-pictures' 
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND (
        -- Allow common image formats
        (storage.extension(name) = 'jpg') OR
        (storage.extension(name) = 'jpeg') OR
        (storage.extension(name) = 'png') OR
        (storage.extension(name) = 'webp')
    )
);

-- Allow users to update their own profile pictures
CREATE POLICY "Users can update their own profile pictures" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'profile-pictures' 
    AND auth.uid()::text = (storage.foldername(name))[1]
) WITH CHECK (
    bucket_id = 'profile-pictures' 
    AND auth.uid()::text = (storage.foldername(name))[1]
    AND (
        -- Allow common image formats
        (storage.extension(name) = 'jpg') OR
        (storage.extension(name) = 'jpeg') OR
        (storage.extension(name) = 'png') OR
        (storage.extension(name) = 'webp')
    )
);

-- Allow users to delete their own profile pictures
CREATE POLICY "Users can delete their own profile pictures" ON storage.objects
FOR DELETE USING (
    bucket_id = 'profile-pictures' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);
