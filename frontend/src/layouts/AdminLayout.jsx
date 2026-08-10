import React, { useState, useContext } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import AdminSidebar from '../components/admin/layout/AdminSidebar';
import AdminTopbar from '../components/admin/layout/AdminTopbar';

const AdminLayout = () => {
  const { user, logoutUser } = useContext(AppContext);
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex admin-area">
      {/* Sidebar */}
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top bar */}
        <AdminTopbar onMobileMenuOpen={() => setMobileMenuOpen(true)} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
