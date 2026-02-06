-- Create the story_posts table
CREATE TABLE IF NOT EXISTS story_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_email TEXT NOT NULL,
  author_username TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE story_posts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all posts
CREATE POLICY "Users can view all story posts"
  ON story_posts FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert their own posts
CREATE POLICY "Users can insert their own posts"
  ON story_posts FOR INSERT
  WITH CHECK (auth.email() = author_email);

-- Policy: Users can update their own posts
CREATE POLICY "Users can update their own posts"
  ON story_posts FOR UPDATE
  USING (auth.email() = author_email);

-- Policy: Users can delete their own posts
CREATE POLICY "Users can delete their own posts"
  ON story_posts FOR DELETE
  USING (auth.email() = author_email);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_story_posts_created_at ON story_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_story_posts_author_email ON story_posts(author_email);
