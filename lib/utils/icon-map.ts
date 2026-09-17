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

const ICON_MAP: Record<string, LucideIcon> = {
  // Mapping nama ikon lengkap
  Utensils,
  Car,
  Receipt,
  ShoppingBag,
  Shopping: ShoppingBag,
  Film,
  Entertainment: Film,
  HeartPulse,
  Health: HeartPulse,
  MoreHorizontal,
  Other: MoreHorizontal,
  Briefcase,
  Freelance: Briefcase,
  TrendingUp,
  Investment: TrendingUp,
  Wallet,
  Salary: Wallet,
  Tag,
  Fuel,
};

export function getCategoryIcon(iconName?: string): LucideIcon {
  if (!iconName) return Tag;

  // Mencocokkan nama ikon langsung atau fallback aman
  const match = ICON_MAP[iconName];
  if (match) return match;

  return Tag;
}
