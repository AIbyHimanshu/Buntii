// The wordmark ships in exactly three colourways — light, reversed, one-colour ink.
// The full stop is never dropped. The stop is the auntie.
const COLORWAYS = {
  light: { bunt: "#16584A", ii: "#FF6A4D", stop: "#4ABB92" },
  reversed: { bunt: "#4ABB92", ii: "#FF6A4D", stop: "#4ABB92" },
  ink: { bunt: "#0A2A22", ii: "#0A2A22", stop: "#0A2A22" },
};

export const Wordmark = ({ colorway = "light", className = "text-2xl", testId = "wordmark" }) => {
  const c = COLORWAYS[colorway] || COLORWAYS.light;
  return (
    <span className={`font-display font-extrabold tracking-tight ${className}`} data-testid={testId}>
      <span style={{ color: c.bunt }}>Bunt</span>
      <span style={{ color: c.ii }}>ii</span>
      <span style={{ color: c.stop }}>.</span>
    </span>
  );
};
