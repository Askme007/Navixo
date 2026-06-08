// src\components\dashboard\DashboardHeader.tsx

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu, LogOut } from "lucide-react";
import { NavixoLogo } from "../NavixoLogo";

interface DashboardHeaderProps {
  userName: string;
  onSidebarToggle: () => void;
  onNavigate: (path: string) => void;
  onLogoutClick: () => void;
}

export function DashboardHeader({
  userName,
  onSidebarToggle,
  onLogoutClick,
}: DashboardHeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[#13151B]/80 backdrop-blur-xl border-b border-white/10 z-50">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between gap-4">
        {/* Left: hamburger + logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onSidebarToggle}
            className="lg:hidden p-2 hover:bg-white/5 rounded-lg transition-all"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5 text-white/70" />
          </button>
          <NavixoLogo size={32} variant="white" />
        </div>

        {/* Right: user menu */}
        <div className="flex items-center gap-2">
          {/* User menu (desktop) */}
          <div className="relative hidden sm:flex items-center gap-3 pl-3">
            <p
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 500,
                fontSize: "13px",
              }}
              className="text-white"
            >
              {userName}
            </p>
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="user-menu-button w-9 h-9 bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] rounded-full flex items-center justify-center hover:scale-105 transition-transform"
              aria-label="User menu"
            >
              <span
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
                className="text-white"
              >
                {userName.charAt(0).toUpperCase()}
              </span>
            </button>

            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="user-menu-dropdown absolute right-0 top-full mt-2 w-44 bg-[#13151B]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-xl z-50"
                >
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onLogoutClick();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-all text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span
                        style={{
                          fontFamily: "Inter, sans-serif",
                          fontSize: "14px",
                          fontWeight: 500,
                        }}
                      >
                        Logout
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Logout (mobile) */}
          <button
            onClick={onLogoutClick}
            className="sm:hidden p-2 hover:bg-white/5 rounded-lg transition-all"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4 text-white/50" />
          </button>
        </div>
      </div>
    </header>
  );
}
