import { useState, useEffect } from "react"
import { MdDashboard, MdPointOfSale, MdStorage } from "react-icons/md";
import { CiClock2 } from "react-icons/ci";
import { dataAPI } from "../api";
import { useNavigate, useLocation  } from 'react-router-dom'

function Sidebar({userData}) {
    const [lowProducts, setLowProducts] = useState(0)
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const fetchLowProducts = async () => {
            try {
                const items = await dataAPI.getProducts();
                setLowProducts(items.filter(p => p.status === 'ناقص').length);
            } catch (err) {
                console.error(err);
            }
        };
        fetchLowProducts();
    }, [])

    const navItem = (label, path, icon, badge) => (
        <button onClick={() => {
            navigate(path)
        }} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            backgroundColor: location.pathname === path ? "#1f2e1f" : "transparent",
            color: location.pathname === path ? "#22c97a" : "#aaa",
            border: "none", borderRadius: "8px", padding: "8px 12px",
            cursor: "pointer", fontFamily: "cairo, sans-serif", fontSize: "14px",
            width: "100%", textAlign: "right"
        }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {badge > 0 && (
                    <span style={{
                        backgroundColor: "#e05555", color: "white", borderRadius: "50%",
                        width: "18px", height: "18px", fontSize: "11px",
                        display: "inline-flex", alignItems: "center", justifyContent: "center"
                    }}>{badge}</span>
                )}
                <span>{label}</span>
            </div>
            <span style={{ fontSize: "16px" }}>{icon}</span>
        </button >
    )

    return (
        <div style={{
            width: '240px', height: '100vh', background: '#121212',
            padding: '16px', borderLeft: "1px solid #222",
            display: "flex", flexDirection: "column", gap: "2px",
            boxSizing: "border-box"
        }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", marginBottom: "20px", padding: "0 4px" }}>
                <h1 style={{ color: 'white', margin: 0, fontFamily: "cairo, sans-serif", fontSize: "22px", letterSpacing: "1px" }}>
                    TIJARA
                </h1>
            </div>

            {/* الرئيسية */}
            <p style={{ color: "#444", fontSize: "11px", fontFamily: "cairo, sans-serif", margin: "4px 4px 2px", textAlign: "right" }}>الرئيسية</p>
            {navItem("الرئيسية", "/dashboard", <MdDashboard />)}

            {/* العمليات اليومية */}
            <p style={{ color: "#444", fontSize: "11px", fontFamily: "cairo, sans-serif", margin: "10px 4px 2px", textAlign: "right" }}>العمليات اليومية</p>
            {navItem("مبيعات اليوم", "/sales", <MdPointOfSale />)}
            {navItem("المخزن", "/storage", <MdStorage />, lowProducts)}
            {navItem("المصروفات", "/expenses", <CiClock2 />)}
            {navItem("الديون والأجل", "/debts", <MdStorage /> /* using storage as placeholder */, 1)}

            {/* التقارير */}
            <p style={{ color: "#444", fontSize: "11px", fontFamily: "cairo, sans-serif", margin: "10px 4px 2px", textAlign: "right" }}>التقارير</p>
            {navItem("الأرباح والخسائر", "/profits", <MdPointOfSale />)}
            {navItem("تقرير اليوم", "/daily-report", <CiClock2 />)}
            {navItem("الموردون", "/suppliers", <MdStorage />)}

            <div style={{ flex: 1 }}></div>

            {/* User Profile */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #222', paddingTop: '12px', marginTop: '12px' }}>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'white', fontSize: '14px', fontFamily: 'cairo, sans-serif' }}>{userData?.name || "المستخدم"}</div>
                    <div style={{ color: '#666', fontSize: '11px', fontFamily: 'cairo, sans-serif' }}>{userData?.businessName || "مدير الفني"}</div>
                </div>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#0d2a1b', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>
                    {userData?.name ? userData.name.substring(0, 2) : "م"}
                </div>
            </div>
        </div>
    )
}
export default Sidebar