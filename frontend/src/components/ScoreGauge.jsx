import { scoreRgb } from "../utils/scoring.js";
export default function ScoreGauge({ score }) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (safeScore / 100) * circumference;

  const [red, green, blue] = scoreRgb(safeScore);
  const color = `rgb(${red}, ${green}, ${blue})`;

  return (
    <svg
      width="140"
      height="140"
      viewBox="0 0 140 140"
      role="img"
      aria-label={`Match score ${safeScore} out of 100`}
    >
      <circle
        cx="70"
        cy="70"
        r={radius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="12"
      />

      <circle
        cx="70"
        cy="70"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 70 70)"
      />

      <text
        x="70"
        y="80"
        textAnchor="middle"
        fontSize="32"
        fontWeight="700"
        fill={color}
      >
        {safeScore}
      </text>
    </svg>
  );
}
