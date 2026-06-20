import Header from "../components/Header";
import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, increment } from "firebase/firestore";


function Sales() {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const currentDate = new Date().toLocaleDateString('ar-EG', options);

  const [products, setProducts] = useState([])
  const [quantities, setQuantities] = useState({})
  const [saved, setSaved] = useState(false)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [totalCost, setTotalCost] = useState(0)
  const [totalProfit, setTotalProfit] = useState(0)

  //getting products for current user from the firestore and listen to changes in real time
  useEffect(() => {
    const user = auth.currentUser
    if (!user) return

    const q = query(collection(db, "products"), where("ownerId", "==", user.uid))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }))
      setProducts(items)
      setQuantities(prev => {
        const updated = { ...prev }
        items.forEach(p => {
          if (!(p.id in updated)) updated[p.id] = 0
        })
        return updated
      })
    })

    return () => unsubscribe()
  }, [])

  //getting total revenue, cost and profit for the current day
  useEffect(() => {
    const user = auth.currentUser
    if (!user) return

    const today = new Date().toISOString().split('T')[0]

    const q = query(
      collection(db, "sales"),
      where("ownerId", "==", user.uid),
      where("date", "==", today)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let revenue = 0, cost = 0, profit = 0
      snapshot.docs.forEach(doc => {
        const data = doc.data()
        revenue += data.revenue || 0
        cost += data.quantitySold * data.buyingPrice || 0
        profit += data.profit || 0
      })
      setTotalRevenue(revenue)
      setTotalCost(cost)
      setTotalProfit(profit)
    })

    return () => unsubscribe()
  }, [])

  // function to save today's sales to firestore and update product quantities
  const saveSales = async () => {
    const user = auth.currentUser
    if (!user) return

    const soldEntries = products
      .map(p => ({ product: p, soldQuantity: quantities[p.id] || 0 }))
      .filter(entry => entry.soldQuantity > 0)

    if (soldEntries.length === 0) {
      alert('من فضلك أدخل كمية مباعة لمنتج واحد على الأقل')
      return
    }
    //promise to update stock and record sale for each sold product
    //promise mean that we will wait for all the promises to resolve before setting saved to true
    await Promise.all(soldEntries.map(({ product: p, soldQuantity }) => {
      const updateStock = updateDoc(doc(db, "products", p.id), {
        quantity: increment(-soldQuantity)
      })

      const recordSale = addDoc(collection(db, "sales"), {
        ownerId: user.uid,
        productId: p.id,
        productName: p.name,
        quantitySold: soldQuantity,
        sellingPrice: p.sellingPrice,
        buyingPrice: p.buyingPrice,
        revenue: soldQuantity * p.sellingPrice,
        profit: soldQuantity * (p.sellingPrice - p.buyingPrice),
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date()
      })

      return Promise.all([updateStock, recordSale])
    }))

    setSaved(true)
  }

  return (
    <>
      <Header title="مبيعات اليوم" extraContent={<span></span>} />

      {/* Sales Hero Box */}
      <div style={{
        background: "linear-gradient(135deg, #1e1e1e 0%, #161616 100%)",
        border: "1px solid #22c97a30", borderRadius: "16px",
        padding: "20px", margin: "16px 28px 20px"
      }}>

        {/* Date + Status */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexDirection: "row-reverse" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#a0a0a0", fontSize: "13px", fontFamily: "cairo, sans-serif" }}>حالة الإدخال</span>
            {saved ? (
              <span style={{
                backgroundColor: "#22c97a14", color: "#22c97a",
                padding: "2px 8px", borderRadius: "20px",
                fontSize: "11px", fontWeight: "600", fontFamily: "cairo, sans-serif"
              }}>تم الحفظ ✓</span>
            ) : (
              <span style={{
                backgroundColor: "#f5a62314", color: "#f5a623",
                padding: "2px 8px", borderRadius: "20px",
                fontSize: "11px", fontWeight: "600", fontFamily: "cairo, sans-serif"
              }}>لم يُحفظ</span>
            )}

          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "11px", color: "#585858", fontFamily: "cairo, sans-serif" }}>إدخال مبيعات</div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: "#f2f2f2", fontFamily: "cairo, sans-serif" }}>{currentDate}</div>
          </div>
        </div>

        {/* Totals */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: "1px", background: "#ffffff14",
          borderRadius: "8px", overflow: "hidden", marginBottom: "16px"
        }}>
          <div style={{ background: "#1e1e1e", padding: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "#585858", marginBottom: "3px", fontFamily: "cairo, sans-serif" }}>الإيراد الكلي</div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "#f2f2f2", fontFamily: "cairo, sans-serif" }}>{totalRevenue} جنيه</div>
          </div>
          <div style={{ background: "#1e1e1e", padding: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "#585858", marginBottom: "3px", fontFamily: "cairo, sans-serif" }}>التكلفة الكلية</div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "#f05c5c", fontFamily: "cairo, sans-serif" }}>{totalCost} جنيه</div>
          </div>
          <div style={{ background: "#1e1e1e", padding: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "#585858", marginBottom: "3px", fontFamily: "cairo, sans-serif" }}>الربح الصافي</div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "#22c97a", fontFamily: "cairo, sans-serif" }}>{totalProfit} جنيه</div>
          </div>
        </div>
      </div>
      {/* products */}
      <div>
        <div style={{ display: "flex", gap: "12px", padding: "0 28px", marginBottom: "8px", fontFamily: "cairo, sans-serif", fontSize: "14px", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ margin: 0, color: "#f2f2f2", fontFamily: "cairo, sans-serif", fontSize: "18px", fontWeight: "800" }}>كم منتج تم بيعه اليوم</p>
          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={saveSales} style={{
              backgroundColor: "#22c97a", color: "#000",
              border: "none", borderRadius: "8px",
              padding: "8px 16px", cursor: "pointer",
              fontFamily: "cairo, sans-serif", fontSize: "13px", fontWeight: "600"
            }}>💾 حفظ مبيعات اليوم</button>
          </div>
        </div>
      </div>
      {/* Products Table */}
      <div style={{ padding: "0 28px", marginTop: "20px" }}>
        {products.length === 0 ? (
          <p style={{ color: "#585858", textAlign: "center", padding: "40px", fontFamily: "cairo, sans-serif" }}>
            لا يوجد منتجات في المخزن - اضف بعض المنتجات من صفحة المخزن لبدء تسجيل المبيعات
          </p>
        ) :
          products.map((p) => (
            <div key={p.id} style={{
              background: "#1e1e1e", border: "1px solid #ffffff14",
              borderRadius: "12px", padding: "12px 14px",
              marginBottom: "8px", display: "grid",
              gridTemplateColumns: "1fr auto auto auto",
              gap: "24px", alignItems: "center"
            }}>
              {/* اسم المنتج - اليمين */}
              <div style={{ textAlign: "right" }}>
                <div style={{ color: "#f2f2f2", fontWeight: "600", fontSize: "14px", fontFamily: "cairo, sans-serif" }}>{p.name}</div>
                <div style={{ color: "#585858", fontSize: "11px", fontFamily: "cairo, sans-serif" }}>بيع: {p.sellingPrice} ج/كيلو | شراء: {p.buyingPrice} ج/كيلو</div>
              </div>

              {/* input */}
              <div style={{ textAlign: "center" }}>
                <input
                  type="number" min="0"
                  value={quantities[p.id] || 0}
                  onChange={(e) => {
                    const val = Number(e.target.value)
                    setQuantities({ ...quantities, [p.id]: val > p.quantity ? p.quantity : val });
                    setSaved(false);
                  }}
                  style={{
                    width: "80px", padding: "8px", textAlign: "center",
                    backgroundColor: "#262626", border: "1px solid #22c97a",
                    borderRadius: "8px", color: "#f2f2f2",
                    fontFamily: "cairo, sans-serif", fontSize: "14px"
                  }}
                />
                <div style={{ color: "#585858", fontSize: "11px", fontFamily: "cairo, sans-serif", marginTop: "4px" }}>{p.unit} (متاح: {p.quantity})</div>
              </div>

              {/* إيراد */}
              <div style={{ textAlign: "center", minWidth: "60px" }}>
                <p style={{ color: "#585858", fontSize: "11px", fontFamily: "cairo, sans-serif", margin: "0 0 3px" }}>الإيراد</p>
                {(quantities[p.id] || 0) === 0 ?
                  <p style={{ color: "#585858", fontSize: "14px", margin: 0 }}>—</p> :
                  <p style={{ color: "#f2f2f2", fontSize: "14px", fontWeight: "700", margin: 0, fontFamily: "cairo, sans-serif" }}>{quantities[p.id] * p.sellingPrice} ج</p>
                }
              </div>

              {/* ربح */}
              <div style={{ textAlign: "center", minWidth: "60px" }}>
                <p style={{ color: "#585858", fontSize: "11px", fontFamily: "cairo, sans-serif", margin: "0 0 3px" }}>الربح</p>
                {(quantities[p.id] || 0) === 0 ?
                  <p style={{ color: "#585858", fontSize: "14px", margin: 0 }}>—</p> :
                  <p style={{ color: "#22c97a", fontSize: "14px", fontWeight: "700", margin: 0, fontFamily: "cairo, sans-serif" }}>{quantities[p.id] * (p.sellingPrice - p.buyingPrice)} ج</p>
                }
              </div>
            </div>
          ))}
      </div>
    </>
  );
}

export default Sales