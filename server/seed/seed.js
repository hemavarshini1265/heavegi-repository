require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const path = require('path');
const Database = require('better-sqlite3');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../../heavegi.db');
const SCHEMA_PATH = path.join(__dirname, '../models/schema.sql');

console.log('🌱 Heavegi Platforms — Seeding database...\n');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Apply schema
const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
db.exec(schema);

// ─── PRODUCTS (30 Indian products) ───────────────────────────────────────────
const products = [
  // Electronics (10)
  { name: 'Samsung Galaxy M34 5G', description: '6.5" FHD+ display, 6000mAh battery, 50MP camera. Best mid-range 5G phone in India.', price: 18999, category: 'electronics', stock: 150, image_url: 'https://images.example.com/samsung-m34.jpg', pincode_areas: '400001,110001,600001,700001,560001' },
  { name: 'boAt Rockerz 450 Pro Bluetooth Headphones', description: 'Over-ear wireless headphones with 70hr playback, ASAP Charge, Rich Bass.', price: 1499, category: 'electronics', stock: 300, image_url: 'https://images.example.com/boat-rockerz-450.jpg', pincode_areas: '400001,110001,600001,560001' },
  { name: 'Realme Narzo 60x 5G', description: '5000mAh battery, 50MP AI camera, MediaTek Dimensity 6100+ processor.', price: 11999, category: 'electronics', stock: 200, image_url: 'https://images.example.com/realme-narzo60x.jpg', pincode_areas: '400001,110001,600001,700001' },
  { name: 'Mi Smart TV 4A 40" Full HD', description: 'Android TV with PatchWall, Chromecast, 20W speakers, Dolby + DTS audio.', price: 24999, category: 'electronics', stock: 60, image_url: 'https://images.example.com/mi-tv-4a-40.jpg', pincode_areas: '400001,110001,600001' },
  { name: 'HP 15s Ryzen 5 Laptop', description: '15.6" FHD IPS, Ryzen 5 5500U, 8GB RAM, 512GB SSD, Windows 11.', price: 44999, category: 'electronics', stock: 40, image_url: 'https://images.example.com/hp-15s.jpg', pincode_areas: '400001,110001,600001,560001' },
  { name: 'Noise ColorFit Pro 4 Smartwatch', description: 'AMOLED display, Bluetooth calling, 100+ sports modes, SpO2 & heart rate.', price: 2499, category: 'electronics', stock: 400, image_url: 'https://images.example.com/noise-cf-pro4.jpg', pincode_areas: '400001,110001,600001,700001,560001,302001' },
  { name: 'Canon PIXMA MG2577s Printer', description: 'All-in-one inkjet printer, print/scan/copy, 4800x600 dpi, USB connectivity.', price: 3499, category: 'electronics', stock: 90, image_url: 'https://images.example.com/canon-mg2577s.jpg', pincode_areas: '400001,110001,600001' },
  { name: 'Redmi 12C Smartphone', description: '6.71" HD+ display, 5000mAh battery, 50MP camera, Helio G85.', price: 8999, category: 'electronics', stock: 250, image_url: 'https://images.example.com/redmi-12c.jpg', pincode_areas: '400001,110001,600001,700001,560001,302001,500001' },
  { name: 'JBL Flip 6 Portable Speaker', description: 'IP67 waterproof, 12h playtime, PartyBoost compatible, powerful bass.', price: 8999, category: 'electronics', stock: 120, image_url: 'https://images.example.com/jbl-flip6.jpg', pincode_areas: '400001,110001,600001,560001' },
  { name: 'Lenovo IdeaPad Slim 3 Chromebook', description: '15.6" FHD IPS, Intel Celeron N4020, 4GB RAM, 64GB eMMC, ChromeOS.', price: 19999, category: 'electronics', stock: 55, image_url: 'https://images.example.com/lenovo-chromebook.jpg', pincode_areas: '400001,110001,600001' },

  // Clothing (10)
  { name: 'Raymond Linen Formal Shirt — Men', description: 'Premium linen fabric, regular fit, full-sleeve, available in white/blue/grey.', price: 1299, category: 'clothing', stock: 500, image_url: 'https://images.example.com/raymond-linen-shirt.jpg', pincode_areas: '400001,110001,600001,560001,302001' },
  { name: 'Fabindia Kurta Set for Women', description: 'Hand-block printed cotton kurta with palazzo. Sizes XS–XXL. Ethnic Indian wear.', price: 2199, category: 'clothing', stock: 350, image_url: 'https://images.example.com/fabindia-kurta.jpg', pincode_areas: '400001,110001,600001,700001,302001' },
  { name: 'Levi\'s 511 Slim Fit Jeans', description: 'Premium stretch denim, slim fit, 5-pocket styling. Sizes 28–40.', price: 2999, category: 'clothing', stock: 400, image_url: 'https://images.example.com/levis-511.jpg', pincode_areas: '400001,110001,600001,560001' },
  { name: 'Nike Dri-FIT Running T-Shirt — Men', description: 'Moisture-wicking fabric, slim fit, available in multiple colours.', price: 1799, category: 'clothing', stock: 600, image_url: 'https://images.example.com/nike-drifit-tshirt.jpg', pincode_areas: '400001,110001,600001,560001,700001' },
  { name: 'Biba Anarkali Suit Set', description: 'Flared anarkali with dupatta, printed cotton, festive & casual wear.', price: 2799, category: 'clothing', stock: 280, image_url: 'https://images.example.com/biba-anarkali.jpg', pincode_areas: '400001,110001,600001,302001' },
  { name: 'Peter England Chinos — Men', description: 'Cotton stretch chinos, slim tapered fit, 4-way stretch fabric. Various colours.', price: 1899, category: 'clothing', stock: 320, image_url: 'https://images.example.com/pe-chinos.jpg', pincode_areas: '400001,110001,600001,560001' },
  { name: 'Jockey Women\'s Cotton Innerwear Pack of 3', description: 'Soft premium combed cotton, full coverage, tagless. Sizes S–XXL.', price: 599, category: 'clothing', stock: 800, image_url: 'https://images.example.com/jockey-women.jpg', pincode_areas: '400001,110001,600001,700001,560001,302001,500001' },
  { name: 'Woodland Casual Leather Shoes — Men', description: 'Genuine leather uppers, rubber outsole, lace-up style. Sizes 6–12.', price: 3799, category: 'clothing', stock: 200, image_url: 'https://images.example.com/woodland-shoes.jpg', pincode_areas: '400001,110001,600001,560001' },
  { name: 'W for Woman Rayon A-Line Dress', description: 'Floral printed rayon dress, knee-length, boat neck, casual daily wear.', price: 1499, category: 'clothing', stock: 450, image_url: 'https://images.example.com/w-for-woman-dress.jpg', pincode_areas: '400001,110001,600001,302001,560001' },
  { name: 'Arrow Classic Oxford Shirt', description: 'Premium 100% cotton, button-down collar, regular fit, formal & smart-casual.', price: 1599, category: 'clothing', stock: 380, image_url: 'https://images.example.com/arrow-oxford.jpg', pincode_areas: '400001,110001,600001,560001' },

  // Groceries (5)
  { name: 'Tata Tea Gold 500g', description: 'Blended premium Assam & Darjeeling tea leaves. Rich aroma, strong flavour.', price: 275, category: 'groceries', stock: 1000, image_url: 'https://images.example.com/tata-tea.jpg', pincode_areas: '400001,110001,600001,700001,560001,302001,500001' },
  { name: 'Fortune Sunflower Oil 5L', description: 'Refined sunflower oil, heart-healthy, light & odourless. FSSAI certified.', price: 749, category: 'groceries', stock: 600, image_url: 'https://images.example.com/fortune-oil-5l.jpg', pincode_areas: '400001,110001,600001,560001,302001' },
  { name: 'Aashirvaad Atta 10kg', description: 'Whole wheat flour from the finest wheat. 100% atta, no maida. Soft rotis guaranteed.', price: 390, category: 'groceries', stock: 800, image_url: 'https://images.example.com/aashirvaad-atta.jpg', pincode_areas: '400001,110001,600001,700001,560001,302001,500001' },
  { name: 'Amul Butter 500g', description: 'Pasteurised table butter from Amul. Rich taste, perfect for cooking & spreading.', price: 285, category: 'groceries', stock: 700, image_url: 'https://images.example.com/amul-butter.jpg', pincode_areas: '400001,110001,600001,560001' },
  { name: 'Haldiram\'s Bhujia Sev 1kg', description: 'Classic Bikaner bhujia, crispy & spicy snack. No preservatives, vacuum packed.', price: 299, category: 'groceries', stock: 550, image_url: 'https://images.example.com/haldirams-bhujia.jpg', pincode_areas: '400001,110001,600001,700001,560001,302001' },

  // Books (5)
  { name: 'The Alchemist — Paulo Coelho (Hindi Edition)', description: 'Indian Hindi translation of the global bestseller. Life-changing journey of self-discovery.', price: 199, category: 'books', stock: 400, image_url: 'https://images.example.com/alchemist-hindi.jpg', pincode_areas: '400001,110001,600001,700001,560001,302001,500001' },
  { name: 'Wings of Fire — A.P.J. Abdul Kalam', description: 'Autobiography of India\'s beloved Missile Man and former President. Inspirational classic.', price: 249, category: 'books', stock: 500, image_url: 'https://images.example.com/wings-of-fire.jpg', pincode_areas: '400001,110001,600001,700001,560001,302001,500001' },
  { name: 'Ikigai — Héctor García & Francesc Miralles', description: 'Japanese secret to a long and happy life. Indian paperback edition.', price: 299, category: 'books', stock: 350, image_url: 'https://images.example.com/ikigai.jpg', pincode_areas: '400001,110001,600001,560001' },
  { name: 'The Immortals of Meluha — Amish Tripathi', description: 'Book 1 of the Shiva Trilogy. Historical fiction set in mythological India.', price: 349, category: 'books', stock: 450, image_url: 'https://images.example.com/meluha.jpg', pincode_areas: '400001,110001,600001,700001,560001' },
  { name: 'Class 10 NCERT Science Textbook', description: 'Official NCERT textbook for Class 10 Science. Curriculum-aligned, board exam essential.', price: 89, category: 'books', stock: 1200, image_url: 'https://images.example.com/ncert-sci-10.jpg', pincode_areas: '400001,110001,600001,700001,560001,302001,500001' },
];

// ─── FAQs (10) ───────────────────────────────────────────────────────────────
const faqs = [
  {
    question: 'What is Heavegi Platforms?',
    answer: 'Heavegi Platforms is an Indian e-commerce marketplace where you can buy electronics, clothing, groceries, books, and much more. We deliver across all major Indian pincodes with quick delivery and easy returns.',
    category: 'general',
  },
  {
    question: 'How can I track my order?',
    answer: 'You can track your order by logging in to your Heavegi account, going to "My Orders", and clicking "Track Order" on the relevant order. You will also receive SMS and email updates at every delivery milestone.',
    category: 'orders',
  },
  {
    question: 'What is the return policy on Heavegi?',
    answer: 'Heavegi offers a 7-day return window for most products. Electronics have a 30-day replacement guarantee. To initiate a return, go to My Orders → Return/Replace. Refunds are processed within 5–7 business days to your original payment method.',
    category: 'orders',
  },
  {
    question: 'Which payment methods are accepted on Heavegi?',
    answer: 'We accept UPI (PhonePe, GPay, Paytm), credit/debit cards (Visa, Mastercard, RuPay), net banking, EMI, and Cash on Delivery (COD) for eligible orders above ₹299.',
    category: 'payments',
  },
  {
    question: 'Is Cash on Delivery (COD) available?',
    answer: 'Yes! COD is available for orders between ₹299 and ₹10,000 at eligible pincodes across India. During checkout, select "Cash on Delivery" as your payment method to check availability at your pincode.',
    category: 'payments',
  },
  {
    question: 'How long does delivery take?',
    answer: 'Standard delivery takes 3–7 business days. Express delivery (available in select cities like Mumbai, Delhi, Bangalore, Chennai, Hyderabad) delivers within 1–2 business days. Free delivery on orders above ₹499.',
    category: 'delivery',
  },
  {
    question: 'How do I cancel an order?',
    answer: 'You can cancel an order before it is shipped by going to My Orders → Cancel Order. If the order has already been shipped, you can refuse delivery or initiate a return once it arrives. Prepaid orders receive a full refund to the original payment method.',
    category: 'orders',
  },
  {
    question: 'How do I contact Heavegi customer support?',
    answer: 'You can reach us via: (1) AI Chat on this page — available 24/7, (2) Email at support@heavegi.in — response within 24 hours, (3) Phone: 1800-XXX-XXXX (toll-free, Mon–Sat 9 AM–9 PM). You can also raise a support ticket from your account dashboard.',
    category: 'support',
  },
  {
    question: 'Is my payment information safe on Heavegi?',
    answer: 'Absolutely. Heavegi uses 256-bit SSL encryption for all transactions. We are PCI-DSS compliant and do not store your full card details on our servers. All payments are processed through RBI-approved payment gateways.',
    category: 'payments',
  },
  {
    question: 'How do I become a seller on Heavegi?',
    answer: 'Becoming a Heavegi seller is easy! Visit heavegi.in/sell, fill in your business details, upload your GST certificate and bank details, and you can start listing products within 48 hours. We charge a small commission of 2–8% per sale depending on category.',
    category: 'seller',
  },
];

// ─── Error Codes ──────────────────────────────────────────────────────────────
const errorCodes = [
  { code: '400', title: 'Bad Request', description: 'The server could not understand the request due to invalid syntax or missing required parameters.', resolution: 'Check your request body and query parameters. Ensure all required fields are present and correctly formatted.' },
  { code: '401', title: 'Unauthorized', description: 'Authentication is required and has failed or not been provided. Your session may have expired.', resolution: 'Please log in again or provide a valid Bearer token in the Authorization header.' },
  { code: '403', title: 'Forbidden', description: 'You do not have permission to access this resource. This is different from 401 — authentication will not help.', resolution: 'Contact support if you believe you should have access. Check your account role and permissions.' },
  { code: '404', title: 'Not Found', description: 'The requested resource (product, order, page) could not be found on the Heavegi server.', resolution: 'Verify the URL or ID you are using. The item may have been removed or the link may be incorrect.' },
  { code: '429', title: 'Too Many Requests', description: 'You have sent too many requests in a short period. Heavegi rate-limits to 100 requests per 15 minutes per IP.', resolution: 'Wait 15 minutes before retrying. If you need higher limits, contact our developer team.' },
  { code: '500', title: 'Internal Server Error', description: 'An unexpected error occurred on the Heavegi server. This is not caused by your request.', resolution: 'Try again after a few minutes. If the error persists, please raise a support ticket with the timestamp and error details.' },
  { code: '503', title: 'Service Unavailable', description: 'The Heavegi service is temporarily unavailable due to maintenance or overload.', resolution: 'Check heavegi.in/status for live service status. Try again after a few minutes. Maintenance windows are announced on our social media.' },
  { code: 'HEAVEGI-001', title: 'Payment Gateway Timeout', description: 'The payment gateway did not respond within the expected time. Your order may not have been confirmed and your money may not have been deducted.', resolution: 'Check your bank statement. If money was deducted but no order confirmation was received, raise a support ticket with your UTR/transaction reference number. Refunds for such cases are processed within 2–5 business days.' },
];

// ─── Seed Execution ───────────────────────────────────────────────────────────
const seedProducts = db.transaction(() => {
  const existing = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
  if (existing > 0) { console.log(`  ⏭  Products already seeded (${existing} rows). Skipping.`); return; }
  const stmt = db.prepare(
    'INSERT INTO products (name, description, price, category, stock, image_url, pincode_areas) VALUES (?,?,?,?,?,?,?)'
  );
  for (const p of products) {
    stmt.run(p.name, p.description, p.price, p.category, p.stock, p.image_url, p.pincode_areas);
  }
  console.log(`  ✅ Seeded ${products.length} products`);
});

const seedFaqs = db.transaction(() => {
  const existing = db.prepare('SELECT COUNT(*) as c FROM faqs').get().c;
  if (existing > 0) { console.log(`  ⏭  FAQs already seeded (${existing} rows). Skipping.`); return; }
  const stmt = db.prepare('INSERT INTO faqs (question, answer, category) VALUES (?,?,?)');
  for (const f of faqs) stmt.run(f.question, f.answer, f.category);
  console.log(`  ✅ Seeded ${faqs.length} FAQs`);
});

const seedErrorCodes = db.transaction(() => {
  const existing = db.prepare('SELECT COUNT(*) as c FROM error_codes').get().c;
  if (existing > 0) { console.log(`  ⏭  Error codes already seeded (${existing} rows). Skipping.`); return; }
  const stmt = db.prepare('INSERT INTO error_codes (code, title, description, resolution) VALUES (?,?,?,?)');
  for (const e of errorCodes) stmt.run(e.code, e.title, e.description, e.resolution);
  console.log(`  ✅ Seeded ${errorCodes.length} error codes`);
});

const seedUsers = db.transaction(() => {
  const existing = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  if (existing > 0) return;
  db.prepare(
    "INSERT INTO users (id, name, email, password, role) VALUES (?,?,?,?,?)"
  ).run(1, 'Hemavarshini', 'hemavarshini@heavegi.in', 'hashed_pass_123', 'customer');
  console.log('  ✅ Seeded demo user: Hemavarshini (id: 1)');
});

try {
  seedUsers();
  seedProducts();
  seedFaqs();
  seedErrorCodes();
  console.log('\n🎉 Seeding complete! Heavegi Platforms database is ready.\n');
} catch (err) {
  console.error('\n❌ Seeding failed:', err.message);
  process.exit(1);
}

db.close();
