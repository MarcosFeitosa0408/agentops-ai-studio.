'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
}

export const Accordion: React.FC<AccordionProps> = ({ items, allowMultiple = false }) => {
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      if (expandedIds.includes(id)) {
        setExpandedIds(expandedIds.filter((itemId) => itemId !== id));
      } else {
        setExpandedIds([...expandedIds, id]);
      }
    } else {
      if (expandedIds.includes(id)) {
        setExpandedIds([]);
      } else {
        setExpandedIds([id]);
      }
    }
  };

  return (
    <div className="divide-border border-border bg-surface divide-y overflow-hidden rounded-xl border">
      {items.map((item) => {
        const isExpanded = expandedIds.includes(item.id);
        return (
          <div key={item.id} className="flex flex-col">
            <button
              onClick={() => toggleItem(item.id)}
              className="text-text-primary hover:bg-neutral-light/40 flex cursor-pointer items-center justify-between px-6 py-4 text-left font-semibold transition-colors outline-none select-none"
              aria-expanded={isExpanded}
            >
              <span>{item.title}</span>
              <ChevronDown
                className={`text-text-secondary h-4 w-4 transition-transform duration-200 ${
                  isExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-300 ${
                isExpanded
                  ? 'border-border/40 max-h-96 border-t px-6 py-4 opacity-100'
                  : 'max-h-0 opacity-0'
              }`}
            >
              <div className="text-text-secondary text-sm leading-relaxed">{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;
