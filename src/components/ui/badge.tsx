import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-sm",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        success:
          "border-transparent bg-success text-success-foreground",
        warning:
          "border-transparent bg-warning text-warning-foreground",
        outline:
          "text-foreground",
        candidate:
          "border-transparent bg-warning text-warning-foreground font-bold",
        recruiter:
          "border-transparent bg-success text-success-foreground font-bold",
        guest:
          "border-transparent bg-muted text-muted-foreground",
        underReview:
          "border-transparent bg-primary/10 text-primary",
        shortlisted:
          "border-transparent bg-success/10 text-success",
        rejected:
          "border-transparent bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
