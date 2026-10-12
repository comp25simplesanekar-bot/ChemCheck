export const STATUS = {
  green: { label: "Low concern", chip: "bg-okbg text-okfg", dot: "bg-okdot", ring: "border-okdot" },
  yellow: { label: "Caution", chip: "bg-warnbg text-warnfg", dot: "bg-warndot", ring: "border-warndot" },
  red: { label: "Significant concern", chip: "bg-badbg text-badfg", dot: "bg-baddot", ring: "border-baddot" },
  grey: { label: "Not assessed", chip: "bg-nabg text-nafg", dot: "bg-nadot", ring: "border-nadot" },
};

export const LEVEL_STYLE = {
  attention: STATUS.red,
  caution: STATUS.yellow,
  low: STATUS.green,
  limited: STATUS.grey,
  insufficient: STATUS.grey,
};

export default function Badge({ status }) {
  const s = STATUS[status] || STATUS.grey;
  return (
    <span className={"inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold " + s.chip}>
      <span className={"h-2.5 w-2.5 rounded-full " + s.dot} aria-hidden="true"></span>
      {s.label}
    </span>
  );
}
