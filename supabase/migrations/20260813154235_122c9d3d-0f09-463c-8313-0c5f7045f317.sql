CREATE TABLE public.rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'waiting',
  host_device text NOT NULL,
  host_name text,
  guest_device text,
  guest_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  paired_at timestamptz
);

CREATE INDEX rooms_code_idx ON public.rooms (code);

GRANT SELECT, INSERT, UPDATE ON public.rooms TO anon;
GRANT SELECT, INSERT, UPDATE ON public.rooms TO authenticated;
GRANT ALL ON public.rooms TO service_role;

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can look up rooms"
  ON public.rooms FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create a room"
  ON public.rooms FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'waiting' AND guest_device IS NULL);

CREATE POLICY "Waiting rooms can be joined"
  ON public.rooms FOR UPDATE
  TO anon, authenticated
  USING (status = 'waiting')
  WITH CHECK (status IN ('waiting', 'paired'));

ALTER TABLE public.rooms REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;