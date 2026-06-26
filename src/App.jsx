import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { authAPI } from './api'
import Sidebar from './components/Sidebar'
import Sales from './pages/Sales'
import Storage from './pages/Storage'
import Expenses from './pages/Expenses'
import Dashboard from './pages/Dashboard'
import SignUp from './auth/SignUp'
import LogIn from './auth/LogIn'
import Suppliers from './pages/Suppliers'

function App() {
  const [activePage, setActivePage] = useState('Storage')
  const [loggedIn, setLoggedIn] = useState(false)
  const [authPage, setAuthPage] = useState('signup')
  const [userData, setUserData] = useState(null)

  // Listen for authentication state changes
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const user = await authAPI.me();
          setUserData(user);
          setLoggedIn(true);
        } catch (error) {
          console.error("Auth check failed:", error);
          localStorage.removeItem('authToken');
          setUserData(null);
          setLoggedIn(false);
        }
      } else {
        setUserData(null);
        setLoggedIn(false);
      }
    };
    checkAuth();
  }, [])

  // If the user is not logged in, show the SignUp or LogIn component based on authPage state
  if (!loggedIn) {
    if (authPage === 'signup') {
      return <SignUp setLoggedIn={setLoggedIn} setAuthPage={setAuthPage} setUserData={setUserData} />
    } else {
      return <LogIn setLoggedIn={setLoggedIn} setAuthPage={setAuthPage} setUserData={setUserData} />
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
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="storage" element={<Storage />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="sales" element={<Sales />} />
          <Route path="suppliers" element={<Suppliers />} />
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