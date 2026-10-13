-- ==============================================================================
-- بوستيرا | POSTERA - إعداد قاعدة بيانات Supabase ونظام التخزين والحماية
-- ملف تهيئة متكامل جاهز للتنفيذ بنقرة واحدة داخل Supabase SQL Editor
-- ==============================================================================

-- 1. تفعيل الإضافات المطلوبة
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. إنشاء الجداول (Tables)
-- ==============================================================================

-- جدول الإعدادات العامة للمتجر (Settings - بيانات عامة يقرأها المتجر والزوار)
CREATE TABLE IF NOT EXISTS public.settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    store_name TEXT NOT NULL DEFAULT 'بوستيرا | POSTERA',
    instapay_handle TEXT NOT NULL DEFAULT 'postera@instapay',
    wallet_number TEXT NOT NULL DEFAULT '01000000000',
    whatsapp_number TEXT NOT NULL DEFAULT '01000000000',
    shipping_fee NUMERIC(10, 2) NOT NULL DEFAULT 60.00,
    free_shipping_threshold NUMERIC(10, 2) NOT NULL DEFAULT 2500.00,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- جدول إعدادات الإدارة المحمية (Admin Settings - خاص بالأدمن فقط ومحمي تماماً من الزوار)
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    notification_email TEXT DEFAULT 'admin@postera.com',
    resend_api_key TEXT DEFAULT '',
    email_webhook_url TEXT DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- جدول المقاسات والأسعار (Sizes)
CREATE TABLE IF NOT EXISTS public.sizes (
    id TEXT PRIMARY KEY,                       -- مثل 's', 'm', 'l', 'xl'
    label TEXT NOT NULL,                       -- مثل '20×30', '30×45'
    width_cm INT NOT NULL,                     -- العرض بالسنتيمتر
    height_cm INT NOT NULL,                    -- الارتفاع بالسنتيمتر
    price NUMERIC(10, 2) NOT NULL,             -- السعر بالجنيه
    is_active BOOLEAN NOT NULL DEFAULT true,   -- متاح للطلب أم لا
    sort_order INT NOT NULL DEFAULT 0,         -- ترتيب الظهور
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- جدول المنتجات واللوحات الجاهزة (Products)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,                       -- اسم اللوحة
    category TEXT NOT NULL,                    -- التصنيف (مصر، فضاء، طبيعة، مدن، تجريدي)
    image_url TEXT,                            -- رابط الصورة في التخزين
    kind TEXT,                                 -- كود اللوحة الفنية SVG إذا وُجد
    is_visible BOOLEAN NOT NULL DEFAULT true,  -- ظاهر / مخفي
    sort_order INT NOT NULL DEFAULT 0,         -- ترتيب الظهور
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- جدول الطلبات الرئيسي (Orders)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,         -- رقم الطلب ببادئة PST-xxxx
    customer_name TEXT NOT NULL CHECK (char_length(trim(customer_name)) >= 3), -- الاسم لا يقل عن 3 حروف
    customer_phone TEXT NOT NULL CHECK (customer_phone ~ '^01[0125][0-9]{8}$'), -- الموبايل 11 رقم مصري ويبدأ بـ 01
    governorate TEXT NOT NULL,                 -- المحافظة
    address TEXT NOT NULL CHECK (char_length(trim(address)) >= 5), -- العنوان لا يقل عن 5 حروف
    payment_method TEXT NOT NULL CHECK (payment_method IN ('instapay', 'wallet')),
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount > 0),       -- المبلغ المطلوب
    transferred_amount NUMERIC(10, 2) NOT NULL CHECK (transferred_amount >= 0), -- المبلغ المحوّل
    payment_screenshot_url TEXT,               -- رابط سكرين التحويل في التخزين الخاص
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'printing', 'shipped', 'completed', 'cancelled')),
    notes TEXT,                                -- ملاحظات إضافية
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- جدول تفاصيل عناصر الطلب (Order Items)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_title TEXT NOT NULL,               -- اسم اللوحة أو 'لوحة خاصة'
    size_label TEXT NOT NULL,                  -- المقاس (مثال 30×45)
    quantity INT NOT NULL CHECK (quantity > 0) DEFAULT 1,
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    total_price NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
    is_custom BOOLEAN NOT NULL DEFAULT false,  -- هل هو طباعة خاصة لصورة عميل؟
    custom_image_url TEXT,                     -- رابط صورة العميل الخاصة
    orientation TEXT CHECK (orientation IN ('p', 'l')), -- طولي أو عرضي
    fit TEXT CHECK (fit IN ('cover', 'contain')),       -- تملا اللوحة أو الصورة كاملة
    finish TEXT CHECK (finish IN ('لامع', 'مطفي', 'glossy', 'matte')), -- نوع التشطيب
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 3. الفهارس وحماية تكرار الطلبات (Indexes & Rate Limiting Trigger)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_visible ON public.products(is_visible);

-- تفعيل قيود التحقق الصارمة على الطلبات في حال كان الجدول منشأ مسبقاً
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_customer_phone_check') THEN
        ALTER TABLE public.orders ADD CONSTRAINT orders_customer_phone_check CHECK (customer_phone ~ '^01[0125][0-9]{8}$');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_customer_name_check') THEN
        ALTER TABLE public.orders ADD CONSTRAINT orders_customer_name_check CHECK (char_length(trim(customer_name)) >= 3);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_address_check') THEN
        ALTER TABLE public.orders ADD CONSTRAINT orders_address_check CHECK (char_length(trim(address)) >= 5);
    END IF;
EXCEPTION
    WHEN others THEN NULL;
END $$;

-- دالة وتريجر حماية من الإغراق والطلبات المزيفة (Anti-Spam Rate Limiter)
CREATE OR REPLACE FUNCTION public.check_order_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
    -- منع إرسال أكثر من 3 طلبات من نفس رقم الموبايل خلال 10 دقائق
    IF (SELECT COUNT(*) FROM public.orders 
        WHERE customer_phone = NEW.customer_phone 
        AND created_at > now() - INTERVAL '10 minutes') >= 3 THEN
        RAISE EXCEPTION 'تم إرسال عدة طلبات مؤخراً من هذا الرقم. يرجى الانتظار 10 دقائق قبل إرسال طلب جديد.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_order_rate_limit ON public.orders;
CREATE TRIGGER trg_order_rate_limit
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.check_order_rate_limit();

-- ==============================================================================
-- 4. إعداد حاويات التخزين (Storage Buckets)
-- ==============================================================================

-- 1. سكرينات التحويل (Private - خاص)
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

-- 2. صور العملاء للطباعة الخاصة (Private - خاص)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'custom_designs',
    'custom_designs',
    false,
    52428800, -- أقصى حجم 50MB لدقة الطباعة العالية
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/tiff']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/tiff'];

-- 3. صور المنتجات والكتالوج (Public - عام للجميع)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'product_images',
    'product_images',
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

-- ==============================================================================
-- 5. تفعيل أمان مستوى الصف (Row Level Security - RLS)
-- ==============================================================================
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- سياسات جدول الطلبات (Orders Policies):
-- الزائر يستطيع فقط إضافة طلب جديد (INSERT)، ولا يمكنه قراءة أو تعديل أي طلب.
-- المشرف (Authenticated / Service Role) يستطيع القراءة والتعديل والحذف بالكامل.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Visitors can create orders" ON public.orders;
CREATE POLICY "Visitors can create orders"
ON public.orders FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access on orders" ON public.orders;
CREATE POLICY "Admin full access on orders"
ON public.orders FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- سياسات تفاصيل الطلب (Order Items Policies):
-- الزائر يستطيع فقط إضافة عناصر الطلب (INSERT)، ولا يمكنه القراءة أو التعديل.
-- المشرف يستطيع القراءة والتعديل والحذف بالكامل.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Visitors can insert order items" ON public.order_items;
CREATE POLICY "Visitors can insert order items"
ON public.order_items FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access on order items" ON public.order_items;
CREATE POLICY "Admin full access on order items"
ON public.order_items FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- سياسات المنتجات (Products Policies):
-- الزائر يستطيع فقط قراءة المنتجات الظاهرة (is_visible = true).
-- المشرف يستطيع الإضافة والتعديل والحذف.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view visible products" ON public.products;
CREATE POLICY "Public can view visible products"
ON public.products FOR SELECT
TO public
USING (is_visible = true);

DROP POLICY IF EXISTS "Admin full access on products" ON public.products;
CREATE POLICY "Admin full access on products"
ON public.products FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- سياسات المقاسات (Sizes Policies):
-- الزائر يستطيع قراءة المقاسات المتاحة (is_active = true).
-- المشرف يستطيع إدارة المقاسات والأسعار بالكامل.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can view active sizes" ON public.sizes;
CREATE POLICY "Public can view active sizes"
ON public.sizes FOR SELECT
TO public
USING (is_active = true);

DROP POLICY IF EXISTS "Admin full access on sizes" ON public.sizes;
CREATE POLICY "Admin full access on sizes"
ON public.sizes FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- سياسات الإعدادات (Settings Policies):
-- الزائر يستطيع قراءة بيانات الدفع والشحن العامة فقط.
-- المشرف فقط يستطيع تحديث الإعدادات.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can read settings" ON public.settings;
CREATE POLICY "Public can read settings"
ON public.settings FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "Admin can update settings" ON public.settings;
CREATE POLICY "Admin can update settings"
ON public.settings FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- سياسات إعدادات الإدارة المحمية (Admin Settings Policy):
-- المشرف فقط (Authenticated) يستطيع القراءة والتحديث، ولا يمكن لأي زائر قراءتها.
DROP POLICY IF EXISTS "Admin full access on admin_settings" ON public.admin_settings;
CREATE POLICY "Admin full access on admin_settings"
ON public.admin_settings FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ==============================================================================
-- 6. سياسات حماية التخزين (Storage RLS Policies)
-- ==============================================================================

-- 1) حاوية سكرينات التحويل (payment_screenshots):
-- الزائر يستطيع الرفع فقط (INSERT)، ولا يمكنه رؤية سكرينات الآخرين.
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

-- 2) حاوية صور العملاء الخاصة (custom_designs):
-- الزائر يستطيع الرفع فقط (INSERT)، ولا يمكنه رؤية صور العملاء الآخرين.
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

-- 3) حاوية صور المنتجات (product_images):
-- الجميع يستطيع رؤية وتحميل صور المنتجات (SELECT).
-- المشرف فقط يستطيع الرفع والتعديل والحذف.
DROP POLICY IF EXISTS "Public view product images" ON storage.objects;
CREATE POLICY "Public view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product_images');

DROP POLICY IF EXISTS "Admin manage product images" ON storage.objects;
CREATE POLICY "Admin manage product images"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'product_images')
WITH CHECK (bucket_id = 'product_images');

-- ==============================================================================
-- 7. البيانات الأولية التجريبية (Seed Initial Data)
-- ==============================================================================

-- إدخال الإعدادات العامة الافتراضية
INSERT INTO public.settings (id, store_name, instapay_handle, wallet_number, whatsapp_number, shipping_fee, free_shipping_threshold)
VALUES (1, 'بوستيرا | POSTERA', 'postera@instapay', '01000000000', '01000000000', 60.00, 2500.00)
ON CONFLICT (id) DO UPDATE SET
    store_name = EXCLUDED.store_name,
    instapay_handle = EXCLUDED.instapay_handle,
    wallet_number = EXCLUDED.wallet_number,
    whatsapp_number = EXCLUDED.whatsapp_number,
    shipping_fee = EXCLUDED.shipping_fee,
    free_shipping_threshold = EXCLUDED.free_shipping_threshold;

-- إدخال إعدادات الإدارة المحمية الافتراضية
INSERT INTO public.admin_settings (id, notification_email, resend_api_key, email_webhook_url)
VALUES (1, 'admin@postera.com', '', '')
ON CONFLICT (id) DO NOTHING;

-- إدخال المقاسات الأساسية
INSERT INTO public.sizes (id, label, width_cm, height_cm, price, is_active, sort_order)
VALUES
    ('s',  '20×30', 20, 30, 450.00,  true, 1),
    ('m',  '30×45', 30, 45, 750.00,  true, 2),
    ('l',  '40×60', 40, 60, 1200.00, true, 3),
    ('xl', '50×75', 50, 75, 1800.00, true, 4)
ON CONFLICT (id) DO UPDATE SET
    label = EXCLUDED.label,
    width_cm = EXCLUDED.width_cm,
    height_cm = EXCLUDED.height_cm,
    price = EXCLUDED.price,
    is_active = EXCLUDED.is_active,
    sort_order = EXCLUDED.sort_order;

-- إدخال المنتجات الأولية للتشكيلة
INSERT INTO public.products (title, category, kind, is_visible, sort_order)
VALUES
    ('ليل الأهرامات',   'مصر',     'pyramids',  true, 1),
    ('القمر الذهبي',    'فضاء',    'moon',      true, 2),
    ('جبال الفجر',     'طبيعة',   'mountains', true, 3),
    ('أقواس الآرت ديكو', 'تجريدي',  'deco',      true, 4),
    ('مدينة بعد الغروب', 'مدن',     'city',      true, 5),
    ('جمال',           'مصر',     'calli',     true, 6),
    ('كثبان الصحراء',   'طبيعة',   'desert',    true, 7),
    ('خطوط الموج',      'تجريدي',  'waves',     true, 8)
ON CONFLICT DO NOTHING;

-- ==============================================================================
-- 8. إنشاء حساب المدير (Admin Credentials) في Supabase Auth
-- ==============================================================================
-- الطريقة الرسمية الموصى بها لإنشاء حساب الأدمن للدخول إلى لوحة /admin:
-- 1. افتح لوحة تحكم مشروعك في Supabase Dashboard.
-- 2. من القائمة الجانبية اليسرى ادخل على: Authentication -> Users.
-- 3. اضغط على زر: "Add user" واقترح اختيار "Create user".
-- 4. اكتب بيانات الحساب:
--    - Email: admin@postera.com
--    - Password: postera123  (أو أي كلمة مرور قوية من اختيارك)
--    - فعّل خيار: "Auto Confirm User?" ليتفعل الحساب فوراً دون الحاجة لتأكيد البريد.
-- 5. اضغط Save.
--
-- بمجرد إضافة هذا المستخدم ووضع مفاتيح Supabase في ADMIN_CONFIG بصفحة admin.html،
-- ستسجل الدخول فوراً بالبريد وكلمة المرور المشفرين بأعلى معايير الأمان (Argon2 / Bcrypt).
--
-- ملحوظة: يمكنك أيضاً اختبار لوحة الأدمن محلياً في أي وقت بدون ربط Supabase
-- بالضغط على زر "⚡ تجربة الدخول الفوري بضغطة زر" بنفس هذه البيانات!
-- ==============================================================================

