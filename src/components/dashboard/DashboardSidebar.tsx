// src\components\dashboard\DashboardSidebar.tsx

import { motion, AnimatePresence } from "motion/react";
import { LayoutDashboard, Map, MessageSquare, X } from "lucide-react";
import { NavixoLogo } from "../NavixoLogo";

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  currentPath?: string;
}

export function DashboardSidebar({
  isOpen,
  onClose,
  onNavigate,
  currentPath = "dashboard",
}: DashboardSidebarProps) {
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "dashboard",
    },
    { id: "roadmap", label: "Roadmap", icon: Map, path: "roadmap" },
    { id: "chat", label: "Ask Navixo", icon: MessageSquare, path: "chat" },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Panel - Fixed Desktop Override */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-[#13151B] border-r border-white/10 z-[70] flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 lg:hidden">
          <NavixoLogo size={28} variant="white" />
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg text-white/70"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* <div className="hidden lg:flex h-16 items-center px-6 border-b border-white/10">
          <NavixoLogo size={28} variant="white" />
        </div> */}

        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentPath === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.path);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20"
                    : "text-white/60 hover:bg-white/5 hover:text-white border border-transparent"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? "text-[#8B5CF6]" : "text-white/40"}`}
                />
                <span
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "14px",
                    fontWeight: isActive ? 600 : 500,
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
