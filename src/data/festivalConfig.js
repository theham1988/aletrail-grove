export const festivalTiers = [
  { id: 1, label: "Tier 1", start: 1, end: 10, reward: "Sticker Pack" },
  { id: 2, label: "Tier 2", start: 11, end: 20, reward: "Festival Pin" },
  { id: 3, label: "Tier 3", start: 21, end: 30, reward: "Limited Cup" },
  { id: 4, label: "Tier 4", start: 31, end: 40, reward: "Merch Voucher" },
  { id: 5, label: "Tier 5", start: 41, end: 49, reward: "Grand Finisher Prize" },
];

export const secureFestivalQRCodes = Object.fromEntries(
  Array.from({ length: 49 }, (_, index) => [`RIGFEST-VENDOR-${String(index + 1).padStart(3, "0")}`, index + 1]),
);
