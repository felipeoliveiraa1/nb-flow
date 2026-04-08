-- NB Flow OS - Schema Inicial
-- Execute no SQL Editor do Supabase

-- 1. Tabela de Perfis das Angels
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  level TEXT DEFAULT 'Iniciante' CHECK (level IN ('Iniciante', 'Pro', 'Elite', 'Master')),
  xp INTEGER DEFAULT 0 CHECK (xp >= 0),
  avatar_url TEXT,
  total_procedures INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Tabela de Logs de Atividades (Para o Ranking)
CREATE TABLE activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ia_analysis', 'shop_purchase', 'photo_shared', 'monthly_goal')),
  xp_gained INTEGER NOT NULL CHECK (xp_gained > 0),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Tabela de Galeria (Antes/Depois)
CREATE TABLE gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  client_name TEXT,
  before_url TEXT NOT NULL,
  after_url TEXT NOT NULL,
  analysis_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Trigger para Atualização de XP e Level Automática
CREATE OR REPLACE FUNCTION update_level_on_xp()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.xp >= 5000 THEN NEW.level := 'Master';
  ELSIF NEW.xp >= 2000 THEN NEW.level := 'Elite';
  ELSIF NEW.xp >= 500 THEN NEW.level := 'Pro';
  ELSE NEW.level := 'Iniciante';
  END IF;
  NEW.updated_at := timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_level
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_level_on_xp();

-- 5. Função para criar perfil automaticamente no signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 6. Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Profiles: usuario ve e edita apenas seu proprio perfil
-- Leitura publica para o ranking
CREATE POLICY "Perfil publico para ranking"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Usuario edita proprio perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Activities: usuario ve apenas suas atividades, insere apenas para si
CREATE POLICY "Ver proprias atividades"
  ON activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Inserir proprias atividades"
  ON activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Gallery: usuario ve e gerencia apenas sua galeria
CREATE POLICY "Ver propria galeria"
  ON gallery FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Inserir na propria galeria"
  ON gallery FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Deletar da propria galeria"
  ON gallery FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Indices para performance
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX idx_gallery_user_id ON gallery(user_id);
CREATE INDEX idx_profiles_xp ON profiles(xp DESC);

-- 8. Storage bucket para fotos
-- Execute isso separadamente no Supabase Dashboard > Storage
-- INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', false);
