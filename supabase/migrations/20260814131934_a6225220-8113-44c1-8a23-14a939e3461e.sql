-- 1. Lock down rooms: no direct Data API access
DROP POLICY IF EXISTS "Anyone can create a room" ON public.rooms;
DROP POLICY IF EXISTS "Anyone can look up rooms" ON public.rooms;
DROP POLICY IF EXISTS "Waiting rooms can be joined" ON public.rooms;
REVOKE ALL ON public.rooms FROM anon;
REVOKE ALL ON public.rooms FROM authenticated;
GRANT ALL ON public.rooms TO service_role;

-- 2. Capsules
CREATE TABLE IF NOT EXISTS public.capsules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  sender_device text NOT NULL,
  sender_name text,
  photo_url text,
  caption text NOT NULL DEFAULT '',
  note text NOT NULL DEFAULT '',
  voice_url text,
  voice_seconds integer,
  opened_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS capsules_room_idx ON public.capsules(room_id, created_at DESC);
GRANT ALL ON public.capsules TO service_role;
ALTER TABLE public.capsules ENABLE ROW LEVEL SECURITY;
-- no anon/authenticated policies: access only through the verified functions below

-- 3. Content-free realtime signal table
CREATE TABLE IF NOT EXISTS public.capsule_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  sender_device text NOT NULL,
  kind text NOT NULL DEFAULT 'capsule',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.capsule_events TO anon;
GRANT SELECT ON public.capsule_events TO authenticated;
GRANT ALL ON public.capsule_events TO service_role;
ALTER TABLE public.capsule_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signals are readable" ON public.capsule_events
  FOR SELECT TO anon, authenticated USING (true);
ALTER TABLE public.capsule_events REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.capsule_events;

-- 4. Push subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  device_id text NOT NULL,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.push_subscriptions TO service_role;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- 5. Membership helper
CREATE OR REPLACE FUNCTION public.fold_is_member(p_room uuid, p_device text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.rooms r
    WHERE r.id = p_room AND (r.host_device = p_device OR r.guest_device = p_device)
  );
$$;

-- 6. Room lifecycle
CREATE OR REPLACE FUNCTION public.fold_create_room(p_device text, p_name text)
RETURNS public.rooms LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_code text;
  v_room public.rooms;
  v_alphabet text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  i integer;
BEGIN
  FOR attempt IN 1..12 LOOP
    v_code := 'FOLD-';
    FOR i IN 1..4 LOOP
      v_code := v_code || substr(v_alphabet, 1 + floor(random() * length(v_alphabet))::int, 1);
    END LOOP;
    BEGIN
      INSERT INTO public.rooms (code, status, host_device, host_name)
      VALUES (v_code, 'waiting', p_device, nullif(btrim(p_name), ''))
      RETURNING * INTO v_room;
      RETURN v_room;
    EXCEPTION WHEN unique_violation THEN
      NULL;
    END;
  END LOOP;
  RAISE EXCEPTION 'Could not generate a free Soul Code. Please try again.';
END;
$$;

CREATE OR REPLACE FUNCTION public.fold_join_room(p_code text, p_device text, p_name text)
RETURNS public.rooms LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_room public.rooms;
BEGIN
  SELECT * INTO v_room FROM public.rooms WHERE code = upper(btrim(p_code));
  IF v_room.id IS NULL THEN
    RAISE EXCEPTION 'No room found with that Soul Code.';
  END IF;
  IF v_room.host_device = p_device OR v_room.guest_device = p_device THEN
    RETURN v_room;
  END IF;
  IF v_room.status <> 'waiting' THEN
    RAISE EXCEPTION 'That room is already paired.';
  END IF;
  UPDATE public.rooms
     SET status = 'paired', guest_device = p_device,
         guest_name = nullif(btrim(p_name), ''), paired_at = now()
   WHERE id = v_room.id AND status = 'waiting'
   RETURNING * INTO v_room;
  IF v_room.id IS NULL THEN
    RAISE EXCEPTION 'Someone just took that room.';
  END IF;
  RETURN v_room;
END;
$$;

CREATE OR REPLACE FUNCTION public.fold_get_room(p_id uuid, p_device text)
RETURNS public.rooms LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.* FROM public.rooms r
  WHERE r.id = p_id AND (r.host_device = p_device OR r.guest_device = p_device);
$$;

-- 7. Capsule access
CREATE OR REPLACE FUNCTION public.fold_send_capsule(
  p_room uuid, p_device text, p_name text, p_photo text, p_caption text,
  p_note text, p_voice text, p_voice_seconds integer
) RETURNS public.capsules LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_capsule public.capsules;
BEGIN
  IF NOT public.fold_is_member(p_room, p_device) THEN
    RAISE EXCEPTION 'You are not part of this room.';
  END IF;
  INSERT INTO public.capsules (room_id, sender_device, sender_name, photo_url, caption, note, voice_url, voice_seconds)
  VALUES (p_room, p_device, nullif(btrim(coalesce(p_name, '')), ''), p_photo,
          coalesce(p_caption, ''), coalesce(p_note, ''), p_voice, p_voice_seconds)
  RETURNING * INTO v_capsule;
  INSERT INTO public.capsule_events (room_id, sender_device) VALUES (p_room, p_device);
  RETURN v_capsule;
END;
$$;

CREATE OR REPLACE FUNCTION public.fold_list_capsules(p_room uuid, p_device text)
RETURNS SETOF public.capsules LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.fold_is_member(p_room, p_device) THEN
    RAISE EXCEPTION 'You are not part of this room.';
  END IF;
  RETURN QUERY SELECT * FROM public.capsules c WHERE c.room_id = p_room ORDER BY c.created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.fold_mark_opened(p_id uuid, p_device text)
RETURNS public.capsules LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_capsule public.capsules;
BEGIN
  SELECT * INTO v_capsule FROM public.capsules WHERE id = p_id;
  IF v_capsule.id IS NULL OR NOT public.fold_is_member(v_capsule.room_id, p_device) THEN
    RAISE EXCEPTION 'You are not part of this room.';
  END IF;
  UPDATE public.capsules SET opened_at = coalesce(opened_at, now()), updated_at = now()
   WHERE id = p_id RETURNING * INTO v_capsule;
  RETURN v_capsule;
END;
$$;

-- 8. Push subscription storage
CREATE OR REPLACE FUNCTION public.fold_save_push_subscription(
  p_room uuid, p_device text, p_endpoint text, p_p256dh text, p_auth text
) RETURNS void LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.fold_is_member(p_room, p_device) THEN
    RAISE EXCEPTION 'You are not part of this room.';
  END IF;
  INSERT INTO public.push_subscriptions (room_id, device_id, endpoint, p256dh, auth)
  VALUES (p_room, p_device, p_endpoint, p_p256dh, p_auth)
  ON CONFLICT (endpoint) DO UPDATE
    SET room_id = EXCLUDED.room_id, device_id = EXCLUDED.device_id,
        p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth;
END;
$$;

GRANT EXECUTE ON FUNCTION public.fold_create_room(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fold_join_room(text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fold_get_room(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fold_send_capsule(uuid, text, text, text, text, text, text, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fold_list_capsules(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fold_mark_opened(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fold_save_push_subscription(uuid, text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fold_is_member(uuid, text) TO anon, authenticated;