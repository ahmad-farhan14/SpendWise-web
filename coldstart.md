# Coldstart Document — SpendWise (v0.1)

## 1. Project Overview & PRD
- **Name:** SpendWise
- **Category:** General Financial & Global Cash Flow Calculator
- **Tagline:** Kelola arus kas harian dan hitung batas aman pengeluaran secara presisi dengan dukungan mata uang global.
- **Problem:** Banyak orang kesulitan melacak arus kas harian, menghitung net balance secara otomatis, dan bertransaksi dalam berbagai mata uang global (IDR, USD, JPY, EUR, GBP, CNY, KRW).
- **Target User:** Pengguna Umum, Mahasiswa, Pekerja Kantoran, Wisatawan, dan Pengguna Transaksi Multi-Currency.

### Core Features (In-Scope):
1. **Transaction Logging:** Input Pemasukan (Income) & Pengeluaran (Expense) cepat dengan kategori.
2. **Cash Flow Summary Calculator:** Total Income, Total Expense, Net Balance (Income - Expense), & Safe-to-Spend Daily Average.
3. **Global Multi-Currency Selector:** IDR, USD, JPY, EUR, GBP, CNY, KRW dengan live number formatting.
4. **Category Breakdown & History:** Progress bar alokasi pengeluaran per kategori & riwayat transaksi dengan filter bulanan.

### Out of Scope:
- Integrasi otomatis bank/e-wallet.
- Live exchange rate fetching API (menggunakan base view currency pilihan user).
- Export PDF/Excel, AI Advisor, & pembukuan ganda (double-entry).

---

## 2. User Persona & User Flow
- **Persona:** Rian Sanjaya (26th), Content Creator / Freelancer. Butuh pencatatan cepat, tahu sisa saldo bersih (net balance), dan mengontrol pengeluaran harian multi-currency.
- **User Flow:** Buka App -> Pilih Base Currency -> Input Transaksi (Income/Expense) -> Calculator Summary Update -> Tinjau Analytics & Riwayat.

---

## 3. Wireframe Structure
1. **Header / Navbar:** Logo SpendWise, Global Base Currency Selector Dropdown, User Auth Status.
2. **Hero Dashboard (Summary Calculator Card):**
   - Net Balance (Large bold text)
   - Safe-to-Spend Daily Average
   - Income & Expense Sub-cards (Green/Red indicators)
3. **Primary Action:** Button "+ Add Transaction" (Triggers Pop-up Modal).
4. **Input Modal:** Toggle Income/Expense, Amount + Currency Select, Category Select, Note, Date Picker.
5. **Category Allocation Section:** Progress bars alokasi pengeluaran per kategori.
6. **Transaction History List:** Search & Filter Bar, List Table with Category Icons, Date, Notes, Amount, and Delete/Edit Actions.

---

## 4. Database Schema (PostgreSQL / Supabase)
- **Table `profiles`:** `id` (UUID, PK), `email` (TEXT), `full_name` (TEXT), `default_currency` (VARCHAR(3), default 'IDR'), `created_at` (TIMESTAMPTZ).
- **Table `categories`:** `id` (UUID, PK), `user_id` (UUID, FK -> profiles.id), `name` (VARCHAR(50)), `type` (VARCHAR(10)), `icon` (VARCHAR(50)), `created_at` (TIMESTAMPTZ).
- **Table `transactions`:** `id` (UUID, PK), `user_id` (UUID, FK -> profiles.id), `category_id` (UUID, FK -> categories.id), `type` (VARCHAR(10)), `amount` (NUMERIC(15,2)), `currency` (VARCHAR(3)), `note` (TEXT), `transaction_date` (DATE), `created_at` (TIMESTAMPTZ).

---

## 5. Style & Mood Visual
- **Vibe:** Clean, Modern & Trustworthy Financial Minimalist.
- **Color Palette:**
  - Primary Brand & Income: `#10B981` (Emerald Green)
  - Expense & Alert: `#EF4444` (Rose Red)
  - Background Light: `#F8FAFC` (Slate-50) | Dark: `#0F172A` (Slate-900)
  - Cards & Borders: `#1E293B` (Slate-800)
- **Typography:** Default Tailwind / System UI Sans (`tabular nums` for financial figures).