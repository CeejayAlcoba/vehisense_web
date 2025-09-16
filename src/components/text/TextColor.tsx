type TextColorProps = {
  isDanger?: boolean;
  isWarning?: boolean;
  children: React.ReactNode;
};

export default function TextColor(props: TextColorProps) {
  const { isDanger = false, isWarning = false, children } = props;

  let className = "";
  if (isWarning) className = "text-warning"; 
  else if (isDanger) className = "text-danger";   
  

  return <span className={className}>{children}</span>;
}
