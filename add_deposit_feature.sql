-- ==============================================================================
-- بوستيرا | POSTERA - إضافة خاصية دفع العربون (Deposit Feature)
-- انسخ هذا الكود والصقه في SQL Editor داخل Supabase واضغط RUN
-- رابط مباشر: https://supabase.com/dashboard/project/vgwsexvwbpwlhfrwfnii/sql/new
-- ==============================================================================

-- 1. إضافة أعمدة إعدادات العربون في جدول الإعدادات العامة (Settings)
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS deposit_enabled BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS deposit_type TEXT NOT NULL DEFAULT 'percent'; -- 'percent' أو 'fixed'
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS deposit_value NUMERIC(10, 2) NOT NULL DEFAULT 50.00;

-- 2. إضافة أعمدة العربون في جدول الطلبات (Orders)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS is_deposit BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC(10, 2) DEFAULT 0.00;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS remaining_amount NUMERIC(10, 2) DEFAULT 0.00;

-- 3. تحديث القيم الافتراضية للسطر الحالي في settings إن وجد
UPDATE public.settings 
SET 
    deposit_enabled = COALESCE(deposit_enabled, true),
    deposit_type = COALESCE(deposit_type, 'percent'),
    deposit_value = COALESCE(deposit_value, 50.00)
WHERE id = 1;
