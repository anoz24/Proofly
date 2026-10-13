interface StatTileProps {
  label: string;
  value: number;
  highlighted?: boolean;
}

export function StatTile({ label, value, highlighted }: StatTileProps) {
  return (
    <div
      className="rounded-[18px] border px-5 py-4 flex flex-col gap-1"
      style={
        highlighted
          ? { background: "#1F4FE0", borderColor: "#1F4FE0" }
          : { background: "#F4F8FF", borderColor: "#DCEBFF", borderWidth: "1.5px" }
      }
    >
      <span
        className="text-[13px] font-medium leading-[1.4]"
        style={{ color: highlighted ? "rgba(255,255,255,0.75)" : "#3C4A6B" }}
      >
        {label}
      </span>
      <span
        className="font-display font-semibold text-[28px] leading-[1.1]"
        style={{ color: highlighted ? "#FFFFFF" : "#0A1633" }}
      >
        {value}
      </span>
    </div>
  );
}
