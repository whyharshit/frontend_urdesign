import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useOwnProfile } from '../../hooks/useOwnProfile';
import { PageHeading } from '../../components/ui/PageHeading';
import { Button } from '../../components/ui/Button';
import { Notice } from '../../components/ui/Feedback';
import { ProfileContent } from '../../components/professionals/ProfileContent';
import { ProfileFields, PublishControls } from './ProfileEditor';
import { ServicesPage } from './ServicesPage';
import { ProjectEditor } from './PortfolioPage';
import { publishChecks } from '../../lib/rules';
import { plural } from '../../lib/format';

const STEPS = ['Profile', 'Services', 'First project', 'Preview', 'Publish'];

/** First-time setup for a new professional: Profile → Services → First project → Preview → Publish. */
export function SetupPage() {
  const { profile } = useOwnProfile();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const step = Math.min(STEPS.length, Math.max(1, Number(params.get('step')) || 1));
  const go = (next: number) => {
    setParams({ step: String(next) });
    window.scrollTo(0, 0);
  };
  const hasProject = profile.projects.some((p) => p.images.length > 0);
  const profileReady = publishChecks(profile)
    .slice(0, 5)
    .every((c) => c.done);
  return (
    <div className="stack setup">
      <PageHeading
        eyebrow="SET UP YOUR PRACTICE"
        title={step === 1 ? 'Welcome. Let’s build your profile.' : STEPS[step - 1]}
        description="Five short steps. Your profile stays hidden from clients until you publish."
      />
      <ol className="setup-steps" aria-label="Setup progress">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={i + 1 === step ? 'active' : i + 1 < step ? 'done' : ''}
            aria-current={i + 1 === step ? 'step' : undefined}
          >
            <b>{i + 1 < step ? <Check size={12} /> : i + 1}</b>
            {label}
          </li>
        ))}
      </ol>
      {step === 1 && (
        <form
          className="panel stack"
          onSubmit={(e) => {
            e.preventDefault();
            if (profileReady) go(2);
          }}
        >
          <ProfileFields />
          {!profileReady && (
            <p className="small muted">
              Add your name, type, city and at least 40 characters about your practice to continue.
            </p>
          )}
          <div className="button-row">
            <Button type="submit">
              Continue to services <ArrowRight size={16} />
            </Button>
          </div>
        </form>
      )}
      {step === 2 && (
        <>
          <ServicesPage />
          <div className="button-row setup-nav">
            <Button variant="ghost" onClick={() => go(1)}>
              <ArrowLeft size={16} /> Back
            </Button>
            <Button disabled={!profile.services.length} onClick={() => go(3)}>
              Continue to your first project <ArrowRight size={16} />
            </Button>
            {!profile.services.length && (
              <span className="small muted">Add at least one service to continue.</span>
            )}
          </div>
        </>
      )}
      {step === 3 &&
        (hasProject ? (
          <div className="panel stack">
            <Notice tone="success">
              {plural(profile.projects.length, 'project')} added. You can add more any time from
              Portfolio.
            </Notice>
            <div className="button-row setup-nav">
              <Button variant="ghost" onClick={() => go(2)}>
                <ArrowLeft size={16} /> Back
              </Button>
              <Button onClick={() => go(4)}>
                Preview your profile <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        ) : (
          <ProjectEditor onSaved={() => go(4)} />
        ))}
      {step === 4 && (
        <>
          <div className="button-row setup-nav">
            <Button variant="ghost" onClick={() => go(3)}>
              <ArrowLeft size={16} /> Back
            </Button>
            <Button onClick={() => go(5)}>
              Looks good — continue <ArrowRight size={16} />
            </Button>
          </div>
          <div className="panel">
            <ProfileContent professional={profile} preview />
          </div>
        </>
      )}
      {step === 5 && (
        <>
          <PublishControls onPublished={() => navigate('/dashboard')} />
          <div className="button-row setup-nav">
            <Button variant="ghost" onClick={() => go(4)}>
              <ArrowLeft size={16} /> Back
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
