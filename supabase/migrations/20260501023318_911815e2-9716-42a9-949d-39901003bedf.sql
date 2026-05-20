UPDATE auth.users
SET email = 'loiraosjc@hotmail.com',
    raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('email', 'loiraosjc@hotmail.com'),
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    updated_at = now()
WHERE email = 'loiraosjc@gmail.com';