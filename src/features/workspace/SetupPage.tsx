import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check, Copy, MessageCircle, PartyPopper } from 'lucide-react';
import { useOwnProfile } from '../../hooks/useOwnProfile';
import { PageHeading } from '../../components/ui/PageHeading';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Notice, toast } from '../../components/ui/Feedback';
import { ProfileContent } from '../../components/professionals/ProfileContent';
import { ProfileFields, PublishControls } from './ProfileEditor';
import { ServicesPage } from './ServicesPage';
import { ProjectEditor } from './PortfolioPage';
import { publishChecks } from '../../lib/rules';
import { plural } from '../../lib/format';
import { SITE_URL } from '../../config/catalog';
import type { Professional } from '../../types/domain';

const STEPS = ['Profile', 'Services', 'First project', 'Preview', 'Publish'];

/** The moment after publishing: the live link, ways to share it, and what to do next. */
function LiveScreen({ profile }: { profile: Professional }) {
  const url = `${SITE_URL}/p/${profile.slug}`;
  const more = Math.max(0, 3 - profile.projects.length);
  return (
    <div className="panel stack live-screen">
      <div className="success-mark success-mark--animated">
        <PartyPopper size={26} />
      </div>
      <span className="eyebrow">YOU’RE LIVE</span>
      <h2>Your profile is live.</h2>
      <p>Clients can now find {profile.studio || profile.name} in discovery and send enquiries.</p>
      <p className="live-url">
        <a className="text-link" href={`/p/${profile.slug}`}>
          {url.replace(/^https?:\/\//, '')}
        </a>
      </p>
      <div className="button-row">
        <Button
          variant="secondary"
          onClick={() => {
            navigator.clipboard?.writeText(url).then(
              () => toast('Link copied'),
              () => toast('Couldn’t copy. Select the link and copy it instead.'),
            );
          }}
        >
          <Copy size={16} /> Copy link
        </Button>
        <a
          className="button button--secondary"
          href={`https://wa.me/?text=${encodeURIComponent(`See my work on UR DESIGNER: ${url}`)}`}
          target="_blank"
          rel="noreferrer"
        >
          <MessageCircle size={16} /> Share on WhatsApp
        </a>
      </div>
      {more > 0 && (
        <Notice>
          Profiles with three or more projects get more enquiries. Add{' '}
          {plural(more, 'more project')} to show the range of your work.
        </Notice>
      )}
      <div className="button-row">
        {more > 0 && (
          <ButtonLink to="/dashboard/portfolio/new">
            Add {more === 1 ? 'a project' : `${more} more projects`}
          </ButtonLink>
        )}
        <ButtonLink variant={more > 0 ? 'secondary' : 'primary'} to="/dashboard">
          Go to your workspace <ArrowRight size={16} />
        </ButtonLink>
      </div>
    </div>
  );
}

/** First-time setup for a new professional: Profile → Services → First project → Preview → Publish. */
export function SetupPage() {
  const { profile } = useOwnProfile();
  const [params, setParams] = useSearchParams();
  const step = Math.min(STEPS.length, Math.max(1, Number(params.get('step')) || 1));
  const go = (next: number | 'live') => {
    setParams({ step: String(next) });
    window.scrollTo(0, 0);
  };
  if (params.get('step') === 'live' && profile.status === 'published')
    return <LiveScreen profile={profile} />;
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
              Looks good, continue <ArrowRight size={16} />
            </Button>
          </div>
          <div className="panel">
            <ProfileContent professional={profile} preview />
          </div>
        </>
      )}
      {step === 5 && (
        <>
          <PublishControls onPublished={() => go('live')} />
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
