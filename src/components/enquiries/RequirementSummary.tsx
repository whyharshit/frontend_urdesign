import { areaLabel, dateLabel } from '../../lib/format';
import type { Requirement } from '../../types/domain';

export function RequirementSummary({ requirement: r }: { requirement: Requirement }) {
  return (
    <div className="stack">
      <div>
        <span className="eyebrow">THE PROJECT</span>
        <h2>{r.title}</h2>
        <p style={{ marginTop: 18, whiteSpace: 'pre-wrap' }}>{r.description}</p>
      </div>
      <dl className="detail-grid">
        {[
          ['Service', r.service],
          ['City', r.city],
          ['Project type', r.projectType],
          ['Total project budget', r.budget || 'Open to discussion'],
          ['Preferred timeline', r.timeline || 'Flexible'],
          ['Project size', r.size ? areaLabel(r.size) : 'Not specified'],
          ['Created', dateLabel(r.createdAt)],
        ].map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
