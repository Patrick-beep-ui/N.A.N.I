-- N.A.N.I.: baseline compatible with prisma/schema.prisma at d461d8593c2b8d5553034b0cb450c140a22bef28.
-- Applied to the existing empty hosted project; no Supabase-managed tables are changed.
CREATE TYPE public."MemoryKind" AS ENUM ('FACT','PREFERENCE','PRINCIPLE','GOAL','KNOWLEDGE');
CREATE TYPE public."MemoryScope" AS ENUM ('PERSONAL','PROJECT','DEVICE');
CREATE TYPE public."MemoryCertainty" AS ENUM ('EXPLICIT','INFERRED');
CREATE TYPE public."MemoryStatus" AS ENUM ('CANDIDATE','ACTIVE','SUPERSEDED','REJECTED','DELETED');
CREATE TYPE public."MemorySource" AS ENUM ('USER_STATEMENT','OBSERVED_RESULT','IMPORTED');
CREATE TYPE public."MemorySensitivity" AS ENUM ('PUBLIC','INTERNAL','SENSITIVE','RESTRICTED');
CREATE TYPE public."ChangeOperation" AS ENUM ('CREATE','REVISE','REJECT','FORGET');
CREATE TYPE public."ChangeStatus" AS ENUM ('PENDING','APPLIED','CONFLICT','FAILED');

CREATE TABLE public.profiles (
  user_id UUID NOT NULL,
  display_name TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'es',
  timezone TEXT NOT NULL,
  context_revision INTEGER NOT NULL DEFAULT 1,
  current_summary TEXT,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL,
  CONSTRAINT profiles_pkey PRIMARY KEY (user_id)
);

CREATE TABLE public.personal_memories (
  id UUID NOT NULL,
  user_id UUID NOT NULL,
  kind public."MemoryKind" NOT NULL,
  topic_key TEXT NOT NULL,
  scope public."MemoryScope" NOT NULL,
  scope_ref TEXT,
  subject TEXT NOT NULL,
  current_revision_id UUID,
  deleted_at TIMESTAMP(3),
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL,
  CONSTRAINT personal_memories_pkey PRIMARY KEY (id)
);

CREATE TABLE public.memory_revisions (
  id UUID NOT NULL,
  memory_id UUID NOT NULL,
  revision INTEGER NOT NULL,
  content TEXT NOT NULL,
  certainty public."MemoryCertainty" NOT NULL,
  status public."MemoryStatus" NOT NULL,
  source public."MemorySource" NOT NULL,
  sensitivity public."MemorySensitivity" NOT NULL DEFAULT 'INTERNAL',
  exposure TEXT[] DEFAULT ARRAY[]::TEXT[],
  valid_from TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  valid_to TIMESTAMP(3),
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT memory_revisions_pkey PRIMARY KEY (id)
);

CREATE TABLE public.memory_evidence (
  id UUID NOT NULL,
  revision_id UUID NOT NULL,
  source_type TEXT NOT NULL,
  source_ref TEXT NOT NULL,
  excerpt TEXT,
  content_hash TEXT,
  observed_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT memory_evidence_pkey PRIMARY KEY (id)
);

CREATE TABLE public.memory_changes (
  change_id UUID NOT NULL,
  user_id UUID NOT NULL,
  run_id UUID,
  operation public."ChangeOperation" NOT NULL,
  memory_id UUID,
  expected_revision INTEGER,
  status public."ChangeStatus" NOT NULL,
  result JSONB,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  applied_at TIMESTAMP(3),
  CONSTRAINT memory_changes_pkey PRIMARY KEY (change_id)
);

CREATE TABLE public.devices (
  id UUID NOT NULL,
  user_id UUID NOT NULL,
  canonical_key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  capabilities JSONB NOT NULL,
  last_seen_at TIMESTAMP(3),
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL,
  CONSTRAINT devices_pkey PRIMARY KEY (id)
);

CREATE TABLE public.projects (
  id UUID NOT NULL,
  user_id UUID NOT NULL,
  canonical_key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  remote_url TEXT,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL,
  CONSTRAINT projects_pkey PRIMARY KEY (id)
);

CREATE UNIQUE INDEX personal_memories_current_revision_id_key ON public.personal_memories(current_revision_id);
CREATE UNIQUE INDEX personal_memories_user_id_topic_key_scope_scope_ref_key ON public.personal_memories(user_id,topic_key,scope,scope_ref);
CREATE INDEX personal_memories_user_id_scope_scope_ref_idx ON public.personal_memories(user_id,scope,scope_ref);
CREATE UNIQUE INDEX memory_revisions_memory_id_revision_key ON public.memory_revisions(memory_id,revision);
CREATE INDEX memory_revisions_memory_id_status_idx ON public.memory_revisions(memory_id,status);
CREATE INDEX memory_evidence_revision_id_idx ON public.memory_evidence(revision_id);
CREATE INDEX memory_changes_user_id_created_at_idx ON public.memory_changes(user_id,created_at);
CREATE UNIQUE INDEX devices_user_id_canonical_key_key ON public.devices(user_id,canonical_key);
CREATE UNIQUE INDEX projects_user_id_canonical_key_key ON public.projects(user_id,canonical_key);

ALTER TABLE public.personal_memories ADD CONSTRAINT personal_memories_user_id_fkey FOREIGN KEY(user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE public.personal_memories ADD CONSTRAINT personal_memories_current_revision_id_fkey FOREIGN KEY(current_revision_id) REFERENCES public.memory_revisions(id) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE public.memory_revisions ADD CONSTRAINT memory_revisions_memory_id_fkey FOREIGN KEY(memory_id) REFERENCES public.personal_memories(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE public.memory_evidence ADD CONSTRAINT memory_evidence_revision_id_fkey FOREIGN KEY(revision_id) REFERENCES public.memory_revisions(id) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE public.memory_changes ADD CONSTRAINT memory_changes_user_id_fkey FOREIGN KEY(user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE ON UPDATE CASCADE;

-- Supplemental integrity: a nullable scope_ref must not permit duplicate personal topics.
CREATE UNIQUE INDEX personal_memories_null_scope_topic_key ON public.personal_memories(user_id,topic_key,scope) WHERE scope_ref IS NULL;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_context_revision_positive CHECK(context_revision >= 1);
ALTER TABLE public.memory_revisions ADD CONSTRAINT memory_revisions_revision_positive CHECK(revision >= 1);
ALTER TABLE public.memory_revisions ADD CONSTRAINT memory_revisions_valid_period CHECK(valid_to IS NULL OR valid_to >= valid_from);
ALTER TABLE public.personal_memories ADD CONSTRAINT personal_memories_scope_reference CHECK (
  (scope = 'PERSONAL' AND scope_ref IS NULL) OR
  (scope IN ('PROJECT','DEVICE') AND scope_ref IS NOT NULL AND length(btrim(scope_ref)) > 0)
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memory_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Application writes are server-side via Prisma. No browser role may mutate memories.
REVOKE ALL ON TABLE public.profiles,public.personal_memories,public.memory_revisions,public.memory_evidence,public.memory_changes,public.devices,public.projects FROM PUBLIC,anon,authenticated;
GRANT SELECT ON TABLE public.profiles,public.personal_memories,public.memory_revisions,public.memory_evidence,public.memory_changes,public.devices,public.projects TO authenticated;
GRANT ALL ON TABLE public.profiles,public.personal_memories,public.memory_revisions,public.memory_evidence,public.memory_changes,public.devices,public.projects TO service_role;
GRANT USAGE ON SCHEMA public TO authenticated;

CREATE POLICY profiles_owner_read ON public.profiles FOR SELECT TO authenticated USING(user_id = (SELECT auth.uid()));
CREATE POLICY personal_memories_owner_read ON public.personal_memories FOR SELECT TO authenticated USING(user_id = (SELECT auth.uid()));
CREATE POLICY memory_changes_owner_read ON public.memory_changes FOR SELECT TO authenticated USING(user_id = (SELECT auth.uid()));
CREATE POLICY devices_owner_read ON public.devices FOR SELECT TO authenticated USING(user_id = (SELECT auth.uid()));
CREATE POLICY projects_owner_read ON public.projects FOR SELECT TO authenticated USING(user_id = (SELECT auth.uid()));
CREATE POLICY memory_revisions_owner_read ON public.memory_revisions FOR SELECT TO authenticated USING (
  EXISTS(SELECT 1 FROM public.personal_memories m WHERE m.id = memory_revisions.memory_id AND m.user_id = (SELECT auth.uid()))
);
CREATE POLICY memory_evidence_owner_read ON public.memory_evidence FOR SELECT TO authenticated USING (
  EXISTS(SELECT 1 FROM public.memory_revisions r JOIN public.personal_memories m ON m.id = r.memory_id
    WHERE r.id = memory_evidence.revision_id AND m.user_id = (SELECT auth.uid()))
);
