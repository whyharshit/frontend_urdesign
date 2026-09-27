import { CheckCircle2, Circle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { publishChecks } from '../../lib/rules';
import type { Professional } from '../../types/domain';

export function PublishChecklist({ professional }: { professional: Professional }) {
  return (
    <ul className="checklist">
      {publishChecks(professional).map((check) => (
        <li className={check.done ? '' : 'incomplete'} key={check.label}>
          <Link to={check.to}>
            {check.done ? <CheckCircle2 size={17} /> : <Circle size={17} />}
            {check.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
