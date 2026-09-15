"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type RevealVariant = "up" | "fade" | "left" | "right" | "scale";

type RevealProps = {
  children: ReactElement;
  /** up | fade | left | right | scale */
  variant?: RevealVariant;
  delay?: number;
  className?: string;
};

/** Marks a single element for RevealObserver (keeps the child’s tag). */
export function Reveal({
  children,
  variant = "up",
  delay = 0,
  className,
}: RevealProps) {
  if (!isValidElement(children)) return children;

  const props = children.props as {
    className?: string;
  };

  return cloneElement(children, {
    className: cn(props.className, className),
    "data-vb-reveal": variant === "up" ? "up" : variant,
    ...(delay > 0 ? { "data-vb-reveal-delay": delay } : {}),
  } as Record<string, unknown>);
}

/** Stagger direct children that are valid elements. */
export function RevealStagger({
  children,
  variant = "up",
  step = 80,
  className,
}: {
  children: ReactNode;
  variant?: RevealVariant;
  step?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {Children.map(children, (child, i) => {
        if (!isValidElement(child)) return child;
        return (
          <Reveal variant={variant} delay={i * step}>
            {child}
          </Reveal>
        );
      })}
    </div>
  );
}
