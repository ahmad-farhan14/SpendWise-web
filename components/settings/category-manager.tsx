"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCategoryIcon } from "@/lib/utils/icon-map";
import type { Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Edit2, Check, X, AlertTriangle } from "lucide-react";
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

  // State untuk Modal Hapus Custom
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string>("");

  // Bersihkan data duplikat kategori jika ada di database
  const uniqueCategories = useMemo(() => {
    const seen = new Set<string>();
    return categories.filter((cat) => {
      const key = `${cat.name.toLowerCase()}-${cat.type}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [categories]);

  // Tambah Kategori
  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("categories").insert({
      user_id: userId,
      name: newCatName.trim(),
      type: newCatType,
      icon: newCatType === "expense" ? "Tag" : "Wallet",
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

  // Edit Kategori
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

  // Hapus Kategori
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

  const expenseCategories = uniqueCategories.filter(
    (c) => c.type === "expense",
  );
  const incomeCategories = uniqueCategories.filter((c) => c.type === "income");

  const renderCategoryList = (items: Category[]) => (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((cat) => {
        const Icon = getCategoryIcon(cat.icon);
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
                    className="h-8 w-8 text-green-500 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950/30"
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
                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
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
        {renderCategoryList(expenseCategories)}
      </div>

      {/* Income Categories */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-brand uppercase tracking-wider">
          Income Categories
        </h4>
        {renderCategoryList(incomeCategories)}
      </div>

      {/* Custom Modal Dialog Hapus */}
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
