'use client';

import { useState } from 'react';

export function SettingsTabs({ tabs }: { tabs: { id: string; label: string; content: React.ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const activeTab = tabs.find((tab) => tab.id === active) ?? tabs[0];

  return (
    <div>
      <nav aria-label="Settings categories" className="flex flex-wrap gap-2 mb-6">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActive(id)}
            aria-current={active === id ? 'true' : undefined}
            className={`px-4 py-1.5 rounded-full text-sm border whitespace-nowrap transition-colors ${
              active === id
                ? 'bg-[var(--ink)] text-white border-[var(--ink)]'
                : 'bg-white text-[var(--ink)] border-[var(--line)] hover:border-[var(--ink)]'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>
      {activeTab?.content}
    </div>
  );
}
