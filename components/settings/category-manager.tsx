"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getCategoryIcon } from "@/lib/utils/icon-map";
import type { Category } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { toast } from "sonner";

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

  // Handle Add Category
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

  // Handle Save Edit
  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("categories")
      .update({ name: editName.trim() })
      .eq("id", id);

    if (error) {
      toast.error("Failed to update category: " + error.message);
    } else {
      toast.success("Category updated");
      setEditingId(null);
      onRefresh();
    }
  };

  // Handle Delete Category
  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete category: " + error.message);
    } else {
      toast.success("Category deleted");
      onRefresh();
    }
  };

  const expenseCategories = categories.filter((c) => c.type === "expense");
  const incomeCategories = categories.filter((c) => c.type === "income");

  const renderCategoryList = (items: Category[]) => (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((cat) => {
        const Icon = getCategoryIcon(cat.icon);
        const isEditing = editingId === cat.id;

        return (
          <div
            key={cat.id}
            className="flex items-center justify-between rounded-lg border bg-card p-3 shadow-sm"
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveEdit(cat.id);
                    }}
                    className="h-8 w-8 text-green-500 hover:text-green-600"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(null);
                    }}
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
                    onClick={(e) => {
                      e.stopPropagation();
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
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(cat.id);
                    }}
                    className="h-8 w-8 text-destructive hover:text-destructive"
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
    </div>
  );
}
