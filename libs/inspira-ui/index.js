import React, { forwardRef } from "react";

const VARIANT_STYLES = {
  primary: "bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500 text-white shadow-lg",
  secondary: "bg-surface text-foreground border border-border",
  outline: "border border-border text-foreground bg-transparent",
};

const SIZE_STYLES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

function toClassName(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value.map(toClassName).filter(Boolean).join(" ");
  }
  if (typeof value === "object") {
    return Object.entries(value)
      .filter(([, condition]) => Boolean(condition))
      .map(([className]) => className)
      .join(" ");
  }
  return "";
}

export function cn(...values) {
  return values.map(toClassName).filter(Boolean).join(" ");
}

export const Button = forwardRef(function Button(
  { asChild = false, variant = "primary", size = "md", className, children, ...props },
  ref
) {
  const variantStyles = VARIANT_STYLES[variant] ?? VARIANT_STYLES.primary;
  const sizeStyles = SIZE_STYLES[size] ?? SIZE_STYLES.md;

  const baseStyles = "relative overflow-hidden rounded-full font-medium transition-transform duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref,
      className: cn(children.props?.className, baseStyles, variantStyles, sizeStyles, className),
      ...props,
    });
  }

  return (
    <button
      ref={ref}
      className={cn(baseStyles, variantStyles, sizeStyles, className)}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </button>
  );
});

export const Card = forwardRef(function Card(
  { className, children, padding = "md", as: Component = "div", ...props },
  ref
) {
  const paddingStyles = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <Component
      ref={ref}
      className={cn(
        "rounded-3xl border border-border/60 bg-background/80 shadow-xl shadow-background/40 backdrop-blur",
        paddingStyles[padding] ?? paddingStyles.md,
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
});

export const GradientTitle = ({ className, children, gradient = "from-sky-500 via-indigo-500 to-purple-500" }) => (
  <h2
    className={cn(
      "text-3xl font-bold tracking-tight text-transparent bg-clip-text",
      "bg-gradient-to-r",
      gradient,
      className
    )}
  >
    {children}
  </h2>
);

export const Surface = forwardRef(function Surface(
  { className, elevation = "md", as: Component = "div", children, ...props },
  ref
) {
  const elevationStyles = {
    none: "shadow-none",
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
  };

  return (
    <Component
      ref={ref}
      className={cn(
        "rounded-2xl border border-border/40 bg-background/90 backdrop-blur",
        elevationStyles[elevation] ?? elevationStyles.md,
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
});

export const Stack = ({
  as: Component = "div",
  direction = "column",
  gap = "md",
  className,
  align = "stretch",
  justify = "flex-start",
  children,
  ...props
}) => {
  const gapMap = {
    none: "gap-0",
    xs: "gap-1",
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-6",
  };

  return (
    <Component
      className={cn(
        "flex",
        direction === "row" ? "flex-row" : "flex-col",
        gapMap[gap] ?? gapMap.md,
        `items-${align}`,
        `justify-${justify}`,
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

export default {
  Button,
  Card,
  GradientTitle,
  Surface,
  Stack,
  cn,
};
