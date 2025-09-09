import React from "react";

const WeekSelector = ({ currentWeek, onWeekChange, className = "" }) => {
  const weeks = Array.from({ length: 18 }, (_, i) => i + 1);

  return (
    <div className={`flex justify-center ${className}`}>
      <div className="relative">
        <select
          value={currentWeek}
          onChange={(e) => onWeekChange(parseInt(e.target.value))}
          className="appearance-none bg-white border border-gray-300 rounded-lg px-6 py-3 pr-10 text-center font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-nfl-blue focus:border-transparent transition-colors duration-200"
        >
          {weeks.map((week) => (
            <option key={week} value={week}>
              Week {week}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default WeekSelector;
