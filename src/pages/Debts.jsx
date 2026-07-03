import { useState, useEffect } from "react";
import Statics from "../components/statics";
import Header from "../components/Header";
import toast from "react-hot-toast";
import { MdAssignment, MdDelete, MdCheckCircle } from "react-icons/md";

// CSS Styles inline to keep it modular and match the existing project structure
const cardStyle = {
  backgroundColor: "#1c1c1c",
  borderRadius: "12px",
  padding: "20px",
  fontFamily: "cairo, sans-serif",
  color: "white",
  boxSizing: "border-box",
};

const inputStyle = {
  backgroundColor: "#0d0d0d",
  border: "1px solid #2a2a2a",
  padding: "10px 12px",
  borderRadius: "8px",
  color: "white",
  font: "14px cairo, sans-serif",
  width: "100%",
  boxSizing: "border-box",
  outline: "none",
  marginTop: "6px",
  marginBottom: "12px",
};

const labelStyle = {
  fontSize: "12px",
  color: "#aaa",
  fontFamily: "cairo, sans-serif",
  display: "block",
  textAlign: "right",
};

function Debts() {
  const [debts, setDebts] = useState([]);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  // Load debts from localStorage on component mount
  useEffect(() => {
    const stored = localStorage.getItem("tijara_debts");
    if (stored) {
      try {
        setDebts(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse debts", e);
      }
    } else {
      // Add initial sample debts as shown in the mockup
      const initialSample = [
        {
          id: 1,
          name: "محمد علي",
          amount: 850,
          paid: 0,
          due: "2026-06-18",
          note: "3 كيلو أرز + 2 كيلو سكر",
        },
        {
          id: 2,
          name: "أم أحمد",
          amount: 450,
          paid: 0,
          due: "2026-06-25",
          note: "زيت وزبدة",
        },
        {
          id: 3,
          name: "عم حسن",
          amount: 1200,
          paid: 600,
          due: "2026-06-30",
          note: "بضاعة متنوعة",
        },
      ];
      localStorage.setItem("tijara_debts", JSON.stringify(initialSample));
      setDebts(initialSample);
      // Dispatch storage event to update sidebar badge
      window.dispatchEvent(new Event("storage"));
    }
  }, []);

  // Save debts helper
  const saveDebts = (updatedDebts) => {
    localStorage.setItem("tijara_debts", JSON.stringify(updatedDebts));
    setDebts(updatedDebts);
    // Dispatch storage event to notify Sidebar.jsx
    window.dispatchEvent(new Event("storage"));
  };

  // Add a new debt
  const handleAddDebt = (e) => {
    e.preventDefault();
    if (!name || !amount || !dueDate) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    const newDebt = {
      id: Date.now(),
      name: name.trim(),
      amount: Number(amount),
      paid: paidAmount ? Number(paidAmount) : 0,
      due: dueDate,
      note: notes.trim(),
    };

    const updated = [newDebt, ...debts];
    saveDebts(updated);
    toast.success("تم تسجيل الدين بنجاح");

    // Reset form fields
    setName("");
    setAmount("");
    setPaidAmount("");
    setDueDate("");
    setNotes("");
  };

  // Collect/Pay debt (clears it or marks it)
  const handleCollectDebt = (id) => {
    const updated = debts.filter((d) => d.id !== id);
    saveDebts(updated);
    toast.success("تم تحصيل الدين بنجاح");
  };

  // Delete debt entry
  const handleDeleteDebt = (id) => {
    const updated = debts.filter((d) => d.id !== id);
    saveDebts(updated);
    toast.success("تم حذف السجل بنجاح");
  };

  // Calculations for stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDaysDiff = (dateStr) => {
    const due = new Date(dateStr);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isOverdue = (dateStr) => {
    return getDaysDiff(dateStr) < 0;
  };

  // Calculate stats values
  const totalDebtsVal = debts.reduce(
    (sum, d) => sum + ((d.amount || 0) - (d.paid || 0)),
    0,
  );
  const uniqueClientsCount = new Set(debts.map((d) => d.name)).size;
  const overdueDebtsCount = debts.filter(
    (d) => isOverdue(d.due) && d.amount - d.paid > 0,
  ).length;
  const maxDebtVal =
    debts.length > 0
      ? Math.max(...debts.map((d) => (d.amount || 0) - (d.paid || 0)))
      : 0;

  // Extract initials for customer avatar (e.g. "محمد علي" -> "مع")
  const getInitials = (custName) => {
    if (!custName) return "";
    const parts = custName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return custName.slice(0, 2);
  };

  return (
    <div
      style={{
        backgroundColor: "#161616",
        minHeight: "100vh",
        paddingBottom: "40px",
      }}
    >
      <Header title="الديون والآجل" />

      {/* Stats Section */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          justifyContent: "space-between",
          width: "94%",
          margin: "20px auto",
          borderRadius: "12px",
          direction: "rtl",
        }}
      >
        <Statics
          title="إجمالي الديون"
          value={`${totalDebtsVal.toLocaleString()} جنيه`}
          valueColor="#cb6262"
        />
        <Statics
          title="عدد العملاء بالأجل"
          value={uniqueClientsCount}
          valueColor="white"
        />
        <Statics
          title="ديون متأخرة"
          value={overdueDebtsCount}
          valueColor={overdueDebtsCount > 0 ? "#cb6262" : "gray"}
        />
      </div>

      {/* Middle Grid - Add Debt Form & Summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "24px",
          width: "94%",
          margin: "24px auto",
          direction: "rtl",
        }}
      >
        {/* Register Debt Form */}
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            <MdAssignment style={{ color: "#22c97a", fontSize: "20px" }} />
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>
              تسجيل دين جديد
            </h3>
          </div>

          <form onSubmit={handleAddDebt}>
            <div>
              <label style={labelStyle}>اسم العميل</label>
              <input
                type="text"
                placeholder="اسم العميل"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={inputStyle}
                required
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
              }}
            >
              <div>
                <label style={labelStyle}>المبلغ (جنيه)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>تاريخ الاستحقاق</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>المدفوع (إن وجد)</label>
              <input
                type="number"
                placeholder="0"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>البضاعة / الملاحظة</label>
              <textarea
                placeholder="مثال: 5 كيلو أرز + كيلو سكر"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  ...inputStyle,
                  height: "80px",
                  resize: "none",
                  fontFamily: "cairo, sans-serif",
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                backgroundColor: "#22c97a",
                color: "black",
                border: "none",
                borderRadius: "8px",
                padding: "12px",
                width: "100%",
                cursor: "pointer",
                fontFamily: "cairo, sans-serif",
                fontSize: "14px",
                fontWeight: "700",
                marginTop: "10px",
              }}
            >
              + تسجيل الدين
            </button>
          </form>
        </div>

        {/* Debts Summary Card */}
        <div
          style={{
            ...cardStyle,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h3
              style={{
                margin: "0 0 20px 0",
                fontSize: "16px",
                fontWeight: "bold",
              }}
            >
              ملخص الديون
            </h3>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #222",
                  paddingBottom: "8px",
                }}
              >
                <span style={{ color: "#aaa" }}>إجمالي مطلوب</span>
                <span style={{ color: "#cb6262", fontWeight: "bold" }}>
                  {totalDebtsVal.toLocaleString()} ج
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #222",
                  paddingBottom: "8px",
                }}
              >
                <span style={{ color: "#aaa" }}>عدد العملاء</span>
                <span>{uniqueClientsCount} عميل</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #222",
                  paddingBottom: "8px",
                }}
              >
                <span style={{ color: "#aaa" }}>ديون متأخرة</span>
                <span
                  style={{ color: overdueDebtsCount > 0 ? "#cb6262" : "white" }}
                >
                  {overdueDebtsCount} دين
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid #222",
                  paddingBottom: "8px",
                }}
              >
                <span style={{ color: "#aaa" }}>أكبر دين</span>
                <span>{maxDebtVal.toLocaleString()} ج</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debts List */}
      <div style={{ width: "94%", margin: "24px auto", direction: "rtl" }}>
        <h3
          style={{
            color: "white",
            margin: "0 0 16px 0",
            fontFamily: "cairo, sans-serif",
            fontSize: "18px",
          }}
        >
          قائمة الديون
        </h3>

        {debts.length === 0 ? (
          <div
            style={{
              ...cardStyle,
              textAlign: "center",
              padding: "40px",
              color: "#666",
            }}
          >
            لا توجد ديون مسجلة حالياً
          </div>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            {debts.map((debt) => {
              const overdue = isOverdue(debt.due);
              const daysDiff = getDaysDiff(debt.due);
              const remaining = debt.amount - (debt.paid || 0);

              // Define avatar background and text color based on overdue status
              const avatarBg = overdue ? "#3a1c1c" : "#242424";
              const avatarColor = overdue ? "#e55b5b" : "#888";

              return (
                <div
                  key={debt.id}
                  style={{
                    ...cardStyle,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 20px",
                  }}
                >
                  {/* Right Column: Avatar and Client details */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        backgroundColor: avatarBg,
                        color: avatarColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "16px",
                        fontWeight: "bold",
                      }}
                    >
                      {getInitials(debt.name)}
                    </div>
                    <div>
                      <h4
                        style={{ margin: 0, fontSize: "16px", color: "white" }}
                      >
                        {debt.name}
                      </h4>
                      <p
                        style={{
                          margin: "4px 0 0 0",
                          fontSize: "12px",
                          color: "#aaa",
                        }}
                      >
                        {debt.note ? `${debt.note} - ` : ""}
                        {new Date(debt.due).toLocaleDateString("ar-EG", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })}
                      </p>
                      {debt.paid > 0 && (
                        <p
                          style={{
                            margin: "4px 0 0 0",
                            fontSize: "12px",
                            color: "#22c97a",
                          }}
                        >
                          دفع: {debt.paid} جنيه
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Left Column: Amount, Status Badge, and Actions */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "20px",
                    }}
                  >
                    {/* Amount */}
                    <div style={{ textAlign: "left" }}>
                      <span
                        style={{
                          fontSize: "18px",
                          fontWeight: "bold",
                          color: overdue ? "#e55b5b" : "white",
                        }}
                      >
                        {remaining.toLocaleString()} ج
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "4px 10px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: "bold",
                          backgroundColor: overdue
                            ? "rgba(229, 91, 91, 0.1)"
                            : "rgba(34, 201, 122, 0.1)",
                          color: overdue ? "#e55b5b" : "#22c97a",
                        }}
                      >
                        {overdue ? "متأخر" : `باقي ${daysDiff} يوم`}
                      </span>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => handleCollectDebt(debt.id)}
                        style={{
                          backgroundColor: "#22c97a",
                          color: "black",
                          border: "none",
                          borderRadius: "6px",
                          padding: "6px 12px",
                          cursor: "pointer",
                          fontFamily: "cairo, sans-serif",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        تحصيل
                      </button>
                      <button
                        onClick={() => handleDeleteDebt(debt.id)}
                        style={{
                          backgroundColor: "#3a1c1c",
                          color: "#e55b5b",
                          border: "1px solid #5a2c2c",
                          borderRadius: "6px",
                          padding: "6px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                        title="حذف"
                      >
                        <MdDelete size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Debts;
