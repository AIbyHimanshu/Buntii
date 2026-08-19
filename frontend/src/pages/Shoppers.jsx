import { ShoppingBasket, Fish, Store } from "lucide-react";
import { MaskedLines, Reveal, Chapter, Marquee } from "../components/Motion";
import { WaitlistForm } from "../components/WaitlistForm";
import { track } from "../lib/analytics";

const WHY = [
  {
    title: "Pick what you like. Not a mystery bag.",
    body: "You need the freedom of choice, and Buntii supports it. You see it, you want it, you walk over. No surprise bags. No gambling on what's inside.",
    icon: ShoppingBasket,
  },
  {
    title: "Real food. Real prices.",
    body: "Fresh fruit, fish off the ice, bread from this morning. The food you were going to buy anyway, minus most of the price. Near closing, plenty of it is half price or better.",
    icon: Fish,
  },
  {
    title: "Independents first.",
    body: "Not just the big supermarkets. The greengrocer, the fishmonger, the baker your nan trusts. The shops most apps never bother to list.",
    icon: Store,
  },
];

const STEPS = [
  { n: "1", title: "Tell us where you are.", body: "Your street, your shops. That's the whole setup." },
  { n: "2", title: "See what's reduced near you, right now.", body: "The actual item, the actual price, the actual shop — as it drops." },
  { n: "3", title: "Walk over, buy it, home before dinner.", body: "Pay in-store like you always do. Just cheaper." },
];

const Shoppers = () => (
  <main>
    <section className="bg-blush" data-testid="shoppers-hero">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <Reveal y={14}>
          <span className="eyebrow-chip" data-testid="shoppers-eyebrow">For shoppers</span>
        </Reveal>
        <h1 className="mt-7 max-w-4xl font-display text-4xl font-extrabold leading-[1.03] tracking-tight text-ink sm:text-5xl lg:text-6xl">
          <MaskedLines
            delay={0.15}
            lines={[
              <span key="a">The deals on your street.</span>,
              <span key="b" className="text-deepjade">Before they're gone.</span>,
            ]}
          />
        </h1>
        <Reveal delay={0.45}>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-slatesage md:text-lg">
            Every evening, the shops near you quietly drop their prices. Buntii shows you what's reduced, where, and right now. You get the thing you actually wanted, for a fraction of what it cost at noon.
          </p>
        </Reveal>
        <Reveal delay={0.6}>
          <button
            className="btn btn-primary mt-9"
            onClick={() => {
              track("waitlist_open", { source: "shoppers_hero" });
              const el = document.getElementById("shopper-waitlist");
              if (el && window.__lenis) window.__lenis.scrollTo(el, { offset: -84, duration: 1.3 });
              else if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            data-testid="shoppers-join-cta"
          >
            Join the waitlist
          </button>
        </Reveal>
      </div>
    </section>

    <Marquee
      items={["Same strawberries. Same shop. 90p by five.", "Trust your auntie.", "Fresh this morning. Don't be shy.", "Gone by 5pm. Move."]}
      className="border-y bg-jade py-4 text-ink"
      itemClassName="text-sm"
    />

    <section className="bg-white" data-testid="shoppers-why">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <Chapter number="01" label="Why Buntii" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {WHY.map((w, i) => (
            <Reveal key={w.title} delay={i * 0.12}>
              <div className="h-full rounded-2xl border bg-white p-8" style={{ borderColor: "var(--hairline)" }} data-testid={`shoppers-why-${i}`}>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-seamist">
                  <w.icon size={20} className="text-jade" />
                </span>
                <h3 className="mt-5 font-display text-xl font-bold leading-snug text-ink">{w.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slatesage">{w.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-20">
          <div className="rounded-3xl bg-ink px-7 py-12 sm:px-12" data-testid="shoppers-rhetoric">
            <p className="max-w-3xl font-display text-2xl font-extrabold leading-snug text-white sm:text-3xl lg:text-4xl">
              Why pay £3 for strawberries at noon when they're <span className="text-jade">90p by five?</span>
            </p>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-seamist">
              Same strawberries. Same shop. Your auntie always knew when to turn up. Now you do too.
            </p>
          </div>
        </Reveal>
      </div>
    </section>

    <section className="bg-seamist" data-testid="shoppers-how">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <Chapter number="02" label="How it works" />
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.1}>
              <div className="h-full rounded-2xl border bg-white p-8" style={{ borderColor: "var(--hairline)" }} data-testid={`shoppers-step-${s.n}`}>
                <span className="font-display text-4xl font-extrabold text-jade">{s.n}</span>
                <h3 className="mt-4 font-display text-lg font-bold leading-snug text-ink">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slatesage">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}>
          <p className="mt-12 max-w-2xl text-base leading-relaxed text-ink md:text-lg">
            Food prices are up nearly 40% in five years. Your auntie has had enough of that. Buntii points you at the food that's already been marked down tonight, on your own street.
          </p>
        </Reveal>
      </div>
    </section>

    <section id="shopper-waitlist" className="bg-blush" data-testid="shoppers-waitlist">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-24 sm:px-8 lg:grid-cols-2 lg:py-32">
        <Reveal>
          <h2 className="font-display text-3xl font-extrabold leading-[1.05] tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Know the moment your street switches on<span className="text-jade">.</span>
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-slatesage md:text-lg">
            We're starting on Green Lanes and working outward, corridor by corridor. Pop your postcode in — it tells us where to go next.
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <WaitlistForm presetRole="shopper" source="shoppers_page" />
        </Reveal>
      </div>
    </section>
  </main>
);

export default Shoppers;
