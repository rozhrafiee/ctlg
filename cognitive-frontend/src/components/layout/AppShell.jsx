import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppShell({ children, title }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden">
      <div className="flex min-h-screen">
        {/* Desktop sidebar */}
        <div className="hidden lg:block flex-shrink-0">
          <Sidebar />
        </div>
        {/* Mobile sidebar overlay */}
        <Sidebar
          isMobileOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          mobileOnly
        />
        <div className="flex-1 min-w-0 flex flex-col">
          <Topbar title={title} onMenuClick={() => setMobileMenuOpen(true)} />
          <main className="container-shell py-6 sm:py-8 flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
