export default function HighlightedText({ text, skills = [] }) {
  if (!text) return null;

  const sortedSkills = [...skills]
    .filter(Boolean)
    .sort((a, b) => b.length - a.length);

  if (sortedSkills.length === 0) {
    return <>{text}</>;
  }

  const escapedSkills = sortedSkills.map((skill) =>
    skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );

  const regex = new RegExp(
    `(${escapedSkills.join("|")})`,
    "gi"
  );

  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) => {
        const matched = sortedSkills.some(
          (skill) => skill.toLowerCase() === part.toLowerCase()
        );

        return matched ? (
          <mark className="skill-mark" key={index}>
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        );
      })}
    </>
  );
}