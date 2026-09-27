export type ContextKey = "عام" | "شغل" | "صيانة" | "توصيل" | "تسوّق";
export type Direction = "pidgin-to-arabic" | "arabic-to-pidgin";

export interface TranslationFixture {
  id: string;
  context: ContextKey;
  source: string;
  target: string;
  simpler?: string;
  direction: Direction;
  ambiguity?: string[];
}

export interface HistoryItem extends TranslationFixture {
  createdAt: string;
  isUser: boolean;
}

export interface TranslationResult {
  fixture?: TranslationFixture;
  unsupported?: boolean;
}

export interface TranslationService {
  translate(text: string, direction: Direction, context: ContextKey): Promise<TranslationResult>;
  example(context: ContextKey, direction: Direction): TranslationFixture;
}

export const fixtures: TranslationFixture[] = [
  { id: "maintenance", context: "صيانة", direction: "pidgin-to-arabic", source: "هذا ماكينة أول شغال، الحين ما في شغال، يمكن واير خربان", target: "الجهاز كان يعمل، لكنه توقف الآن. ربما يوجد عطل في السلك.", simpler: "الجهاز توقف. ربما السلك تالف." },
  { id: "maintenance-reply", context: "صيانة", direction: "arabic-to-pidgin", source: "افصل الكهرباء، وسأرسل شخصًا لفحص الجهاز غدًا.", target: "إنت سكّر كهرباء. بكرة أنا يرسل شخص يشيّك ماكينة.", simpler: "سكّر كهرباء. بكرة شخص يجي يشيّك ماكينة." },
  { id: "delivery", context: "توصيل", direction: "pidgin-to-arabic", source: "أنا برّه عند باب، إنت يرسل لوكيشن مضبوط", target: "أنا بالخارج عند الباب. أرسل لي الموقع الدقيق.", simpler: "أنا عند الباب. أرسل الموقع الصحيح." },
  { id: "shopping", context: "تسوّق", direction: "pidgin-to-arabic", source: "هذا كم آخر سعر؟ أنا يبغى اثنين", target: "ما آخر سعر؟ أريد قطعتين.", simpler: "كم السعر؟ أريد اثنين." },
  { id: "work", context: "شغل", direction: "pidgin-to-arabic", source: "بكرة إنت يجي ساعة تسعة، يجيب ورقة معاك", target: "تعال غدًا الساعة التاسعة، وأحضر الورقة معك.", simpler: "تعال غدًا الساعة ٩. أحضر الورقة." },
  { id: "general-ambiguous", context: "عام", direction: "pidgin-to-arabic", source: "هو يجي بعد", target: "سيأتي لاحقًا", simpler: "يأتي لاحقًا.", ambiguity: ["سيأتي لاحقًا", "سيأتي أيضًا"] },
  { id: "general-reply", context: "عام", direction: "arabic-to-pidgin", source: "انتظر هنا قليلًا، وسأعود بعد خمس دقائق.", target: "إنت انتظر هنا شوي. أنا يرجع بعد خمس دقيقة.", simpler: "انتظر هنا. أنا يرجع بعد خمس دقيقة." },
  { id: "work-reply", context: "شغل", direction: "arabic-to-pidgin", source: "انتهِ من هذا العمل أولًا، ثم ابدأ بالمهمة الجديدة.", target: "أول خلّص هذا شغل، بعدين يبدأ شغل جديد.", simpler: "خلّص هذا أول. بعدين شغل جديد." },
  { id: "delivery-reply", context: "توصيل", direction: "arabic-to-pidgin", source: "ضع الطلب أمام الباب واتصل بي.", target: "حط طلب قدّام باب، بعدين اتصل أنا.", simpler: "حط طلب عند باب. اتصل أنا." },
  { id: "shopping-reply", context: "تسوّق", direction: "arabic-to-pidgin", source: "أريد هذا المقاس بلون آخر.", target: "أنا يبغى هذا سايز، لون ثاني.", simpler: "هذا سايز، لون ثاني أبغى." },
];

export const localTranslationService: TranslationService = {
  async translate(text, direction, context) {
    const normalized = text.trim();
    const fixture = fixtures.find((item) => item.direction === direction && item.context === context && item.source === normalized)
      ?? fixtures.find((item) => item.direction === direction && item.source === normalized);
    return fixture ? { fixture } : { unsupported: true };
  },
  example(context, direction) {
    const fixture = fixtures.find((item) => item.context === context && item.direction === direction)
      ?? fixtures.find((item) => item.direction === direction)
      ?? fixtures[0];
    if (!fixture) throw new Error("No local translation fixtures available");
    return fixture;
  },
};

export const phraseFixtures = [
  ["التحية", "مرحبًا، كيف حالك؟", "سلام، كيف حال إنت؟"], ["التحية", "شكرًا لمساعدتك.", "شكراً، إنت ساعد أنا."],
  ["العمل", "تعال غدًا الساعة التاسعة.", "بكرة إنت يجي ساعة تسعة."], ["العمل", "أرسل التقرير قبل الظهر.", "إنت يرسل تقرير قبل ظهر."],
  ["العمل", "أحضر الورقة معك.", "يجيب ورقة معاك."], ["الصيانة", "الجهاز لا يعمل.", "ماكينة ما في شغال."],
  ["الصيانة", "افصل الكهرباء الآن.", "الحين سكّر كهرباء."], ["الصيانة", "سأرسل شخصًا غدًا.", "بكرة أنا يرسل شخص."],
  ["التوصيل", "أنا عند الباب.", "أنا برّه عند باب."], ["التوصيل", "أرسل الموقع الصحيح.", "إنت يرسل لوكيشن مضبوط."],
  ["التوصيل", "ضع الطلب أمام الباب.", "حط طلب قدّام باب."], ["التسوّق", "ما آخر سعر؟", "هذا كم آخر سعر؟"],
  ["التسوّق", "أريد قطعتين.", "أنا يبغى اثنين."], ["التسوّق", "هل يوجد لون آخر؟", "في لون ثاني؟"],
  ["عام", "انتظر هنا قليلًا.", "إنت انتظر هنا شوي."], ["عام", "لم أفهم، أعد من فضلك.", "أنا ما فهم، قول مرة ثاني لو سمحت."],
] as const;

const keys = { history: "maloom-history", favorites: "maloom-favorites", settings: "maloom-settings" };
export const storage = {
  read<T>(key: keyof typeof keys, fallback: T): T { if (typeof window === "undefined") return fallback; try { return JSON.parse(localStorage.getItem(keys[key]) ?? "") as T; } catch { return fallback; } },
  write<T>(key: keyof typeof keys, value: T) { if (typeof window !== "undefined") localStorage.setItem(keys[key], JSON.stringify(value)); },
};
