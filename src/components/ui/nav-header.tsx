"use client"; 

import React, { useRef, useState } from "react";
// We use motion from motion/react as instructed by guidelines, but we can also use framer-motion as user requested
import { motion } from "framer-motion";

export function NavHeader({ children }: { children: React.ReactNode }) {
  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  return (
    <ul
      className="relative mx-auto flex w-fit rounded-full border border-white/20 bg-white/10 p-1 backdrop-blur-sm"
      onMouseLeave={() => setPosition((pv) => ({ ...pv, opacity: 0 }))}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { setPosition } as any);
        }
        return child;
      })}

      <Cursor position={position} />
    </ul>
  );
}

export const Tab = ({
  children,
  setPosition,
  onClick
}: {
  children: React.ReactNode;
  setPosition?: any;
  onClick?: () => void;
}) => {
  const ref = useRef<HTMLLIElement>(null);
  return (
    <li
      ref={ref}
      onClick={onClick}
      onMouseEnter={() => {
        if (!ref.current || !setPosition) return;

        const { width } = ref.current.getBoundingClientRect();
        setPosition({
          width,
          opacity: 1,
          left: ref.current.offsetLeft,
        });
      }}
      className="relative z-10 block cursor-pointer px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white mix-blend-difference md:px-4 md:py-2"
    >
      {children}
    </li>
  );
};


const Cursor = ({ position }: { position: any }) => {
  return (
    <motion.li
      animate={position}
      className="absolute z-0 h-7 rounded-full bg-white md:h-10"
    />
  );
};

export default NavHeader;
