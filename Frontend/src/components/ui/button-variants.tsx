import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        medical: "bg-gradient-to-r from-[hsl(var(--medical-blue))] to-[hsl(var(--secondary))] text-white hover:shadow-[var(--shadow-medical)] transition-all duration-300",
        "medical-outline": "border-2 border-[hsl(var(--medical-blue))] text-[hsl(var(--medical-blue))] hover:bg-[hsl(var(--medical-blue))] hover:text-white transition-all duration-300",
        hero: "bg-gradient-to-r from-[hsl(var(--medical-blue))] to-[hsl(var(--secondary))] text-white px-8 py-6 text-lg font-semibold hover:shadow-[var(--shadow-medical)] hover:scale-105 transition-all duration-300",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-14 rounded-lg px-10",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;