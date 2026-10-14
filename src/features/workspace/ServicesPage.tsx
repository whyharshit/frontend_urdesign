import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useOwnProfile } from '../../hooks/useOwnProfile';
import { SERVICES, CONTACT_WARNING } from '../../config/catalog';
import { uid, servicePrice } from '../../lib/format';
import { hasContactDetails } from '../../lib/rules';
import { PageHeading } from '../../components/ui/PageHeading';
import { Button } from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Field';
import { Notice, EmptyState, toast } from '../../components/ui/Feedback';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import type { Service } from '../../types/domain';

const blank: Service = { id: '', category: '', description: '', priceType: 'contact_for_pricing' };
export function ServicesPage() {
  const { profile, update, ready } = useOwnProfile();
  const [edit, setEdit] = useState<Service | null>(null);
  const [remove, setRemove] = useState<Service | null>(null);
  const [message, setMessage] = useState('');
  return (
    <>
      <PageHeading
        eyebrow="WHAT YOU BRING TO THE TABLE"
        title="Services & pricing"
        description="Help clients understand how you can bring their ideas to life."
        action={
          <Button
            disabled={!ready || profile.services.length === SERVICES.length}
            onClick={() => {
              setEdit({ ...blank });
              setMessage('');
            }}
          >
            <Plus size={17} />
            Add service
          </Button>
        }
      />
      <div className="stack">
        {message && <Notice tone="success">{message}</Notice>}
        {edit && (
          <form
            className="panel stack"
            onSubmit={(e) => {
              e.preventDefault();
              const service = {
                ...edit,
                id: edit.id || uid(),
                price: edit.priceType === 'contact_for_pricing' ? undefined : edit.price,
              };
              update({
                services: edit.id
                  ? profile.services.map((s) => (s.id === edit.id ? service : s))
                  : [...profile.services, service],
              });
              setEdit(null);
              setMessage('');
              toast('Service saved');
            }}
          >
            <div className="panel-heading">
              <h2>{edit.id ? 'Refine your service' : 'Add a service'}</h2>
            </div>
            <Select
              label="Service category"
              value={edit.category}
              required
              onChange={(e) => setEdit({ ...edit, category: e.target.value })}
            >
              <option value="">Choose a service</option>
              {SERVICES.filter(
                (s) => s === edit.category || !profile.services.some((p) => p.category === s),
              ).map((s) => (
                <option key={s}>{s}</option>
              ))}
            </Select>
            <Textarea
              label="A little about this service"
              maxLength={300}
              value={edit.description}
              onChange={(e) => setEdit({ ...edit, description: e.target.value })}
            />
            {hasContactDetails(edit.description) && (
              <Notice tone="warning">{CONTACT_WARNING}</Notice>
            )}
            <div className="form-grid">
              <Select
                label="How would you like to show pricing?"
                value={edit.priceType}
                onChange={(e) =>
                  setEdit({ ...edit, priceType: e.target.value as Service['priceType'] })
                }
              >
                <option value="contact_for_pricing">Contact for pricing</option>
                <option value="starting_from">Starting from</option>
                <option value="fixed">Fixed price</option>
                <option value="per_sqft">Per sq ft</option>
                <option value="percent">% of project cost</option>
              </Select>
              {edit.priceType !== 'contact_for_pricing' && (
                <Input
                  label={
                    edit.priceType === 'percent'
                      ? 'Percentage of project cost (%)'
                      : edit.priceType === 'per_sqft'
                        ? 'Rate per sq ft (₹)'
                        : 'Price (₹)'
                  }
                  type="number"
                  min={edit.priceType === 'percent' ? 0.5 : 1}
                  max={edit.priceType === 'percent' ? 50 : undefined}
                  step={edit.priceType === 'percent' ? 0.5 : 1}
                  required
                  value={edit.price ?? ''}
                  onChange={(e) => setEdit({ ...edit, price: Number(e.target.value) })}
                />
              )}
            </div>
            <div className="button-row">
              <Button type="submit">Save service</Button>
              <Button type="button" variant="ghost" onClick={() => setEdit(null)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
        {profile.services.map((s) => (
          <article className="service-editor-card" key={s.id}>
            <div>
              <span className="eyebrow">DESIGN SERVICE</span>
              <h3>{s.category}</h3>
              <p>{s.description}</p>
              <strong>{servicePrice(s)}</strong>
            </div>
            <div className="button-row">
              <Button variant="ghost" aria-label={`Edit ${s.category}`} onClick={() => setEdit(s)}>
                <Pencil size={17} />
              </Button>
              <Button
                variant="ghost"
                aria-label={`Remove ${s.category}`}
                onClick={() => setRemove(s)}
              >
                <Trash2 size={17} />
              </Button>
            </div>
          </article>
        ))}
        {!profile.services.length && !edit && (
          <EmptyState
            title="Your expertise belongs here."
            description="Add a service to help clients find you. Pricing is optional; Contact for pricing is always available."
          />
        )}
        <Notice>
          Publish with at least one service. You can leave rates open and discuss the right scope
          through a proposal.
        </Notice>
      </div>
      <ConfirmDialog
        open={!!remove}
        title="Remove this service?"
        confirmLabel="Remove service"
        onClose={() => setRemove(null)}
        onConfirm={() => {
          update({ services: profile.services.filter((s) => s.id !== remove?.id) });
          if (edit?.id === remove?.id) setEdit(null);
          toast('Service removed');
        }}
      >
        <p>
          {remove?.category} will be removed from your profile. Removing your last service also
          unpublishes your profile.
        </p>
      </ConfirmDialog>
    </>
  );
}
