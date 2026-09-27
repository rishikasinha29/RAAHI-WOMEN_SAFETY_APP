import { ShieldCheck } from "lucide-react"

export default function AnzenLogo({
  compact = false,
  light = false,
}) {
  return (
    <div
      className={`anzen-logo ${
        compact ? "anzen-logo--compact" : ""
      } ${light ? "anzen-logo--light" : ""}`}
    >
      <div className="anzen-logo-mark">
        <ShieldCheck
          size={compact ? 20 : 25}
          strokeWidth={2.4}
        />
      </div>

      {!compact && (
        <div className="anzen-logo-copy">
          <div className="anzen-logo-name">
            ANZEN
          </div>

          <div className="anzen-logo-tagline">
            Safe navigation
          </div>
        </div>
      )}
    </div>
  )
}