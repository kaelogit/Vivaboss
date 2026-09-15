"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: ReactElement<{
    className?: string;
    style?: CSSProperties;
    "data-vb-reveal"?: string;
    "data-vb-reveal-delay"?: string | number;
  }>;
  /** up | fade | left | right | scale */
  variant?: "up" | "fade" | "left" | "right" | "scale";
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

  return cloneElement(children, {
    className: cn(children.props.className, className),
    "data-vb-reveal": variant === "up" ? "up" : variant,
    "data-vb-reveal-delay": delay || undefined,
  });
}

/** Stagger direct children that are valid elements. */
export function RevealStagger({
  children,
  variant = "up",
  step = 80,
  className,
}: {
  children: ReactNode;
  variant?: RevealProps["variant"];
  step?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {Children.map(children, (child, i) => {
        if (!isValidElement(child)) return child;
        return (
          <Reveal variant={variant} delay={i * step}>
            {child as ReactElement}
          </Reveal>
        );
      })}
    </div>
  );
}
