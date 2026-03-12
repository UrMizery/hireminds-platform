"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "../lib/language-context";

type CartItem = {
  id: string;
  nameEn: string;
  nameEs: string;
  nameAr: string;
  namePl: string;
  price: number;
  descriptionEn: string;
  descriptionEs: string;
  descriptionAr: string;
  descriptionPl: string;
};

const starterItems: CartItem[] = [
  {
    id: "free-resume",
    nameEn: "Free Resume",
    nameEs: "Resume Gratis",
    nameAr: "سيرة ذاتية مجانية",
    namePl: "Darmowe Resume",
    price: 0,
    descriptionEn: "1-page resume with basic features.",
    descriptionEs: "Resume de 1 página con funciones básicas.",
    descriptionAr: "سيرة ذاتية من صفحة واحدة مع ميزات أساسية.",
    descriptionPl: "1-stronicowe resume z podstawowymi funkcjami.",
  },
  {
    id: "premium-resume",
    nameEn: "Premium Resume",
    nameEs: "Resume Premium",
    nameAr: "السيرة الذاتية المميزة",
    namePl: "Resume Premium",
    price: 19.99,
    descriptionEn: "2-page resume with premium formatting and support.",
    descriptionEs: "Resume de 2 páginas con formato premium y soporte.",
    descriptionAr: "سيرة ذاتية من صفحتين مع تنسيق ودعم مميز.",
    descriptionPl: "2-stronicowe resume z formatowaniem premium i wsparciem.",
  },
  {
    id: "premium-plus-pro",
    nameEn: "Premium Plus / Pro",
    nameEs: "Premium Plus / Pro",
    nameAr: "بريميوم بلس / برو",
    namePl: "Premium Plus / Pro",
    price: 39.99,
    descriptionEn: "Advanced package with CV tools, AI features, and added support.",
    descriptionEs: "Paquete avanzado con herramientas de CV, funciones de IA y apoyo adicional.",
    descriptionAr: "باقة متقدمة تتضمن أدوات CV وميزات الذكاء الاصطناعي ودعمًا إضافيًا.",
    descriptionPl: "Zaawansowany pakiet z narzędziami CV, funkcjami AI i dodatkowym wsparciem.",
  },
  {
    id: "ai-mock-interview",
    nameEn: "AI Mock Interview",
    nameEs: "Entrevista Simulada con IA",
    nameAr: "مقابلة تجريبية بالذكاء الاصطناعي",
    namePl: "Próbna rozmowa AI",
    price: 14.99,
    descriptionEn: "Practice interview support with AI guidance.",
    descriptionEs: "Práctica de entrevista con guía de IA.",
    descriptionAr: "دعم للتدريب على المقابلات بإرشاد الذكاء الاصطناعي.",
    descriptionPl: "Ćwiczenie rozmowy z pomocą AI.",
  },
  {
    id: "live-mock-interview",
    nameEn: "Live Mock Interview",
    nameEs: "Entrevista Simulada en Vivo",
    nameAr: "مقابلة تجريبية مباشرة",
    namePl: "Próbna rozmowa na żywo",
    price: 29.99,
    descriptionEn: "45-minute live mock interview session.",
    descriptionEs: "Sesión de entrevista simulada en vivo de 45 minutos.",
    descriptionAr: "جلسة مقابلة تجريبية مباشرة لمدة 45 دقيقة.",
    descriptionPl: "45-minutowa próbna rozmowa na żywo.",
  },
  {
    id: "ai-resume-revision",
    nameEn: "AI Resume Revision",
    nameEs: "Revisión de Resume con IA",
    nameAr: "مراجعة السيرة الذاتية بالذكاء الاصطناعي",
    namePl: "Korekta resume AI",
    price: 14.99,
    descriptionEn: "AI-assisted wording, structure, and clarity improvements.",
    descriptionEs: "Mejoras de redacción, estructura y claridad con IA.",
    descriptionAr: "تحسينات في الصياغة والبنية والوضوح بمساعدة الذكاء الاصطناعي.",
    descriptionPl: "Poprawa treści, struktury i klarowności z pomocą AI.",
  },
  {
    id: "live-resume-revision",
    nameEn: "Live Resume Revision",
    nameEs: "Revisión de Resume en Vivo",
    nameAr: "مراجعة السيرة الذاتية مباشرة",
    namePl: "Korekta resume na żywo",
    price: 29.99,
    descriptionEn: "Work directly with a live reviewer.",
    descriptionEs: "Trabaja directamente con un revisor en vivo.",
    descriptionAr: "اعمل مباشرة مع مراجع مباشر.",
    descriptionPl: "Pracuj bezpośrednio z konsultantem na żywo.",
  },
  {
    id: "live-cv-revision",
    nameEn: "Live CV Revision",
    nameEs: "Revisión de CV en Vivo",
    nameAr: "مراجعة السيرة المهنية مباشرة",
    namePl: "Korekta CV na żywo",
    price: 39.99,
    descriptionEn: "Live review session for CV-level documents.",
    descriptionEs: "Sesión en vivo para revisión de documentos tipo CV.",
    descriptionAr: "جلسة مباشرة لمراجعة مستندات CV.",
    descriptionPl: "Sesja na żywo do korekty dokumentów typu CV.",
  },
  {
    id: "verification-single",
    nameEn: "1 Employer Verification",
    nameEs: "1 Verificación de Empleo",
    nameAr: "تحقق توظيف واحد",
    namePl: "1 weryfikacja zatrudnienia",
    price: 9.99,
    descriptionEn: "Single employer verification request.",
    descriptionEs: "Solicitud individual de verificación de empleo.",
    descriptionAr: "طلب تحقق واحد من صاحب عمل.",
    descriptionPl: "Pojedynczy wniosek o weryfikację zatrudnienia.",
  },
  {
    id: "verification-bundle-3",
    nameEn: "Employer Verification Package (3)",
    nameEs: "Paquete de Verificación de Empleo (3)",
    nameAr: "باقة التحقق من التوظيف (3)",
    namePl: "Pakiet weryfikacji zatrudnienia (3)",
    price: 24.99,
    descriptionEn: "Bundle of 3 employer verification requests.",
    descriptionEs: "Paquete de 3 solicitudes de verificación de empleo.",
    descriptionAr: "باقة من 3 طلبات تحقق من أصحاب العمل.",
    descriptionPl: "Pakiet 3 wniosków o weryfikację zatrudnienia.",
  },
  {
    id: "career-coach-session",
    nameEn: "Career Coach Session",
    nameEs: "Sesión con Coach de Carrera",
    nameAr: "جلسة مع مدرب مهني",
    namePl: "Sesja z coachem kariery",
    price: 39.99,
    descriptionEn: "Guided career strategy and next-step planning.",
    descriptionEs: "Estrategia profesional guiada y planificación de próximos pasos.",
    descriptionAr: "استراتيجية مهنية موجهة وتخطيط للخطوات التالية.",
    descriptionPl: "Prowadzona strategia kariery i planowanie kolejnych kroków.",
  },
  {
    id: "consultation",
    nameEn: "Consultation",
    nameEs: "Consulta",
    nameAr: "استشارة",
    namePl: "Konsultacja",
    price: 29.99,
    descriptionEn: "General consultation for resume and career questions.",
    descriptionEs: "Consulta general para preguntas sobre carrera y resume.",
    descriptionAr: "استشارة عامة لأسئلة السيرة الذاتية والمسار المهني.",
    descriptionPl: "Ogólna konsultacja dotycząca resume i kariery.",
  },
];

export default function CartPage() {
  const { lang } = useLanguage();
  const [cart, setCart] = useState<CartItem[]>([]);

  const copy = useMemo(() => {
    const byLang = {
      en: {
        title: "Cart / Checkout",
        subtitle: "Review services, add items, and prepare for checkout.",
        available: "Available Services",
        orderSummary: "Order Summary",
        empty: "Your cart is empty.",
        addToCart: "Add to Cart",
        remove: "Remove",
        subtotal: "Subtotal",
        total: "Total",
        checkout: "Proceed to Checkout",
        note: "Checkout can be connected to Stripe next.",
      },
      es: {
        title: "Carrito / Pago",
        subtitle: "Revisa servicios, agrega artículos y prepárate para pagar.",
        available: "Servicios Disponibles",
        orderSummary: "Resumen del Pedido",
        empty: "Tu carrito está vacío.",
        addToCart: "Agregar al Carrito",
        remove: "Eliminar",
        subtotal: "Subtotal",
        total: "Total",
        checkout: "Continuar al Pago",
        note: "El pago puede conectarse a Stripe después.",
      },
      ar: {
        title: "السلة / الدفع",
        subtitle: "راجع الخدمات وأضف العناصر واستعد لإتمام الدفع.",
        available: "الخدمات المتاحة",
        orderSummary: "ملخص الطلب",
        empty: "سلتك فارغة.",
        addToCart: "أضف إلى السلة",
        remove: "إزالة",
        subtotal: "المجموع الفرعي",
        total: "الإجمالي",
        checkout: "المتابعة إلى الدفع",
        note: "يمكن ربط الدفع مع Stripe لاحقًا.",
      },
      pl: {
        title: "Koszyk / Płatność",
        subtitle: "Przejrzyj usługi, dodaj pozycje i przygotuj się do płatności.",
        available: "Dostępne Usługi",
        orderSummary: "Podsumowanie Zamówienia",
        empty: "Twój koszyk jest pusty.",
        addToCart: "Dodaj do koszyka",
        remove: "Usuń",
        subtotal: "Suma częściowa",
        total: "Razem",
        checkout: "Przejdź do płatności",
        note: "Płatność można później połączyć ze Stripe.",
      },
    } as const;

    return byLang[lang];
  }, [lang]);

  const isRTL = lang === "ar";

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);

  function getItemName(item: CartItem) {
    if (lang === "es") return item.nameEs;
    if (lang === "ar") return item.nameAr;
    if (lang === "pl") return item.namePl;
    return item.nameEn;
  }

  function getItemDescription(item: CartItem) {
    if (lang === "es") return item.descriptionEs;
    if (lang === "ar") return item.descriptionAr;
    if (lang === "pl") return item.descriptionPl;
    return item.descriptionEn;
  }

  function addToCart(item: CartItem) {
    setCart((prev) => [...prev, item]);
  }

  function removeFromCart(index: number) {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <main
      style={{
        ...styles.page,
        direction: isRTL ? "rtl" : "ltr",
      }}
    >
      <div style={styles.wrapper}>
        <section
          style={{
            ...styles.hero,
            textAlign: isRTL ? "right" : "left",
          }}
        >
          <p style={styles.kicker}>HIREMINDS</p>
          <h1 style={styles.title}>{copy.title}</h1>
          <p style={styles.subtitle}>{copy.subtitle}</p>
        </section>

        <div style={styles.layout}>
          <section style={styles.leftCol}>
            <div style={styles.sectionCard}>
              <h2 style={styles.sectionTitle}>{copy.available}</h2>

              <div style={styles.serviceGrid}>
                {starterItems.map((item) => (
                  <div key={item.id} style={styles.serviceCard}>
                    <p style={styles.serviceName}>{getItemName(item)}</p>
                    <p style={styles.servicePrice}>${item.price.toFixed(2)}</p>
                    <p style={styles.serviceText}>{getItemDescription(item)}</p>

                    <button
                      type="button"
                      style={styles.addButton}
                      onClick={() => addToCart(item)}
                    >
                      {copy.addToCart}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside style={styles.rightCol}>
            <div style={styles.summaryCard}>
              <h2 style={styles.sectionTitle}>{copy.orderSummary}</h2>

              {cart.length === 0 ? (
                <p style={styles.emptyText}>{copy.empty}</p>
              ) : (
                <div style={styles.cartList}>
                  {cart.map((item, index) => (
                    <div key={`${item.id}-${index}`} style={styles.cartRow}>
                      <div>
                        <p style={styles.cartItemName}>{getItemName(item)}</p>
                        <p style={styles.cartItemPrice}>${item.price.toFixed(2)}</p>
                      </div>

                      <button
                        type="button"
                        style={styles.removeButton}
                        onClick={() => removeFromCart(index)}
                      >
                        {copy.remove}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div style={styles.totals}>
                <div style={styles.totalRow}>
                  <span>{copy.subtotal}</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div style={styles.totalRowStrong}>
                  <span>{copy.total}</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>

              <button type="button" style={styles.checkoutButton}>
                {copy.checkout}
              </button>

              <p style={styles.note}>{copy.note}</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(255,255,255,0.05), transparent 20%), linear-gradient(180deg, #040404 0%, #0b0b0d 100%)",
    color: "#f5f5f5",
    padding: "40px 24px 64px",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  wrapper: {
    maxWidth: "1440px",
    margin: "0 auto",
  },
  hero: {
    marginBottom: "24px",
    padding: "32px",
    background: "linear-gradient(180deg, #111111 0%, #171717 100%)",
    border: "1px solid #232323",
    borderRadius: "28px",
    boxShadow: "0 24px 70px rgba(0,0,0,0.22)",
  },
  kicker: {
    margin: "0 0 12px",
    color: "#a3a3a3",
    fontSize: "12px",
    letterSpacing: "0.22em",
    textTransform: "uppercase",
  },
  title: {
    margin: "0 0 12px",
    fontSize: "46px",
    lineHeight: 1.05,
    fontWeight: 500,
    letterSpacing: "-0.04em",
    color: "#f5f5f5",
  },
  subtitle: {
    margin: 0,
    color: "#c4c4c4",
    fontSize: "17px",
    lineHeight: 1.8,
    maxWidth: "820px",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: "20px",
    alignItems: "start",
  },
  leftCol: {},
  rightCol: {
    position: "sticky",
    top: "120px",
  },
  sectionCard: {
    background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
    border: "1px solid #262626",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 24px 70px rgba(0,0,0,0.22)",
  },
  summaryCard: {
    background: "linear-gradient(180deg, #111827 0%, #172033 100%)",
    border: "1px solid #2d3b57",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 24px 70px rgba(0,0,0,0.22)",
  },
  sectionTitle: {
    margin: "0 0 18px",
    color: "#f5f5f5",
    fontSize: "28px",
    fontWeight: 600,
  },
  serviceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "14px",
  },
  serviceCard: {
    background: "#0f172a",
    border: "1px solid #273244",
    borderRadius: "20px",
    padding: "18px",
  },
  serviceName: {
    margin: "0 0 8px",
    color: "#f3f4f6",
    fontWeight: 700,
    fontSize: "16px",
  },
  servicePrice: {
    margin: "0 0 10px",
    color: "#93c5fd",
    fontWeight: 700,
    fontSize: "15px",
  },
  serviceText: {
    margin: "0 0 14px",
    color: "#d1d5db",
    lineHeight: 1.7,
    fontSize: "14px",
  },
  addButton: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "14px",
    border: "1px solid #d1d5db",
    background: "linear-gradient(180deg, #d4d4d8 0%, #a3a3a3 100%)",
    color: "#09090b",
    fontWeight: 700,
    cursor: "pointer",
  },
  emptyText: {
    color: "#d1d5db",
    lineHeight: 1.7,
    marginBottom: "18px",
  },
  cartList: {
    display: "grid",
    gap: "12px",
    marginBottom: "18px",
  },
  cartRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    padding: "12px 0",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  cartItemName: {
    margin: "0 0 4px",
    color: "#f3f4f6",
    fontWeight: 700,
  },
  cartItemPrice: {
    margin: 0,
    color: "#cbd5e1",
  },
  removeButton: {
    padding: "9px 12px",
    borderRadius: "12px",
    border: "1px solid #475569",
    background: "transparent",
    color: "#e5e7eb",
    cursor: "pointer",
  },
  totals: {
    marginTop: "12px",
    paddingTop: "12px",
    borderTop: "1px solid rgba(255,255,255,0.1)",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "10px",
    color: "#d1d5db",
  },
  totalRowStrong: {
    display: "flex",
    justifyContent: "space-between",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: "18px",
  },
  checkoutButton: {
    width: "100%",
    marginTop: "18px",
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid #d1d5db",
    background: "linear-gradient(180deg, #d4d4d8 0%, #a3a3a3 100%)",
    color: "#09090b",
    fontWeight: 700,
    cursor: "pointer",
  },
  note: {
    marginTop: "14px",
    color: "#cbd5e1",
    fontSize: "13px",
    lineHeight: 1.7,
  },
};
