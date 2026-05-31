import React from 'react';

/**
 * SegmentedControl
 * Swiss design system: 
 * Bordered segmented control. Not pill tabs, not underline tabs.
 * Active state: black fill, white text.
 * Inactive state: white fill, black text.
 */
const SegmentedControl = ({ options, value, onChange, className = '', optionClassName = '' }) => {
  return (
    <div className={`flex flex-wrap w-full border-t-2 border-b-2 border-l-2 border-black ${className}`}>
      {options.map((option, index) => {
        const isActive = value === option.value;
        return (
          <button
            key={option.value || index}
            type="button"
            onClick={() => onChange(option.value)}
            className={`
              flex-1 py-3 px-4 text-ui-xs font-bold uppercase transition-colors
              border-r-2 border-black focus:outline-none
              ${isActive ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'}
              ${optionClassName}
            `}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default SegmentedControl;
