import React, { useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { getDynamicYears } from '../../utils/yearUtils';

interface DynamicYearSelectProps {
  value: string;
  onChange: (year: string) => void;
  startYear?: number;
  yearsInAdvance?: number;
  id?: string;
  className?: string;
  showLabel?: boolean;
  showIcon?: boolean;
}

export const DynamicYearSelect: React.FC<DynamicYearSelectProps> = ({
  value,
  onChange,
  startYear = 2026,
  id = "select-ano",
  className = "",
  showLabel = true,
  showIcon = true,
}) => {
  const years = useMemo(() => getDynamicYears(startYear, 2030), [startYear]);

  return (
    <div className={`flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-sm px-2.5 py-1.5 focus-within:border-[#0055A5] focus-within:bg-white transition-all shadow-2xs ${className}`}>
      {showIcon && <Calendar className="w-3.5 h-3.5 text-[#003366] shrink-0" />}
      {showLabel && (
        <label htmlFor={id} className="text-[10px] uppercase font-bold text-slate-500 mr-1 shrink-0">
          Ano:
        </label>
      )}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent text-xs font-black font-mono text-[#003366] outline-none cursor-pointer pr-1 max-h-48 overflow-y-auto custom-scrollbar"
      >
        {years.map((year) => (
          <option key={year} value={year.toString()} className="bg-white text-slate-800 font-sans py-1">
            {year}
          </option>
        ))}
      </select>
    </div>
  );
};
