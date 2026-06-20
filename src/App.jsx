import { useState, useEffect } from 'react'
import { auth, db } from './firebase'
import { doc, getDoc } from 'firebase/firestore'
import { BrowserRouter, Routes, Route ,Outlet } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Sales from './pages/Sales'
import Storage from './pages/Storage'
import Expenses from './pages/Expenses'
import SignUp from './auth/SignUp'
import LogIn from './auth/LogIn'

function App() {
  const [activePage, setActivePage] = useState('Storage')
  const [loggedIn, setLoggedIn] = useState(false)
  const [authPage, setAuthPage] = useState('signup')
  const [userData, setUserData] = useState(null)

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      // If the user is logged in, fetch their data from Firestore
      if (user) {
        const docSnap = await getDoc(doc(db, "users", user.uid))
        // If the document exists, set the user data and loggedIn state
        if (docSnap.exists()) {
          setUserData(docSnap.data())
        }
        setLoggedIn(true)
        // If the user is not logged in, clear the user data and set loggedIn to false
      } else {
        setUserData(null)
        setLoggedIn(false)
      }
    })
    return () => unsubscribe()
  }, [])

  // If the user is not logged in, show the SignUp or LogIn component based on authPage state
  if (!loggedIn) {
    if (authPage === 'signup') {
      return <SignUp setLoggedIn={setLoggedIn} setAuthPage={setAuthPage} />
    } else {
      return <LogIn setLoggedIn={setLoggedIn} setAuthPage={setAuthPage} />
    }
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <div style={{ display: 'flex', direction: 'rtl', width: '100%', height: '100vh', backgroundColor: "#161616" }}>
            <Sidebar userData={userData} />
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {/* {Outlet will render the child routes} */}
              <Outlet />
            </div>
          </div>
        }>
          {/* {Route index for default page.*/}
          <Route index element={<Sales />} />
          <Route path="storage" element={<Storage />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="sales" element={<Sales />} />
        </Route>
      </Routes>
    </BrowserRouter>
    // <div style={{ display: 'flex', direction: 'rtl', width: '100%', height: '100vh', backgroundColor: "#161616", }}>
    //   <Sidebar activePage={activePage} setActivePage={setActivePage} userData={userData} />

    //   <div style={{ padding: '0px', flex: 1 }}>
    //     {activePage === 'Storage' && <Storage />}
    //     {activePage === 'Expenses' && <Expenses />}
    //     {activePage === 'Sales' && <Sales />}
    //   </div>
    // </div>
  )
}

export default App