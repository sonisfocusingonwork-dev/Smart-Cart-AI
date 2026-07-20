import React from "react";
import { Apple, Leaf, Fish, Beef, Milk, Cookie } from "lucide-react";

export function MonogramPattern() {
  const icons = [Apple, Leaf, Fish, Beef, Milk, Cookie];
  
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-5 flex flex-wrap gap-8 p-4 justify-around items-center">
      {Array.from({ length: 48 }).map((_, i) => {
        const Icon = icons[i % icons.length];
        return (
          <div key={i} className="flex h-12 w-12 items-center justify-center -rotate-12">
            <Icon size={32} />
          </div>
        );
      })}
    </div>
  );
}
