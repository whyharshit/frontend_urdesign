import { Mail, MessageCircle, Phone, Handshake } from 'lucide-react';
import { formatPhone, phoneLink, whatsappLink } from '../../lib/format';
import { linkLabel } from '../professionals/ProfileContent';

/** Shown to both sides once a proposal is accepted: who to call, and how. */
export function ContactReveal({
  name,
  phone,
  email,
  role,
  project,
  links = [],
}: {
  name: string;
  phone?: string;
  email?: string;
  /** A professional's website and social links, released together with phone and email. */
  links?: string[];
  role: 'professional' | 'client';
  project: string;
}) {
  const greeting = `Hi ${name.split(' ')[0]}, this is about "${project}" on UR DESIGNER.`;
  return (
    <section className="panel stack-sm contact-reveal">
      <Handshake className="accent" size={26} />
      <h3>You’re ready for a first hello.</h3>
      <p className="small">
        {role === 'professional'
          ? `Here’s how to reach ${name}. They have your details too, so a quick call is a good next step.`
          : `Here’s how to reach ${name}. They can see your details too and may get in touch first.`}
      </p>
      {phone || email ? (
        <>
          <dl className="detail-grid">
            <div>
              <dt>{role === 'professional' ? 'Professional' : 'Client'}</dt>
              <dd>{name}</dd>
            </div>
            {phone && (
              <div>
                <dt>Mobile</dt>
                <dd>
                  <a className="text-link" href={phoneLink(phone)}>
                    {formatPhone(phone)}
                  </a>
                </dd>
              </div>
            )}
            {email && (
              <div>
                <dt>Email</dt>
                <dd>
                  <a className="text-link" href={`mailto:${email}`}>
                    {email}
                  </a>
                </dd>
              </div>
            )}
            {links.filter(Boolean).map((url) => (
              <div key={url}>
                <dt>{linkLabel(url)}</dt>
                <dd>
                  <a className="text-link" href={url} target="_blank" rel="noreferrer nofollow">
                    {url.replace(/^https?:\/\/(www\.)?/, '')}
                  </a>
                </dd>
              </div>
            ))}
          </dl>
          <div className="button-row">
            {phone && (
              <a className="button button--primary" href={phoneLink(phone)}>
                <Phone size={16} /> Call
              </a>
            )}
            {phone && (
              <a
                className="button button--secondary"
                href={whatsappLink(phone, greeting)}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={16} /> WhatsApp
              </a>
            )}
            {email && (
              <a className="button button--ghost" href={`mailto:${email}`}>
                <Mail size={16} /> Email
              </a>
            )}
          </div>
        </>
      ) : (
        <p className="small">Contact details will appear here shortly.</p>
      )}
    </section>
  );
}
