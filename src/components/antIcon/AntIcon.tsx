import React from "react";
import * as AntIcons from "@ant-design/icons";

interface AntIconProps {
  icon?: string; // e.g., " HomeOutlined " or " User Outlined "
  style?: React.CSSProperties;
  className?: string;
  size?: number;
}

export default function AntIcon({
  icon,
  style,
  className,
  size = 15,
}: AntIconProps) {
  if (!icon) return null;

  // Remove all whitespace characters (not just leading/trailing)
  const cleanedIcon = icon.replace(/\s+/g, "");

  const IconComponent = (AntIcons as any)[cleanedIcon];

  return IconComponent ? (
    <IconComponent style={{ fontSize: size, ...style }} className={className} />
  ) : (
    <></>
  );
}