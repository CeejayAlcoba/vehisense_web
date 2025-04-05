type TextColorProps = {
  isDanger?: boolean;
  children: React.ReactNode;
};

export default function TextColor(props: TextColorProps) {
  const { isDanger = false, children } = props;
  return <span className={isDanger ? " text-danger " : ""}>{children}</span>;
}
