'use client';

import { motion } from 'motion/react';
import { item, stagger } from '@/lib/motion';
import { chip, chipOff, chipOn } from '@/lib/ui';

type Props = {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  /** Multi-select keeps earlier picks; single-select replaces them. */
  multi?: boolean;
};

export function ChipGroup({ options, selected, onToggle, multi = false }: Props) {
  if (options.length === 0) return null;

  return (
    <motion.div
      className="mb-[22px] flex flex-wrap gap-2.5"
      variants={stagger()}
      initial="initial"
      animate="animate"
      role={multi ? 'group' : 'radiogroup'}
    >
      {options.map((opt) => {
        const on = selected.includes(opt);
        return (
          <motion.button
            key={opt}
            type="button"
            className={`${chip} ${on ? chipOn : chipOff}`}
            role={multi ? 'checkbox' : 'radio'}
            aria-checked={on}
            variants={item}
            whileTap={{ scale: 0.97 }}
            onClick={() => onToggle(opt)}
          >
            {on && (
              <motion.span
                className="grid size-[21px] place-items-center rounded-full bg-check text-xs leading-none text-white"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 600, damping: 22 }}
              >
                ✓
              </motion.span>
            )}
            {opt}
          </motion.button>
        );
      })}
    </motion.div>
  );
}
