"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { useCurrency } from "@/lib/currency-context";
import { useAuth } from "@/lib/auth-context";
import type {
  Category,
  Transaction,
  CurrencyCode,
  TransactionType,
} from "@/lib/types";
import { CURRENCIES, CURRENCY_LABELS } from "@/lib/types";
import { getCategoryIcon } from "@/lib/utils/icon-map";
import { formatThousands } from "@/lib/utils/currency";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowDownCircle, ArrowUpCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.string().min(1, "Amount is required"),
  currency: z.enum(["IDR", "USD", "JPY", "EUR", "GBP", "CNY", "KRW"]),
  categoryId: z.string().min(1, "Please select a category"),
  note: z.string().max(200).optional(),
  transactionDate: z
    .string()
    .refine((d) => new Date(d) <= new Date(), "Date cannot be in the future"),
});

type FormData = z.infer<typeof transactionSchema>;

interface TransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTransaction?: Transaction | null;
  onSaved?: () => void;
}

export function TransactionModal({
  open,
  onOpenChange,
  editingTransaction,
  onSaved,
}: TransactionModalProps) {
  const { currency: baseCurrency } = useCurrency();
  const { profile } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      amount: "",
      currency: baseCurrency,
      categoryId: "",
      note: "",
      transactionDate: new Date().toISOString().split("T")[0],
    },
  });

  const watchedType = watch("type");

  const loadCategories = useCallback(async () => {
    if (!profile) return;
    const supabase = createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", profile.id);

    if (error) {
      toast.error("Failed to load categories");
      return;
    }

    setCategories((data ?? []) as Category[]);
  }, [profile]);

  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open, loadCategories]);

  useEffect(() => {
    if (editingTransaction) {
      reset({
        type: editingTransaction.type,
        amount: formatThousands(String(editingTransaction.amount)),
        currency: editingTransaction.currency,
        categoryId: editingTransaction.category_id,
        note: editingTransaction.note ?? "",
        transactionDate: editingTransaction.transaction_date,
      });
    } else {
      reset({
        type: "expense",
        amount: "",
        currency: baseCurrency,
        categoryId: "",
        note: "",
        transactionDate: new Date().toISOString().split("T")[0],
      });
    }
  }, [editingTransaction, reset, baseCurrency, open]);

  const filteredCategories = categories.filter((c) => c.type === watchedType);

  const onSubmit = async (data: FormData) => {
    if (!profile) return;
    const amount = parseFloat(data.amount.replace(/\./g, "")) || 0;
    if (amount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const payload = {
        user_id: profile.id,
        type: data.type,
        amount,
        currency: data.currency,
        category_id: data.categoryId,
        note: data.note || null,
        transaction_date: data.transactionDate,
      };

      if (editingTransaction) {
        const { error } = await supabase
          .from("transactions")
          .update(payload)
          .eq("id", editingTransaction.id);
        if (error) throw error;
        toast.success("Transaction updated");
      } else {
        const { error } = await supabase.from("transactions").insert(payload);
        if (error) throw error;
        toast.success("Transaction added");
      }

      onSaved?.();
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to save transaction";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingTransaction ? "Edit Transaction" : "Add Transaction"}
          </DialogTitle>
          <DialogDescription>
            {editingTransaction
              ? "Update the details of your transaction."
              : "Log a new income or expense transaction."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Type toggle */}
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => {
                setValue("type", "expense");
                setValue("categoryId", "");
              }}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                watchedType === "expense"
                  ? "bg-destructive/10 text-destructive ring-2 ring-destructive/30"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <ArrowDownCircle className="h-4 w-4" />
              Expense
            </button>
            <button
              type="button"
              onClick={() => {
                setValue("type", "income");
                setValue("categoryId", "");
              }}
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                watchedType === "income"
                  ? "bg-brand/10 text-brand ring-2 ring-brand/30"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <ArrowUpCircle className="h-4 w-4" />
              Income
            </button>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Controller
              control={control}
              name="amount"
              render={({ field }) => {
                const raw = (field.value as string) ?? "";
                const digits = raw.replace(/\D/g, "");
                const displayValue = formatThousands(digits);
                return (
                  <Input
                    value={displayValue}
                    id="amount"
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    className="text-lg font-semibold tabular-nums"
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, "");
                      field.onChange(formatThousands(digitsOnly));
                    }}
                  />
                );
              }}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">
                {errors.amount.message}
              </p>
            )}
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <Label>Currency</Label>
            <Controller
              control={control}
              name="currency"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {CURRENCY_LABELS[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCategories.map((cat) => {
                      // PERBAIKAN: Melewatkan cat.name sebagai parameter kedua
                      const Icon = getCategoryIcon(cat.icon, cat.name);
                      return (
                        <SelectItem key={cat.id} value={cat.id}>
                          <span className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {cat.name}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.categoryId && (
              <p className="text-sm text-destructive">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          {/* Note */}
          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              {...register("note")}
              id="note"
              placeholder="Add a note..."
              maxLength={200}
              rows={2}
            />
            {errors.note && (
              <p className="text-sm text-destructive">{errors.note.message}</p>
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="transactionDate">Date</Label>
            <Input
              {...register("transactionDate")}
              id="transactionDate"
              type="date"
              max={today}
            />
            {errors.transactionDate && (
              <p className="text-sm text-destructive">
                {errors.transactionDate.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-brand hover:bg-brand/90"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : editingTransaction ? (
                "Save Changes"
              ) : (
                "Save Transaction"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
