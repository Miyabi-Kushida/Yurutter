import { Home, Flame, Compass, MessageCircle } from "lucide-react";

export default function Sidebar({ categories, activeCategory, setActiveCategory, isMobile = false }) {
  return (
    <aside
      className={
        `${isMobile ? "flex" : "hidden sm:flex"} flex-col 
     ${isMobile ? "w-full h-full pt-0" : "w-56 min-h-screen fixed left-0 top-0 pt-16"} 
     bg-white shadow-[2px_0_8px_-2px_rgba(0,0,0,0.05)]`
      }
    >

      <nav className="flex flex-col gap-1 px-3 py-4">
        {categories.map((cat, i) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-[15px] font-medium transition-all
              ${activeCategory === cat
                ? "bg-gray-100 text-[#457BF5]"
                : "text-gray-600 hover:bg-gray-50 hover:text-[#457BF5]"
              }`}
          >

            <span>{cat}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}