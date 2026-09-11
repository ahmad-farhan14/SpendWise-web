import {
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Film,
  HeartPulse,
  MoreHorizontal,
  Wallet,
  Laptop,
  TrendingUp,
  Circle,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  utensils: Utensils,
  car: Car,
  'shopping-bag': ShoppingBag,
  receipt: Receipt,
  film: Film,
  'heart-pulse': HeartPulse,
  'more-horizontal': MoreHorizontal,
  wallet: Wallet,
  laptop: Laptop,
  'trending-up': TrendingUp,
  circle: Circle,
};

export function getCategoryIcon(iconName: string): LucideIcon {
  return iconMap[iconName] ?? Circle;
}
