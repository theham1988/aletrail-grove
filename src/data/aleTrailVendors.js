export const ALE_TRAIL_TOTAL_STAMPS = 6;
export const ALE_TRAIL_MAX_STAMPS_PER_STOP = 2;

function googleMapsQuery(value) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`;
}

export const aleTrailVendors = [
  {
    key: "brewbridge",
    id: 1,
    festivalVendorId: 6,
    qrPayload: "ALETRAIL-BREWBRIDGE",
    name: "Brewbridge",
    shortLabel: "Brew",
    area: "Cherngtalay",
    desc: "A Boat Avenue craft stop with a strong draft list and relaxed Phuket pace.",
    beers: ["Tap Rotation", "Guest IPA", "Guest Sour"],
    maps: googleMapsQuery("49/22 Boat Avenue Cherngtalay Phuket BrewBridge"),
    x: 28,
    y: 38,
  },
  {
    key: "beerfest",
    id: 2,
    festivalVendorId: 7,
    qrPayload: "ALETRAIL-BEERFEST",
    name: "Beerfest",
    shortLabel: "Beerfest",
    area: "Wichit",
    desc: "A Phuket brewery and restaurant stop where one visit can cover dinner and your trail pour.",
    beers: ["House Lager", "IPA", "Seasonal Special"],
    maps: googleMapsQuery("46/6 Moo 5 Wichit Mueang Phuket Beerfest"),
    x: 58,
    y: 84,
  },
  {
    key: "chit-hole",
    id: 3,
    festivalVendorId: 4,
    qrPayload: "ALETRAIL-CHIT-HOLE",
    name: "Chit Hole",
    shortLabel: "Chit Hole",
    area: "Phuket Old Town",
    desc: "A core Phuket craft stop with a recognizable local crowd and on-site beer program.",
    beers: ["Session IPA", "Amber Ale", "House Brew"],
    maps: googleMapsQuery("50/2 Takuapa Road Talat Nuea Phuket Chit Hole"),
    x: 60,
    y: 73,
  },
  {
    key: "chalong-bay-rum",
    id: 4,
    festivalVendorId: 48,
    qrPayload: "ALETRAIL-CHALONG-BAY-RUM",
    name: "Chalong Bay Rum",
    shortLabel: "Chalong Bay",
    area: "Chalong",
    desc: "A Phuket distillery stop that brings a local producer into the Ale Trail alongside the island's beer bars.",
    beers: ["Signature Rum Flight", "Cane Spirit Pour", "Cocktail Feature"],
    maps: googleMapsQuery("14/2 Moo 2 Soi Palai 2 Chalong Phuket Chalong Bay Rum"),
    x: 55,
    y: 101,
  },
  {
    key: "brb",
    id: 5,
    qrPayload: "ALETRAIL-BRB",
    name: "BRB",
    shortLabel: "BRB",
    area: "Chalong",
    desc: "Beer Right Back in Chalong brings rotating craft taps into the southern part of the island.",
    beers: ["Tap Rotation", "Local Guest Pour", "Bottle Fridge Pick"],
    maps: googleMapsQuery("89/9 Chao Fah Tawan Tok Road Chalong Phuket BRB Beer Right Back"),
    x: 53,
    y: 99,
  },
  {
    key: "beer-bank",
    id: 6,
    qrPayload: "ALETRAIL-BEER-BANK",
    name: "Beer Bank",
    shortLabel: "Beer Bank",
    area: "Rawai",
    desc: "A Rawai craft beer cafe with a broad bottle list and enough variety for a second trail stamp.",
    beers: ["Craft Bottle Pick", "Sour Choice", "Dark Beer Choice"],
    maps: googleMapsQuery("28/47 Wiset Road Rawai Phuket Beer Bank"),
    x: 59,
    y: 121,
  },
  {
    key: "crafty-coyote-pub",
    id: 7,
    qrPayload: "ALETRAIL-CRAFTY-COYOTE",
    name: "Crafty Coyote Pub",
    shortLabel: "Coyote",
    area: "Nai Harn / Rawai",
    desc: "A Rawai-side craft pub with 10 taps, strong local variety, and an easy late-night stop.",
    beers: ["Tap Rotation", "Local IPA", "Cider Pick"],
    maps: "https://maps.app.goo.gl/YKqCVE8hiP4gDbNg7",
    x: 49,
    y: 128,
  },
  {
    key: "polly-jen-rawai",
    id: 8,
    qrPayload: "ALETRAIL-POLLY-JEN-RAWAI",
    name: "Polly Jen Rawai",
    shortLabel: "Polly Jen",
    area: "Rawai",
    desc: "A Rawai trail stop reserved for the south-island crowd and sunset sessions.",
    beers: ["House Pour", "Guest Tap", "Cold Can Pick"],
    maps: "https://share.google/CIkNc04T2ewQrRo4d",
    x: 55,
    y: 132,
  },
];

export const aleTrailStopByKey = Object.fromEntries(aleTrailVendors.map((vendor) => [vendor.key, vendor]));

export const aleTrailStopPayloads = Object.fromEntries(
  aleTrailVendors.map((vendor) => [vendor.qrPayload, vendor.key]),
);

export const aleTrailStopByFestivalVendorId = Object.fromEntries(
  aleTrailVendors
    .filter((vendor) => vendor.festivalVendorId)
    .map((vendor) => [vendor.festivalVendorId, vendor]),
);
