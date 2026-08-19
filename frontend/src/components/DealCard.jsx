// Deal card — locked: white on white, hairline border, sea-mist image well,
// reduced price always jade (Bricolage 800), struck original slate sage,
// coral urgency flag top-right only, max one per card.
import { Reveal } from "./Motion";

export const DealCard = ({ deal, delay = 0, className = "" }) => {
  const Icon = deal.icon;
  return (
    <Reveal delay={delay} className={className}>
      <article className="card-deal relative overflow-hidden rounded-2xl" data-testid={`deal-card-${deal.id}`}>
        <span
          className="absolute right-3 top-3 z-10 rounded-md bg-coral px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-ink"
          data-testid={`deal-flag-${deal.id}`}
        >
          {deal.goneBy}
        </span>
        <div className="flex h-40 items-center justify-center bg-seamist">
          <Icon size={56} strokeWidth={1.4} className="text-jade" aria-hidden="true" />
        </div>
        <div className="p-5">
          <h3 className="font-display text-lg font-bold leading-snug text-ink">{deal.item}</h3>
          <p className="mt-1 text-sm text-slatesage">{deal.shop}</p>
          <div className="mt-4 flex items-end justify-between">
            <p className="flex items-baseline gap-2">
              <span className="font-display text-2xl font-extrabold text-jade" data-testid={`deal-price-${deal.id}`}>
                {deal.now}
              </span>
              <span className="text-sm text-slatesage line-through">{deal.was}</span>
            </p>
            <p className="text-xs font-semibold uppercase tracking-wide text-deepjade">You saved {deal.saved}</p>
          </div>
        </div>
      </article>
    </Reveal>
  );
};
