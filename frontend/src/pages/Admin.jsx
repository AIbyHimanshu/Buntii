import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Download, FileSpreadsheet, LogOut, Search } from "lucide-react";
import { API } from "../lib/api";
import { Wordmark } from "../components/Wordmark";

const COLUMNS = [
  { key: "first_name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "postcode", label: "Postcode" },
  { key: "source", label: "Source" },
  { key: "referral_code", label: "Referral" },
  { key: "referred_by", label: "Referred by" },
  { key: "shop_name", label: "Shop" },
  { key: "shop_type", label: "Shop type" },
  { key: "created_at", label: "Joined" },
];

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data.detail === "string" ? data.detail : "Login failed");
      localStorage.setItem("buntii_admin_token", data.access_token);
      onLogin(data.access_token);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-seamist px-5" data-testid="admin-login">
      <form onSubmit={submit} className="w-full max-w-sm rounded-3xl border bg-white p-8" style={{ borderColor: "var(--hairline)" }}>
        <Wordmark colorway="light" className="text-2xl" />
        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slatesage">Waitlist admin</p>
        <div className="mt-7 space-y-5">
          <div>
            <label className="field-label" htmlFor="admin-email">Email</label>
            <input id="admin-email" type="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" data-testid="admin-email" />
          </div>
          <div>
            <label className="field-label" htmlFor="admin-password">Password</label>
            <input id="admin-password" type="password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" data-testid="admin-password" />
          </div>
        </div>
        {error && (
          <p className="field-hint mt-4" role="alert" data-testid="admin-login-error"><AlertCircle size={13} />{error}</p>
        )}
        <button type="submit" className="btn btn-primary mt-6 w-full" disabled={busy} data-testid="admin-login-submit">
          {busy ? "Checking…" : "Sign in"}
        </button>
      </form>
    </div>
  );
};

const Dashboard = ({ token, onLogout }) => {
  const [role, setRole] = useState("shopper");
  const [filters, setFilters] = useState({ q: "", postcode: "", source: "", referral_code: "", date_from: "", date_to: "" });
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const authHeaders = { Authorization: `Bearer ${token}` };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ role });
      Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
      const res = await fetch(`${API}/admin/signups?${params}`, { headers: authHeaders });
      if (res.status === 401) return onLogout();
      const data = await res.json();
      setRows(data.rows || []);
      setTotal(data.total || 0);
    } catch (e) {
      setError("Couldn't load the list. Try again.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, filters, token]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  const download = async (path, filename) => {
    const res = await fetch(`${API}${path}`, { headers: authHeaders });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCsv = () => {
    const params = new URLSearchParams({ role });
    Object.entries(filters).forEach(([k, v]) => v && params.set(k, v));
    download(`/admin/export.csv?${params}`, `buntii-${role}s.csv`);
  };

  const visibleCols = COLUMNS.filter((c) => !["shop_name", "shop_type"].includes(c.key) || role === "trader");

  return (
    <div className="min-h-screen bg-seamist" data-testid="admin-dashboard">
      <header className="border-b bg-white" style={{ borderColor: "var(--hairline)" }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-4">
            <Wordmark colorway="light" className="text-xl" />
            <span className="rounded-full bg-seamist px-3 py-1 text-xs font-semibold uppercase tracking-wide text-deepjade">Waitlist admin</span>
          </div>
          <button onClick={onLogout} className="btn btn-tertiary !text-sm" data-testid="admin-logout">
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex rounded-full border bg-white p-1" style={{ borderColor: "var(--hairline)" }} role="tablist">
            {["shopper", "trader"].map((r) => (
              <button
                key={r}
                role="tab"
                aria-selected={role === r}
                onClick={() => setRole(r)}
                className={`rounded-full px-5 py-2 text-sm font-semibold capitalize transition-colors ${
                  role === r ? "bg-deepjade text-white" : "text-slatesage hover:text-deepjade"
                }`}
                data-testid={`tab-${r}s`}
              >
                {r}s
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={exportCsv} className="btn btn-secondary !px-4 !py-2 !text-xs" data-testid="export-csv">
              <Download size={14} /> Export CSV (filtered)
            </button>
            <button onClick={() => download("/admin/export.xlsx", "buntii-waitlist.xlsx")} className="btn btn-secondary !px-4 !py-2 !text-xs" data-testid="export-xlsx">
              <FileSpreadsheet size={14} /> Export XLSX (all)
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 rounded-2xl border bg-white p-4 sm:grid-cols-2 lg:grid-cols-6" style={{ borderColor: "var(--hairline)" }}>
          <div className="relative lg:col-span-2">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slatesage" />
            <input
              className="field !pl-10"
              placeholder="Search name or email"
              value={filters.q}
              onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
              data-testid="filter-search"
            />
          </div>
          <input className="field" placeholder="Postcode (N4…)" value={filters.postcode} onChange={(e) => setFilters((f) => ({ ...f, postcode: e.target.value }))} data-testid="filter-postcode" />
          <input className="field" placeholder="Source" value={filters.source} onChange={(e) => setFilters((f) => ({ ...f, source: e.target.value }))} data-testid="filter-source" />
          <input className="field" type="date" value={filters.date_from} onChange={(e) => setFilters((f) => ({ ...f, date_from: e.target.value }))} data-testid="filter-date-from" aria-label="From date" />
          <input className="field" type="date" value={filters.date_to} onChange={(e) => setFilters((f) => ({ ...f, date_to: e.target.value }))} data-testid="filter-date-to" aria-label="To date" />
        </div>

        <p className="mt-5 text-sm font-semibold text-deepjade" data-testid="results-count">
          {loading ? "Loading…" : `${total} ${role}${total === 1 ? "" : "s"} on the list`}
        </p>
        {error && <p className="field-hint mt-2" role="alert">{error}</p>}

        <div className="mt-3 overflow-x-auto rounded-2xl border bg-white" style={{ borderColor: "var(--hairline)" }}>
          <table className="w-full min-w-[760px] text-left text-sm" data-testid="signups-table">
            <thead>
              <tr className="border-b text-xs uppercase tracking-wide text-slatesage" style={{ borderColor: "var(--hairline)" }}>
                {visibleCols.map((c) => (
                  <th key={c.key} className="px-4 py-3 font-semibold">{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id || r.email || i} className="border-b last:border-0 odd:bg-white even:bg-seamist" style={{ borderColor: "var(--hairline)" }}>
                  {visibleCols.map((c) => (
                    <td key={c.key} className="px-4 py-3 text-ink">
                      {c.key === "created_at" && r[c.key] ? new Date(r[c.key]).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : r[c.key] || "—"}
                    </td>
                  ))}
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={visibleCols.length} className="px-4 py-10 text-center text-slatesage" data-testid="empty-state">
                    Nobody here yet. The street is quiet — for now.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Admin = () => {
  const [token, setToken] = useState(() => localStorage.getItem("buntii_admin_token"));
  const logout = () => {
    localStorage.removeItem("buntii_admin_token");
    setToken(null);
  };
  return token ? <Dashboard token={token} onLogout={logout} /> : <Login onLogin={setToken} />;
};

export default Admin;
