-- ============================================================
-- Migrasi: sistem review + voucher (jalankan di Supabase SQL Editor)
-- ============================================================

-- 1. Kolom has_reviewed di orders, untuk cegah 1 invoice review berkali-kali.
--    Dicek server-side di /api/review, BUKAN localStorage.
alter table orders
  add column if not exists has_reviewed boolean not null default false;

-- 1b. Kolom buat catat voucher yang dipakai di order ini (kalau ada).
alter table orders
  add column if not exists voucher_code text,
  add column if not exists voucher_discount integer;

-- 2. Tabel reviews — ulasan asli dari pembeli (bukan mock lagi).
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  invoice_id text not null references orders(invoice_id) on delete cascade,
  game_id text not null,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  display_name text not null,
  created_at timestamptz not null default now()
);
create index if not exists reviews_game_id_idx on reviews (game_id, created_at desc);

-- 3. Tabel vouchers — reward diskon dari review (skema tiered yang udah dihitung).
create table if not exists vouchers (
  code text primary key,
  amount integer not null,
  source_invoice_id text not null references orders(invoice_id),
  used boolean not null default false,
  used_invoice_id text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days')
);

-- 4. Enable RLS di tabel baru. Nggak perlu bikin policy apa pun karena semua
--    akses lewat API route pakai SUPABASE_SERVICE_ROLE_KEY (otomatis bypass RLS).
--    Ini cuma jaring pengaman kalau suatu saat ada yang query dari client pakai anon key.
alter table reviews enable row level security;
alter table vouchers enable row level security;
