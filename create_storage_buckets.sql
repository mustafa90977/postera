-- ==============================================================================
-- بوستيرا | POSTERA - كود إنشاء مجلدات التخزين وحمايتها
-- قم بنسخ هذا الكود بالكامل ولصقه في SQL Editor داخل مشروع Supabase واضغط RUN
-- رابط مباشر: https://supabase.com/dashboard/project/vgwsexvwbpwlhfrwfnii/sql
-- ==============================================================================

-- 1. إنشاء مجلد سكرينات التحويل (Private - خاص بالمشرف فقط)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'payment_screenshots',
    'payment_screenshots',
    false,
    10485760, -- أقصى حجم 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

-- 2. إنشاء مجلد صور العملاء للطباعة الخاصة (Private - خاص بالمشرف فقط)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'custom_designs',
    'custom_designs',
    false,
    52428800, -- أقصى حجم 50MB لجودة الطباعة الفائقة
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/tiff']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/tiff'];

-- 3. إنشاء مجلد صور المنتجات واللوحات المعروضة (Public - عام للزوار)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product_images',
    'product_images',
    true,
    10485760, -- أقصى حجم 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

-- ==============================================================================
-- ضبط سياسات الحماية والأمان لمجلدات التخزين (Storage RLS Policies)
-- ==============================================================================

-- 1) حماية سكرينات التحويل (payment_screenshots):
-- الزائر يرفع الإيصال فقط ولا يرى إيصالات الآخرين، المشرف يرى ويحذف
DROP POLICY IF EXISTS "Visitors upload payment screenshot" ON storage.objects;
CREATE POLICY "Visitors upload payment screenshot"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'payment_screenshots');

DROP POLICY IF EXISTS "Admin view payment screenshots" ON storage.objects;
CREATE POLICY "Admin view payment screenshots"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'payment_screenshots');

DROP POLICY IF EXISTS "Admin delete payment screenshots" ON storage.objects;
CREATE POLICY "Admin delete payment screenshots"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'payment_screenshots');

-- 2) حماية صور العملاء للطباعة (custom_designs):
-- الزائر يرفع صورته فقط بجودتها الكاملة، والمشرف فقط يراها ويحملها للطباعة
DROP POLICY IF EXISTS "Visitors upload custom designs" ON storage.objects;
CREATE POLICY "Visitors upload custom designs"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'custom_designs');

DROP POLICY IF EXISTS "Admin view custom designs" ON storage.objects;
CREATE POLICY "Admin view custom designs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'custom_designs');

DROP POLICY IF EXISTS "Admin delete custom designs" ON storage.objects;
CREATE POLICY "Admin delete custom designs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'custom_designs');

-- 3) حماية صور المنتجات (product_images):
-- الجميع يشاهد الصور في المتجر، والمشرف فقط يرفع ويعدل ويحذف
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product_images');

DROP POLICY IF EXISTS "Admin manage product images" ON storage.objects;
CREATE POLICY "Admin manage product images"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'product_images')
WITH CHECK (bucket_id = 'product_images');
