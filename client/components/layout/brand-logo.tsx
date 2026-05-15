import Image from "next/image";

const LOGO_WIDTH = 162;
const LOGO_HEIGHT = 32;

type Props = {
  className?: string;
  priority?: boolean;
};

export function BrandLogo({ className = "h-8 w-auto", priority = false }: Props) {
  return (
    <Image
      src="/logo1.svg"
      alt="CreditSea"
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      priority={priority}
      className={className}
      style={{ width: "auto", height: "auto" }}
    />
  );
}
