import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

export const Reveal = ({ children, delay = 0, y = 28, className = "" }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-70px" }}
    transition={{ duration: 0.75, delay, ease: EASE }}
  >
    {children}
  </motion.div>
);

// Masked line-by-line reveal — the signature on-load hero moment.
export const MaskedLines = ({ lines, className = "", lineClassName = "", delay = 0 }) => (
  <span className={className}>
    {lines.map((line, i) => (
      <span key={i} className="block overflow-hidden pb-[0.1em] -mb-[0.1em]">
        <motion.span
          className={`block ${lineClassName}`}
          initial={{ y: "115%" }}
          animate={{ y: "0%" }}
          transition={{ duration: 0.95, delay: delay + i * 0.13, ease: EASE }}
        >
          {line}
        </motion.span>
      </span>
    ))}
  </span>
);

// Slow editorial marquee band.
export const Marquee = ({ items, className = "", itemClassName = "" }) => {
  const row = [...items, ...items];
  return (
    <div className={`marquee ${className}`} aria-hidden="true">
      <div className="marquee-track">
        {row.map((item, i) => (
          <span key={i} className={`flex items-center whitespace-nowrap ${itemClassName}`}>
            <span className="font-display font-bold uppercase tracking-[0.08em]">{item}</span>
            <span className="mx-8 inline-block h-2 w-2 rounded-full bg-current opacity-60" />
          </span>
        ))}
      </div>
    </div>
  );
};

// Animate-on-scroll counter — figures can be swapped without a rebuild.
export const Counter = ({ to, from = 0, decimals = 0, prefix = "", suffix = "", duration = 1.8, className = "" }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [val, setVal] = useState(from);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(from, to, {
      duration,
      ease: EASE,
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [inView, from, to, duration]);

  const formatted = val.toLocaleString("en-GB", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return (
    <span ref={ref} className={className} data-testid="stat-counter">
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};

// Numbered manifesto chapter eyebrow.
export const Chapter = ({ number, label, dark = false }) => (
  <Reveal>
    <p
      className={`flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] ${
        dark ? "text-jade" : "text-deepjade"
      }`}
      data-testid={`chapter-${number}`}
    >
      <span className="font-display text-sm font-bold">{number}</span>
      <span className={`h-px w-10 ${dark ? "bg-jade" : "bg-deepjade"}`} />
      {label}
    </p>
  </Reveal>
);
