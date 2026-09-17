"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCategoryIcon } from "@/lib/utils/icon-map";
import type { Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CategoryManagerProps {
  categories: Category[];
  userId: string;
  onRefresh: () => void;
}

// 1. DAFTAR KATEGORI DEFAULT KONSISTEN (KEMBALI SEPERTI SEMULA)
const DEFAULT_EXPENSE_CATEGORIES = [
  { id: "def-food", name: "Food & Drink", type: "expense", icon: "Utensils" },
  { id: "def-trans", name: "Transportation", type: "expense", icon: "Car" },
  { id: "def-shop", name: "Shopping", type: "expense", icon: "ShoppingBag" },
  { id: "def-bills", name: "Bills", type: "expense", icon: "Receipt" },
  { id: "def-ent", name: "Entertainment", type: "expense", icon: "Film" },
  { id: "def-health", name: "Health", type: "expense", icon: "HeartPulse" },
  {
    id: "def-other-exp",
    name: "Other",
    type: "expense",
    icon: "MoreHorizontal",
  },
];

const DEFAULT_INCOME_CATEGORIES = [
  { id: "def-salary", name: "Salary", type: "income", icon: "Wallet" },
  { id: "def-free", name: "Freelance", type: "income", icon: "Briefcase" },
  { id: "def-inv", name: "Investment", type: "income", icon: "TrendingUp" },
  {
    id: "def-other-inc",
    name: "Other",
    type: "income",
    icon: "MoreHorizontal",
  },
];

// Deteksi Ikon Otomatis untuk Kategori Baru
function getAutoIconName(name: string, type: "expense" | "income"): string {
  const lower = name.toLowerCase();
  if (
    lower.includes("food") ||
    lower.includes("drink") ||
    lower.includes("makan") ||
    lower.includes("minum") ||
    lower.includes("beverage")
  ) {
    return "Utensils";
  }
  if (
    lower.includes("fuel") ||
    lower.includes("bensin") ||
    lower.includes("gas")
  ) {
    return "Fuel";
  }
  if (
    lower.includes("trans") ||
    lower.includes("travel") ||
    lower.includes("car")
  ) {
    return "Car";
  }
  if (
    lower.includes("bill") ||
    lower.includes("tagihan") ||
    lower.includes("listrik")
  ) {
    return "Receipt";
  }
  if (lower.includes("shop") || lower.includes("belanja")) {
    return "ShoppingBag";
  }
  return type === "expense" ? "Tag" : "Wallet";
}

export function CategoryManager({
  categories,
  userId,
  onRefresh,
}: CategoryManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [newCatType, setNewCatType] = useState<"expense" | "income">("expense");
  const [loading, setLoading] = useState(false);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string>("");

  // Filter hanya kategori kustom yang dibuat user di database
  const defaultNames = [
    ...DEFAULT_EXPENSE_CATEGORIES.map((c) => c.name.toLowerCase()),
    ...DEFAULT_INCOME_CATEGORIES.map((c) => c.name.toLowerCase()),
    "food and beverages",
    "food and drink",
  ];

  const customCategories = categories.filter(
    (c) => !defaultNames.includes(c.name.toLowerCase()),
  );

  const customExpense = customCategories.filter((c) => c.type === "expense");
  const customIncome = customCategories.filter((c) => c.type === "income");

  // Tambah Kategori Kustom
  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    setLoading(true);

    const iconName = getAutoIconName(newCatName.trim(), newCatType);
    const supabase = createClient();
    const { error } = await supabase.from("categories").insert({
      user_id: userId,
      name: newCatName.trim(),
      type: newCatType,
      icon: iconName,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Category added");
      setNewCatName("");
      onRefresh();
    }
    setLoading(false);
  };

  // Edit Kategori Kustom
  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("categories")
      .update({ name: editName.trim() })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update: " + error.message);
    } else {
      toast.success("Category updated");
      setEditingId(null);
      onRefresh();
    }
  };

  // Hapus Kategori Kustom
  const confirmDeleteCategory = async () => {
    if (!deleteId) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", deleteId);

    if (error) {
      toast.error("Failed to delete: " + error.message);
    } else {
      toast.success("Category deleted");
      onRefresh();
    }
    setDeleteId(null);
  };

  const renderCategoryList = (
    defaultItems: typeof DEFAULT_EXPENSE_CATEGORIES,
    customItems: Category[],
  ) => (
    <div className="grid gap-3 sm:grid-cols-2">
      {/* RENDER KATEGORI DEFAULT (LOCKED TOTAL) */}
      {defaultItems.map((cat) => {
        const Icon = getCategoryIcon(cat.icon, cat.name);
        return (
          <div
            key={cat.id}
            className="group flex items-center justify-between rounded-lg border bg-card p-3 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium">{cat.name}</span>
            </div>

            {/* Indikator gembok halus pada hover */}
            <div className="px-2 opacity-0 transition-opacity group-hover:opacity-100">
              <Lock className="h-3.5 w-3.5 text-muted-foreground/60" />
            </div>
          </div>
        );
      })}

      {/* RENDER KATEGORI CUSTOM (BISA EDIT & HAPUS) */}
      {customItems.map((cat) => {
        const Icon = getCategoryIcon(cat.icon, cat.name);
        const isEditing = editingId === cat.id;

        return (
          <div
            key={cat.id}
            className="flex items-center justify-between rounded-lg border bg-card p-3 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              {isEditing ? (
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-8 w-36 text-sm"
                  autoFocus
                />
              ) : (
                <span className="text-sm font-medium">{cat.name}</span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {isEditing ? (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    type="button"
                    onClick={() => handleSaveEdit(cat.id)}
                    className="h-8 w-8 text-green-500 hover:bg-green-50"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="h-8 w-8 text-muted-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    type="button"
                    onClick={() => {
                      setEditingId(cat.id);
                      setEditName(cat.name);
                    }}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    type="button"
                    onClick={() => {
                      setDeleteId(cat.id);
                      setDeleteName(cat.name);
                    }}
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Form Tambah Kategori */}
      <div className="flex gap-2">
        <Input
          placeholder="New category name..."
          value={newCatName}
          onChange={(e) => setNewCatName(e.target.value)}
        />
        <select
          value={newCatType}
          onChange={(e) =>
            setNewCatType(e.target.value as "expense" | "income")
          }
          className="rounded-md border bg-background px-3 text-sm"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <Button onClick={handleAddCategory} disabled={loading}>
          <Plus className="mr-1 h-4 w-4" /> Add
        </Button>
      </div>

      {/* Expense Categories */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-destructive uppercase tracking-wider">
          Expense Categories
        </h4>
        {renderCategoryList(DEFAULT_EXPENSE_CATEGORIES, customExpense)}
      </div>

      {/* Income Categories */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-brand uppercase tracking-wider">
          Income Categories
        </h4>
        {renderCategoryList(DEFAULT_INCOME_CATEGORIES, customIncome)}
      </div>

      {/* Modal Dialog Hapus Custom */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400 sm:mx-0">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <AlertDialogTitle className="mt-2">
              {`Delete "${deleteName}" category?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Any transactions associated with
              this category will remain, but the category tag will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCategory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
