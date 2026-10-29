export function DetailStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-lg font-semibold leading-tight tabular">{value}</dd>
    </div>
  );
}
