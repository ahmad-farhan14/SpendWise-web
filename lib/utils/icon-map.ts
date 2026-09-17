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

export function getCategoryIcon(iconName?: string): LucideIcon {
  if (!iconName) return Tag;
  return ICON_MAP[iconName] || Tag;
}
