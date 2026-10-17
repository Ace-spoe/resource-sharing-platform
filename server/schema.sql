CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() ,
    name TEXT NOT NULL ,
    email TEXT NOT NULL UNIQUE ,
    role TEXT NOT NULL DEFAULT 'user' CHECK ( role IN ('user', 'admin')),
    password TEXT NOT NULL ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE courses (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() ,
    title TEXT NOT NULL ,
    code TEXT NOT NULL UNIQUE ,
    department TEXT NOT NULL ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE resources (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() ,
    title TEXT NOT NULL ,
    description TEXT ,
    course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    uploader_id uuid REFERENCES users(id) ON DELETE SET NULL ,
    file_url TEXT NOT NULL ,
    resource_type TEXT NOT NULL CHECK ( resource_type IN ('past exam' , 'slides' , 'notes' ,'short notes' , 'other')),
    avg_rating NUMERIC(3,2) NOT NULL DEFAULT 0.00 ,
    rating_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE ratings (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid() ,
     resource_id uuid NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
     user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     score SMALLINT NOT NULL CHECK (score BETWEEN 1 AND 5 ),
     review TEXT ,
     created_at TIMESTAMPTZ DEFAULT NOW() , -- TIMESTAMPTZ records UTC offsets properly across distributed environments
     UNIQUE (resource_id , user_id)
);

CREATE TABLE tags (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() ,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE resource_tags (
    resource_id uuid NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    tag_id uuid NOT NULL REFERENCES tags(id) ON DELETE CASCADE ,
    PRIMARY KEY (resource_id , tag_id)
);

