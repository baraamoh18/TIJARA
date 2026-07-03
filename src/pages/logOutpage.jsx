import { createPortal } from "react-dom";
import { useState } from "react";

function LogOutModal({ isOpen, onClose, onConfirm }) {
    const [isHovered, setIsHovered] = useState(false);

    if (!isOpen) return null;

    return createPortal(
        <>
            <div 
                onClick={onClose} 
                style={{
                    position: "fixed", 
                    inset: 0,
                    background: "rgba(0,0,0,0.7)", 
                    zIndex: 999999,
                    backdropFilter: "blur(2px)" // تأثير ضبابي خفيف للخلفية كالعادة
                }} 
            />


            <div style={{
                position: "fixed", 
                top: "50%", 
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "#161616", 
                border: "1px solid #2a2a2a",
                borderRadius: "16px", 
                padding: "24px",
                width: "360px", 
                maxWidth: "90vw",
                zIndex: 1000000, 
                direction: "rtl",
                fontFamily: "cairo, sans-serif",
                boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
                textAlign: "center"
            }}>

                <div style={{ 
                    fontSize: "36px", 
                    marginBottom: "12px",
                    color: "#e05555" 
                }}>
                    ⚠️
                </div>


                <h3 style={{ color: "#f2f2f2", fontSize: "16px", fontWeight: "700", margin: "0 0 8px 0" }}>
                    تسجيل الخروج
                </h3>
                <p style={{ color: "#888", fontSize: "13px", margin: "0 0 24px 0", lineHeight: "1.5" }}>
                    هل أنت متأكد أنك تريد تسجيل الخروج؟ ستحتاج لإدخال بياناتك مجدداً للدخول.
                </p>


                <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>

                    <button
                        onClick={onConfirm}
                        
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        style={{
                            flex: 1,
                            background: isHovered ? "#b83f3f" : "#e05555",
                            color: "#fff",
                            border: "none", 
                            borderRadius: "10px",
                            padding: "10px 0", 
                            cursor: "pointer",
                            fontFamily: "cairo, sans-serif", 
                            fontSize: "13px", 
                            fontWeight: "700",
                            transition: "background 0.15s ease"
                        }}
                    >
                        نعم، خروج
                    </button>

                    <button
                        onClick={onClose}
                        style={{
                            flex: 1,
                            background: "#2a2a2a", 
                            color: "#f2f2f2",
                            border: "none", 
                            borderRadius: "10px",
                            padding: "10px 0", 
                            cursor: "pointer",
                            fontFamily: "cairo, sans-serif", 
                            fontSize: "13px", 
                            fontWeight: "600"
                        }}
                    >
                        تراجع
                    </button>
                </div>
            </div>
        </>,
        document.body
    );
}

export default LogOutModal;