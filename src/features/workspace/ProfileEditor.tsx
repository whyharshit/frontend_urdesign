import { useState } from 'react';
import { Check, ArrowUpRight } from 'lucide-react';
import { useOwnProfile } from '../../hooks/useOwnProfile';
import { CITIES, PROFESSIONAL_TYPES, CONTACT_WARNING } from '../../config/catalog';
import { hasContactDetails, publishChecks } from '../../lib/rules';
import { Avatar } from '../../components/professionals/ProfessionalCard';
import { ProfileContent } from '../../components/professionals/ProfileContent';
import { PublishChecklist } from '../../components/professionals/PublishChecklist';
import { PageHeading } from '../../components/ui/PageHeading';
import { Input, Select, Textarea } from '../../components/ui/Field';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Notice, StatusBadge } from '../../components/ui/Feedback';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import type { ProfessionalType } from '../../types/domain';

export function ProfileEditor() {
  const { profile: p, update, ready, storageError } = useOwnProfile();
  return (
    <>
      <PageHeading
        eyebrow="YOUR PRACTICE, IN YOUR WORDS"
        title="Let’s tell your story."
        description="A thoughtful profile helps the right clients find you."
        action={
          <span className="saved-note">
            <Check />
            {storageError ? 'Saved for this session' : 'Changes save in this browser'}
          </span>
        }
      />
      <div className="editor-layout">
        <div className="stack">
          <section className="panel">
            <div className="section-title">
              <span>01</span>
              <h2>The person behind the practice</h2>
            </div>
            <fieldset disabled={!ready} style={{ border: 0, padding: 0, margin: 0 }}>
              <div className="form-grid">
                <Input
                  id="name"
                  label="Full name"
                  value={p.name}
                  minLength={2}
                  maxLength={80}
                  required
                  onChange={(e) => update({ name: e.target.value })}
                />
                <Input
                  label="Studio / firm name"
                  value={p.studio}
                  maxLength={80}
                  placeholder="Optional — make your practice the headline"
                  onChange={(e) => update({ studio: e.target.value })}
                />
                <Select
                  id="type"
                  label="Professional type"
                  value={p.type}
                  onChange={(e) => update({ type: e.target.value as ProfessionalType })}
                >
                  <option value="">Choose your profession</option>
                  {PROFESSIONAL_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </Select>
                <Select
                  id="city"
                  label="Based in"
                  value={p.city}
                  onChange={(e) => update({ city: e.target.value })}
                >
                  <option value="">Choose a city</option>
                  {CITIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
                <div className="full-width">
                  <Textarea
                    id="bio"
                    label="About your practice"
                    value={p.bio}
                    minLength={40}
                    maxLength={500}
                    rows={5}
                    hint={`${p.bio.length}/500 characters · At least 40 characters to publish.`}
                    onChange={(e) => update({ bio: e.target.value })}
                  />
                  {hasContactDetails(p.bio) && (
                    <div style={{ marginTop: 12 }}>
                      <Notice tone="warning">{CONTACT_WARNING}</Notice>
                    </div>
                  )}
                </div>
                <Input
                  label="Years of experience"
                  type="number"
                  min={0}
                  max={60}
                  step={1}
                  value={p.years}
                  onChange={(e) =>
                    update({ years: Math.min(60, Math.max(0, Math.round(Number(e.target.value)))) })
                  }
                />
                <Input
                  label="Qualification"
                  value={p.qualification}
                  maxLength={120}
                  onChange={(e) => update({ qualification: e.target.value })}
                />
                <Input
                  label="Languages"
                  value={p.languages.join(', ')}
                  hint="Separate languages with commas."
                  onChange={(e) =>
                    update({ languages: e.target.value.split(',').map((x) => x.trimStart()) })
                  }
                />
                <div id="mobile">
                  <span className="eyebrow">MOBILE VERIFICATION</span>
                  <StatusBadge status={p.mobileVerified ? 'verified' : 'pending'} />
                  <p className="small" style={{ marginTop: 8 }}>
                    Sample verification state. Phone changes require the authentication API.
                  </p>
                </div>
              </div>
            </fieldset>
          </section>
          {p.status === 'unpublished' && (
            <Notice tone="warning">
              Your profile is unpublished. Restore the missing essentials, then preview and publish
              again.
            </Notice>
          )}
          <div className="button-row">
            <ButtonLink to="/dashboard/services" variant="secondary">
              Manage services
            </ButtonLink>
            <ButtonLink to="/dashboard/publish">
              Preview & publish <ArrowUpRight size={16} />
            </ButtonLink>
          </div>
        </div>
        <aside className="panel editor-preview">
          <span className="eyebrow">YOUR LIVE PREVIEW</span>
          <Avatar professional={p} large />
          <h3>{p.studio || p.name || 'Your practice name'}</h3>
          <p className="meta">
            {p.type} · {p.city || 'Your city'}
          </p>
          <p>{p.bio || 'Tell people what makes your practice yours.'}</p>
          <hr className="divider" />
          <p className="small">
            {p.services.length} services · {p.projects.length} portfolio projects
          </p>
          <StatusBadge status={p.status} />
          <ButtonLink variant="secondary" to="/dashboard/publish">
            See full preview
          </ButtonLink>
        </aside>
      </div>
    </>
  );
}

export function PublishPage() {
  const { profile, update, ready } = useOwnProfile();
  const [confirm, setConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const missing = publishChecks(profile).filter((check) => !check.done);
  return (
    <div className="stack">
      <PageHeading
        eyebrow="READY FOR YOUR NEXT CHAPTER?"
        title="Your practice, at a glance."
        description="This is how clients will discover your work."
        action={<StatusBadge status={profile.status} />}
      />
      <div className="panel stack">
        <PublishChecklist professional={profile} />
        {success && (
          <Notice tone="success">
            Your profile is published in the local demo. It can now be found in discovery.
          </Notice>
        )}
        {profile.status === 'suspended' && (
          <Notice tone="warning">
            This profile is suspended. Admin review is required before publishing.
          </Notice>
        )}
        <div className="button-row">
          <Button
            disabled={!ready || missing.length > 0 || profile.status === 'suspended'}
            onClick={() => {
              update({ status: 'published' });
              setSuccess(true);
            }}
          >
            {profile.status === 'published' ? 'Profile is published' : 'Publish profile'}{' '}
            <ArrowUpRight size={16} />
          </Button>
          <ButtonLink variant="secondary" to="/dashboard/profile">
            Continue editing
          </ButtonLink>
          {profile.status === 'published' && (
            <Button variant="ghost" onClick={() => setConfirm(true)}>
              Unpublish
            </Button>
          )}
        </div>
        {missing.length > 0 && (
          <p className="small">
            Complete the linked essentials above to publish. {missing.length}{' '}
            {missing.length === 1 ? 'item' : 'items'} remaining.
          </p>
        )}
      </div>
      <ProfileContent professional={profile} preview />
      <ConfirmDialog
        open={confirm}
        title="Take your profile off discovery?"
        confirmLabel="Unpublish profile"
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          update({ status: 'unpublished' });
          setSuccess(false);
        }}
      >
        <p>
          Your existing enquiries and proposals stay active. You can publish again whenever you’re
          ready.
        </p>
      </ConfirmDialog>
    </div>
  );
}
