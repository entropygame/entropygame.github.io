-- Retirer la politique UPDATE permissive
drop policy if exists "Anyone can update their own session by session_id" on public.visit_sessions;

-- Rendre ended_at, duration_ms requis lors d'un seul insert (en gardant nullable pour compat)
-- Pas de changement de structure, juste suppression de la politique update.