export type PriceTier = 1 | 2 | 3 | 4;

export type SearchParams = {
  lat: number;
  lng: number;
  datetime: string;
  partySize: number;
  prices: PriceTier[];
};

export type Restaurant = {
  opentable_id: string;
  name: string;
  cuisine: string;
  rating: number;
  review_count: number;
  price: PriceTier;
  price_label: string;
  lat: number;
  lng: number;
  distance_meters: number;
  address: string;
  neighborhood: string;
  photo_url: string;
  slots: string[];
  confirmed_time: string;
  booking_url: string;
};

export type ApiSuccess = {
  restaurants: Restaurant[];
};

export type ApiError = {
  error: string;
};
