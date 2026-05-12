"use client";

import React from 'react';
import type   { Table } from '@tanstack/react-table';
import { MinusIcon, SquareIcon, MaximizeIcon } from 'lucide-react';
import type { RowDensity } from './dataTableDensity.utils';

export interface DataTableDensityProps<TData> {
  table: Table<TData>;
  density: RowDensity;
  onDensityChange: (density: RowDensity) => void;
}

export function DataTableDensity<TData>({
  density,
  onDensityChange,
}: DataTableDensityProps<TData>) {
  const densityOptions: { value: RowDensity; label: string; icon: React.ReactNode }[] = [
    {
      value: 'compact',
      label: 'Compact',
      icon: <MinusIcon className="w-4 h-4" />,
    },
    {
      value: 'normal',
      label: 'Normal',
      icon: <SquareIcon className="w-4 h-4" />,
    },
    {
      value: 'comfortable',
      label: 'Comfortable',
      icon: <MaximizeIcon className="w-4 h-4" />,
    },
  ];


  return (
    <div className="flex items-center space-x-2">
      {/* Density Selector */}
      <div className="border-input flex items-center space-x-1 rounded-lg border">
        {densityOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onDensityChange(option.value)}
            className={`flex items-center space-x-1 px-3 py-2 text-sm transition-colors ${
              density === option.value
                ? 'border-primary/30 bg-primary/10 text-primary'
                : 'text-foreground hover:bg-accent'
            } ${option.value === 'compact' ? 'rounded-l-lg' : ''} ${
              option.value === 'comfortable' ? 'rounded-r-lg' : ''
            }`}
            title={option.label}
          >
            {option.icon}
            <span className="hidden sm:inline">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

