export default function SkillTags({ skills, variant }) {
  if (!skills || skills.length === 0) {
    return <p className="muted">None</p>;
  }

  return (
    <ul className="tags">
      {skills.map((skill) => (
        <li key={skill} className={`tag tag-${variant}`}>
          {skill}
        </li>
      ))}
    </ul>
  );
}