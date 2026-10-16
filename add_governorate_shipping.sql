-- ==============================================================================
-- بوستيرا | POSTERA - إضافة خاصية تسعير الشحن حسب المحافظة
-- انسخ هذا الكود والصقه في SQL Editor داخل Supabase واضغط RUN
-- رابط مباشر: https://supabase.com/dashboard/project/vgwsexvwbpwlhfrwfnii/sql/new
-- ==============================================================================

-- 1. إضافة عمود أسعار الشحن للمحافظات في جدول الإعدادات العامة (Settings)
ALTER TABLE public.settings ADD COLUMN IF NOT EXISTS governorate_shipping JSONB DEFAULT '{}'::jsonb;

-- 2. إضافة عمود مصاريف الشحن المحسوبة في جدول الطلبات (Orders)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_fee NUMERIC(10, 2) DEFAULT 0.00;

-- 3. تحديث مبدئي لعمود الإعدادات إن وجد
UPDATE public.settings 
SET governorate_shipping = COALESCE(governorate_shipping, '{}'::jsonb)
WHERE id = 1;
