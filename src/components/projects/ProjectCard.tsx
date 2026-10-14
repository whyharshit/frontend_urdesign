import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Project } from '../../types/domain';
import { useRequirementLink } from '../../hooks/useRequirementLink';
import { areaLabel } from '../../lib/format';
export function ProjectCard({
  project,
  slug,
  natural = false,
}: {
  project: Project;
  slug: string;
  /** Keep the photo's own proportions, for masonry layouts. */
  natural?: boolean;
}) {
  const withRequirement = useRequirementLink();
  return (
    <Link className="project-card" to={withRequirement(`/p/${slug}/project/${project.id}`)}>
      <div className={`project-card-image ${natural ? 'project-card-image--natural' : ''}`}>
        <img src={project.images[0]} alt={project.title} loading="lazy" />
        <span className="image-arrow">
          <ArrowUpRight size={21} />
        </span>
        <span className="project-type">{project.type}</span>
      </div>
      <h3>{project.title}</h3>
      <p>
        {project.location}
        <span>·</span>
        {project.year}
        {project.area && (
          <>
            <span>·</span>
            {areaLabel(project.area)}
          </>
        )}
      </p>
    </Link>
  );
}
