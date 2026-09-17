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
      toast.error(error.message);
    } else {
      toast.success("Category updated");
      setEditingId(null);
      onRefresh();
    }
  };

  // Hapus Kategori
  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Category deleted");
      onRefresh();
    }
  };

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

      {/* List Kategori dengan Aksi Edit dan Delete */}
      <div className="grid gap-3 sm:grid-cols-2">
        {categories.map((cat) => {
          const Icon = getCategoryIcon(cat.icon);
          const isEditing = editingId === cat.id;

          return (
            <div
              key={cat.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                {isEditing ? (
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-8 w-36 text-sm"
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
                      onClick={() => handleSaveEdit(cat.id)}
                    >
                      <Check className="h-4 w-4 text-green-500" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setEditingId(null)}
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setEditingId(cat.id);
                        setEditName(cat.name);
                      }}
                    >
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteCategory(cat.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
