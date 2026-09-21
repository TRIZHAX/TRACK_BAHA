import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva("inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:pointer-events-none disabled:opacity-50 active:translate-y-px", {
  variants: {
    variant: {
      default: "bg-[var(--primary)] text-white shadow-[0_8px_20px_-10px_var(--primary)] hover:bg-[var(--primary-strong)]",
      secondary: "bg-[var(--secondary-soft)] text-[var(--secondary)] hover:bg-[var(--secondary)] hover:text-white",
      outline: "border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)] hover:text-[var(--primary)]",
      ghost: "hover:bg-[var(--muted)]",
      danger: "bg-[var(--danger)] text-white shadow-[0_10px_28px_-12px_var(--danger)] hover:brightness-90"
    },
    size: { default: "h-11 px-5", sm: "h-9 px-3", lg: "h-13 px-7 text-base", icon: "size-11" }
  }, defaultVariants: { variant: "default", size: "default" }
});

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />);
Button.displayName = "Button";
export { buttonVariants };
