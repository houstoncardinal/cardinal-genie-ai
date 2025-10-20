import cardinalLogo from "@/assets/cardinal-logo.png";

interface CardinalLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const CardinalLogo = ({ className = "", size = "md" }: CardinalLogoProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-20 h-20",
  };

  return (
    <img
      src={cardinalLogo}
      alt="Cardinal Business Genie Logo"
      className={`${sizeClasses[size]} animate-glow ${className}`}
    />
  );
};
