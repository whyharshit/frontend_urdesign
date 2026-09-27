import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Project } from '../../types/domain';
import { useRequirementLink } from '../../hooks/useRequirementLink';
export function ProjectCard({ project, slug }: { project: Project; slug: string }) {
  const withRequirement = useRequirementLink();
  return (
    <Link className="project-card" to={withRequirement(`/p/${slug}/project/${project.id}`)}>
      <div className="project-card-image">
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
        <span>·</span>
        {project.area}
      </p>
    </Link>
  );
}
