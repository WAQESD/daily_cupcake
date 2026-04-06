interface TagProps {
  label: string;
  bright?: boolean;
}

export function Tag({ label, bright = false }: TagProps) {
  return <span className={bright ? "tag tag--bright" : "tag"}>{label}</span>;
}
