import TopBar from "@/components/TopBar";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen p-3 md:p-4">
        <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-400 flex-col gap-4 lg:min-h-[calc(100vh-2rem)]">
          <TopBar />
          <main className="terminal-panel relative min-h-[70vh] flex-1 overflow-auto rounded-3xl p-4 md:p-6 lg:p-8">
            <div className="relative z-10">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
