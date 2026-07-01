import { createPortal } from "react-dom";
import { useState } from "react";
function Export({ onClose }) {
    const [isFirstButtonHovered, setIsFirstButtonHovered] = useState(false);
    const [isSecondButtonHovered, setIsSecondButtonHovered] = useState(false);

    return createPortal(
        <>



            {/* Overlay */}
            <div
                onClick={onClose}
                style={{
                    position: "fixed",
                    inset: 0,
                    background: "rgba(0,0,0,0.7)", // خليناها أغمق شوية لعزل أفضل
                    zIndex: 99999 // رفعنا الـ zIndex لضمان الظهور فوق أي شيء
                }}
            />

            {/* Modal */}
            <div style={{
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "#1a1a1a",
                border: "1px solid #2a2a2a",
                borderRadius: "16px",
                padding: "28px",
                width: "440px",
                maxWidth: "90vw",
                zIndex: 100000,
                direction: "rtl",
                fontFamily: "cairo, sans-serif",
                boxShadow: "0 20px 40px rgba(0,0,0,0.5)" // إضافة ظل ليفصل المودال عن الخلفية
            }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                    <h2 style={{ color: "#f2f2f2", fontSize: "17px", fontWeight: "700", margin: 0 }}>
                        تصدير البيانات
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: "none", border: "none", color: "#555",
                            fontSize: "20px", cursor: "pointer", lineHeight: 1
                        }}

                    >✕</button>
                </div>
                <p style={{ color: "#666", fontSize: "13px", marginBottom: "20px" }}>
                    اختر الطريقة التي تناسبك لتحميل بيانات عملك
                </p>

                {/* Excel Option */}
                <div style={{
                    background: "#111", border: "1px solid #2a2a2a",
                    borderRadius: "12px", padding: "16px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    marginBottom: "10px"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                            width: "40px", height: "40px", borderRadius: "10px",
                            background: "#1a3a1a", border: "1px solid #22c97a22",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "20px"
                        }}>📊</div>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ color: "#f2f2f2", fontSize: "14px", fontWeight: "700" }}>
                                ملف Excel (CSV)
                            </div>
                            <div style={{ color: "#555", fontSize: "12px", marginTop: "3px" }}>
                                تحميل بياناتك على شكل ملف Excel بصيغة CSV
                            </div>
                        </div>
                    </div>
                    <button style={{
                        background: "#22c97a", color: "#000",
                        border: "none", borderRadius: "8px",
                        padding: "8px 14px", cursor: "pointer",
                        fontFamily: "cairo, sans-serif", fontSize: "12px", fontWeight: "700",
                        background: isFirstButtonHovered ? "#19985d" : "#28d085" 

                    }}
                        onMouseEnter={() => setIsFirstButtonHovered(true)}
                        onMouseLeave={() => setIsFirstButtonHovered(false)}>
                        تحميل
                    </button>
                </div>

                {/* JSON Option */}
                <div style={{
                    background: "#111", border: "1px solid #2a2a2a",
                    borderRadius: "12px", padding: "16px",
                    display: "flex", alignItems: "center", justifyContent: "space-between"
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{
                            width: "40px", height: "40px", borderRadius: "10px",
                            background: "#1a1a2e", border: "1px solid #4ea8f522",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "20px"
                        }}>🗂️</div>
                        <div style={{ textAlign: "right" }}>
                            <div style={{ color: "#f2f2f2", fontSize: "14px", fontWeight: "700" }}>
                                نسخة احتياطية كاملة (JSON)
                            </div>
                            <div style={{ color: "#555", fontSize: "12px", marginTop: "3px" }}>
                                تحميل جميع بياناتك على شكل ملف JSON
                            </div>
                        </div>
                    </div>
                    <button style={{
                        background: "#4ea8f5", color: "#000",
                        border: "none", borderRadius: "8px",
                        padding: "8px 14px", cursor: "pointer",
                        fontFamily: "cairo, sans-serif", fontSize: "12px", fontWeight: "700",
                        background: isSecondButtonHovered ? "#3573a9" : "#4ea8f5"
                    }}
                        onMouseEnter={() => setIsSecondButtonHovered(true)}
                        onMouseLeave={() => setIsSecondButtonHovered(false)}>
                        تحميل
                    </button>
                </div>
            </div>
        </>,
        document.body
    )
}

export default Export;