import { Palette } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

const themes = [
  'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate', 
  'synthwave', 'retro', 'cyberpunk', 'valentine', 'halloween', 'garden',
  'forest', 'aqua', 'lofi', 'pastel', 'fantasy', 'wireframe', 'black',
  'luxury', 'dracula', 'cmyk', 'autumn', 'business', 'acid', 'lemonade',
  'night', 'coffee', 'winter', 'dim', 'nord', 'sunset'
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
        <Palette className="h-4 w-4" />
        <span className="hidden sm:inline">Theme</span>
      </div>
      <div className="dropdown-content bg-base-200 text-base-content rounded-box top-px max-h-96 h-[70vh] w-52 overflow-y-auto shadow-2xl mt-16">
        <div className="grid grid-cols-1 gap-3 p-3">
          {themes.map((themeName) => (
            <div
              key={themeName}
              className="outline-base-content overflow-hidden rounded-lg outline-2 outline-offset-2 hover:outline"
              data-theme={themeName}
            >
              <div
                onClick={() => setTheme(themeName)}
                className="bg-base-100 text-base-content w-full cursor-pointer font-sans transition-colors duration-200 hover:bg-base-200"
                data-theme={themeName}
              >
                <div className="grid grid-cols-5 grid-rows-3">
                  <div className="col-span-5 row-span-3 row-start-1 flex gap-1 py-3 px-4">
                    <div className="flex-grow text-sm font-bold capitalize">
                      {themeName}
                      {theme === themeName && <span className="ml-2 text-primary">✓</span>}
                    </div>
                    <div className="flex flex-shrink-0 flex-wrap gap-1">
                      <div className="bg-primary w-2 rounded"></div>
                      <div className="bg-secondary w-2 rounded"></div>
                      <div className="bg-accent w-2 rounded"></div>
                      <div className="bg-neutral w-2 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}