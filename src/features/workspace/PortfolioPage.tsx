import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, Upload, ArrowLeft, ArrowRight, ImagePlus } from 'lucide-react';
import { useOwnProfile } from '../../hooks/useOwnProfile';
import { useLocalDraft } from '../../hooks/useLocalDraft';
import { PageHeading } from '../../components/ui/PageHeading';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Field';
import { Notice, EmptyState, StatusBadge, toast } from '../../components/ui/Feedback';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { PROJECT_TYPES, CONTACT_WARNING, AREA_UNITS } from '../../config/catalog';
import { hasContactDetails } from '../../lib/rules';
import { joinMeasure, splitMeasure, uid } from '../../lib/format';
import { readDemoImage } from '../../services/demoImages';
import type { Project } from '../../types/domain';

export function PortfolioPage() {
  const { profile, update } = useOwnProfile();
  const [remove, setRemove] = useState<Project | null>(null);
  return (
    <>
      <PageHeading
        eyebrow="LET YOUR WORK DO THE TALKING"
        title="Your portfolio"
        description="Thoughtful spaces. Considered details. Stories worth sharing."
        action={
          <ButtonLink to="/dashboard/portfolio/new">
            <Plus size={17} />
            Add a project
          </ButtonLink>
        }
      />
      {profile.projects.length ? (
        <div className="portfolio-grid">
          {profile.projects.map((p) => (
            <article className="portfolio-item" key={p.id}>
              <img src={p.images[0]} alt={p.title} />
              <div>
                <StatusBadge status={p.status} />
                <h3 style={{ marginTop: 12 }}>{p.title}</h3>
                <p>
                  {p.location} · {p.year} · {p.images.length}{' '}
                  {p.images.length === 1 ? 'photo' : 'photos'}
                </p>
                <div className="button-row">
                  <ButtonLink variant="secondary" to={`/dashboard/portfolio/${p.id}`}>
                    Edit project
                  </ButtonLink>
                  <Button
                    variant="ghost"
                    aria-label={`Delete ${p.title}`}
                    onClick={() => setRemove(p)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Every practice starts with a first project."
          description="Add at least one project with a photo to publish your profile."
          to="/dashboard/portfolio/new"
          action="Add your first project"
        />
      )}
      <ConfirmDialog
        open={!!remove}
        title="Remove this project?"
        confirmLabel="Remove project"
        onClose={() => setRemove(null)}
        onConfirm={() => {
          update({ projects: profile.projects.filter((p) => p.id !== remove?.id) });
          toast('Project removed');
        }}
      >
        <p>
          {remove?.title} and its images will be removed. If this is your last project with a photo,
          your profile will be unpublished.
        </p>
      </ConfirmDialog>
    </>
  );
}

export function ProjectEditor({ onSaved }: { onSaved?: () => void } = {}) {
  const { projectId } = useParams();
  const { profile, ready } = useOwnProfile();
  const project = profile.projects.find((p) => p.id === projectId);
  if (!ready) return <Notice>Loading your saved project…</Notice>;
  if (projectId && !project)
    return (
      <EmptyState
        title="Project unavailable"
        description="Return to your portfolio to create or edit a project."
        to="/dashboard/portfolio"
        action="Back to portfolio"
      />
    );
  return <ProjectEditorForm key={projectId || 'new'} project={project} onSaved={onSaved} />;
}

function ProjectEditorForm({ project, onSaved }: { project?: Project; onSaved?: () => void }) {
  const { profile, update } = useOwnProfile();
  const navigate = useNavigate();
  const key = `urdesigner.draft.project.${project?.id || 'new'}`;
  const [draft, setDraft, storageFailed] = useLocalDraft<Project>(
    key,
    project || {
      id: '',
      title: '',
      type: 'Residential',
      location: profile.city,
      year: new Date().getFullYear(),
      area: '',
      description: '',
      images: [],
      status: 'Completed',
    },
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [declared, setDeclared] = useState(!!project);
  const [dragging, setDragging] = useState<number | null>(null);
  const area = splitMeasure(draft.area, AREA_UNITS, 'sq ft');
  const patch = (values: Partial<Project>) => setDraft((d) => ({ ...d, ...values }));
  const upload = async (files: FileList | null) => {
    if (!files) return;
    setBusy(true);
    setErrors([]);
    const valid: string[] = [];
    const failed: string[] = [];
    for (const file of Array.from(files)) {
      if (draft.images.length + valid.length >= 10) {
        failed.push(`${file.name}: Maximum 10 images per project.`);
        continue;
      }
      try {
        valid.push(await readDemoImage(file));
      } catch (error) {
        failed.push(`${file.name}: ${(error as Error).message}`);
      }
    }
    setDraft((d) => ({ ...d, images: [...d.images, ...valid].slice(0, 10) }));
    setErrors(failed);
    setBusy(false);
  };
  const reorder = (index: number, destination: number) => {
    const images = [...draft.images];
    const [item] = images.splice(index, 1);
    images.splice(destination, 0, item);
    patch({ images });
  };
  return (
    <>
      <PageHeading
        eyebrow="SPACES WITH A STORY"
        title={project ? 'Refine your project.' : 'Show what you’ve created.'}
        description="A few considered images can say more than a thousand words."
        action={
          <ButtonLink variant="secondary" to="/dashboard/portfolio">
            Back to portfolio
          </ButtonLink>
        }
      />
      <form
        className="stack"
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.images.length) {
            setErrors(['Add at least one photo before saving. The first photo is the cover.']);
            document.getElementById('project-photos')?.scrollIntoView({ block: 'center' });
            return;
          }
          const saved = {
            ...draft,
            title: draft.title.trim(),
            location: draft.location.trim(),
            id: project?.id || uid(),
          };
          update({
            projects: project
              ? profile.projects.map((p) => (p.id === project.id ? saved : p))
              : [...profile.projects, saved],
          });
          try {
            localStorage.removeItem(key);
          } catch {
            /* Session state is still usable. */
          }
          toast(project ? 'Project updated' : 'Project added');
          if (onSaved) onSaved();
          else navigate('/dashboard/portfolio');
        }}
      >
        {storageFailed && (
          <Notice tone="warning">
            Browser storage is full or unavailable. Your draft is kept for this session only.
          </Notice>
        )}
        <section className="panel">
          <div className="section-title">
            <span>01</span>
            <h2>The story behind the space</h2>
          </div>
          <div className="form-grid">
            <Input
              label="Project title"
              required
              minLength={3}
              maxLength={100}
              value={draft.title}
              onChange={(e) => patch({ title: e.target.value })}
            />
            <Select
              label="Project type"
              value={draft.type}
              required
              onChange={(e) => patch({ type: e.target.value })}
            >
              {PROJECT_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </Select>
            <Input
              label="Location"
              required
              maxLength={80}
              value={draft.location}
              onChange={(e) => patch({ location: e.target.value })}
            />
            <Input
              label="Year"
              type="number"
              min={1950}
              max={new Date().getFullYear()}
              required
              value={draft.year || ''}
              onChange={(e) => patch({ year: Number(e.target.value) })}
            />
            <div className="measure-field">
              <Input
                label="Project area (optional)"
                type="number"
                min={1}
                step="any"
                placeholder="e.g. 1850"
                value={area.amount}
                onChange={(e) => patch({ area: joinMeasure(e.target.value, area.unit) })}
              />
              <Select
                label="Area unit"
                value={area.unit}
                onChange={(e) => patch({ area: joinMeasure(area.amount, e.target.value) })}
              >
                {AREA_UNITS.map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </Select>
            </div>
            <Select
              label="Project status"
              value={draft.status}
              onChange={(e) => patch({ status: e.target.value as Project['status'] })}
            >
              {['Completed', 'Ongoing', 'Concept'].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
            <div className="full-width">
              <Textarea
                label="About the project"
                maxLength={1000}
                rows={4}
                value={draft.description}
                hint={`${draft.description.length}/1000 characters`}
                onChange={(e) => patch({ description: e.target.value })}
              />
            </div>
          </div>
          {hasContactDetails(draft.title + ' ' + draft.description) && (
            <Notice tone="warning">{CONTACT_WARNING}</Notice>
          )}
        </section>
        <section className="panel stack" id="project-photos">
          <div className="section-title" style={{ marginBottom: 0 }}>
            <span>02</span>
            <h2>Project photos</h2>
          </div>
          <p className="small">
            The first photo is the cover. Drag photos to reorder them, or use the arrows.
          </p>
          <div className="upload-area">
            <ImagePlus size={30} />
            <h3>Make your work the focal point.</h3>
            <p>
              One good photo of a finished room works better than five taken during construction.
              <br />
              JPG, PNG or WEBP · Up to 10 MB per file · 1–10 images per project
            </p>
            <input
              aria-label="Upload project images"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              disabled={busy || draft.images.length >= 10}
              onChange={(e) => {
                void upload(e.target.files);
                e.target.value = '';
              }}
            />
            <p>
              Images are resized for this browser preview. Production uploads will use secure object
              storage.
            </p>
          </div>
          {busy && (
            <Notice>
              Preparing your images… Successful images will be kept if another file fails.
            </Notice>
          )}
          {errors.map((error) => (
            <Notice key={error} tone="warning">
              {error}
            </Notice>
          ))}
          <div className="image-editor-grid">
            {draft.images.map((src, i) => (
              <div
                className={`image-editor-item ${dragging === i ? 'is-dragging' : ''} ${i === 0 ? 'is-cover' : ''}`}
                key={`${i}-${src.slice(-15)}`}
                draggable={!busy}
                onDragStart={(e) => {
                  setDragging(i);
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (dragging !== null && dragging !== i) reorder(dragging, i);
                  setDragging(null);
                }}
                onDragEnd={() => setDragging(null)}
              >
                {i === 0 && <span className="cover-badge">Cover</span>}
                <img src={src} alt={`Project image ${i + 1}`} draggable={false} />
                <div className="button-row">
                  <Button
                    variant="ghost"
                    type="button"
                    disabled={busy || i === 0}
                    onClick={() => reorder(i, 0)}
                  >
                    {i === 0 ? 'Cover image' : 'Make cover'}
                  </Button>
                  <Button
                    variant="ghost"
                    type="button"
                    aria-label={`Move image ${i + 1} left`}
                    disabled={busy || i === 0}
                    onClick={() => reorder(i, i - 1)}
                  >
                    <ArrowLeft size={13} />
                  </Button>
                  <Button
                    variant="ghost"
                    type="button"
                    aria-label={`Move image ${i + 1} right`}
                    disabled={busy || i === draft.images.length - 1}
                    onClick={() => reorder(i, i + 1)}
                  >
                    <ArrowRight size={13} />
                  </Button>
                  <Button
                    variant="ghost"
                    type="button"
                    aria-label={`Remove image ${i + 1}`}
                    disabled={busy}
                    onClick={() =>
                      patch({ images: draft.images.filter((_, index) => index !== i) })
                    }
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <label className="checkbox">
            <input
              type="checkbox"
              required
              checked={declared}
              onChange={(e) => setDeclared(e.target.checked)}
            />
            <span>This is my own work, or I have permission to show it.</span>
          </label>
        </section>
        <div className="button-row">
          <Button type="submit" disabled={busy}>
            <Upload size={16} />
            Save project
          </Button>
          <ButtonLink variant="secondary" to="/dashboard/portfolio">
            Cancel
          </ButtonLink>
        </div>
      </form>
    </>
  );
}
