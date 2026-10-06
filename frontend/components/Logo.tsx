import Image from "next/image";
import Link from "next/link";

/**
 * The logo file is used as-is, shown as a rounded app-icon tile beside the
 * wordmark so it reads on both light and dark surfaces.
 */
export function Logo({
  tone = "light",
  size = 40,
  href = "/",
  hideWordOnTiny = true,
}: {
  tone?: "light" | "dark";
  size?: number;
  href?: string | null;
  hideWordOnTiny?: boolean;
}) {
  const content = (
    <>
      <Image
        src="/logo.jpeg"
        alt=""
        width={size}
        height={size}
        priority
        className="flex-none rounded-[10px] ring-1 ring-black/10"
        style={{ width: size, height: size }}
      />
      <span
        className={`text-[1.12rem] font-bold tracking-tight ${hideWordOnTiny ? "max-[380px]:hidden" : ""} ${
          tone === "dark" ? "text-white" : "text-ink"
        }`}
      >
        Legal Connect
      </span>
    </>
  );

  if (!href) return <span className="inline-flex items-center gap-2.5">{content}</span>;

  return (
    <Link href={href} aria-label="Legal Connect home" className="inline-flex items-center gap-2.5">
      {content}
    </Link>
  );
}
