-- ==============================================================================
-- إضافة أعمدة البانرات (Hero Slider) والمجموعات المختارة (Curated Collections)
-- إلى جدول settings في Supabase لدعم التحكم الكامل من لوحة الإدارة
-- ==============================================================================

-- 1. إضافة عمود البانرات كـ JSONB
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS banners JSONB DEFAULT '[]'::jsonb;

-- 2. إضافة عمود المجموعات المختارة كـ JSONB
ALTER TABLE public.settings 
ADD COLUMN IF NOT EXISTS curated_cards JSONB DEFAULT '[]'::jsonb;

-- 3. توثيق الأعمدة
COMMENT ON COLUMN public.settings.banners IS 'قائمة شرائح الهيرو سلايدر (فيديو MP4 وصور ونصوص وأزرار التوجيه)';
COMMENT ON COLUMN public.settings.curated_cards IS 'بطاقات المجموعات الأربعة المختارة أسفل الهيرو سلايدر';

-- تأكيد نجاح التحديث
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'settings' 
  AND column_name IN ('banners', 'curated_cards');
