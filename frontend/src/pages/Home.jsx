import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform, useScroll } from "framer-motion";
import { ArrowRight, BadgeCheck, MapPin, Store, ShoppingBasket, Fish } from "lucide-react";
import { MaskedLines, Marquee, Reveal, Counter, Chapter } from "../components/Motion";
import { DealCard } from "../components/DealCard";
import { WaitlistForm } from "../components/WaitlistForm";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { MOCK_DEALS } from "../lib/mockDeals";
import { track } from "../lib/analytics";

const WHY = [
  {
    title: "The gap is the point",
    body: "Same shop, same food, few hours apart. We just tell you which four hours.",
  },
  {
    title: "Down your road, not down the motorway",
    body: "No chains, no delivery vans, no warehouse in Leeds. Only the shops you already walk past. Can't walk to it? It's not on here.",
  },
  {
    title: "The actual thing, not a mystery bag",
    body: "You see exactly what's reduced and go get exactly that. No surprise bags, no hoping you like beetroot. You choose.",
  },
  {
    title: "The bin doesn't need feeding. You do.",
    body: "Everything you grab was heading for the skip. Cheaper for you, less waste for everyone. Nice bonus. Not the reason you came.",
  },
];

const USPS = [
  {
    title: "Every reduction on the street, not just the supermarkets.",
    body: "The greengrocer, the fishmonger, the baker your nan trusts. The shops most apps never bother to list. Buntii is built for them.",
  },
  {
    title: "See the actual item, not a mystery bag.",
    body: "Item-level, choose-what-you-want discovery. You see it, you want it, you walk over. No gambling on what's inside.",
  },
  {
    title: "Real-time, verified by your neighbours.",
    body: "Shoppers confirm or flag items in-store, building the trust layer no till integration can fake. Spotters earn status.",
  },
];

const STEPS = [
  { n: "1", title: "Open Buntii", body: "No signup needed to browse. Just open the app and see what's on near you right now." },
  { n: "2", title: "Find something good", body: "Browse by category or compare prices across every shop on your street." },
  { n: "3", title: "Let Buntii route you", body: "Add your list and our smart planner works out the fewest shops for the lowest total." },
  { n: "4", title: "Pick up & enjoy", body: "Walk over, pay in-store, and take home the same food for a fraction of the price." },
];

const FAQS = [
  {
    q: "Is Buntii live yet?",
    a: "Not yet. We're onboarding traders on Green Lanes first — the densest mile of independent grocers and fishmongers in London. Join the waitlist and we'll tell you the moment your street switches on.",
  },
  {
    q: "What does it cost?",
    a: "Free for shoppers. Zero fee for traders at launch. Margins are thin enough already.",
  },
  {
    q: "Is this like Too Good To Go?",
    a: "No. You see the actual item before you leave the house — the £3 tray of strawberries that's 90p now — and you go get exactly that. No mystery bags, no hoping you like beetroot.",
  },
  {
    q: "Which shops will be on it?",
    a: "Greengrocers. Fishmongers. Bakers. Butchers. Market stalls. The independents who know their customers by name — the shops the other apps structurally can't reach.",
  },
  {
    q: "When do the deals appear?",
    a: "When the shops drop their prices — usually as the evening wears on. Real-time, item-level, down your road. Gone by five means gone by five.",
  },
];

const MARQUEE_ITEMS = [
  "Trust your auntie.",
  "Gone by 5pm. Move.",
  "Fresh this morning. Don't be shy.",
  "For this price? Take two.",
  "Waste? Not in this house.",
  "Same strawberries. Same shop. 90p by five.",
];

// Market-stall awning — the brand mark. Jade, deep jade and white only.
const Awning = ({ className = "" }) => (
  <svg viewBox="0 0 240 38" className={className} aria-hidden="true" preserveAspectRatio="none">
    {Array.from({ length: 8 }).map((_, i) => (
      <path
        key={i}
        d={`M${i * 30} 0 h30 v20 q-15 15 -30 0 z`}
        fill={i % 2 === 0 ? "#4ABB92" : "#FFFFFF"}
      />
    ))}
    <rect x="0" y="0" width="240" height="5" fill="#16584A" />
  </svg>
);

const Hero = () => {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 55, damping: 16 });
  const sy = useSpring(my, { stiffness: 55, damping: 16 });
  const cardX = useTransform(sx, (v) => v * 26);
  const cardY = useTransform(sy, (v) => v * 18);
  const backX = useTransform(sx, (v) => v * -14);
  const backY = useTransform(sy, (v) => v * -10);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 90]);

  const onMove = (e) => {
    mx.set(e.clientX / window.innerWidth - 0.5);
    my.set(e.clientY / window.innerHeight - 0.5);
  };

  const big = MOCK_DEALS[0];
  const small = MOCK_DEALS[1];

  return (
    <section ref={ref} onMouseMove={onMove} className="relative overflow-hidden bg-blush" data-testid="hero">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-14 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:pb-28 lg:pt-20">
        <div>
          <Reveal y={14}>
            <span className="eyebrow-chip" data-testid="hero-eyebrow">
              <MapPin size={12} className="text-coral" />
              Now onboarding · Green Lanes, North London
            </span>
          </Reveal>
          <h1 className="mt-7 font-display text-4xl font-extrabold leading-[1.02] tracking-tight text-ink sm:text-5xl lg:text-[64px]">
            <MaskedLines
              delay={0.15}
              lines={[
                <span key="a">The deals on</span>,
                <span key="b">your street.</span>,
                <span key="c" className="text-deepjade">Before they're gone.</span>,
              ]}
            />
          </h1>
          <Reveal delay={0.55}>
            <p className="mt-6 max-w-md text-base leading-relaxed text-slatesage md:text-lg">
              No mystery bags. No supermarket-only deals. Just the good stuff that's reduced right now.
            </p>
          </Reveal>
          <Reveal delay={0.7}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link to="/shoppers" className="btn btn-secondary" onClick={() => track("hero_shopper_click")} data-testid="hero-shopper-cta">
                Find deals near me
              </Link>
              <Link to="/traders" className="btn btn-secondary" onClick={() => track("hero_trader_click")} data-testid="hero-trader-cta">
                I'm a trader
              </Link>
              <button
                className="btn btn-primary"
                onClick={() => {
                  track("waitlist_open", { source: "hero" });
                  const el = document.getElementById("waitlist");
                  if (el && window.__lenis) window.__lenis.scrollTo(el, { offset: -84, duration: 1.4 });
                  else if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                data-testid="hero-join-cta"
              >
                Join the waitlist
                <ArrowRight size={16} />
              </button>
            </div>
          </Reveal>
        </div>

        {/* Hero visual — illustrative mock deal cards, not live inventory */}
        <motion.div className="relative mx-auto w-full max-w-md pt-14 lg:max-w-none" style={{ y: parallaxY }}>
          <motion.div style={{ x: backX, y: backY }} className="absolute left-0 right-0 top-0">
            <Awning className="h-14 w-full drop-shadow-sm" />
          </motion.div>
          <motion.div
            style={{ x: cardX, y: cardY }}
            initial={{ opacity: 0, y: 60, rotate: 4 }}
            animate={{ opacity: 1, y: 0, rotate: 2 }}
            transition={{ duration: 1, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 mx-auto w-[82%]"
          >
            <article className="card-deal relative overflow-hidden rounded-3xl" data-testid="hero-deal-card">
              <span className="absolute right-3 top-3 z-10 rounded-md bg-coral px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-ink">
                {big.goneBy}
              </span>
              <div className="flex h-52 items-center justify-center bg-seamist">
                <big.icon size={84} strokeWidth={1.2} className="text-jade" aria-hidden="true" />
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-bold text-ink">{big.item}</h3>
                <p className="mt-1 text-sm text-slatesage">{big.shop}</p>
                <div className="mt-5 flex items-end justify-between border-t pt-4" style={{ borderColor: "var(--hairline)" }}>
                  <p className="flex items-baseline gap-2.5">
                    <span className="text-sm uppercase tracking-wide text-slatesage">Now</span>
                    <span className="font-display text-4xl font-extrabold text-jade">{big.now}</span>
                  </p>
                  <p className="text-right">
                    <span className="block text-sm text-slatesage line-through">Was {big.was}</span>
                    <span className="block text-xs font-semibold uppercase tracking-wide text-deepjade">You saved {big.saved}</span>
                  </p>
                </div>
              </div>
            </article>
          </motion.div>
          <motion.div
            style={{ x: backX, y: cardY }}
            initial={{ opacity: 0, y: 80, rotate: -8 }}
            animate={{ opacity: 1, y: 0, rotate: -6 }}
            transition={{ duration: 1, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="absolute -bottom-10 left-2 z-20 w-[52%] sm:left-6"
          >
            <article className="card-deal overflow-hidden rounded-2xl shadow-[0_24px_50px_-24px_rgba(10,42,34,0.4)]" data-testid="hero-deal-card-small">
              <div className="flex h-24 items-center justify-center bg-seamist">
                <Fish size={40} strokeWidth={1.4} className="text-jade" aria-hidden="true" />
              </div>
              <div className="p-4">
                <h3 className="font-display text-sm font-bold text-ink">{small.item}</h3>
                <p className="mt-2 flex items-baseline gap-2">
                  <span className="font-display text-xl font-extrabold text-jade">{small.now}</span>
                  <span className="text-xs text-slatesage line-through">{small.was}</span>
                </p>
              </div>
            </article>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

const Home = () => (
  <main>
    <Hero />

    <Marquee
      items={MARQUEE_ITEMS}
      className="border-y bg-jade py-4 text-ink"
      itemClassName="text-sm"
    />

    {/* 01 — The problem */}
    <section className="bg-white" data-testid="section-problem">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <Chapter number="01" label="The problem" />
        <div className="mt-8 grid gap-12 lg:grid-cols-2">
          <Reveal>
            <h2 className="font-display text-3xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-4xl lg:text-5xl">
              The shops on your street drop their prices <span className="text-deepjade">every evening.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-base leading-relaxed text-ink md:text-lg">
              Greengrocers, fishmongers, bakeries. Strawberries: £3 at noon, <span className="font-semibold text-jade" style={{ color: "var(--deep-jade)" }}>90p by five</span>.
            </p>
            <p className="mt-5 text-base leading-relaxed text-slatesage">
              You just never knew until you'd already walked past. <span className="font-semibold text-deepjade">Now you do.</span>
            </p>
          </Reveal>
        </div>
      </div>
    </section>

    {/* 02 — What Buntii is */}
    <section className="bg-seamist" data-testid="section-what">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <Chapter number="02" label="What Buntii is" />
        <Reveal className="mt-8 max-w-3xl">
          <h2 className="font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-deepjade sm:text-4xl">
            Every reduction at the independent grocers, fishmongers and bakeries on your road. Real-time, item-level, verified by your neighbours.
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {USPS.map((u, i) => (
            <Reveal key={u.title} delay={i * 0.12}>
              <div className="h-full rounded-2xl border bg-white p-7" style={{ borderColor: "var(--hairline)" }} data-testid={`usp-card-${i}`}>
                <span className="font-display text-sm font-extrabold text-jade">0{i + 1}</span>
                <h3 className="mt-3 font-display text-lg font-bold leading-snug text-ink">{u.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slatesage">{u.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* Reduced right now — illustrative mock deals */}
    <section className="bg-white" data-testid="section-deals">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Reduced right now<span className="text-jade">.</span>
            </h2>
            <p className="mt-3 text-sm text-slatesage">The kind of thing you'll see, every evening. Illustrative examples — the real ones land at launch.</p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="font-display text-lg font-bold uppercase tracking-wide text-coralpress">Auntie says: gone by 5pm. Move.</p>
          </Reveal>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MOCK_DEALS.map((deal, i) => (
            <DealCard key={deal.id} deal={deal} delay={i * 0.12} />
          ))}
        </div>
      </div>
    </section>

    {/* 03 — Why Buntii */}
    <section id="why-buntii" className="bg-seamist" data-testid="section-why">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <Chapter number="03" label="Why Buntii" />
        <Reveal className="mt-8 max-w-2xl">
          <h2 className="font-display text-3xl font-extrabold leading-[1.08] tracking-tight text-deepjade sm:text-4xl lg:text-5xl">
            Strawberries: £3 at noon, 90p by five. Buntii tells you when.
          </h2>
        </Reveal>
        <div className="mt-14 grid gap-x-10 gap-y-12 md:grid-cols-2">
          {WHY.map((w, i) => (
            <Reveal key={w.title} delay={i * 0.1}>
              <div className="border-l-2 border-jade pl-6" data-testid={`why-bullet-${i}`}>
                <h3 className="font-display text-xl font-bold text-ink">{w.title}</h3>
                <p className="mt-3 max-w-md text-base leading-relaxed text-slatesage">{w.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Stat block — animate-on-scroll counters; figures sourced */}
        <Reveal className="mt-20">
          <div className="overflow-hidden rounded-3xl bg-ink px-7 py-12 sm:px-12" data-testid="stat-block">
            <div className="grid gap-10 md:grid-cols-3">
              <div>
                <p className="font-display text-5xl font-extrabold text-jade lg:text-6xl">
                  <Counter to={38.6} decimals={1} suffix="%" />
                </p>
                <p className="mt-3 text-sm leading-relaxed text-seamist">UK food price rise, 2020–2025</p>
                <p className="mt-1 text-xs" style={{ color: "var(--footer-heading)" }}>House of Commons Library, Jan 2026</p>
              </div>
              <div>
                <p className="font-display text-5xl font-extrabold text-jade lg:text-6xl">
                  £<Counter to={17} suffix="bn" />
                </p>
                <p className="mt-3 text-sm leading-relaxed text-seamist">Edible food wasted in the UK every year — about £1,000 a household of four</p>
                <p className="mt-1 text-xs" style={{ color: "var(--footer-heading)" }}>WRAP, 2025</p>
              </div>
              <div>
                <p className="font-display text-5xl font-extrabold text-jade lg:text-6xl">
                  &lt;<Counter from={10000} to={1000} duration={2.2} />
                </p>
                <p className="mt-3 text-sm leading-relaxed text-seamist">Independent fishmongers left — down from around 10,000 in the 1950s</p>
                <p className="mt-1 text-xs" style={{ color: "var(--footer-heading)" }}>Industry estimates, Buntii bedrock</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>

    {/* 04 — Green Lanes / local wedge */}
    <section className="bg-blush" data-testid="section-green-lanes">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <Chapter number="04" label="Where we start" />
        <div className="mt-8 grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <h2 className="font-display text-3xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-4xl lg:text-5xl">
              North London is the wedge, <span className="text-deepjade">not the ceiling.</span>
            </h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-ink md:text-lg">
              We're starting on Green Lanes, the densest mile of independent grocers and fishmongers in London. Then North London. Then London, corridor by corridor.
            </p>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-slatesage">
              Every high street in this country has the same shops dropping the same prices to nobody. We're going to switch all of it on.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="relative rounded-3xl border bg-white p-8" style={{ borderColor: "var(--hairline)" }}>
              <div className="grid grid-cols-6 gap-3" aria-hidden="true">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="flex h-14 items-center justify-center rounded-xl bg-seamist">
                    <MapPin size={18} className={i % 5 === 0 ? "text-coral" : "text-jade"} strokeWidth={2} />
                  </div>
                ))}
              </div>
              <p className="mt-6 flex items-center gap-2 text-sm font-semibold text-deepjade">
                <MapPin size={15} className="text-jade" />
                Green Lanes, N4–N8 · first corridor
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>

    {/* 05 — For shoppers / For traders */}
    <section className="bg-white" data-testid="section-audiences">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <Chapter number="05" label="Two sides, one street" />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <Link to="/shoppers" onClick={() => track("hero_shopper_click", { from: "home_split" })} className="group block h-full rounded-3xl border bg-white p-9 transition-shadow duration-300 hover:shadow-[0_24px_60px_-30px_rgba(10,42,34,0.35)]" style={{ borderColor: "var(--hairline)" }} data-testid="split-shoppers">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-seamist">
                <ShoppingBasket size={22} className="text-jade" />
              </span>
              <h3 className="mt-6 font-display text-2xl font-extrabold text-ink">For shoppers</h3>
              <p className="mt-4 max-w-md text-base leading-relaxed text-slatesage">
                The store next door cuts its prices every evening. Now you'll know. Real food, real prices — the thing you actually wanted, for a fraction of what it cost at noon.
              </p>
              <p className="mt-6 flex items-center gap-2 text-sm font-semibold text-deepjade transition-colors group-hover:text-coralpress">
                See what's in it for you <ArrowRight size={15} />
              </p>
            </Link>
          </Reveal>
          <Reveal delay={0.12}>
            <Link to="/traders" onClick={() => track("hero_trader_click", { from: "home_split" })} className="group block h-full rounded-3xl border bg-white p-9 transition-shadow duration-300 hover:shadow-[0_24px_60px_-30px_rgba(10,42,34,0.35)]" style={{ borderColor: "var(--hairline)" }} data-testid="split-traders">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-seamist">
                <Store size={22} className="text-jade" />
              </span>
              <h3 className="mt-6 font-display text-2xl font-extrabold text-ink">For traders</h3>
              <p className="mt-4 max-w-md text-base leading-relaxed text-slatesage">
                You already drop your prices at five. Now the whole street will know. No till, no hardware, no faff — ten seconds and it's live.
              </p>
              <p className="mt-6 flex items-center gap-2 text-sm font-semibold text-deepjade transition-colors group-hover:text-coralpress">
                Get in early <ArrowRight size={15} />
              </p>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>

    {/* 06 — How it works */}
    <section id="how-it-works" className="bg-seamist" data-testid="section-how-it-works">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <Chapter number="06" label="How it works" />
        <Reveal className="mt-8">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-deepjade sm:text-4xl">
            From deal to door in minutes.
          </h2>
          <p className="mt-4 max-w-xl text-base text-slatesage">
            The whole journey takes less time than deciding what to have for lunch.
          </p>
        </Reveal>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1}>
              <div className="h-full rounded-2xl border bg-white p-7" style={{ borderColor: "var(--hairline)" }} data-testid={`how-step-${s.n}`}>
                <span className="font-display text-4xl font-extrabold text-jade">{s.n}</span>
                <h3 className="mt-4 font-display text-lg font-bold text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slatesage">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* 07 — Community / verification */}
    <section className="bg-white" data-testid="section-community">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-seamist">
              <BadgeCheck size={22} className="text-jade" />
            </span>
            <h2 className="mt-6 font-display text-3xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-4xl">
              Real-time, <span className="text-deepjade">verified by your neighbours.</span>
            </h2>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-slatesage md:text-lg">
              Shoppers confirm or flag items in-store, so a deal on Buntii is a deal that's actually on the shelf. Follow your favourite traders and get pinged the moment they start reducing.
            </p>
          </Reveal>
          <div className="space-y-4">
            {[
              { name: "A neighbour", text: "Still there — 6 trays left, just walked past.", time: "2 min ago" },
              { name: "A spotter you trust", text: "Confirmed: sea bass at £4.50, ice fresh.", time: "9 min ago" },
              { name: "Buntii", text: "The bakery on the corner just started reducing.", time: "Just now" },
            ].map((v, i) => (
              <Reveal key={v.text} delay={i * 0.12}>
                <div className="flex items-start gap-4 rounded-2xl border bg-white p-5" style={{ borderColor: "var(--hairline)" }} data-testid={`verify-card-${i}`}>
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-jade">
                    <BadgeCheck size={16} className="text-ink" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{v.name} <span className="font-normal text-slatesage">· {v.time}</span></p>
                    <p className="mt-1 text-sm text-slatesage">{v.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>

    {/* 08 — Why (mission) */}
    <section className="bg-blush" data-testid="section-mission">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <Chapter number="07" label="Why we exist" />
        <Reveal className="mt-8 max-w-4xl">
          <h2 className="font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Good food doesn't die in the bin. Good shops don't die on the high street.
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          <Reveal delay={0.1}>
            <p className="text-base leading-relaxed text-ink md:text-lg">
              Every evening, independent traders throw away fresh food they couldn't sell, while families a street away pay full price somewhere else. Buntii closes that gap, one reduced tray and one walkable street at a time.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-base leading-relaxed text-slatesage md:text-lg">
              Buntii turns one shop's loss into one family's saving, and makes the independent trader — not the supermarket — the hero of the story. <span className="font-semibold text-deepjade">Trust your auntie.</span>
            </p>
          </Reveal>
        </div>
      </div>
    </section>

    {/* FAQ */}
    <section id="faq" className="bg-white" data-testid="section-faq">
      <div className="mx-auto max-w-3xl px-5 py-24 sm:px-8 lg:py-28">
        <Reveal className="text-center">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Go on, ask<span className="text-jade">.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1} className="mt-10">
          <Accordion type="single" collapsible>
            {FAQS.map((f, i) => (
              <AccordionItem key={f.q} value={`faq-${i}`} style={{ borderColor: "var(--hairline)" }}>
                <AccordionTrigger
                  className="text-left font-display text-base font-bold text-ink hover:text-deepjade hover:no-underline"
                  onClick={() => track("faq_opened", { question: f.q })}
                  data-testid={`faq-question-${i}`}
                >
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-slatesage">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>

    {/* Waitlist */}
    <section id="waitlist" className="bg-blush" data-testid="section-waitlist">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:py-32">
        <Reveal>
          <h2 className="font-display text-3xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Get it for a steal<span className="text-jade">.</span>
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-slatesage md:text-lg">
            Join the waitlist. Green Lanes first — tell us where you are and we'll tell you the moment your street switches on.
          </p>
          <p className="mt-8 font-display text-lg font-bold text-deepjade">Trust your auntie.</p>
        </Reveal>
        <Reveal delay={0.15}>
          <WaitlistForm source="homepage" />
        </Reveal>
      </div>
    </section>

    {/* Closing CTA — the one coral band */}
    <section className="bg-coral" data-testid="closing-cta">
      <div className="mx-auto max-w-7xl px-5 py-20 text-center sm:px-8 lg:py-28">
        <Reveal>
          <h2 className="font-display text-3xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
            Auntie says: gone by 5pm. Move.
          </h2>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mx-auto mt-5 max-w-xl text-base md:text-lg" style={{ color: "var(--coral-subcopy)" }}>
            The good stuff goes fast and it never comes back at this price. Get on the list before your street does.
          </p>
        </Reveal>
        <Reveal delay={0.22}>
          <button
            className="btn btn-ink mt-9 !px-8 !py-4 !text-base"
            onClick={() => {
              const el = document.getElementById("waitlist");
              if (el && window.__lenis) window.__lenis.scrollTo(el, { offset: -84, duration: 1.4 });
              else if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            data-testid="closing-cta-button"
          >
            Join the waitlist
            <ArrowRight size={16} />
          </button>
        </Reveal>
      </div>
    </section>
  </main>
);

export default Home;
