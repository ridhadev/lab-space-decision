import React from "react";
import {
  Map,
  TrendingUp,
  Store,
  LayoutDashboard,
} from "lucide-react";

export type NavView = "map" | "branches" | "growth" | "overview";

interface LeftNavRailProps {
  currentView: NavView;
  onSelectView: (view: NavView) => void;
}

interface NavItemDef {
  id: NavView;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItemDef[] = [
  { id: "map", label: "Map", icon: Map },
  { id: "branches", label: "Branches", icon: Store },
  { id: "growth", label: "Growth", icon: TrendingUp },
  { id: "overview", label: "Summary", icon: LayoutDashboard },
];

export const LeftNavRail: React.FC<LeftNavRailProps> = ({
  currentView,
  onSelectView,
}) => {
  return (
    <aside
      id="left-nav-rail"
      aria-label="Primary Navigation"
      className="w-[74px] shrink-0 h-screen sticky top-0 bg-[#050B14] border-r border-[#1D3452] flex flex-col items-center py-3.5 z-30 select-none transition-colors"
    >
      {/* Top: 'BE' Brand Square (38px, rounded ~9px, bordered) */}
      <div className="w-[38px] h-[38px] rounded-[9px] border border-[#1D3452] bg-[#0C182A] flex items-center justify-center p-1.5 shadow-xs mb-6 shrink-0 group">
        <img
          src="/bedashing-icon.svg"
          alt="BE Brand Mark"
          className="w-full h-full object-contain filter drop-shadow-xs"
        />
      </div>

      {/* Nav items in exact order: Map, Branches, Growth, Summary */}
      <nav className="flex flex-col items-center gap-2 w-full px-2" role="tablist">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              role="tab"
              aria-selected={isActive}
              aria-label={item.label}
              onClick={() => onSelectView(item.id)}
              className={`w-[56px] h-[52px] rounded-[9px] flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                isActive
                  ? "bg-[#0F1F35] text-white border border-[#1D3452]/90 shadow-sm"
                  : "text-[#8BA2C1] hover:bg-[#193152] hover:text-slate-100 border border-transparent"
              }`}
            >
              <Icon className="w-[18px] h-[18px] stroke-[1.8]" />
              <span className="text-[9px] font-medium tracking-wide uppercase leading-none">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
