export type Esnaf = {
  slug: string;
  name: string;
  phone: string;
  cities: string;
  description: string;
  logoUrl?: string;
  headline?: string;
  theme?: string;
};

export type Hizmet = {
  id: string;
  ad: string;
  fiyat: string;
  sure: string;
};

export type CalismaSaatleri = {
  baslangic: string;
  bitis: string;
};

/** 0=Pazar … 6=Cumartesi — tamamen kapalı günler */
export type GunlukKapaliAralik = {
  gun: number;
  baslangic: string;
  bitis: string;
};

export type EsnafProfile = {
  uid: string;
  isletmeAdi: string;
  esnafAdSoyad: string;
  eposta: string;
  telefon: string;
  slug: string;
  calismaSaatleri: CalismaSaatleri;
  kapaliGunler?: number[];
  gunlukKapaliAraliklar?: GunlukKapaliAralik[];
  adres: string;
  hizmetler: Hizmet[];
  createdAt: any;
  slogan?: string;
  themePreference?: "light" | "dark" | "system";
  primaryColor?: string;
  instagram?: string;
  bio?: string;
  logoUrl?: string;
};
