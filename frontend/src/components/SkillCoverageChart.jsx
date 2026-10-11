
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

export default function SkillCoverageChart({ matched, missing }) {
  const total = matched.length + missing.length;

  if (total === 0) {
    return <p className="muted">No skills available to chart.</p>;
  }

  const data = [
    { name: "Matched", value: matched.length },
    { name: "Missing", value: missing.length },
  ];

  const coverage = Math.round((matched.length / total) * 100);

  return (
    <div
      style={{ position: "relative", width: "100%", height: 240 }}
      role="img"
      aria-label={`${matched.length} of ${total} required skills matched`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
          >
            <Cell fill="#16a34a" />
            <Cell fill="#dc2626" />
          </Pie>

          <Tooltip />
          <Legend verticalAlign="bottom" />
        </PieChart>
      </ResponsiveContainer>

      <div className="donut-center">
        <strong>{coverage}%</strong>
        <span>{matched.length}/{total} skills</span>
      </div>
    </div>
  );
}
