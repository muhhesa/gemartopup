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
    needsNicknameCheck: true
  },
  "aov": {
    fields: [
      { id: "userId", labelId: "User ID", type: "number", required: true },
      { id: "zoneId", labelId: "Zone ID / Server", type: "number", required: true }
    ],
    needsNicknameCheck: true
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
    needsNicknameCheck: true
  },
  "pubg": {
    fields: [
      { id: "userId", labelId: "User ID", type: "number", required: true }
    ],
    needsNicknameCheck: true
  },
  "call-of-duty-mobile": {
    fields: [
      { id: "userId", labelId: "User ID", type: "number", required: true }
    ],
    needsNicknameCheck: true
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
    needsNicknameCheck: true
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
    needsNicknameCheck: true
  },
  "genshin": {
    fields: [
      { id: "userId", labelId: "UID", type: "number", required: true },
      { id: "zoneId", labelId: "Server", type: "dropdown", options: SERVER_OPTIONS, required: true }
    ],
    needsNicknameCheck: true
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
