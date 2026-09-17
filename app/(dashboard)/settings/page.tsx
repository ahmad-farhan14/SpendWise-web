"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { CategoryManager } from "@/components/settings/category-manager";
import type { Category } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tag } from "lucide-react";

export default function SettingsPage() {
  const { profile } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);

  const fetchCategories = useCallback(async () => {
    if (!profile) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", profile.id);

    setCategories((data ?? []) as Category[]);
  }, [profile]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  if (!profile) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-brand" />
            Categories
          </CardTitle>
          <CardDescription>
            Manage your income and expense categories.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Panggil komponen CategoryManager yang memiliki tombol Edit (pensil) */}
          <CategoryManager
            categories={categories}
            userId={profile.id}
            onRefresh={fetchCategories}
          />
        </CardContent>
      </Card>
    </div>
  );
}
