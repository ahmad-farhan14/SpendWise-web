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

// List of available icons for the UI picker dropdown in English
export const AVAILABLE_ICONS = [
  { name: "Utensils", label: "Food & Drinks", icon: Utensils },
  { name: "Car", label: "Transportation", icon: Car },
  { name: "ShoppingBag", label: "Shopping", icon: ShoppingBag },
  { name: "Receipt", label: "Bills & Utilities", icon: Receipt },
  { name: "Film", label: "Entertainment", icon: Film },
  { name: "HeartPulse", label: "Health & Medical", icon: HeartPulse },
  { name: "Pill", label: "Medicine & Pharmacy", icon: Pill },
  { name: "Zap", label: "Electricity & Energy", icon: Zap },
  { name: "Trees", label: "Park & Garden", icon: Trees },
  { name: "Fuel", label: "Gas & Fuel", icon: Fuel },
  { name: "Sparkles", label: "Snacks & Lifestyle", icon: Sparkles },
  { name: "Wallet", label: "Salary & Wallet", icon: Wallet },
  { name: "Briefcase", label: "Work & Freelance", icon: Briefcase },
  { name: "TrendingUp", label: "Investment", icon: TrendingUp },
  { name: "Home", label: "Housing & Rent", icon: Home },
  { name: "GraduationCap", label: "Education", icon: GraduationCap },
  { name: "Plane", label: "Travel & Vacation", icon: Plane },
  { name: "Tag", label: "Other / General", icon: Tag },
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
