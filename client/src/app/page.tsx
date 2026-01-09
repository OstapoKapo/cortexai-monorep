"use client";

import { useState } from "react";
import { Sidebar, Header } from "@/components/layout";
import {
  ReportsPage,
  ChatPage,
  AnalyticsPage,
  DocumentsPage,
  UsersPage,
  SettingsPage,
} from "@/components/pages";

const pageComponents: Record<string, React.ComponentType> = {
  reports: ReportsPage,
  chat: ChatPage,
  analytics: AnalyticsPage,
  documents: DocumentsPage,
  users: UsersPage,
  settings: SettingsPage,
};

export default function Home() {
  const [activeSection, setActiveSection] = useState("reports");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const ActivePage = pageComponents[activeSection] || ReportsPage;

  return (
    <div className="flex min-h-screen font-sans bg-background text-foreground">
      <Sidebar
        activeSection={activeSection}
        collapsed={sidebarCollapsed}
        onSectionChange={setActiveSection}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          sidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <ActivePage />
        </main>
      </div>
    </div>
  );
}
