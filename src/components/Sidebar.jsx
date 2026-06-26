import { useState, useEffect } from "react"
import {
    MdHome,
    MdShoppingCart,
    MdInventory,
    MdAccountBalanceWallet,
    MdHandshake,
    MdBarChart,
    MdAssignment,
    MdLocalShipping
} from "react-icons/md";
import { CiClock2 } from "react-icons/ci";
import { auth, db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useNavigate, useLocation } from 'react-router-dom';


function Sidebar({ userData }) {
    const [lowProducts, setLowProducts] = useState(0)
    const navigate = useNavigate()
    const location = useLocation()

    //getting products with low quantity for current user from the firestore and listen to changes in real time
    useEffect(() => {
        const user = auth.currentUser
        if (!user) return

        const q = query(collection(db, "products"), where("ownerId", "==", user.uid))

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map(docSnap => docSnap.data())
            setLowProducts(items.filter(p => p.status === 'ناقص').length)
        })

        return () => unsubscribe()
    }, [])

    const navItem = (label, path, icon, badge) => (
        <button onClick={() => {
            navigate(path)
        }} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            backgroundColor: location.pathname === path ? "#1f2e1f" : "transparent",
            color: location.pathname === path ? "#22c97a" : "#aaa",
            border: "none", borderRadius: "8px", padding: "10px 14px",
            cursor: "pointer", fontFamily: "cairo, sans-serif", fontSize: "15px",
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
            width: '220px', height: '100vh', background: '#161616',
            padding: '20px', borderLeft: "1px solid #222",
            display: "flex", flexDirection: "column", gap: "4px"
        }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                {/* <div>
                    <h2 style={{ color: 'white', margin: 0, fontFamily: "cairo, sans-serif", fontSize: "20px" }}>
                        {userData?.businessName || "تجارة"}
                    </h2>
                    <p style={{ color: "#555", margin: 0, fontSize: "11px", fontFamily: "cairo, sans-serif" }}>
                        {userData?.fullName || "نظام إدارة البيزنس"}
                    </p>
                </div> */}
               <img 
                    src="public/Logo.png"
                    alt="Logo" 
                    style={{ 
                        width: "70px", 
                        height: "70px", 
                        objectFit: "contain",
                        borderRadius: "6px" 
                    }} 
                />
            </div>

            <p style={{ color: "#444", fontSize: "11px", fontFamily: "cairo, sans-serif", margin: "12px 4px 4px", textAlign: "right" }}> الرئيسية</p>
            {navItem("الرئيسية", "/dashboard", <MdHome />)}

            <p style={{ color: "#444", fontSize: "11px", fontFamily: "cairo, sans-serif", margin: "12px 4px 4px", textAlign: "right" }}>العمليات اليومية</p>
            {navItem("مبيعات اليوم", "/sales", <MdShoppingCart />)}
            {navItem("المخزن", "/storage", <MdInventory />, lowProducts)}
            {navItem("المصروفات", "/expenses", <MdAccountBalanceWallet />)}
            {navItem("الديون والآجل", "/debts", <MdHandshake />, 0)}

            <p style={{ color: "#444", fontSize: "11px", fontFamily: "cairo, sans-serif", margin: "12px 4px 4px", textAlign: "right" }}> التقارير</p>
            {/* {navItem("الأرباح والخسائر", "/profit-loss", <MdBarChart />)}
            {navItem("تقرير اليوم", "/daily-report", <MdAssignment />)} */}
            {navItem("الموردون", "/suppliers", <MdLocalShipping />)}
        </div>
    )
}
export default Sidebar