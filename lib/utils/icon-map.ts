import {
  Utensils,
  Car,
  Receipt,
  ShoppingBag,
  Film,
  HeartPulse,
  MoreHorizontal,
  Briefcase,
  TrendingUp,
  Wallet,
  Tag,
  Fuel,
  Sparkles,
  Pill,
  Zap,
  Trees,
  ShoppingBasket,
  Tv,
  Plane,
  GraduationCap,
  Home,
  type LucideIcon,
} from "lucide-react";

// Daftar ikon yang bisa dipilih pengguna di UI
export const AVAILABLE_ICONS = [
  { name: "Utensils", label: "Makanan/Minuman", icon: Utensils },
  { name: "Car", label: "Transportasi", icon: Car },
  { name: "ShoppingBag", label: "Belanja", icon: ShoppingBag },
  { name: "Receipt", label: "Tagihan", icon: Receipt },
  { name: "Film", label: "Hiburan/Bioskop", icon: Film },
  { name: "HeartPulse", label: "Kesehatan/RS", icon: HeartPulse },
  { name: "Pill", label: "Obat/Apotek", icon: Pill },
  { name: "Zap", label: "Listrik/Listrik", icon: Zap },
  { name: "Trees", label: "Taman/Taman", icon: Trees },
  { name: "Fuel", label: "Bensin/Gas", icon: Fuel },
  { name: "Sparkles", label: "Jajan/Gaya Hidup", icon: Sparkles },
  { name: "Wallet", label: "Gaji/Dompet", icon: Wallet },
  { name: "Briefcase", label: "Kerja/Freelance", icon: Briefcase },
  { name: "TrendingUp", label: "Investasi", icon: TrendingUp },
  { name: "Home", label: "Rumah/Properti", icon: Home },
  { name: "GraduationCap", label: "Pendidikan", icon: GraduationCap },
  { name: "Plane", label: "Liburan/Travel", icon: Plane },
  { name: "Tag", label: "Lainnya", icon: Tag },
];

const CATEGORY_NAME_MAP: Record<string, LucideIcon> = {
  "Food & Drink": Utensils,
  "Food and Drink": Utensils,
  "Food & Beverages": Utensils,
  "Food and Beverages": Utensils,
  Transportation: Car,
  Shopping: ShoppingBag,
  Bills: Receipt,
  Entertainment: Film,
  Health: HeartPulse,
  Other: MoreHorizontal,
  Salary: Wallet,
  Freelance: Briefcase,
  Investment: TrendingUp,
};

const ICON_NAME_MAP: Record<string, LucideIcon> = {
  Utensils,
  Car,
  Receipt,
  ShoppingBag,
  Film,
  HeartPulse,
  MoreHorizontal,
  Briefcase,
  TrendingUp,
  Wallet,
  Tag,
  Fuel,
  Sparkles,
  Pill,
  Zap,
  Trees,
  ShoppingBasket,
  Tv,
  Plane,
  GraduationCap,
  Home,
};

export function getCategoryIcon(
  iconName?: string,
  categoryName?: string,
): LucideIcon {
  if (categoryName && CATEGORY_NAME_MAP[categoryName]) {
    return CATEGORY_NAME_MAP[categoryName];
  }

  if (iconName && ICON_NAME_MAP[iconName]) {
    return ICON_NAME_MAP[iconName];
  }

  return Tag;
}
