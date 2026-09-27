import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BookOpenText, ChevronLeft, Heart, Search, Volume2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PageTitle, Modal } from "../components/PageBits";
import { storage } from "../lib/maloom";
import { phraseDictionary } from "../lib/phrase-dictionary";

export const Route = createFileRoute("/phrases")({
  head: () => ({ meta: [
    { title: "قاموس العبارات — معلوم" },
    { name: "description", content: "مرجع تعليمي لعبارات التواصل اليومي بلهجة السوق العربية المختلطة، مع البحث والتصنيفات." },
    { property: "og:title", content: "قاموس العبارات — معلوم" },
    { property: "og:description", content: "عبارات وأمثلة كثيرة للتعلم حسب الموقف." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Phrases,
});

const PAGE_SIZE = 24;
type Phrase = (typeof phraseDictionary)[number];
const normalize = (value: string) => value.toLowerCase().normalize("NFKC")
  .replace(/[\u064B-\u065F\u0670]/g, "")
  .replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").trim();

function Phrases() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("الكل");
  const [page, setPage] = useState(1);
  const [favs, setFavs] = useState<string[]>([]);
  const [detail, setDetail] = useState<Phrase | null>(null);
  const nav = useNavigate();
  useEffect(() => setFavs(storage.read("favorites", [])), []);

  const cats = ["الكل", "المفضلة", ...new Set(phraseDictionary.map((x) => x[0]))];
  const idFor = (x: Phrase) => `dictionary-${phraseDictionary.indexOf(x)}`;
  const items = useMemo(() => {
    const query = normalize(q);
    return phraseDictionary.filter((x) =>
      (cat === "الكل" || (cat === "المفضلة" ? favs.includes(idFor(x)) : x[0] === cat)) &&
      (!query || normalize(x.join(" ")).includes(query))
    );
  }, [q, cat, favs]);
  const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const visible = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function selectCategory(value: string) { setCat(value); setPage(1); }
  function search(value: string) { setQ(value); setPage(1); }
  function fav(id: string) {
    const next = favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id];
    setFavs(next);
    storage.write("favorites", next);
  }

  return <>
    <PageTitle eyebrow="تعلّم حسب الموقف" title="قاموس العبارات" description="عبارات عربية وصياغات دارجة مختلطة تساعدك تفهم الكلام اليومي وترد عليه."/>
    <div className="rounded-2xl border border-border bg-secondary/40 p-4 text-sm leading-7 text-muted-foreground">
      <BookOpenText className="mb-2 text-primary" size={22}/>
      <strong className="text-foreground">{phraseDictionary.length} عبارة في {cats.length - 2} موضوعًا.</strong>
      {" "}الصياغة هنا تقريبية للتعلّم؛ طريقة الكلام تختلف من شخص لآخر، والإنجليزية والعربية تختلطان بدرجات مختلفة. في الطوارئ استخدم تعليمات واضحة أو مترجمًا مؤهلًا.
    </div>
    <div className="search-box mt-5">
      <Search size={19}/>
      <input value={q} onChange={(e) => search(e.target.value)} placeholder="ابحث بالعربي أو بالكلمات الدارجة…" aria-label="بحث في قاموس العبارات"/>
    </div>
    <div className="chips mt-4" aria-label="تصنيفات العبارات">
      {cats.map((x) => <button type="button" className={cat === x ? "chip selected" : "chip"} onClick={() => selectCategory(x)} key={x}>{x}</button>)}
    </div>
    <p className="mt-5 text-sm text-muted-foreground" aria-live="polite">{items.length} نتيجة{q && <> عن «{q}»</>}</p>
    {visible.length ? <div className="phrase-grid">
      {visible.map((x) => {
        const id = idFor(x);
        return <article className="phrase-card" key={id} onClick={() => setDetail(x)}>
          <div><span>{x[0]}</span><button type="button" onClick={(e) => { e.stopPropagation(); fav(id); }} aria-label={favs.includes(id) ? "إزالة من المفضلة" : "حفظ في المفضلة"} aria-pressed={favs.includes(id)}><Heart size={18} fill={favs.includes(id) ? "currentColor" : "none"}/></button></div>
          <h2>{x[1]}</h2><p>{x[2]}</p>
        </article>;
      })}
    </div> : <div className="mt-8 rounded-2xl border border-border p-8 text-center text-muted-foreground">لا توجد عبارات مطابقة. جرّب كلمة أقصر أو اختر تصنيفًا آخر.</div>}
    {pages > 1 && <nav className="mt-8 flex items-center justify-center gap-4" aria-label="صفحات القاموس">
      <button type="button" className="outline-button" disabled={page === 1} onClick={() => setPage(page - 1)}>السابق</button>
      <span className="text-sm text-muted-foreground">صفحة {page} من {pages}</span>
      <button type="button" className="outline-button" disabled={page === pages} onClick={() => setPage(page + 1)}>التالي <ChevronLeft size={16}/></button>
    </nav>}
    {detail && <Modal title="تفاصيل العبارة" onClose={() => setDetail(null)}>
      <span className="eyebrow">{detail[0]}</span>
      <p className="mt-4 text-lg font-bold">{detail[1]}</p>
      <p className="mt-3 rounded-xl bg-secondary p-4 leading-7">{detail[2]}</p>
      <p className="mt-3 text-xs text-muted-foreground">مثال تقريبي قابل لاختلاف النطق والصياغة.</p>
      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <button className="outline-button" onClick={() => { if ("speechSynthesis" in window) { const u = new SpeechSynthesisUtterance(detail[2]); u.lang = "ar"; speechSynthesis.speak(u); } }}><Volume2 size={18}/>استماع آلي</button>
        <button className="primary-button" onClick={() => nav({ to: "/" })}>استخدم في المترجم</button>
      </div>
    </Modal>}
  </>;
}
