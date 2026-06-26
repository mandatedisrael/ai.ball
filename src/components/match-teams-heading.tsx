import { BrandBall } from "@/components/brand-ball";
import { TeamLogo } from "@/components/team-logo";

interface TeamRef {
  name: string;
  logo?: string;
}

interface MatchTeamsHeadingProps {
  homeTeam: TeamRef;
  awayTeam: TeamRef;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CONFIG = {
  sm: { logo: 22, text: "text-base font-bold" },
  md: { logo: 28, text: "text-lg font-bold sm:text-xl" },
  lg: { logo: 36, text: "text-2xl font-extrabold sm:text-3xl" },
} as const;

export function MatchTeamsHeading({
  homeTeam,
  awayTeam,
  size = "md",
  className = "",
}: MatchTeamsHeadingProps) {
  const config = SIZE_CONFIG[size];

  return (
    <h2
      className={`font-display grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-2 gap-y-1 tracking-tight sm:gap-x-3 ${className}`}
    >
      <span
        className={`${config.text} flex min-w-0 items-center justify-end gap-2 transition-colors group-hover:text-accent`}
      >
        <span className="truncate">{homeTeam.name}</span>
        <TeamLogo
          name={homeTeam.name}
          logo={homeTeam.logo}
          size={config.logo}
        />
      </span>

      <span className="text-muted inline-flex items-center gap-1.5 px-0.5 font-normal">
        {size === "lg" ? (
          "vs"
        ) : (
          <>
            <BrandBall
              size={size === "sm" ? 12 : 14}
              className="text-accent opacity-40 transition-opacity group-hover:opacity-100 group-hover-ball-roll"
            />
            vs
          </>
        )}
      </span>

      <span
        className={`${config.text} flex min-w-0 items-center gap-2 transition-colors group-hover:text-accent`}
      >
        <TeamLogo
          name={awayTeam.name}
          logo={awayTeam.logo}
          size={config.logo}
        />
        <span className="truncate">{awayTeam.name}</span>
      </span>
    </h2>
  );
}