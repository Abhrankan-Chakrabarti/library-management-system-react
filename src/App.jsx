import { useState } from "react";

const INITIAL_BOOKS = [
  { id: 1, name: "DBMS", author: "Korth", stock: 5, total_issued: 1 },
  { id: 2, name: "C Programming", author: "Dennis Ritchie", stock: 3, total_issued: 0 },
  { id: 3, name: "Java", author: "James Gosling", stock: 4, total_issued: 0 },
];

const INITIAL_MEMBERS = [
  { id: 1, name: "Amit", address: "Kolkata", fine_amt: 0 },
  { id: 2, name: "Ravi", address: "Delhi", fine_amt: 0 },
  { id: 3, name: "Sita", address: "Mumbai", fine_amt: 0 },
];

const INITIAL_ISSUES = [
  {
    issue_no: 1,
    issue_date: new Date().toLocaleDateString(),
    mem_id: 1,
    book_no: 1,
    return_date: new Date(Date.now() + 10 * 864e5).toLocaleDateString(),
    returned: "No",
  },
];

function Toast({ msg, type, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 28,
        right: 28,
        zIndex: 9999,
        background: type === "error" ? "#ff4d4d" : "#00e5a0",
        color: type === "error" ? "#fff" : "#0a0f1e",
        padding: "14px 22px",
        borderRadius: 10,
        fontFamily: "'DM Mono', monospace",
        fontSize: 13,
        fontWeight: 600,
        boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        gap: 12,
        animation: "fadeSlideIn 0.25s ease",
        maxWidth: 340,
      }}
    >
      <span>{type === "error" ? "✕" : "✓"}</span>
      <span style={{ flex: 1 }}>{msg}</span>
      <span
        style={{ cursor: "pointer", opacity: 0.7, fontSize: 16 }}
        onClick={onClose}
      >
        ×
      </span>
    </div>
  );
}

function StatPill({ label, value, accent }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: "16px 22px",
        minWidth: 110,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 28,
          fontWeight: 700,
          color: accent || "#00e5a0",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 10,
          color: "rgba(255,255,255,0.4)",
          marginTop: 6,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
        }}
      >
        {label}
      </div>
    </div>
  );
}

export default function LibraryManagementSystem() {
  const [books, setBooks] = useState(INITIAL_BOOKS);
  const [members] = useState(INITIAL_MEMBERS);
  const [issues, setIssues] = useState(INITIAL_ISSUES);
  const [nextIssueNo, setNextIssueNo] = useState(2);
  const [issueMemberId, setIssueMemberId] = useState("");
  const [issueBookNo, setIssueBookNo] = useState("");
  const [returnIssueNo, setReturnIssueNo] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("books");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleIssueBook = () => {
    const memId = parseInt(issueMemberId);
    const bookNo = parseInt(issueBookNo);
    if (!memId || !bookNo) return showToast("Enter both Member ID and Book Number.", "error");
    if (!members.some((m) => m.id === memId)) return showToast(`Member ID ${memId} not found.`, "error");
    const targetBook = books.find((b) => b.id === bookNo);
    if (!targetBook) return showToast(`Book No ${bookNo} not found.`, "error");
    if (targetBook.stock <= 0) return showToast("Book is out of stock.", "error");

    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 10);

    setIssues([
      ...issues,
      {
        issue_no: nextIssueNo,
        issue_date: today.toLocaleDateString(),
        mem_id: memId,
        book_no: bookNo,
        return_date: dueDate.toLocaleDateString(),
        returned: "No",
      },
    ]);
    setNextIssueNo(nextIssueNo + 1);
    setBooks(books.map((b) => b.id === bookNo ? { ...b, stock: b.stock - 1, total_issued: b.total_issued + 1 } : b));
    setIssueMemberId("");
    setIssueBookNo("");
    showToast(`Book issued — Issue #${nextIssueNo} created.`);
  };

  const handleReturnBook = () => {
    const issNo = parseInt(returnIssueNo);
    if (!issNo) return showToast("Enter an Issue Number.", "error");
    const targetIssue = issues.find((i) => i.issue_no === issNo);
    if (!targetIssue) return showToast(`Issue #${issNo} not found.`, "error");
    if (targetIssue.returned !== "No") return showToast("Already returned.", "error");

    const todayStr = new Date().toLocaleDateString();
    setIssues(issues.map((i) => i.issue_no === issNo ? { ...i, returned: todayStr } : i));
    setBooks(books.map((b) => b.id === targetIssue.book_no ? { ...b, stock: b.stock + 1 } : b));
    setReturnIssueNo("");
    showToast(`Issue #${issNo} successfully returned.`);
  };

  const filteredBooks = books.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalBooks = books.length;
  const totalStock = books.reduce((s, b) => s + b.stock, 0);
  const activeIssues = issues.filter((i) => i.returned === "No").length;
  const totalReturned = issues.filter((i) => i.returned !== "No").length;

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Mono:wght@300;400;500&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
    @keyframes fadeSlideIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #07091a; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(0,229,160,0.3); border-radius: 4px; }
    input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
    input::placeholder { color: rgba(255,255,255,0.22); }
  `;

  const styles = {
    root: {
      minHeight: "100vh",
      background: "linear-gradient(160deg, #07091a 0%, #0d1030 60%, #081620 100%)",
      fontFamily: "'DM Mono', monospace",
      padding: "0 0 60px 0",
      position: "relative",
    },
    header: {
      padding: "48px 40px 32px",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      background: "rgba(0,0,0,0.2)",
      backdropFilter: "blur(12px)",
      position: "sticky",
      top: 0,
      zIndex: 100,
    },
    headerInner: {
      maxWidth: 1100,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: 24,
    },
    titleRow: {
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 20,
      flexWrap: "wrap",
    },
    titleBlock: {},
    eyebrow: {
      fontFamily: "'DM Mono', monospace",
      fontSize: 10,
      letterSpacing: "0.22em",
      textTransform: "uppercase",
      color: "#00e5a0",
      marginBottom: 8,
    },
    h1: {
      fontFamily: "'Playfair Display', serif",
      fontSize: 36,
      fontWeight: 900,
      color: "#f0ede6",
      lineHeight: 1.1,
      letterSpacing: "-0.02em",
    },
    searchWrap: {
      position: "relative",
      width: 280,
    },
    searchIcon: {
      position: "absolute",
      left: 14,
      top: "50%",
      transform: "translateY(-50%)",
      color: "rgba(255,255,255,0.3)",
      fontSize: 14,
      pointerEvents: "none",
    },
    searchInput: {
      width: "100%",
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 10,
      padding: "10px 14px 10px 38px",
      color: "#f0ede6",
      fontFamily: "'DM Mono', monospace",
      fontSize: 12,
      outline: "none",
      transition: "border-color 0.2s",
    },
    statsRow: {
      display: "flex",
      gap: 12,
      flexWrap: "wrap",
    },
    main: {
      maxWidth: 1100,
      margin: "0 auto",
      padding: "40px 40px 0",
    },
    tabs: {
      display: "flex",
      gap: 4,
      marginBottom: 32,
      borderBottom: "1px solid rgba(255,255,255,0.07)",
      paddingBottom: 0,
    },
    tab: (active) => ({
      padding: "10px 22px",
      fontFamily: "'DM Mono', monospace",
      fontSize: 11,
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: active ? "#00e5a0" : "rgba(255,255,255,0.35)",
      background: "none",
      border: "none",
      borderBottom: active ? "2px solid #00e5a0" : "2px solid transparent",
      cursor: "pointer",
      marginBottom: -1,
      transition: "color 0.2s, border-color 0.2s",
    }),
    card: {
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 16,
      padding: "28px 28px",
      backdropFilter: "blur(8px)",
    },
    sectionTitle: {
      fontFamily: "'Playfair Display', serif",
      fontSize: 18,
      fontWeight: 700,
      color: "#f0ede6",
      marginBottom: 20,
      display: "flex",
      alignItems: "center",
      gap: 10,
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
    },
    th: {
      fontFamily: "'DM Mono', monospace",
      fontSize: 9,
      letterSpacing: "0.16em",
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.35)",
      padding: "0 14px 12px",
      textAlign: "left",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      fontWeight: 500,
    },
    td: {
      padding: "14px 14px",
      fontSize: 13,
      color: "rgba(255,255,255,0.75)",
      borderBottom: "1px solid rgba(255,255,255,0.04)",
      verticalAlign: "middle",
    },
    pill: (green) => ({
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 600,
      background: green ? "rgba(0,229,160,0.12)" : "rgba(255,77,77,0.12)",
      color: green ? "#00e5a0" : "#ff6b6b",
      border: `1px solid ${green ? "rgba(0,229,160,0.25)" : "rgba(255,77,77,0.25)"}`,
    }),
    grid2: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: 24,
    },
    label: {
      fontFamily: "'DM Mono', monospace",
      fontSize: 10,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.35)",
      marginBottom: 8,
      display: "block",
    },
    input: (accent) => ({
      width: "100%",
      background: "rgba(255,255,255,0.04)",
      border: `1px solid rgba(255,255,255,0.09)`,
      borderRadius: 10,
      padding: "12px 16px",
      color: "#f0ede6",
      fontFamily: "'DM Mono', monospace",
      fontSize: 13,
      outline: "none",
      marginBottom: 16,
      transition: "border-color 0.2s",
    }),
    btn: (color) => ({
      width: "100%",
      background: color === "green"
        ? "linear-gradient(135deg, #00c98a, #00e5a0)"
        : "linear-gradient(135deg, #3b72f0, #5e9aff)",
      color: color === "green" ? "#0a0f1e" : "#fff",
      border: "none",
      borderRadius: 10,
      padding: "13px 0",
      fontFamily: "'DM Mono', monospace",
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      cursor: "pointer",
      marginTop: 4,
      transition: "opacity 0.2s, transform 0.1s",
    }),
    fieldWrap: { marginBottom: 4 },
    returnBadge: (returned) => ({
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 600,
      background: returned !== "No" ? "rgba(0,229,160,0.1)" : "rgba(255,193,7,0.1)",
      color: returned !== "No" ? "#00e5a0" : "#ffc107",
      border: `1px solid ${returned !== "No" ? "rgba(0,229,160,0.25)" : "rgba(255,193,7,0.25)"}`,
    }),
    issueBadge: {
      fontFamily: "'Playfair Display', serif",
      fontWeight: 700,
      fontSize: 14,
      color: "#5e9aff",
    },
  };

  return (
    <>
      <style>{css}</style>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <div style={styles.root}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerInner}>
            <div style={styles.titleRow}>
              <div style={styles.titleBlock}>
                <div style={styles.eyebrow}>Library Management System</div>
                <h1 style={styles.h1}>The Catalogue</h1>
              </div>
              <div style={styles.searchWrap}>
                <span style={styles.searchIcon}>⌕</span>
                <input
                  style={styles.searchInput}
                  type="text"
                  placeholder="Search books or authors…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div style={styles.statsRow}>
              <StatPill label="Total Titles" value={totalBooks} accent="#5e9aff" />
              <StatPill label="In Stock" value={totalStock} accent="#00e5a0" />
              <StatPill label="Active Issues" value={activeIssues} accent="#ffc107" />
              <StatPill label="Returned" value={totalReturned} accent="#a78bfa" />
              <StatPill label="Members" value={members.length} accent="#f87171" />
            </div>
          </div>
        </header>

        {/* Main */}
        <main style={styles.main}>
          {/* Tabs */}
          <div style={styles.tabs}>
            {["books", "members", "transactions", "actions"].map((t) => (
              <button key={t} style={styles.tab(activeTab === t)} onClick={() => setActiveTab(t)}>
                {t === "books" && "📘 "}
                {t === "members" && "👥 "}
                {t === "transactions" && "📜 "}
                {t === "actions" && "⚡ "}
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Books Tab */}
          {activeTab === "books" && (
            <div style={styles.card}>
              <div style={styles.sectionTitle}>
                <span style={{ color: "#5e9aff" }}>▍</span> Available Books
              </div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {["No", "Title", "Author", "Stock", "Total Issued"].map((h) => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredBooks.map((book) => (
                    <tr key={book.id} style={{ transition: "background 0.15s" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ ...styles.td, color: "rgba(255,255,255,0.3)", fontSize: 11 }}>#{book.id}</td>
                      <td style={{ ...styles.td, fontFamily: "'Lora', serif", color: "#f0ede6", fontWeight: 600 }}>{book.name}</td>
                      <td style={{ ...styles.td, fontStyle: "italic", color: "rgba(255,255,255,0.5)" }}>{book.author}</td>
                      <td style={styles.td}>
                        <span style={styles.pill(book.stock > 0)}>{book.stock}</span>
                      </td>
                      <td style={{ ...styles.td, color: "#a78bfa", fontWeight: 600 }}>
                        {book.total_issued} <span style={{ opacity: 0.4, fontSize: 11 }}>issued</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredBooks.length === 0 && (
                <div style={{ textAlign: "center", padding: "32px 0", color: "rgba(255,255,255,0.25)", fontSize: 13 }}>
                  No books found for "{searchQuery}"
                </div>
              )}
            </div>
          )}

          {/* Members Tab */}
          {activeTab === "members" && (
            <div style={styles.card}>
              <div style={styles.sectionTitle}>
                <span style={{ color: "#f87171" }}>▍</span> Members Registry
              </div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {["ID", "Name", "Address", "Fine Balance"].map((h) => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <tr key={m.id}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ ...styles.td, color: "rgba(255,255,255,0.3)", fontSize: 11 }}>#{m.id}</td>
                      <td style={{ ...styles.td, fontFamily: "'Lora', serif", color: "#f0ede6", fontWeight: 600 }}>{m.name}</td>
                      <td style={{ ...styles.td, color: "rgba(255,255,255,0.5)" }}>{m.address}</td>
                      <td style={styles.td}>
                        <span style={{
                          color: m.fine_amt > 0 ? "#f87171" : "rgba(255,255,255,0.3)",
                          fontWeight: m.fine_amt > 0 ? 700 : 400,
                          fontSize: 13,
                        }}>
                          ₹{m.fine_amt.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === "transactions" && (
            <div style={styles.card}>
              <div style={styles.sectionTitle}>
                <span style={{ color: "#ffc107" }}>▍</span> Issue Registry
                <span style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  color: "rgba(255,255,255,0.25)",
                  fontWeight: 400,
                  letterSpacing: "0.1em",
                  marginLeft: 6,
                }}>SELECT * FROM issue;</span>
              </div>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {["Issue #", "Issue Date", "Member", "Book", "Due Date", "Status"].map((h) => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...issues].reverse().map((i) => (
                    <tr key={i.issue_no}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ ...styles.td }}><span style={styles.issueBadge}>#{i.issue_no}</span></td>
                      <td style={{ ...styles.td, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{i.issue_date}</td>
                      <td style={{ ...styles.td, color: "#f0ede6" }}>
                        {members.find((m) => m.id === i.mem_id)?.name || `#${i.mem_id}`}
                      </td>
                      <td style={{ ...styles.td, fontStyle: "italic", color: "rgba(255,255,255,0.55)" }}>
                        {books.find((b) => b.id === i.book_no)?.name || `#${i.book_no}`}
                      </td>
                      <td style={{ ...styles.td, color: "#ffc107", fontSize: 11 }}>{i.return_date}</td>
                      <td style={styles.td}>
                        <span style={styles.returnBadge(i.returned)}>
                          {i.returned !== "No" ? `↩ ${i.returned}` : "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Actions Tab */}
          {activeTab === "actions" && (
            <div style={styles.grid2}>
              {/* Issue Book */}
              <div style={styles.card}>
                <div style={styles.sectionTitle}>
                  <span style={{ color: "#5e9aff" }}>▍</span> Issue a Book
                </div>
                <div style={styles.fieldWrap}>
                  <label style={styles.label}>Member ID</label>
                  <input
                    style={styles.input("blue")}
                    type="number"
                    placeholder="e.g. 1"
                    value={issueMemberId}
                    onChange={(e) => setIssueMemberId(e.target.value)}
                  />
                </div>
                <div style={styles.fieldWrap}>
                  <label style={styles.label}>Book Number</label>
                  <input
                    style={styles.input("blue")}
                    type="number"
                    placeholder="e.g. 2"
                    value={issueBookNo}
                    onChange={(e) => setIssueBookNo(e.target.value)}
                  />
                </div>
                <button style={styles.btn("blue")} onClick={handleIssueBook}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                >
                  Execute Issue
                </button>
                <div style={{ marginTop: 20, padding: "14px 16px", background: "rgba(94,154,255,0.06)", borderRadius: 10, border: "1px solid rgba(94,154,255,0.12)" }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.1em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginBottom: 8 }}>Available Members</div>
                  {members.map((m) => (
                    <div key={m.id} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 12, color: "rgba(255,255,255,0.5)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ fontFamily: "'Lora', serif" }}>{m.name}</span>
                      <span style={{ color: "rgba(255,255,255,0.25)" }}>ID: {m.id}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Return Book */}
              <div style={styles.card}>
                <div style={styles.sectionTitle}>
                  <span style={{ color: "#00e5a0" }}>▍</span> Return a Book
                </div>
                <div style={styles.fieldWrap}>
                  <label style={styles.label}>Issue Number</label>
                  <input
                    style={styles.input("green")}
                    type="number"
                    placeholder="e.g. 1"
                    value={returnIssueNo}
                    onChange={(e) => setReturnIssueNo(e.target.value)}
                  />
                </div>
                <button style={styles.btn("green")} onClick={handleReturnBook}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = "0.85"}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                >
                  Execute Return
                </button>
                <div style={{ marginTop: 20, padding: "14px 16px", background: "rgba(0,229,160,0.04)", borderRadius: 10, border: "1px solid rgba(0,229,160,0.1)" }}>
                  <div style={{ fontSize: 10, letterSpacing: "0.1em", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", marginBottom: 8 }}>Pending Returns</div>
                  {issues.filter((i) => i.returned === "No").length === 0 ? (
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontStyle: "italic" }}>All books returned.</div>
                  ) : issues.filter((i) => i.returned === "No").map((i) => (
                    <div key={i.issue_no} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 12, color: "rgba(255,255,255,0.5)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ color: "#5e9aff", fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>#{i.issue_no}</span>
                      <span style={{ fontFamily: "'Lora', serif" }}>{books.find((b) => b.id === i.book_no)?.name}</span>
                      <span style={{ color: "#ffc107", fontSize: 10 }}>Due: {i.return_date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
