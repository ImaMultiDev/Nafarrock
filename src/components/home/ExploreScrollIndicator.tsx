"use client";

import { motion } from "framer-motion";

type Variant = "green" | "red";

const variantStyles: Record<
  Variant,
  { stroke: string; filterId: string }
> = {
  green: {
    stroke: "#00C853",
    filterId: "rock-hand-glow-green",
  },
  red: {
    stroke: "#E60026",
    filterId: "rock-hand-glow-red",
  },
};

// Path del SVG rock-on-svgrepo-com.svg
const ROCK_HAND_PATH =
  "M17 11.0009V21.0009C17 22.1049 17.896 23.0009 19 23.0009H21C22.104 23.0009 23 22.1049 23 21.0009V11.0009C23 9.89687 22.104 9.00087 21 9.00087H19C17.896 9.00087 17 9.89687 17 11.0009ZM17 11.0009C17 9.89687 16.104 9.00087 15 9.00087H13C11.896 9.00087 11 9.89687 11 11.0009V14.0009M9.6191 6.98137L8.8731 2.64637C8.6831 1.56237 7.6571 0.838368 6.5801 1.03037L4.6311 1.37637C3.5541 1.56737 2.8361 2.60137 3.0241 3.68437L5.3571 17.0014M24.3701 7.01457L25.1201 2.64657C25.3081 1.56257 26.3351 0.838568 27.4111 1.03057L29.3591 1.37557C30.4351 1.56757 31.1521 2.60157 30.9641 3.68457L28.0001 20.0006V27.0006C28.0001 29.3336 26.3331 31.0006 24.0001 31.0006H9.0001C4.0001 31.0006 1.0001 28.9586 1.0001 23.0006V18.0006C1.0001 17.4486 1.4471 17.0006 2.0001 17.0006H16.0001C16.5311 17.0006 17.0001 17.4386 17.0001 18.0006V19.0006C17.0001 21.3446 15.3441 23.0006 13.0001 23.0006H7.0001";

function RockHandSvg({ variant }: { variant: Variant }) {
  const { stroke, filterId } = variantStyles[variant];

  return (
    <svg
      viewBox="0 0 32 32"
      className="h-12 w-12 sm:h-14 sm:w-14"
      fill="none"
      stroke={stroke}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ filter: `url(#${filterId})` }}
    >
      <defs>
        <filter
          id={filterId}
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feFlood floodColor={stroke} floodOpacity="0.8" result="color" />
          <feComposite in="color" in2="blur" operator="in" result="glow" />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path d={ROCK_HAND_PATH} />
    </svg>
  );
}

type Props = {
  variant?: Variant;
};

export function ExploreScrollIndicator({ variant = "green" }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="flex flex-col items-center py-6"
    >
      <motion.div
        className="flex items-center justify-center"
        animate={{ y: [0, 8, 0], opacity: [1, 0.7, 1] }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <RockHandSvg variant={variant} />
      </motion.div>
    </motion.div>
  );
}
