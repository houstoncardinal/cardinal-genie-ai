import { cva } from "class-variance-authority";

export const cardinalButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        hero: "bg-gradient-cardinal text-primary-foreground shadow-glow hover:shadow-[0_0_50px_hsl(var(--cardinal-red)/0.5)] border border-primary/50 backdrop-blur-sm font-display tracking-wide",
        glass: "glass text-foreground hover:glass-strong border-primary/30 hover:border-primary/60 transition-all",
        ghost: "text-foreground hover:bg-accent/20 hover:text-accent",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-sm",
        lg: "h-14 px-8 text-lg",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
