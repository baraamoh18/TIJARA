import { useState, useMemo } from "react";
import Header from "../components/Header";
import toast from "react-hot-toast";
import { useTijara } from "../context/TijaraContext";
import StatCard from "../components/StatCard";
import { FaPhoneAlt, FaWhatsapp, FaMapMarkerAlt } from "react-icons/fa";
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
  if (!name) return "تاجر";
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

const getWhatsappLink = (num) => {
  if (!num) return "";
  let clean = num.replace(/\s+/g, "").replace("+", "");
  if (clean.startsWith("0")) {
    clean = "2" + clean;
  }
  return `https://wa.me/${clean}`;
};

/* ─────────────────────────────────────────────
   EXTRA DEBT DATA (local-only, NOT synced with Xano)
   Xano's `debt` table only has debtorName/amount/isPaid/dueDate.
   We keep contact info, address, description, originalAmount, 
   and payment installment logs locally in localStorage.
   ───────────────────────────────────────────── */
const EXTRA_KEY = "tijara_debt_extra";

const getAllExtra = () => {
  try {
    return JSON.parse(localStorage.getItem(EXTRA_KEY) || "{}");
  } catch {
    return {};
  }
};

const getExtra = (id) => getAllExtra()[id] || null;

const saveExtra = (id, data) => {
  const all = getAllExtra();
  all[id] = data;
  localStorage.setItem(EXTRA_KEY, JSON.stringify(all));
};

const removeExtra = (id) => {
  const all = getAllExtra();
  delete all[id];
  localStorage.setItem(EXTRA_KEY, JSON.stringify(all));
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
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(defaultDueDate());
  const [submitting, setSubmitting] = useState(false);

  // Collect Modal States
  const [collectOpen, setCollectOpen] = useState(false);
  const [collectingDebt, setCollectingDebt] = useState(null);
  const [collectAmount, setCollectAmount] = useState("");
  const [collectMethod, setCollectMethod] = useState("كاش");
  const [collectingId, setCollectingId] = useState(null);

  /* ── add debt (no products link, pure custom input) ── */
  const handleAdd = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount) || 0;

    if (!debtorName.trim()) {
      toast.error("اكتب اسم التاجر / المورد");
      return;
    }
    if (!amt || amt <= 0) {
      toast.error("اكتب إجمالي الدين بشكل صحيح");
      return;
    }

    const debtData = {
      debtorName: debtorName.trim(),
      amount: amt,
      isPaid: false,
      dueDate: dueDate,
    };

    setSubmitting(true);
    const newDebt = await contextAddDebt(debtData);

    if (newDebt && newDebt.id) {
      // Save contact details, address, description, original amount and payments list locally
      saveExtra(newDebt.id, {
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        address: address.trim(),
        description: description.trim(),
        originalAmount: amt,
        payments: [],
      });
    }

    setSubmitting(false);
    setDebtorName("");
    setPhone("");
    setWhatsapp("");
    setAddress("");
    setDescription("");
    setAmount("");
    setDueDate(defaultDueDate());
  };

  /* ── open collect (pay installment) modal ── */
  const openCollect = (d) => {
    setCollectingDebt(d);
    setCollectAmount(d.amount); // Default to full remaining amount
    setCollectOpen(true);
  };

  /* ── confirm pay installment ── */
  const confirmCollect = async () => {
    if (!collectingDebt) return;
    const paidAmt = parseFloat(collectAmount) || 0;

    if (paidAmt <= 0) {
      toast.error("اكتب مبلغ السداد بشكل صحيح");
      return;
    }
    if (paidAmt > collectingDebt.amount) {
      toast.error("المبلغ المدفوع أكبر من المتبقي في الدين");
      return;
    }

    setCollectingId(collectingDebt.id);
    try {
      const extra = getExtra(collectingDebt.id) || {};
      const originalAmount = extra.originalAmount || collectingDebt.amount;
      const payments = extra.payments || [];

      // Record this installment payment
      const newPayment = {
        amount: paidAmt,
        date: new Date().toISOString().split("T")[0],
        method: collectMethod,
      };

      const updatedPayments = [...payments, newPayment];
      const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);
      const remaining = Math.max(0, originalAmount - totalPaid);
      const isPaid = remaining <= 0;

      // Update backend via Xano
      await contextUpdateDebt(collectingDebt.id, {
        debtorName: collectingDebt.debtorName,
        amount: remaining,
        dueDate: collectingDebt.dueDate,
        isPaid: isPaid,
      });

      // Update local storage
      saveExtra(collectingDebt.id, {
        ...extra,
        payments: updatedPayments,
      });

      setCollectOpen(false);

      if (isPaid) {
        toast.success(`✅ تم سداد دين ${collectingDebt.debtorName} بالكامل (${collectMethod})`);
      } else {
        toast.success(`✅ تم تسجيل سداد دفعة بقيمة ${fmt(paidAmt)} ج لـ ${collectingDebt.debtorName}`);
      }
    } catch {
      // TijaraContext already shows error toast
    } finally {
      setCollectingId(null);
    }
  };

  /* ── delete debt ── */
  const handleDelete = async (id) => {
    if (!window.confirm("هتمسح الدين ده؟")) return;
    await contextDeleteDebt(id);
    removeExtra(id);
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
      <div style={{ display: "flex", gap: "16px", margin: "20px 0" }}>
        <StatCard
          title="إجمالي الديون المستحقة عليا"
          value={fmt(totalRem)}
          unit="جنيه"
          valueColor="#f05c5c"
          accent="red"
        />
        <StatCard
          title="عدد التجار الدائنين"
          value={unpaid.length}
        />
        <StatCard
          title="ديون متأخر سدادها"
          value={overdue.length}
          valueColor={overdue.length ? '#f05c5c' : '#fff'}
          accent={overdue.length ? 'red' : 'green'}
        />
      </div>

      {/* ── top grid: form + summary ── */}
      <div className="debts-grid2">
        {/* form card */}
        <div className="debts-card">
          <div className="debts-card-hd">
            <div className="debts-card-title">📝 تسجيل دين جديد عليا (شراء بالآجل / تسهيلات)</div>
          </div>
          <form onSubmit={handleAdd}>
            <div className="debts-form-group">
              <div className="debts-form-label">اسم التاجر / المورد</div>
              <input
                className="debts-input"
                placeholder="اسم التاجر أو الشركة الدائنة"
                value={debtorName}
                onChange={(e) => setDebtorName(e.target.value)}
              />
            </div>
            
            <div className="debts-form-row">
              <div className="debts-form-group">
                <div className="debts-form-label">رقم الهاتف</div>
                <input
                  className="debts-input"
                  placeholder="رقم الهاتف"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="debts-form-group">
                <div className="debts-form-label">رقم واتساب</div>
                <input
                  className="debts-input"
                  placeholder="رقم الواتساب"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                />
              </div>
            </div>

            <div className="debts-form-group">
              <div className="debts-form-label">العنوان</div>
              <input
                className="debts-input"
                placeholder="عنوان التاجر أو الشركة"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="debts-form-group">
              <div className="debts-form-label">وصف الدين</div>
              <input
                className="debts-input"
                placeholder="تفاصيل البضاعة المشتراة بالآجل أو وصف الدين"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="debts-form-row">
              <div className="debts-form-group">
                <div className="debts-form-label">إجمالي قيمة الدين (جنيه)</div>
                <input
                  className="debts-input"
                  type="number"
                  min="1"
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

            <button
              type="submit"
              disabled={submitting}
              className="debts-btn-green debts-btn-green--full"
            >
              {submitting ? "جاري الحفظ..." : "+ تسجيل الدين المستحق"}
            </button>
          </form>
        </div>

        {/* summary card */}
        <div className="debts-card">
          <div className="debts-card-hd">
            <div className="debts-card-title">ملخص ديون التجار</div>
          </div>
          {unpaid.length === 0 ? (
            <div className="debts-empty">
              <div className="debts-empty-icon">✅</div>
              <div className="debts-empty-text">ليس عليك أي ديون مستحقة للتجار حالياً!</div>
            </div>
          ) : (
            <>
              <div className="debts-stat-row">
                <span className="debts-stat-label">إجمالي الديون</span>
                <span className="debts-stat-val debts-stat-val--red">
                  {fmt(totalRem)} ج
                </span>
              </div>
              <div className="debts-stat-row">
                <span className="debts-stat-label">عدد الدائنين</span>
                <span className="debts-stat-val">{unpaid.length} تاجر/شركة</span>
              </div>
              <div className="debts-stat-row">
                <span className="debts-stat-label">ديون متأخر سدادها</span>
                <span
                  className={`debts-stat-val ${overdue.length ? "debts-stat-val--red" : "debts-stat-val--green"}`}
                >
                  {overdue.length} دين
                </span>
              </div>
              <div className="debts-stat-row debts-stat-row--last">
                <span className="debts-stat-label">أكبر دين مستحق</span>
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
          <div className="debts-card-title">قائمة الديون المستحقة للتجار</div>
        </div>

        {unpaid.length === 0 ? (
          <div className="debts-empty">
            <div className="debts-empty-icon">🤝</div>
            <div className="debts-empty-text">مفيش أي ديون مسجلة دلوقتي</div>
          </div>
        ) : (
          unpaid.map((d) => {
            const extra = getExtra(d.id);
            const payments = extra?.payments || [];
            const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
            // originalAmount is saved at debt creation time — never changes
            // d.amount from Xano is already reduced after partial payments, so we can't trust it as "original"
            const original = extra?.originalAmount || (d.amount + totalPaid);
            const rem = Math.max(0, original - totalPaid);
            const od = isOverdue(d);
            const daysLeft = getDaysLeft(d.dueDate);

            let statusTxt, statusType;
            if (od) {
              statusTxt = "متأخر السداد";
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
                  
                  {/* Extra contact details */}
                  {extra && (
                    <div className="debts-debt-details">
                      {(extra.phone || extra.whatsapp) && (
                        <div className="debts-debt-details-item">
                          {extra.phone && (
                            <span style={{ marginRight: 0 }}>
                              <FaPhoneAlt style={{ verticalAlign: "middle", marginLeft: 4 }} />
                              <a href={`tel:${extra.phone}`} className="debts-debt-details-link">{extra.phone}</a>
                            </span>
                          )}
                          {extra.whatsapp && (
                            <span style={{ marginRight: 12 }}>
                              <FaWhatsapp style={{ verticalAlign: "middle", marginLeft: 4, color: "#25D366" }} />
                              <a 
                                href={getWhatsappLink(extra.whatsapp)} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="debts-debt-details-link"
                                style={{ color: "#25D366" }}
                              >
                                واتساب
                              </a>
                            </span>
                          )}
                        </div>
                      )}
                      {extra.address && (
                        <div className="debts-debt-details-item">
                          <FaMapMarkerAlt style={{ verticalAlign: "middle", marginLeft: 4 }} />
                          <span>{extra.address}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Description */}
                  {extra?.description && (
                    <div className="debts-debt-desc">
                      {extra.description}
                    </div>
                  )}

                  {/* Installments info */}
                  {totalPaid > 0 && (
                    <div style={{ marginTop: 8, fontSize: "11px", color: "var(--green, #1fd97a)" }}>
                      💵 تم سداد: {fmt(totalPaid)} ج من أصل {fmt(original)} ج (المتبقي: {fmt(rem)} ج)
                    </div>
                  )}

                  {/* Installment History Log */}
                  {payments.length > 0 && (
                    <div className="debts-payments-history">
                      <div className="debts-payments-title">سجل دفعات السداد:</div>
                      {payments.map((p, idx) => (
                        <div key={idx} className="debts-payment-item">
                          <span>{fmt(p.amount)} ج ({p.method})</span>
                          <span>{p.date}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="debts-debt-meta">
                    {d.created_at
                      ? `سجل بتاريخ: ${new Date(d.created_at).toLocaleDateString("ar-EG")}`
                      : ""}
                  </div>
                </div>

                {/* amount + badge */}
                <div className="debts-debt-amount">
                  <div className="debts-debt-amount-val">{fmt(rem)} ج</div>
                  <div style={{ marginTop: 4, textAlign: "left" }}>
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
                    سداد
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

      {/* ── collect (pay installment) modal ── */}
      <div
        className={`debts-overlay ${collectOpen ? "debts-overlay--open" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setCollectOpen(false);
        }}
      >
        <div className="debts-modal">
          <div className="debts-modal-title">💵 تسجيل دفعة سداد دين</div>
          {collectingDebt && (
            <div className="debts-modal-summary">
              <strong>{collectingDebt.debtorName}</strong>
              <br />
              المبلغ المتبقي الحالي: {fmt(collectingDebt.amount || 0)} جنيه
              {(() => {
                const extra = getExtra(collectingDebt.id);
                if (extra && extra.originalAmount > collectingDebt.amount) {
                  const paid = extra.originalAmount - collectingDebt.amount;
                  return (
                    <>
                      <br />
                      <span className="debts-modal-summary-note">
                        (إجمالي الدين الأصلي: {fmt(extra.originalAmount)} ج · إجمالي المسدد سابقاً: {fmt(paid)} ج)
                      </span>
                    </>
                  );
                }
                return null;
              })()}
            </div>
          )}
          
          <div className="debts-form-group">
            <div className="debts-form-label">المبلغ المراد سداده (جنيه)</div>
            <input
              className="debts-input"
              type="number"
              min="1"
              max={collectingDebt ? collectingDebt.amount : undefined}
              value={collectAmount}
              onChange={(e) => setCollectAmount(e.target.value)}
            />
          </div>

          <div className="debts-form-group">
            <div className="debts-form-label">طريقة السداد</div>
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
              {collectingId !== null ? "..." : "✅ تأكيد السداد"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
