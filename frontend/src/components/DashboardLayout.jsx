// components/DashboardLayout.jsx
import Sidebar from "./Sidebar";

export default function DashboardLayout({ children, role }) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar role={role} />

      {/* Main content */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}
