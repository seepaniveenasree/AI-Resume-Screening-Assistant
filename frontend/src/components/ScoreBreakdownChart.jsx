
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  LabelList,
} from "recharts";

const COLORS = {
  Skills: "#2563eb",
  Experience: "#7c3aed",
  Education: "#0891b2",
};

export default function ScoreBreakdownChart({ breakdown }) {
  const data = [
    { name: "Skills", score: breakdown.skills },
    { name: "Experience", score: breakdown.experience },
    { name: "Education", score: breakdown.education },
  ];

  return (
    <div>
      <div
        style={{ width: "100%", height: 240 }}
        role="img"
        aria-label={`Score breakdown: skills ${breakdown.skills}, experience ${breakdown.experience}, education ${breakdown.education}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 16, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="score" radius={[6, 6, 0, 0]}>
              {data.map((d) => (
                <Cell key={d.name} fill={COLORS[d.name]} />
              ))}
              <LabelList dataKey="score" position="top" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="muted">
        Weighting: skills 50%, experience 30%, education 20%
      </p>
    </div>
  );
}
