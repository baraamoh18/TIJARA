import { useState } from "react";

function Statics({ title, value, valueColor, subtitle, subtitleColor }) {
    const [onHover, setOnHover] = useState(false);
    return (
        <div
            onMouseEnter={() => setOnHover(true)}
            onMouseLeave={() => setOnHover(false)}
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                padding: "24px",
                flex: 1,
                backgroundColor: "#202020",
                borderRadius: "12px",
                fontFamily: "cairo, sans-serif",
                letterSpacing: "0.5px",
                borderTop: onHover ? "4px solid #22c97a" : "4px solid #333",
            }}
        >
            <h3 style={{ color: "#888", margin: "0", textAlign: "right", fontSize: "14px" }}>{title}</h3>
            <p style={{ color: valueColor || "gray", margin: "0", textAlign: "right" }}>{value}</p>
            {subtitle && (
                <p style={{ color: subtitleColor || "#22c97a", margin: "0", textAlign: "right", fontSize: "12px" }}>
                    {subtitle}
                </p>
            )}
        </div>
    );
}

export default Statics;