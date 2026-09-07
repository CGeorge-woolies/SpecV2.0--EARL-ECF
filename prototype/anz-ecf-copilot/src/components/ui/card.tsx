import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"
import tokens from "@/theme/tokens"

function Card({ className, style, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn("flex flex-col", className)}
      style={{
        backgroundColor: tokens.colorBgPrimary,
        border: `1px solid ${tokens.colorBorderWeak}`,
        borderRadius: tokens.radiusMd,
        ...style,
      }}
      {...props}
    />
  )
}

function CardHeader({ className, style, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex items-center", className)}
      style={{
        padding: `${tokens.spaceInternalLarge} ${tokens.spaceContentSmall}`,
        borderBottom: `1px solid ${tokens.colorBorderWeak}`,
        ...style,
      }}
      {...props}
    />
  )
}

function CardTitle({ className, style, ...props }: ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn(className)}
      style={{
        fontFamily: tokens.fontFamily,
        fontSize: tokens.fontSizeTitleSm,
        fontWeight: 700,
        color: tokens.colorTextStrong,
        ...style,
      }}
      {...props}
    />
  )
}

function CardContent({ className, style, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("flex flex-col", className)}
      style={{
        padding: tokens.spaceContentSmall,
        gap: tokens.spaceInternalLarge,
        ...style,
      }}
      {...props}
    />
  )
}

export { Card, CardHeader, CardTitle, CardContent }
