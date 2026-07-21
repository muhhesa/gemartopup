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

// Server list persis seperti yang ditampilkan Indoflazz untuk Harry Potter: Magic Awakened
const HP_SERVER_OPTIONS = [
  { value: "Thunderbird", label: "Thunderbird" },
  { value: "Phoenix", label: "不死鳥 (Phoenix)" },
  { value: "Niffler", label: "니플러 (Niffler)" },
  { value: "Ashwinder", label: "Ashwinder" },
  { value: "Sphinx", label: "Sphinx" },
  { value: "Rougarou", label: "Rougarou" },
  { value: "Erumpent", label: "Erumpent" },
  { value: "Unicorn", label: "ユニコーン (Unicorn)" }
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
      { id: "userId", labelId: "User ID", type: "number", required: true }
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
      { id: "userId", labelId: "Nomor WhatsApp", type: "number", required: true }
    ],
    needsNicknameCheck: false,
    guideDesc: "Masukkan nomor WhatsApp Anda. Voucher Cash PB akan dikirim ke nomor tersebut / tercantum di keterangan invoice."
  },
  "harry-potter-magic-awakened": {
    fields: [
      { id: "userId", labelId: "User ID", type: "number", required: true },
      { id: "zoneId", labelId: "Server", type: "dropdown", options: HP_SERVER_OPTIONS, required: true }
    ],
    needsNicknameCheck: true,
    guideDesc: "Untuk menemukan ID Anda, buka Harry Potter: Magic Awakened. Klik pada gambar di sebelah tempat tidur di kamar, Anda akan menemukannya pada kolom User ID. Contoh: 110008785."
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
  // Semua produk voucher di Indoflazz (Spotify, Google Play, Steam, Nintendo, Hotelmurah, dll)
  // dikirim ke Nomor HP/WhatsApp, BUKAN email. Jangan diubah balik ke email.
  "voucher": {
    fields: [
      { id: "userId", labelId: "Nomor HP / WhatsApp", type: "number", required: true }
    ],
    needsNicknameCheck: false
  },
  "pulsa": {
    fields: [
      { id: "userId", labelId: "Nomor HP", type: "number", required: true }
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

  // PLN pakai Nomor Meteran, BUKAN Nomor HP — beda dari produk pulsa lainnya
  if (gameId === 'pln') {
    return {
      fields: [
        { id: "userId", labelId: "Nomor Meteran", type: "number", required: true }
      ],
      needsNicknameCheck: false,
      guideDesc: "Masukkan Nomor Meteran/ID Pelanggan PLN Anda (bukan nomor HP)."
    };
  }

  return DEFAULT_CONFIGS[category] || DEFAULT_CONFIGS["game"];
};
