import { useState } from "react";
import Header from "../components/Header";
import toast from "react-hot-toast";
import { useTijara } from "../context/TijaraContext";
import "./Debts.css";

/* ─────────────────────────────────────────────
   HELPERS
 ───────────────────────────────────────────── */
const fmt = (n) => Math.round(n || 0).toLocaleString("ar-EG");

const isOverdue = (d) => {
  if (d.isPaid) return false;
  return d.dueDate && new Date(d.dueDate) < new Date();
};

const getInitials = (name) => {
  if (!name) return "دين";
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .substring(0, 2);
};

const getDaysLeft = (dueDate) => {
  if (!dueDate) return 0;
  return Math.ceil((new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24));
};

const defaultDueDate = () => {
  const nd = new Date();
  nd.setDate(nd.getDate() + 7);
  return nd.toISOString().split("T")[0];
};

/* ─────────────────────────────────────────────
   NOTES (local-only, NOT synced with Xano)
   Xano's `debt` table has no column for notes, so we
   keep them client-side, keyed by debt id.
 ───────────────────────────────────────────── */
const NOTES_KEY = "tijara_debt_notes";

const getAllNotes = () => {
  try {
    return JSON.parse(localStorage.getItem(NOTES_KEY) || "{}");
  } catch {
    return {};
  }
};

const getNote = (id) => getAllNotes()[id] || "";

const saveNote = (id, note) => {
  const all = getAllNotes();
  if (note && note.trim()) {
    all[id] = note.trim();
  } else {
    delete all[id];
  }
  localStorage.setItem(NOTES_KEY, JSON.stringify(all));
};

const removeNote = (id) => {
  const all = getAllNotes();
  delete all[id];
  localStorage.setItem(NOTES_KEY, JSON.stringify(all));
};

/* ─────────────────────────────────────────────
   COMPONENT
 ───────────────────────────────────────────── */
export default function Debts() {
  const {
    state,
    addDebt: contextAddDebt,
    updateDebt: contextUpdateDebt,
    deleteDebt: contextDeleteDebt,
  } = useTijara();
  const { debts, isLoading, error } = state;

  // Form States
  const [debtorName, setDebtorName] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(defaultDueDate());
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Collect Modal States
  const [collectOpen, setCollectOpen] = useState(false);
  const [collectingDebt, setCollectingDebt] = useState(null);
  const [collectMethod, setCollectMethod] = useState("كاش");
  const [collectingId, setCollectingId] = useState(null);

  /* ── add debt ── */
  const handleAdd = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount) || 0;
    if (!debtorName.trim() || !amt) {
      toast.error("اكتب اسم العميل والمبلغ");
      return;
    }

    // Matches Xano's `debt` table columns exactly: debtorName, amount, isPaid, dueDate
    const debtData = {
      debtorName: debtorName.trim(),
      amount: amt,
      isPaid: false,
      dueDate: dueDate,
    };

    setSubmitting(true);
    const newDebt = await contextAddDebt(debtData);
    setSubmitting(false);

    // Save the note locally (Xano has no column for it) once we have the new id
    if (newDebt && newDebt.id && note.trim()) {
      saveNote(newDebt.id, note.trim());
    }

    setDebtorName("");
    setAmount("");
    setDueDate(defaultDueDate());
    setNote("");
  };

  /* ── open collect modal ── */
  const openCollect = (d) => {
    setCollectingDebt(d);
    setCollectOpen(true);
  };

  /* ── confirm collect payment (full amount only, matches Xano's isPaid flag) ── */
  const confirmCollect = async () => {
    if (!collectingDebt) return;

    setCollectingId(collectingDebt.id);
    try {
      // Xano's PATCH endpoint requires all fields in the body, not just the
      // one changing — so we send the full record with isPaid flipped.
      await contextUpdateDebt(collectingDebt.id, {
        debtorName: collectingDebt.debtorName,
        amount: collectingDebt.amount,
        dueDate: collectingDebt.dueDate,
        isPaid: true,
      });
      setCollectOpen(false);
      toast.success(
        `✅ تم تحصيل دين ${collectingDebt.debtorName} بالكامل (${collectMethod})`,
      );
    } catch {
      // context already shows an error toast
    } finally {
      setCollectingId(null);
    }
  };

  /* ── delete ── */
  const handleDelete = async (id) => {
    if (!window.confirm("هتمسح الدين ده؟")) return;
    await contextDeleteDebt(id);
    removeNote(id);
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", width: "100%" }}>
        <div style={{ color: "#22c97a", fontSize: "24px", fontFamily: "cairo, sans-serif" }}>جاري التحميل...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", width: "100%" }}>
        <div style={{ color: "#ef4444", fontSize: "20px", fontFamily: "cairo, sans-serif" }}>حدث خطأ: {error}</div>
      </div>
    );
  }

  /* ── derived values ── */
  const safeDebts = debts || [];
  const unpaid = safeDebts.filter((d) => !d.isPaid);
  const totalRem = unpaid.reduce((s, d) => s + (d.amount || 0), 0);
  const overdue = unpaid.filter((d) => isOverdue(d));

  return (
    <div className="debts-page">
      <Header title="الديون والآجل" />

      {/* ── metrics ── */}
      <div className="debts-metrics">
        <div className="debts-metric">
          <div className="debts-metric-accent debts-metric-accent--red" />
          <div className="debts-metric-label">إجمالي المطلوب</div>
          <div className="debts-metric-val debts-metric-val--red">
            {fmt(totalRem)} <span className="debts-metric-unit">جنيه</span>
          </div>
        </div>
        <div className="debts-metric">
          <div className="debts-metric-accent debts-metric-accent--amber" />
          <div className="debts-metric-label">عدد العملاء بالآجل</div>
          <div className="debts-metric-val">{unpaid.length}</div>
        </div>
        <div className="debts-metric">
          <div className="debts-metric-accent debts-metric-accent--red" />
          <div className="debts-metric-label">ديون متأخرة</div>
          <div
            className={`debts-metric-val ${overdue.length ? "debts-metric-val--red" : ""}`}
          >
            {overdue.length}
          </div>
        </div>
      </div>

      {/* ── top grid: form + summary ── */}
      <div className="debts-grid2">
        {/* form card */}
        <div className="debts-card">
          <div className="debts-card-hd">
            <div className="debts-card-title">📝 تسجيل دين جديد</div>
          </div>
          <form onSubmit={handleAdd}>
            <div className="debts-form-group">
              <div className="debts-form-label">اسم العميل</div>
              <input
                className="debts-input"
                placeholder="اسم العميل"
                value={debtorName}
                onChange={(e) => setDebtorName(e.target.value)}
              />
            </div>
            <div className="debts-form-row">
              <div className="debts-form-group">
                <div className="debts-form-label">المبلغ (جنيه)</div>
                <input
                  className="debts-input"
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="debts-form-group">
                <div className="debts-form-label">تاريخ الاستحقاق</div>
                <input
                  className="debts-input"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
            <div className="debts-form-group">
              <div className="debts-form-label">
                البضاعة / الملاحظة{" "}
                <span style={{ opacity: 0.6, fontSize: 12 }}>
                  (محفوظة على هذا المتصفح فقط)
                </span>
              </div>
              <input
                className="debts-input"
                placeholder="مثال: 5 كيلو أرز + كيلو سكر"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="debts-btn-green debts-btn-green--full"
            >
              {submitting ? "جاري الحفظ..." : "+ تسجيل الدين"}
            </button>
          </form>
        </div>

        {/* summary card */}
        <div className="debts-card">
          <div className="debts-card-hd">
            <div className="debts-card-title">ملخص الديون</div>
          </div>
          {unpaid.length === 0 ? (
            <div className="debts-empty">
              <div className="debts-empty-icon">✅</div>
              <div className="debts-empty-text">مفيش ديون — تمام!</div>
            </div>
          ) : (
            <>
              <div className="debts-stat-row">
                <span className="debts-stat-label">إجمالي مطلوب</span>
                <span className="debts-stat-val debts-stat-val--red">
                  {fmt(totalRem)} ج
                </span>
              </div>
              <div className="debts-stat-row">
                <span className="debts-stat-label">عدد العملاء</span>
                <span className="debts-stat-val">{unpaid.length} عميل</span>
              </div>
              <div className="debts-stat-row">
                <span className="debts-stat-label">ديون متأخرة</span>
                <span
                  className={`debts-stat-val ${overdue.length ? "debts-stat-val--red" : "debts-stat-val--green"}`}
                >
                  {overdue.length} دين
                </span>
              </div>
              <div className="debts-stat-row debts-stat-row--last">
                <span className="debts-stat-label">أكبر دين</span>
                <span className="debts-stat-val">
                  {fmt(Math.max(...unpaid.map((d) => d.amount || 0)))} ج
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── debts list card ── */}
      <div className="debts-card debts-card--list">
        <div className="debts-card-hd">
          <div className="debts-card-title">قائمة الديون</div>
        </div>

        {unpaid.length === 0 ? (
          <div className="debts-empty">
            <div className="debts-empty-icon">🤝</div>
            <div className="debts-empty-text">مفيش ديون مسجلة دلوقتي</div>
          </div>
        ) : (
          unpaid.map((d) => {
            const rem = d.amount || 0;
            const od = isOverdue(d);
            const daysLeft = getDaysLeft(d.dueDate);
            const noteText = getNote(d.id);
            let statusTxt, statusType;
            if (od) {
              statusTxt = "متأخر";
              statusType = "red";
            } else if (daysLeft <= 3 && daysLeft >= 0) {
              statusTxt = `باقي ${daysLeft} يوم`;
              statusType = "amber";
            } else {
              statusTxt = d.dueDate
                ? new Date(d.dueDate).toLocaleDateString("ar-EG")
                : "—";
              statusType = "green";
            }

            return (
              <div
                key={d.id}
                className={`debts-debt-card ${od ? "debts-debt-card--overdue" : ""}`}
              >
                {/* avatar */}
                <div
                  className={`debts-debt-avatar ${od ? "debts-debt-avatar--overdue" : ""}`}
                  style={od ? { background: "var(--red-bg)", color: "var(--red)" } : {}}
                >
                  {getInitials(d.debtorName)}
                </div>

                {/* info */}
                <div className="debts-debt-info">
                  <div className="debts-debt-name">{d.debtorName}</div>
                  <div className="debts-debt-meta">
                    {noteText || "بدون ملاحظة"}
                    {d.created_at
                      ? ` · ${new Date(d.created_at).toLocaleDateString("ar-EG")}`
                      : ""}
                  </div>
                </div>

                {/* amount + badge */}
                <div className="debts-debt-amount">
                  <div className="debts-debt-amount-val">{fmt(rem)} ج</div>
                  <div style={{ marginTop: 4 }}>
                    <span className={`debts-badge debts-badge--${statusType}`}>
                      {statusTxt}
                    </span>
                  </div>
                </div>

                {/* actions */}
                <div className="debts-debt-actions">
                  <button
                    className="debts-btn-green-xs"
                    onClick={() => openCollect(d)}
                  >
                    تحصيل
                  </button>
                  <button
                    className="debts-btn-xs-danger"
                    onClick={() => handleDelete(d.id)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── collect modal ── */}
      <div
        className={`debts-overlay ${collectOpen ? "debts-overlay--open" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setCollectOpen(false);
        }}
      >
        <div className="debts-modal">
          <div className="debts-modal-title">💵 تحصيل دين</div>
          {collectingDebt && (
            <div className="debts-modal-summary">
              <strong>{collectingDebt.debtorName}</strong>
              <br />
              المطلوب: {fmt(collectingDebt.amount || 0)} جنيه
              <br />
              <span className="debts-modal-summary-note">
                {getNote(collectingDebt.id) || ""}
              </span>
            </div>
          )}
          <div className="debts-form-group">
            <div className="debts-form-label">طريقة الدفع</div>
            <select
              className="debts-input"
              value={collectMethod}
              onChange={(e) => setCollectMethod(e.target.value)}
            >
              <option>كاش</option>
              <option>فودافون كاش</option>
              <option>إنستاباي</option>
            </select>
          </div>
          <div className="debts-modal-footer">
            <button className="debts-btn" onClick={() => setCollectOpen(false)}>
              إلغاء
            </button>
            <button className="debts-btn-green" onClick={confirmCollect} disabled={collectingId !== null}>
              {collectingId !== null ? "..." : "✅ تأكيد التحصيل الكامل"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
