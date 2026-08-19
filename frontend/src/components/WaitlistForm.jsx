import { useEffect, useRef, useState } from "react";
import { AlertCircle, Check, Copy, ShoppingBasket, Store } from "lucide-react";
import { api, getAttribution, formatApiError } from "../lib/api";
import { track } from "../lib/analytics";

const SHOP_TYPES = ["Greengrocer", "Fishmonger", "Bakery", "Butcher", "Market stall", "Other independent"];
const UK_POSTCODE = /^([A-Za-z]{1,2}\d[A-Za-z\d]?)\s*(\d[A-Za-z]{2})$/;

// Cloudflare Turnstile widget — renders nothing and allows through when no site key is configured.
const TurnstileWidget = ({ onToken }) => {
  const box = useRef(null);
  const widget = useRef(null);
  const siteKey = (process.env.REACT_APP_TURNSTILE_SITE_KEY || "").trim();

  useEffect(() => {
    if (!siteKey) return;
    let cancelled = false;
    const render = () => {
      if (!cancelled && window.turnstile && box.current && !widget.current) {
        widget.current = window.turnstile.render(box.current, {
          sitekey: siteKey,
          action: "waitlist",
          theme: "light",
          callback: (token) => onToken(token),
          "expired-callback": () => onToken(null),
          "error-callback": () => onToken(null),
        });
      }
    };
    const src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    if (!document.querySelector(`script[src^="${src}"]`)) {
      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.defer = true;
      script.onload = render;
      document.head.appendChild(script);
    }
    if (window.turnstile) render();
    const t = setInterval(render, 500);
    return () => {
      cancelled = true;
      clearInterval(t);
      if (widget.current && window.turnstile) window.turnstile.remove(widget.current);
    };
  }, [siteKey, onToken]);

  if (!siteKey) return null;
  return <div ref={box} className="pt-1" aria-label="Bot verification" data-testid="turnstile-widget" />;
};

export const WaitlistForm = ({ presetRole = null, source = "homepage" }) => {
  const [role, setRole] = useState(presetRole || "shopper");
  const [form, setForm] = useState({ first_name: "", email: "", postcode: "" });
  const [trader, setTrader] = useState({ shop_name: "", shop_type: "", phone_whatsapp: "" });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(1);
  const [serverError, setServerError] = useState("");
  const [referralCode, setReferralCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const [token, setToken] = useState(null);
  const openedRef = useRef(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (presetRole) setRole(presetRole);
  }, [presetRole]);

  const set = (key) => (e) => {
    if (!startedRef.current) {
      startedRef.current = true;
      track("waitlist_started", { source, role });
    }
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const validate = () => {
    const er = {};
    if (!form.first_name.trim()) er.first_name = "Tell us your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) er.email = "That email doesn't look right.";
    if (!UK_POSTCODE.test(form.postcode.trim())) er.postcode = "Needs a full postcode.";
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;
    setBusy(true);
    try {
      const { data } = await api.post("/waitlist", {
        ...form,
        role,
        source,
        ...getAttribution(),
        turnstile_token: token,
      });
      track("waitlist_completed", { role, source });
      track(role === "trader" ? "trader_signup" : "shopper_signup", { source });
      setReferralCode(data.referral_code);
      setStep(role === "trader" && data.status === "created" ? 2 : 3);
    } catch (err) {
      setServerError(formatApiError(err));
    } finally {
      setBusy(false);
    }
  };

  const submitTrader = async (e) => {
    e.preventDefault();
    setServerError("");
    const er = {};
    if (!trader.shop_name.trim()) er.shop_name = "What's the shop called?";
    if (!trader.shop_type) er.shop_type = "Pick one — closest fits.";
    setErrors(er);
    if (Object.keys(er).length) return;
    setBusy(true);
    try {
      await api.post("/waitlist/details", { email: form.email.trim(), ...trader });
      setStep(3);
    } catch (err) {
      setServerError(formatApiError(err));
    } finally {
      setBusy(false);
    }
  };

  const shareLink = referralCode ? `https://buntii.co.uk/?ref=${referralCode}` : null;
  const copyLink = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      track("referral_share", { source });
      setTimeout(() => setCopied(false), 2000);
    } catch (e) { /* noop */ }
  };

  return (
    <div
      className="rounded-3xl border bg-white p-6 shadow-[0_30px_80px_-40px_rgba(10,42,34,0.35)] sm:p-9"
      style={{ borderColor: "var(--hairline)" }}
      data-testid="waitlist-form"
      ref={(el) => {
        if (el && !openedRef.current) {
          openedRef.current = true;
          const io = new IntersectionObserver(
            (entries) => entries[0].isIntersecting && track("waitlist_open", { source }),
            { threshold: 0.4 }
          );
          io.observe(el);
        }
      }}
    >
      {step === 1 && (
        <form onSubmit={submit} noValidate>
          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="I am a">
            {[
              { value: "shopper", label: "I'm a shopper", icon: ShoppingBasket, testId: "role-shopper" },
              { value: "trader", label: "I'm a trader", icon: Store, testId: "role-trader" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={role === opt.value}
                onClick={() => setRole(opt.value)}
                data-testid={opt.testId}
                className={`flex items-center justify-center gap-2 rounded-xl border-[1.5px] px-3 py-3.5 text-sm font-semibold transition-colors duration-200 ${
                  role === opt.value
                    ? "border-deepjade bg-seamist text-deepjade"
                    : "border-hairline bg-white text-slatesage hover:border-deepjade hover:text-deepjade"
                }`}
              >
                <opt.icon size={16} className={role === opt.value ? "text-jade" : ""} />
                {opt.label}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-5">
            <div>
              <label className="field-label" htmlFor={`wl-name-${source}`}>First name</label>
              <input
                id={`wl-name-${source}`}
                className={`field ${errors.first_name ? "field-error" : ""}`}
                placeholder="Ayşe"
                value={form.first_name}
                onChange={set("first_name")}
                autoComplete="given-name"
                data-testid="waitlist-first-name"
              />
              {errors.first_name && (
                <p className="field-hint" data-testid="error-first-name"><AlertCircle size={13} />{errors.first_name}</p>
              )}
            </div>
            <div>
              <label className="field-label" htmlFor={`wl-email-${source}`}>Email</label>
              <input
                id={`wl-email-${source}`}
                type="email"
                className={`field ${errors.email ? "field-error" : ""}`}
                placeholder="you@example.co.uk"
                value={form.email}
                onChange={set("email")}
                autoComplete="email"
                data-testid="waitlist-email"
              />
              {errors.email && (
                <p className="field-hint" data-testid="error-email"><AlertCircle size={13} />{errors.email}</p>
              )}
            </div>
            <div>
              <label className="field-label" htmlFor={`wl-postcode-${source}`}>Postcode</label>
              <input
                id={`wl-postcode-${source}`}
                className={`field ${errors.postcode ? "field-error" : ""}`}
                placeholder="N4 1DU"
                value={form.postcode}
                onChange={set("postcode")}
                autoComplete="postal-code"
                data-testid="waitlist-postcode"
              />
              {errors.postcode && (
                <p className="field-hint" data-testid="error-postcode"><AlertCircle size={13} />{errors.postcode}</p>
              )}
            </div>
          </div>

          <TurnstileWidget onToken={setToken} />

          {serverError && (
            <p className="field-hint mt-4" role="alert" data-testid="waitlist-server-error">
              <AlertCircle size={13} />{serverError}
            </p>
          )}

          <button type="submit" className="btn btn-primary mt-6 w-full !py-4 !text-base" disabled={busy} data-testid="waitlist-submit">
            {busy ? "One sec…" : role === "trader" ? "Get in early" : "Join the waitlist"}
          </button>
          <p className="mt-4 text-center text-xs text-slatesage">
            Green Lanes first. We'll only email when it matters.
          </p>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={submitTrader} noValidate>
          <p className="eyebrow-chip" data-testid="trader-step-chip">One more thing, boss</p>
          <h3 className="mt-4 font-display text-2xl font-bold text-ink">Tell us about the shop.</h3>
          <p className="mt-2 text-sm text-slatesage">
            So we can start onboarding on Green Lanes properly — shop by shop, in person.
          </p>
          <div className="mt-6 space-y-5">
            <div>
              <label className="field-label" htmlFor="wl-shop-name">Shop name</label>
              <input
                id="wl-shop-name"
                className={`field ${errors.shop_name ? "field-error" : ""}`}
                placeholder="The shop on the corner"
                value={trader.shop_name}
                onChange={(e) => { setTrader((t) => ({ ...t, shop_name: e.target.value })); setErrors((er) => ({ ...er, shop_name: undefined })); }}
                data-testid="trader-shop-name"
              />
              {errors.shop_name && <p className="field-hint" data-testid="error-shop-name"><AlertCircle size={13} />{errors.shop_name}</p>}
            </div>
            <div>
              <label className="field-label" htmlFor="wl-shop-type">What kind of shop?</label>
              <select
                id="wl-shop-type"
                className={`field ${errors.shop_type ? "field-error" : ""}`}
                value={trader.shop_type}
                onChange={(e) => { setTrader((t) => ({ ...t, shop_type: e.target.value })); setErrors((er) => ({ ...er, shop_type: undefined })); }}
                data-testid="trader-shop-type"
              >
                <option value="">Pick one</option>
                {SHOP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              {errors.shop_type && <p className="field-hint" data-testid="error-shop-type"><AlertCircle size={13} />{errors.shop_type}</p>}
            </div>
            <div>
              <label className="field-label" htmlFor="wl-phone">WhatsApp number (optional)</label>
              <input
                id="wl-phone"
                className="field"
                placeholder="07…"
                value={trader.phone_whatsapp}
                onChange={(e) => setTrader((t) => ({ ...t, phone_whatsapp: e.target.value }))}
                data-testid="trader-phone"
              />
              <p className="mt-1.5 text-xs text-slatesage">Only if you want deals posted over WhatsApp. No pressure.</p>
            </div>
          </div>
          {serverError && (
            <p className="field-hint mt-4" role="alert" data-testid="trader-server-error"><AlertCircle size={13} />{serverError}</p>
          )}
          <button type="submit" className="btn btn-primary mt-6 w-full !py-4 !text-base" disabled={busy} data-testid="trader-details-submit">
            {busy ? "Saving…" : "Done — save my spot"}
          </button>
        </form>
      )}

      {step === 3 && (
        <div className="text-center" data-testid="waitlist-success">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-jade">
            <Check size={26} className="text-ink" strokeWidth={3} />
          </span>
          <h3 className="mt-5 font-display text-3xl font-extrabold text-ink">You're in.</h3>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slatesage">
            {role === "trader"
              ? "Lovely. We're onboarding Green Lanes first, in person — keep an eye on your inbox."
              : "Lovely. When your street switches on, you'll be the first to know what's reduced, right now."}
          </p>
          {shareLink && (
            <div className="mt-6 rounded-2xl bg-seamist p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-deepjade">Bring a neighbour in</p>
              <div className="mt-3 flex items-center gap-2">
                <code className="flex-1 truncate rounded-lg border bg-white px-3 py-2.5 text-left text-xs text-ink" style={{ borderColor: "var(--hairline)" }} data-testid="referral-link">
                  {shareLink}
                </code>
                <button type="button" onClick={copyLink} className="btn btn-secondary !px-4 !py-2.5 !text-xs" data-testid="referral-copy">
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
