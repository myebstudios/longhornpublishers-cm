-- Inbox mirrors future verified Netlify events; existing form records are untouched.
CREATE TABLE form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  netlify_id text NOT NULL UNIQUE,
  form_name text NOT NULL CHECK (form_name IN ('contact', 'newsletter')),
  name text, email text, organisation text, phone text, project_type text,
  languages text, stage text, message text,
  data jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'archived')),
  created_at timestamptz NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX form_submissions_filter_idx ON form_submissions (form_name, status, created_at DESC, id DESC);
CREATE INDEX form_submissions_received_idx ON form_submissions (created_at DESC, id DESC);
CREATE INDEX form_submissions_new_idx ON form_submissions (form_name) WHERE status = 'new';
