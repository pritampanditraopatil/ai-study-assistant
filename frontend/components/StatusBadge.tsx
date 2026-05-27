export type TopicStatus =
  | "study-ready"
  | "mindmap-ready"
  | "has-explanations"
  | "notes-only";

interface StatusBadgeProps {
  status: TopicStatus;
}

const STATUS_MAP: Record<
  TopicStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  "study-ready": {
    label: "STUDY-READY",
    color: "var(--color-accent)",
    bg: "var(--color-accent-faint)",
    border: "var(--color-accent-border)",
  },
  "mindmap-ready": {
    label: "MINDMAP READY",
    color: "var(--color-blue)",
    bg: "var(--color-blue-faint)",
    border: "var(--color-blue-border)",
  },
  "has-explanations": {
    label: "HAS EXPLANATIONS",
    color: "var(--color-warn)",
    bg: "var(--color-warn-faint)",
    border: "var(--color-warn-border)",
  },
  "notes-only": {
    label: "NOTES ONLY",
    color: "var(--color-text-faint)",
    bg: "rgba(255,255,255,0.04)",
    border: "rgba(255,255,255,0.06)",
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const { label, color, bg, border } = STATUS_MAP[status] ?? STATUS_MAP["notes-only"];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.04em",
        padding: "2px 8px",
        borderRadius: "9999px",
        border: `1px solid ${border}`,
        background: bg,
        color,
        whiteSpace: "nowrap",
        lineHeight: 1.6,
      }}
    >
      {label}
    </span>
  );
}
