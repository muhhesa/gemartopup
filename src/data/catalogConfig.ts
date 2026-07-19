export type FieldType = 'number' | 'text' | 'dropdown' | 'email';

export interface FieldConfig {
  id: string;
  labelId: string; // Used directly as label for now, or could map to translation keys
  type: FieldType;
  options?: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
}

export interface GameConfig {
  fields: FieldConfig[];
  needsNicknameCheck: boolean;
  guideDesc?: string;
}

const SERVER_OPTIONS = [
  { value: "Asia", label: "Asia" },
  { value: "America", label: "America" },
  { value: "Europe", label: "Europe" },
  { value: "TW,HK,MO", label: "TW,HK,MO" }
];

export const GAME_CONFIGS: Record<string, GameConfig> = {
  // GAME CATEGORY
  "mlbb": {
    fields: [
      { id: "userId", labelId: "User ID", type: "number", required: true },
      { id: "zoneId", labelId: "Zone ID", type: "number", required: true }
    ],
    needsNicknameCheck: true,
    guideDesc: "Untuk mengetahui User ID Anda, silakan klik menu profile dibagian kiri atas pada menu utama game. User ID akan terlihat dibagian bawah Nama Karakter Game Anda. Silakan masukkan User ID Anda untuk menyelesaikan transaksi. Contoh: 12345678(1234)."
  },
  "aov": {
    fields: [
      { id: "userId", labelId: "User ID", type: "number", required: true },
      { id: "zoneId", labelId: "Zone ID / Server", type: "number", required: true }
    ],
    needsNicknameCheck: true,
    guideDesc: "Untuk menemukan User ID Anda, buka menu profil di dalam game. Masukkan User ID tersebut di sini."
  },
  "undawn": {
    fields: [
      { id: "userId", labelId: "User ID", type: "number", required: true },
      { id: "zoneId", labelId: "Server", type: "number", required: true }
    ],
    needsNicknameCheck: true
  },
  "ff": {
    fields: [
      { id: "userId", labelId: "User ID", type: "number", required: true }
    ],
    needsNicknameCheck: true,
    guideDesc: "Untuk menemukan ID Anda, klik pada ikon karakter. User ID tercantum di bawah nama karakter Anda. Contoh: 5363266446."
  },
  "pubg": {
    fields: [
      { id: "userId", labelId: "User ID", type: "number", required: true }
    ],
    needsNicknameCheck: true,
    guideDesc: "Buka game dan masuk ke menu profil. ID Anda berada di bawah nama karakter. Contoh: 5123456789."
  },
  "call-of-duty-mobile": {
    fields: [
      { id: "userId", labelId: "User ID", type: "number", required: true }
    ],
    needsNicknameCheck: true,
    guideDesc: "Buka menu profil di kiri atas. User ID Anda adalah deretan angka panjang di bawah nama karakter."
  },
  "hago": {
    fields: [
      { id: "userId", labelId: "User ID", type: "number", required: true }
    ],
    needsNicknameCheck: true
  },
  "valo": {
    fields: [
      { id: "userId", labelId: "Riot ID", type: "text", placeholder: "Name", required: true },
      { id: "zoneId", labelId: "Tagline", type: "text", placeholder: "#Tag", required: true }
    ],
    needsNicknameCheck: true,
    guideDesc: "Untuk menemukan Riot ID Anda, buka halaman profil akun dan salin Riot ID+Tag menggunakan tombol yang tersedia disamping Riot ID. Contoh: kuropedia#123"
  },
  "point-blank": {
    fields: [
      { id: "userId", labelId: "Username / User ID", type: "text", required: true }
    ],
    needsNicknameCheck: true
  },
  "honkai--star-rail": {
    fields: [
      { id: "userId", labelId: "UID", type: "number", required: true },
      { id: "zoneId", labelId: "Server", type: "dropdown", options: SERVER_OPTIONS, required: true }
    ],
    needsNicknameCheck: true,
    guideDesc: "Masuk ke dalam game. Buka menu handphone. UID Anda tercetak di atas nama karakter."
  },
  "genshin": {
    fields: [
      { id: "userId", labelId: "UID", type: "number", required: true },
      { id: "zoneId", labelId: "Server", type: "dropdown", options: SERVER_OPTIONS, required: true }
    ],
    needsNicknameCheck: true,
    guideDesc: "Buka menu Paimon. UID Anda berada di bawah avatar karakter Anda."
  }
};

export const DEFAULT_CONFIGS: Record<string, GameConfig> = {
  "game": {
    fields: [
      { id: "userId", labelId: "User ID", type: "text", required: true }
    ],
    needsNicknameCheck: true
  },
  "voucher": {
    fields: [
      { id: "userId", labelId: "Email Tujuan (Opsional)", type: "email", required: false }
    ],
    needsNicknameCheck: false
  },
  "pulsa": {
    fields: [
      { id: "userId", labelId: "Nomor HP / ID Pelanggan", type: "number", required: true }
    ],
    needsNicknameCheck: false
  }
};

export const getConfig = (gameId: string, category: string): GameConfig => {
  const specific = GAME_CONFIGS[gameId];
  if (specific) return specific;

  if (gameId === 'vidio') {
    return {
      fields: [
        { id: "userId", labelId: "Nomor HP / Email Akun Vidio", type: "text", required: true }
      ],
      needsNicknameCheck: false
    };
  }

  return DEFAULT_CONFIGS[category] || DEFAULT_CONFIGS["game"];
};
