import { useState, useEffect, useRef } from "react";
import {
  Library, LayoutDashboard, BookMarked, Users, History,
  Bell, Search, ChevronRight, TrendingUp, Clock, AlertCircle,
  X, CheckCircle, BookOpen, RotateCcw, ArrowUpRight
} from "lucide-react";

// ─── Seed Data ────────────────────────────────────────────────────────────────
const SEED_BOOKS = [
  { id: 1, name: "Database Management", author: "Korth", stock: 4, total_issued: 1 },
  { id: 2, name: "C Programming",        author: "Dennis Ritchie", stock: 3, total_issued: 0 },
  { id: 3, name: "Java Fundamentals",    author: "James Gosling",  stock: 4, total_issued: 0 },
  { id: 4, name: "Compiler Design",      author: "Aho & Ullman",   stock: 2, total_issued: 2 },
  { id: 5, name: "Linear Algebra",       author: "Gilbert Strang", stock: 5, total_issued: 1 },
  { id: 6, name: "Organic Chemistry II", author: "Clayden",        stock: 3, total_issued: 0 },
];

const SEED_MEMBERS = [
  { id: 101, name: "Anish Kumar",  code: "M-301", fine_amt: 0 },
  { id: 245, name: "Ritu Sharma",  code: "M-245", fine_amt: 24 },
  { id: 102, name: "John Doe",     code: "M-102", fine_amt: 0 },
  { id: 115, name: "Sarah Bell",   code: "M-115", fine_amt: 0 },
  { id: 300, name: "Amit Bose",    code: "M-300", fine_amt: 0 },
];

const today = () => new Date().toLocaleDateString("en-IN");
const dueIn = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-IN");
};
const daysDiff = (dateStr) => {
  const due = new Date(dateStr.split("/").reverse().join("-"));
  return Math.floor((new Date() - due) / 864e5);
};

const SEED_ISSUES = [
  { issue_no: 782, issue_date: today(), mem_id: 101, book_no: 1, return_date: dueIn(10),  returned: "No" },
  { issue_no: 779, issue_date: today(), mem_id: 245, book_no: 4, return_date: dueIn(-12), returned: "No" },
  { issue_no: 785, issue_date: today(), mem_id: 102, book_no: 5, return_date: dueIn(1),   returned: "No" },
  { issue_no: 786, issue_date: today(), mem_id: 115, book_no: 6, return_date: dueIn(8),   returned: "No" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function issueStatus(issue) {
  if (issue.returned !== "No") return { label: "RETURNED", cls: "returned" };
  const days = daysDiff(issue.return_date);
  if (days > 10) return { label: `₹${days * 2}.00 FINE`, cls: "fine" };
  if (days > 0)  return { label: "GRACE PER.", cls: "grace" };
  return { label: "ON TIME", cls: "ontime" };
}

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ toasts, dismiss }) {
  return (
    <div style={{ position: "fixed", top: 20, right: 20, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10, pointerEvents: "none" }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          pointerEvents: "auto",
          display: "flex", alignItems: "center", gap: 12,
          background: t.type === "error" ? "#fff1f2" : "#f0fdf4",
          border: `1px solid ${t.type === "error" ? "#fecdd3" : "#bbf7d0"}`,
          color: t.type === "error" ? "#be123c" : "#15803d",
          padding: "12px 16px", borderRadius: 10,
          fontSize: 13, fontWeight: 600,
          boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
          animation: "toastIn 0.22s ease",
          maxWidth: 340,
        }}>
          {t.type === "error" ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
          <span style={{ flex: 1 }}>{t.msg}</span>
          <X size={13} style={{ cursor: "pointer", opacity: 0.5 }} onClick={() => dismiss(t.id)} />
        </div>
      ))}
    </div>
  );
}

// ─── Nav Item ─────────────────────────────────────────────────────────────────
function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", display: "flex", alignItems: "center", gap: 14,
      padding: "11px 16px", borderRadius: 8, border: "none", cursor: "pointer",
      background: active ? "rgba(99,102,241,0.15)" : "transparent",
      color: active ? "#a5b4fc" : "rgba(148,163,184,0.7)",
      fontSize: 13, fontWeight: active ? 600 : 400,
      transition: "all 0.15s", textAlign: "left",
    }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
    >
      {active && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#818cf8", flexShrink: 0 }} />}
      {!active && <Icon size={15} style={{ opacity: 0.5, flexShrink: 0 }} />}
      <span>{label}</span>
      {active && <LayoutDashboard size={14} style={{ marginLeft: "auto", opacity: 0.3 }} />}
    </button>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, iconBg, iconColor, accent, barPct, alert }) {
  return (
    <div style={{
      background: "#fff", padding: 24, borderRadius: 12,
      border: `1px solid ${alert ? "transparent" : "#e2e8f0"}`,
      borderLeft: alert ? "4px solid #f43f5e" : undefined,
      boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      transition: "box-shadow 0.2s",
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</p>
        <div style={{ padding: 8, background: iconBg, borderRadius: 8, display: "flex" }}>
          <Icon size={15} color={iconColor} />
        </div>
      </div>
      <p style={{ fontSize: 28, fontWeight: 800, color: accent || "#0f172a", lineHeight: 1 }}>
        {value} {sub && <span style={{ fontSize: 11, fontWeight: 400, color: "#94a3b8" }}>{sub}</span>}
      </p>
      {barPct !== undefined && (
        <div style={{ marginTop: 16, height: 3, background: "#f1f5f9", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${barPct}%`, background: "#6366f1", borderRadius: 2 }} />
        </div>
      )}
      {!barPct && sub === undefined && (
        <div style={{ marginTop: 14, fontSize: 11, fontWeight: 700, color: alert ? "#f43f5e" : "#10b981", display: "flex", alignItems: "center", gap: 4 }}>
          {alert ? <><AlertCircle size={11} /> {alert}</> : <><TrendingUp size={11} /> +12% from last month</>}
        </div>
      )}
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  ontime:   { bg: "#f0fdf4", color: "#15803d", ring: "#bbf7d0" },
  fine:     { bg: "#fff1f2", color: "#be123c", ring: "#fecdd3" },
  grace:    { bg: "#fffbeb", color: "#92400e", ring: "#fde68a" },
  returned: { bg: "#f8fafc", color: "#64748b", ring: "#e2e8f0" },
};
function StatusBadge({ status }) {
  const s = STATUS_STYLES[status.cls] || STATUS_STYLES.ontime;
  return (
    <span style={{
      padding: "3px 8px", borderRadius: 5, fontSize: 10, fontWeight: 700,
      background: s.bg, color: s.color, border: `1px solid ${s.ring}`,
      whiteSpace: "nowrap",
    }}>{status.label}</span>
  );
}

// ─── Views ────────────────────────────────────────────────────────────────────
function DashboardView({ books, members, issues, nextIssueNo, setBooks, setIssues, setNextIssueNo, toast, searchQuery }) {
  const [memId, setMemId] = useState("");
  const [bookNo, setBookNo] = useState("");
  const [returnNo, setReturnNo] = useState("");
  const [showReturn, setShowReturn] = useState(false);

  const totalStock = books.reduce((s, b) => s + b.stock, 0);
  const activeIssues = issues.filter(i => i.returned === "No").length;
  const overdueCount = issues.filter(i => i.returned === "No" && daysDiff(i.return_date) > 0).length;

  const recentIssues = [...issues].reverse().slice(0, 6);

  const handleIssue = () => {
    const mId = parseInt(memId), bNo = parseInt(bookNo);
    if (!mId || !bNo) return toast("Enter both Member ID and Book Number.", "error");
    if (!members.some(m => m.id === mId)) return toast(`Member ID ${mId} not found.`, "error");
    const book = books.find(b => b.id === bNo);
    if (!book) return toast(`Book #${bNo} not found.`, "error");
    if (book.stock <= 0) return toast(`"${book.name}" is out of stock.`, "error");

    setIssues(p => [...p, {
      issue_no: nextIssueNo,
      issue_date: today(),
      mem_id: mId, book_no: bNo,
      return_date: dueIn(10),
      returned: "No",
    }]);
    setNextIssueNo(n => n + 1);
    setBooks(p => p.map(b => b.id === bNo ? { ...b, stock: b.stock - 1, total_issued: b.total_issued + 1 } : b));
    setMemId(""); setBookNo("");
    toast(`Issue #${nextIssueNo} committed — due ${dueIn(10)}.`);
  };

  const handleReturn = () => {
    const no = parseInt(returnNo);
    if (!no) return toast("Enter an issue number.", "error");
    const iss = issues.find(i => i.issue_no === no);
    if (!iss) return toast(`Issue #${no} not found.`, "error");
    if (iss.returned !== "No") return toast(`Issue #${no} already returned.`, "error");
    const fine = Math.max(0, daysDiff(iss.return_date) - 10) * 2;
    setIssues(p => p.map(i => i.issue_no === no ? { ...i, returned: today() } : i));
    setBooks(p => p.map(b => b.id === iss.book_no ? { ...b, stock: b.stock + 1 } : b));
    setReturnNo("");
    toast(fine > 0 ? `Issue #${no} returned. Fine collected: ₹${fine}.` : `Issue #${no} returned successfully.`);
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px",
    border: "1px solid #e2e8f0", borderRadius: 8,
    fontSize: 13, outline: "none", background: "#f8fafc",
    color: "#0f172a", fontFamily: "inherit",
    transition: "border-color 0.2s",
  };

  return (
    <div style={{ padding: 32, display: "flex", flexDirection: "column", gap: 28, maxWidth: 1200, margin: "0 auto", width: "100%" }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
        <StatCard label="Stock Availability" value={totalStock} sub="vols" icon={Library} iconBg="#eef2ff" iconColor="#6366f1" />
        <StatCard label="Total Members" value={members.length} icon={Users} iconBg="#f1f5f9" iconColor="#475569" sub="" />
        <StatCard label="Currently Issued" value={activeIssues} icon={Clock} iconBg="#f0fdf4" iconColor="#16a34a" accent="#6366f1" barPct={Math.round((activeIssues / (activeIssues + 50)) * 100)} />
        <StatCard label="Overdue Alerts" value={overdueCount} icon={AlertCircle} iconBg="#fff1f2" iconColor="#f43f5e" accent="#f43f5e" alert="Requires follow-up" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
        {/* Transactions */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <div style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
              <History size={15} color="#6366f1" /> Recent Transactions
            </h3>
            <button style={{ fontSize: 11, fontWeight: 700, color: "#6366f1", background: "none", border: "none", cursor: "pointer", letterSpacing: "0.05em" }}
              onClick={() => setShowReturn(!showReturn)}>
              {showReturn ? "HIDE RETURN" : "RETURN A BOOK"}
            </button>
          </div>

          {showReturn && (
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9", background: "#f8fafc", display: "flex", gap: 10, alignItems: "center" }}>
              <input style={{ ...inputStyle, flex: 1, padding: "8px 12px" }} type="number"
                placeholder="Enter Issue Number to return…" value={returnNo}
                onChange={e => setReturnNo(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleReturn()}
              />
              <button onClick={handleReturn} style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 16px", background: "#10b981", color: "#fff",
                border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
              }}>
                <RotateCcw size={13} /> Return
              </button>
            </div>
          )}

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fafc", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {["Issue ID", "Member", "Book Title", "Due Date", "Status"].map(h => (
                    <th key={h} style={{ padding: "12px 20px", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ fontSize: 13 }}>
                {recentIssues.map(iss => {
                  const mem = members.find(m => m.id === iss.mem_id);
                  const bk = books.find(b => b.id === iss.book_no);
                  const status = issueStatus(iss);
                  return (
                    <tr key={iss.issue_no} style={{ borderTop: "1px solid #f1f5f9", transition: "background 0.12s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ padding: "14px 20px", fontFamily: "monospace", fontSize: 12, color: "#64748b" }}>#{iss.issue_no}</td>
                      <td style={{ padding: "14px 20px" }}>
                        <div style={{ fontWeight: 600, color: "#0f172a" }}>{mem?.name || `ID ${iss.mem_id}`}</div>
                        <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", marginTop: 2 }}>{mem?.code}</div>
                      </td>
                      <td style={{ padding: "14px 20px", color: "#475569" }}>{bk?.name || `Book #${iss.book_no}`}</td>
                      <td style={{ padding: "14px 20px", fontFamily: "monospace", fontSize: 12, color: "#64748b" }}>{iss.return_date}</td>
                      <td style={{ padding: "14px 20px" }}><StatusBadge status={status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Issue Panel */}
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
          <h3 style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
            <BookMarked size={15} color="#6366f1" /> Issue New Book
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>Member ID</label>
              <input style={inputStyle} type="number" placeholder="e.g. 101"
                value={memId} onChange={e => setMemId(e.target.value)}
                onFocus={e => e.target.style.borderColor = "#6366f1"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>
            <div>
              <label style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>Book Number</label>
              <input style={inputStyle} type="number" placeholder="e.g. 1"
                value={bookNo} onChange={e => setBookNo(e.target.value)}
                onFocus={e => e.target.style.borderColor = "#6366f1"}
                onBlur={e => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>
          </div>

          <div style={{ padding: "14px 16px", background: "#eef2ff", borderRadius: 10, border: "1px solid #c7d2fe" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: "#4338ca", marginBottom: 10 }}>
              <span>Rule Applied:</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#818cf8", animation: "pulse 1.5s infinite" }} />
                System Auto
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {["Default Period: 10 Days", "Grace Period: +10 Days (Free)", "Post-Grace Fine: ₹2.00 / Day"].map(r => (
                <div key={r} style={{ fontSize: 11, color: "#4f46e5", fontWeight: 500 }}>• {r}</div>
              ))}
            </div>
          </div>

          <button onClick={handleIssue} style={{
            width: "100%", background: "#4f46e5", color: "#fff",
            border: "none", borderRadius: 10, padding: "13px 0",
            fontWeight: 700, fontSize: 12, letterSpacing: "0.07em",
            cursor: "pointer", boxShadow: "0 4px 14px rgba(99,102,241,0.3)",
            transition: "background 0.15s, transform 0.1s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "#4338ca"}
            onMouseLeave={e => e.currentTarget.style.background = "#4f46e5"}
            onMouseDown={e => e.currentTarget.style.transform = "scale(0.98)"}
            onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
          >
            COMMIT TRANSACTION
          </button>

          <p style={{ fontSize: 10, color: "#94a3b8", textAlign: "center", fontStyle: "italic", margin: 0 }}>
            * Triggers update Qty_stock and Issue sequence automatically
          </p>

          {/* Quick member ref */}
          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Member Directory</div>
            {members.map(m => (
              <div key={m.id} onClick={() => setMemId(String(m.id))} style={{
                display: "flex", justifyContent: "space-between",
                padding: "6px 0", fontSize: 12, borderBottom: "1px solid #f8fafc",
                cursor: "pointer", color: "#475569",
              }}
                onMouseEnter={e => e.currentTarget.style.color = "#6366f1"}
                onMouseLeave={e => e.currentTarget.style.color = "#475569"}
              >
                <span style={{ fontWeight: 600 }}>{m.name}</span>
                <span style={{ fontFamily: "monospace", color: "#94a3b8" }}>{m.id}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BooksView({ books, searchQuery }) {
  const filtered = books.filter(b =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.author.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: "0 auto", width: "100%" }}>
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9" }}>
          <h3 style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
            <BookOpen size={15} color="#6366f1" /> Book Inventory
            <span style={{ marginLeft: "auto", fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>{filtered.length} titles</span>
          </h3>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f8fafc", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {["#", "Title", "Author", "In Stock", "Total Issued", "Status"].map(h => (
                <th key={h} style={{ padding: "12px 20px", textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(b => (
              <tr key={b.id} style={{ borderTop: "1px solid #f1f5f9" }}
                onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "14px 20px", fontFamily: "monospace", fontSize: 11, color: "#94a3b8" }}>{b.id}</td>
                <td style={{ padding: "14px 20px", fontWeight: 600, color: "#0f172a" }}>{b.name}</td>
                <td style={{ padding: "14px 20px", color: "#64748b", fontStyle: "italic" }}>{b.author}</td>
                <td style={{ padding: "14px 20px" }}>
                  <span style={{
                    padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                    background: b.stock > 0 ? "#f0fdf4" : "#fff1f2",
                    color: b.stock > 0 ? "#15803d" : "#be123c",
                    border: `1px solid ${b.stock > 0 ? "#bbf7d0" : "#fecdd3"}`,
                  }}>{b.stock}</span>
                </td>
                <td style={{ padding: "14px 20px", color: "#6366f1", fontWeight: 600 }}>{b.total_issued}</td>
                <td style={{ padding: "14px 20px" }}>
                  <span style={{
                    padding: "3px 8px", borderRadius: 5, fontSize: 10, fontWeight: 700,
                    background: b.stock > 0 ? "#eef2ff" : "#f1f5f9",
                    color: b.stock > 0 ? "#4338ca" : "#94a3b8",
                  }}>{b.stock > 0 ? "AVAILABLE" : "OUT OF STOCK"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
            No books found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}

function MembersView({ members }) {
  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: "0 auto", width: "100%" }}>
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9" }}>
          <h3 style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
            <Users size={15} color="#6366f1" /> Member Records
          </h3>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: "#f8fafc", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {["Member ID", "Name", "Code", "Outstanding Fine"].map(h => (
                <th key={h} style={{ padding: "12px 20px", textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m.id} style={{ borderTop: "1px solid #f1f5f9" }}
                onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "14px 20px", fontFamily: "monospace", fontSize: 12, color: "#64748b" }}>{m.id}</td>
                <td style={{ padding: "14px 20px", fontWeight: 600, color: "#0f172a" }}>{m.name}</td>
                <td style={{ padding: "14px 20px" }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b", background: "#f1f5f9", padding: "2px 8px", borderRadius: 5 }}>{m.code}</span>
                </td>
                <td style={{ padding: "14px 20px", fontWeight: 700, color: m.fine_amt > 0 ? "#be123c" : "#94a3b8", fontSize: m.fine_amt > 0 ? 14 : 13 }}>
                  ₹{m.fine_amt.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HistoryView({ issues, books, members }) {
  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: "0 auto", width: "100%" }}>
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
            <History size={15} color="#6366f1" /> Full Issue History
          </h3>
          <span style={{ fontFamily: "monospace", fontSize: 10, color: "#94a3b8", background: "#f8fafc", padding: "3px 10px", borderRadius: 5, border: "1px solid #e2e8f0" }}>
            SELECT * FROM issue;
          </span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f8fafc", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                {["Issue #", "Issue Date", "Member", "Book", "Due Date", "Return Date", "Status"].map(h => (
                  <th key={h} style={{ padding: "12px 20px", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...issues].reverse().map(iss => {
                const mem = members.find(m => m.id === iss.mem_id);
                const bk = books.find(b => b.id === iss.book_no);
                const status = issueStatus(iss);
                return (
                  <tr key={iss.issue_no} style={{ borderTop: "1px solid #f1f5f9" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "14px 20px", fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: "#6366f1" }}>#{iss.issue_no}</td>
                    <td style={{ padding: "14px 20px", fontFamily: "monospace", fontSize: 12, color: "#94a3b8" }}>{iss.issue_date}</td>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ fontWeight: 600, color: "#0f172a" }}>{mem?.name || `#${iss.mem_id}`}</div>
                      <div style={{ fontSize: 10, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>{mem?.code}</div>
                    </td>
                    <td style={{ padding: "14px 20px", color: "#475569" }}>{bk?.name || `#${iss.book_no}`}</td>
                    <td style={{ padding: "14px 20px", fontFamily: "monospace", fontSize: 12, color: "#64748b" }}>{iss.return_date}</td>
                    <td style={{ padding: "14px 20px", fontFamily: "monospace", fontSize: 12, color: iss.returned !== "No" ? "#15803d" : "#94a3b8" }}>
                      {iss.returned !== "No" ? iss.returned : "—"}
                    </td>
                    <td style={{ padding: "14px 20px" }}><StatusBadge status={status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [books, setBooks] = useState(SEED_BOOKS);
  const [members] = useState(SEED_MEMBERS);
  const [issues, setIssues] = useState(SEED_ISSUES);
  const [nextIssueNo, setNextIssueNo] = useState(787);
  const [nav, setNav] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  const [time, setTime] = useState(new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }));
  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })), 10000);
    return () => clearInterval(t);
  }, []);

  const addToast = (msg, type = "success") => {
    const id = ++toastId.current;
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3800);
  };
  const dismissToast = (id) => setToasts(p => p.filter(t => t.id !== id));

  const overdueCount = issues.filter(i => i.returned === "No" && daysDiff(i.return_date) > 0).length;

  const NAV = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "books",     label: "Book Inventory", icon: BookMarked },
    { id: "members",   label: "Member Records", icon: Users },
    { id: "history",   label: "Issue History",  icon: History },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', system-ui, sans-serif; background: #f8fafc; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        input::placeholder { color: #94a3b8; }
        @keyframes toastIn { from { opacity: 0; transform: translateX(16px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
      `}</style>

      <Toast toasts={toasts} dismiss={dismissToast} />

      <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc", fontFamily: "'Inter', system-ui, sans-serif", color: "#0f172a" }}>
        {/* Sidebar */}
        <aside style={{ width: 256, background: "#0f172a", display: "flex", flexDirection: "column", flexShrink: 0, borderRight: "1px solid #1e293b" }}>
          {/* Logo */}
          <div style={{ padding: "28px 24px 24px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 38, height: 38, background: "#4f46e5", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(99,102,241,0.4)" }}>
              <Library size={20} color="#fff" />
            </div>
            <div>
              <div style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 15, letterSpacing: "-0.02em" }}>CAMPUSLIB</div>
              <div style={{ color: "#475569", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 600 }}>Admin Console</div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: "8px 12px", display: "flex", flexDirection: "column", gap: 2 }}>
            {NAV.map(n => <NavItem key={n.id} {...n} active={nav === n.id} onClick={() => setNav(n.id)} />)}
          </nav>

          {/* Session */}
          <div style={{ padding: 16, borderTop: "1px solid #1e293b" }}>
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "12px 14px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.16em", color: "#475569", fontWeight: 700, marginBottom: 4 }}>Current Session</div>
              <div style={{ fontSize: 11, fontFamily: "monospace", color: "#818cf8" }}>LIBRARIAN_ROOT_01</div>
            </div>
          </div>
        </aside>

        {/* Right side */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100vh", overflow: "hidden" }}>
          {/* Header */}
          <header style={{ height: 64, background: "#fff", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", flexShrink: 0, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", zIndex: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
              <span style={{ color: "#94a3b8" }}>System /</span>
              <span style={{ fontWeight: 600, color: "#0f172a" }}>{NAV.find(n => n.id === nav)?.label || "Dashboard"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ position: "relative" }}>
                <Search size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
                <input type="text" placeholder="Search resources…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: 34, paddingRight: 14, paddingTop: 8, paddingBottom: 8, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 12, outline: "none", width: 220, color: "#0f172a", fontFamily: "inherit" }}
                  onFocus={e => e.target.style.borderColor = "#6366f1"}
                  onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                />
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Server Time</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#475569", fontFamily: "monospace" }}>{time}</div>
              </div>
              <div style={{ position: "relative", cursor: "pointer" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f1f5f9", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Bell size={16} color="#64748b" />
                </div>
                {overdueCount > 0 && (
                  <span style={{ position: "absolute", top: 0, right: 0, width: 14, height: 14, background: "#f43f5e", borderRadius: "50%", border: "2px solid #fff", fontSize: 8, color: "#fff", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {overdueCount}
                  </span>
                )}
              </div>
            </div>
          </header>

          {/* Body */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {nav === "dashboard" && (
              <DashboardView
                books={books} members={members} issues={issues}
                nextIssueNo={nextIssueNo} setBooks={setBooks}
                setIssues={setIssues} setNextIssueNo={setNextIssueNo}
                toast={addToast} searchQuery={searchQuery}
              />
            )}
            {nav === "books"   && <BooksView books={books} searchQuery={searchQuery} />}
            {nav === "members" && <MembersView members={members} />}
            {nav === "history" && <HistoryView issues={issues} books={books} members={members} />}
          </div>
        </div>
      </div>
    </>
  );
}
