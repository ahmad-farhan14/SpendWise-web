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
  type LucideIcon,
} from "lucide-react";

// Map nama kategori ke ikon bawaannya
const CATEGORY_NAME_MAP: Record<string, LucideIcon> = {
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
};

export function getCategoryIcon(
  iconName?: string,
  categoryName?: string,
): LucideIcon {
  // 1. Cek berdasarkan nama kategori bawaan terlebih dahulu
  if (categoryName && CATEGORY_NAME_MAP[categoryName]) {
    return CATEGORY_NAME_MAP[categoryName];
  }

  // 2. Jika tidak cocok, cek berdasarkan string nama ikon
  if (iconName && ICON_NAME_MAP[iconName]) {
    return ICON_NAME_MAP[iconName];
  }

  return Tag;
}
