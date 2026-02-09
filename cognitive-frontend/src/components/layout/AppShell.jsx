import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppShell({ children, title }) {
  return (
    <div className="min-h-screen">
      <div className="flex">
        <div className="hidden lg:block">
          <Sidebar />
        </div>
        <div className="flex-1">
          <Topbar title={title} />
          <main className="container-shell py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
