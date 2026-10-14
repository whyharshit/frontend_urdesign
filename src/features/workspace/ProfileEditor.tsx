import { useState } from 'react';
import { Check, ArrowUpRight, ImagePlus, Trash2, X } from 'lucide-react';
import { useOwnProfile } from '../../hooks/useOwnProfile';
import { useDemo } from '../../hooks/useDemo';
import { CITIES, PROFESSIONAL_TYPES, CONTACT_WARNING } from '../../config/catalog';
import { hasContactDetails, publishChecks } from '../../lib/rules';
import { capitaliseWords, experienceLabel, slugify } from '../../lib/format';
import { readDemoImage } from '../../services/demoImages';
import { Avatar } from '../../components/professionals/ProfessionalCard';
import { ProfileContent } from '../../components/professionals/ProfileContent';
import { PublishChecklist } from '../../components/professionals/PublishChecklist';
import { PageHeading } from '../../components/ui/PageHeading';
import {
  CityInput,
  Input,
  NAME_PATTERN,
  NAME_TITLE,
  Select,
  Textarea,
} from '../../components/ui/Field';
import { Button, ButtonLink } from '../../components/ui/Button';
import { Notice, StatusBadge, toast } from '../../components/ui/Feedback';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import type { ProfessionalType } from '../../types/domain';

function ImagePicker({
  label,
  value,
  onChange,
  round = false,
}: {
  label: string;
  value?: string;
  onChange: (value: string | undefined) => void;
  round?: boolean;
}) {
  const [error, setError] = useState('');
  return (
    <div className={`image-picker ${round ? 'image-picker--round' : ''}`}>
      <span className="field-label">{label}</span>
      <div className="image-picker-body">
        {value ? (
          <img src={value} alt="" />
        ) : (
          <span className="image-picker-empty">
            <ImagePlus size={22} />
          </span>
        )}
        <div className="stack-sm">
          <label className="button button--secondary">
            {value ? 'Replace' : 'Upload'}
            <input
              type="file"
              className="sr-only"
              accept="image/jpeg,image/png,image/webp"
              aria-label={`Upload ${label.toLowerCase()}`}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (!file) return;
                try {
                  onChange(await readDemoImage(file));
                  setError('');
                } catch (err) {
                  setError((err as Error).message);
                }
              }}
            />
          </label>
          {value && (
            <Button type="button" variant="ghost" onClick={() => onChange(undefined)}>
              <Trash2 size={14} /> Remove
            </Button>
          )}
        </div>
      </div>
      {error && (
        <small className="error-text" role="alert">
          {error}
        </small>
      )}
    </div>
  );
}

/** Practice details, shared by the profile page and the first-time setup flow. */
export function ProfileFields() {
  const { profile: p, update, ready } = useOwnProfile();
  const { state } = useDemo();
  const [workCity, setWorkCity] = useState('');
  const [slug, setSlug] = useState(p.slug);
  const [slugConfirm, setSlugConfirm] = useState(false);
  const links = [...(p.links || []), '', '', ''].slice(0, 3);
  const slugTaken = state.providers.some((o) => o.id !== p.id && o.slug === slugify(slug));
  return (
    <fieldset disabled={!ready} className="plain-fieldset">
      <div className="form-grid">
        <Input
          id="name"
          label="Full name"
          pattern={NAME_PATTERN}
          title={NAME_TITLE}
          value={p.name}
          minLength={2}
          maxLength={80}
          required
          autoComplete="name"
          onChange={(e) => update({ name: e.target.value })}
          onBlur={() => update({ name: capitaliseWords(p.name.trim()) })}
        />
        <Input
          label="Studio / firm name"
          value={p.studio}
          maxLength={80}
          placeholder="Optional — make your practice the headline"
          onChange={(e) => update({ studio: e.target.value })}
          onBlur={() => update({ studio: capitaliseWords(p.studio.trim()) })}
        />
        <Select
          id="type"
          label="Professional type"
          value={p.type}
          required
          onChange={(e) => update({ type: e.target.value as ProfessionalType })}
        >
          <option value="">Choose your profession</option>
          {PROFESSIONAL_TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </Select>
        <CityInput
          id="city"
          label="Based in"
          value={p.city}
          required
          onChange={(city) => update({ city })}
        />
        <div className="full-width">
          <Textarea
            id="bio"
            label="About your practice"
            value={p.bio}
            minLength={40}
            maxLength={500}
            rows={5}
            hint={`${p.bio.trim().length}/500 characters · At least 40 characters to publish.`}
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
          hint={p.years ? experienceLabel(p.years) : 'Shown as “New practice” while 0.'}
          onChange={(e) =>
            update({ years: Math.min(60, Math.max(0, Math.round(Number(e.target.value)))) })
          }
        />
        <Input
          label="Qualification"
          value={p.qualification}
          maxLength={120}
          placeholder="e.g. B.Arch, CEPT University"
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
        <Input
          label="COA registration number (optional)"
          value={p.coaNumber || ''}
          maxLength={30}
          placeholder="e.g. CA/2016/78231"
          hint="Shown as “COA number provided” until our team checks the register."
          onChange={(e) => update({ coaNumber: e.target.value.toUpperCase() })}
        />
        <div className="full-width stack-sm">
          <span className="field-label">Cities I take work in</span>
          <div className="tag-list">
            {(p.workCities || []).map((c) => (
              <span className="tag tag--removable" key={c}>
                {c}
                <button
                  type="button"
                  aria-label={`Remove ${c}`}
                  onClick={() =>
                    update({ workCities: (p.workCities || []).filter((w) => w !== c) })
                  }
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="inline-add">
            <CityInput label="Add a city" value={workCity} onChange={setWorkCity} />
            <Button
              type="button"
              variant="secondary"
              disabled={!workCity.trim()}
              onClick={() => {
                const city =
                  CITIES.find((c) => c.toLowerCase() === workCity.trim().toLowerCase()) ||
                  capitaliseWords(workCity.trim());
                if (city !== p.city && !(p.workCities || []).includes(city))
                  update({ workCities: [...(p.workCities || []), city].slice(0, 15) });
                setWorkCity('');
              }}
            >
              Add city
            </Button>
          </div>
          <small className="muted">Clients searching these cities will find you too.</small>
        </div>
        <div className="full-width stack-sm">
          <span className="field-label">Website & social links (up to 3)</span>
          {links.map((link, i) => (
            <Input
              key={i}
              label={['Website', 'Instagram', 'Another link'][i]}
              type="url"
              value={link}
              placeholder={
                [
                  'https://yourstudio.in',
                  'https://instagram.com/yourstudio',
                  'https://behance.net/…',
                ][i]
              }
              onChange={(e) => {
                const next = [...links];
                next[i] = e.target.value.trim();
                update({ links: next });
              }}
            />
          ))}
        </div>
        <div className="full-width">
          <span className="field-label">Your profile link</span>
          {p.slugEdited ? (
            <p className="small">
              urdesigner.in/p/<strong>{p.slug}</strong> · already customised once
            </p>
          ) : (
            <div className="inline-add">
              <Input
                label="urdesigner.in/p/"
                value={slug}
                maxLength={60}
                hint="You can change this once."
                error={slugTaken ? 'That link is taken — try another' : undefined}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              />
              <Button
                type="button"
                variant="secondary"
                disabled={!slugify(slug) || slugify(slug) === p.slug || slugTaken}
                onClick={() => setSlugConfirm(true)}
              >
                Save link
              </Button>
            </div>
          )}
        </div>
        <div className="full-width image-picker-row">
          <ImagePicker
            label="Logo or photo"
            round
            value={p.photo}
            onChange={(photo) => update({ photo })}
          />
          <ImagePicker
            label="Cover image"
            value={p.cover}
            onChange={(cover) => update({ cover })}
          />
        </div>
        <div id="mobile">
          <span className="eyebrow">MOBILE VERIFICATION</span>
          <StatusBadge status={p.mobileVerified ? 'verified' : 'pending'} />
        </div>
      </div>
      <ConfirmDialog
        open={slugConfirm}
        title="Change your profile link?"
        confirmLabel="Change link"
        onClose={() => setSlugConfirm(false)}
        onConfirm={() => {
          update({ slug: slugify(slug), slugEdited: true });
          toast('Profile link updated');
        }}
      >
        <p>
          Your profile will move to urdesigner.in/p/<strong>{slugify(slug)}</strong>. Links you’ve
          already shared will stop working, and you can only change it once.
        </p>
      </ConfirmDialog>
    </fieldset>
  );
}

export function ProfileEditor() {
  const { profile: p, storageError } = useOwnProfile();
  return (
    <>
      <PageHeading
        eyebrow="YOUR PRACTICE, IN YOUR WORDS"
        title="Let’s tell your story."
        description="A thoughtful profile helps the right clients find you."
        action={
          <span className="saved-note">
            <Check />
            {storageError ? 'Saved for this session' : 'Changes are saved as you type'}
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
            <ProfileFields />
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
            {p.type} · {p.city || 'Your city'} · {experienceLabel(p.years)}
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
  const { profile } = useOwnProfile();
  return (
    <div className="stack">
      <PageHeading
        eyebrow="READY FOR YOUR NEXT CHAPTER?"
        title="Your practice, at a glance."
        description="This is how clients will discover your work."
        action={<StatusBadge status={profile.status} />}
      />
      <PublishControls />
      <ProfileContent professional={profile} preview />
    </div>
  );
}

/** Checklist plus publish / unpublish, used by Preview & publish and the setup flow. */
export function PublishControls({ onPublished }: { onPublished?: () => void }) {
  const { profile, update, ready } = useOwnProfile();
  const { state } = useDemo();
  const [confirm, setConfirm] = useState(false);
  const missing = publishChecks(profile).filter((check) => !check.done);
  return (
    <div className="panel stack">
      {profile.status !== 'published' && <PublishChecklist professional={profile} />}
      {profile.status === 'published' && (
        <Notice tone="success">
          Your profile is live at urdesigner.in/p/{profile.slug}. Clients can find you in discovery.
        </Notice>
      )}
      {profile.status === 'suspended' && (
        <Notice tone="warning">
          This profile is suspended. Admin review is required before publishing.
        </Notice>
      )}
      <div className="button-row">
        <Button
          disabled={
            !ready ||
            missing.length > 0 ||
            profile.status === 'suspended' ||
            profile.status === 'published'
          }
          onClick={() => {
            // A new practice gets a readable link from its name the first time it publishes.
            let slug = profile.slug;
            if (!profile.slugEdited && slug.startsWith('new-practice-')) {
              const base = slugify(`${profile.studio || profile.name} ${profile.city}`) || slug;
              slug = base;
              for (
                let n = 2;
                state.providers.some((o) => o.id !== profile.id && o.slug === slug);
                n++
              )
                slug = `${base}-${n}`;
            }
            update({ status: 'published', slug });
            toast('Your profile is published');
            onPublished?.();
          }}
        >
          {profile.status === 'published' ? 'Profile is published' : 'Publish profile'}{' '}
          <ArrowUpRight size={16} />
        </Button>
        {!onPublished && (
          <ButtonLink variant="secondary" to="/dashboard/profile">
            Continue editing
          </ButtonLink>
        )}
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
      <ConfirmDialog
        open={confirm}
        title="Take your profile off discovery?"
        confirmLabel="Unpublish profile"
        onClose={() => setConfirm(false)}
        onConfirm={() => {
          update({ status: 'unpublished' });
          toast('Your profile is unpublished');
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
