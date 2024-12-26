import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import SidebarNav from './Components/SideNavBar'; // Admin Sidebar
import SideNavBar2 from './Components/SideNavBar2'; // Manager Sidebar
import SideNavBar3 from "./Components/SideNavBar3"
import LandingPage from './Screen/LandingPage';
import LoginScreen from './Screen/Login';

const App = () => {
  return (
    <div className="App">
      <Router>
        <MainContent />
      </Router>
    </div>
  );
};

const MainContent = () => {
  const location = useLocation();

  // Define routes without Sidebar
  const noNavBarRoutes = ['/', '/login'];
  const isNavBarVisible = !noNavBarRoutes.includes(location.pathname);

  // Retrieve user role from localStorage
  const userRole = localStorage.getItem('userRole'); // 'admin' or 'manager'

  return (
    <>
      {isNavBarVisible && (
        <>
          {userRole === 'admin' && <SidebarNav />}
          {userRole === 'manager' && <SideNavBar2 />}
          {userRole === 'used-bikes' && <SideNavBar3 />}
        </>
      )}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginScreen />} />
      </Routes>
    </>
  );
};

export default App;
