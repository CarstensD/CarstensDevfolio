import * as React from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | (string & {});
export type ButtonSize = "sm" | "md" | "lg" | (string & {});

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button: React.ForwardRefExoticComponent<ButtonProps & React.RefAttributes<HTMLButtonElement>>;

export type CardPadding = "none" | "sm" | "md" | "lg" | (string & {});

export interface CardProps<T extends React.ElementType = "div"> extends React.ComponentPropsWithoutRef<T> {
  as?: T;
  padding?: CardPadding;
}

export const Card: <T extends React.ElementType = "div">(
  props: CardProps<T> & { ref?: React.Ref<React.ElementRef<T>> }
) => React.ReactElement | null;

export interface GradientTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  gradient?: string;
}

export const GradientTitle: React.FC<GradientTitleProps>;

export type SurfaceElevation = "none" | "sm" | "md" | "lg" | (string & {});

export interface SurfaceProps<T extends React.ElementType = "div"> extends React.ComponentPropsWithoutRef<T> {
  as?: T;
  elevation?: SurfaceElevation;
}

export const Surface: <T extends React.ElementType = "div">(
  props: SurfaceProps<T> & { ref?: React.Ref<React.ElementRef<T>> }
) => React.ReactElement | null;

export type StackDirection = "row" | "column" | (string & {});
export type StackGap = "none" | "xs" | "sm" | "md" | "lg" | (string & {});

export interface StackProps<T extends React.ElementType = "div"> extends React.ComponentPropsWithoutRef<T> {
  as?: T;
  direction?: StackDirection;
  gap?: StackGap;
  align?: string;
  justify?: string;
}

export const Stack: <T extends React.ElementType = "div">(
  props: StackProps<T>
) => React.ReactElement | null;

export function cn(...values: Array<string | undefined | null | false | Record<string, boolean> | Array<string | undefined | null | false>>): string;

declare const _default: {
  Button: typeof Button;
  Card: typeof Card;
  GradientTitle: typeof GradientTitle;
  Surface: typeof Surface;
  Stack: typeof Stack;
  cn: typeof cn;
};

export default _default;
