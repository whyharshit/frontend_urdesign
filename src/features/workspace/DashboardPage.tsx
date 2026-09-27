import { Link } from 'react-router-dom';
import { ArrowUpRight, Inbox, Images, Send, Coins, ArrowRight } from 'lucide-react';
import { useDemo } from '../../hooks/useDemo';
import { useOwnProfile } from '../../hooks/useOwnProfile';
import { PageHeading } from '../../components/ui/PageHeading';
import { ButtonLink } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/Feedback';
import { PublishChecklist } from '../../components/professionals/PublishChecklist';
import { dateLabel } from '../../lib/format';

export function DashboardPage() {
  const { state } = useDemo();
  const { profile } = useOwnProfile();
  const enquiries = state.enquiries.filter((e) => e.providerId === profile.id);
  const awaiting = enquiries.filter((e) => ['sent', 'viewed'].includes(e.status));
  return (
    <>
      <PageHeading
        eyebrow="A LITTLE SPACE FOR YOUR PRACTICE"
        title={`Good things ahead, ${profile.name.split(' ')[0] || 'designer'}.`}
        description="Your work is out there. Here’s what’s happening around it."
        action={
          <ButtonLink variant="secondary" to={`/p/${profile.slug}`}>
            View public profile <ArrowUpRight size={16} />
          </ButtonLink>
        }
      />
      <div className="welcome-banner">
        <div>
          <StatusBadge status={profile.status} />
          <h2 style={{ marginTop: 12 }}>
            {profile.status === 'published'
              ? 'Your next introduction could be a great one.'
              : 'Make a little room for your next chapter.'}
          </h2>
          <p>
            {profile.status === 'published'
              ? 'Keep your portfolio current and your practice in view. Thoughtful work deserves to be discovered.'
              : 'Complete your profile, add a service and show your work. Publish when you’re ready.'}
          </p>
        </div>
        <ButtonLink to="/dashboard/profile" variant="secondary">
          Refine your profile <ArrowUpRight size={16} />
        </ButtonLink>
      </div>
      <div className="stats-grid">
        <StatCard
          label="Enquiries received"
          value={enquiries.length}
          detail={`${awaiting.length} awaiting your reply`}
          icon={<Inbox size={18} />}
        />
        <StatCard
          label="Proposals sent"
          value={state.proposals.filter((p) => enquiries.some((e) => e.id === p.enquiryId)).length}
          detail="Thoughtful introductions"
          icon={<Send size={18} />}
        />
        <StatCard
          label="Portfolio projects"
          value={profile.projects.length}
          detail="Your work, in the spotlight"
          icon={<Images size={18} />}
        />
        <StatCard
          label="Available connects"
          value={state.balance}
          detail="Ready for your next proposal"
          icon={<Coins size={18} />}
        />
      </div>
      <div className="dashboard-grid">
        <div className="stack">
          <div className="panel">
            <div className="panel-heading">
              <h2>Latest enquiries</h2>
              <Link className="text-link" to="/dashboard/enquiries">
                View all <ArrowUpRight size={15} />
              </Link>
            </div>
            {enquiries.length ? (
              enquiries
                .slice()
                .reverse()
                .slice(0, 4)
                .map((enquiry) => {
                  const r = state.requirements.find((r) => r.id === enquiry.requirementId)!;
                  return (
                    <Link
                      className="enquiry-list-row"
                      key={enquiry.id}
                      to={`/dashboard/enquiries/${enquiry.id}`}
                    >
                      <div>
                        <h3>{r.title}</h3>
                        <p>
                          {r.city} · {r.service} · {dateLabel(enquiry.sentAt)}
                        </p>
                      </div>
                      <div className="row-end">
                        <StatusBadge status={enquiry.status} />
                        <ArrowUpRight size={18} />
                      </div>
                    </Link>
                  );
                })
            ) : (
              <p className="small">
                Your next enquiry will appear here. Share your profile to start the conversation.
              </p>
            )}
          </div>
          <div className="panel">
            <span className="eyebrow">GOOD PEOPLE KNOW GOOD PEOPLE</span>
            <h2>Make an introduction. Earn connects.</h2>
            <p className="small" style={{ margin: '14px 0 20px' }}>
              Refer a professional. When they publish, you both receive 20 connects. Your first five
              published referrals count.
            </p>
            <Link to="/dashboard/referrals" className="text-link">
              Share your invitation <ArrowRight size={16} />
            </Link>
          </div>
        </div>
        <div className="panel">
          <div className="panel-heading">
            <h2>Your profile essentials</h2>
          </div>
          <PublishChecklist professional={profile} />
          <div style={{ marginTop: 25 }}>
            <ButtonLink to="/dashboard/publish" variant="secondary">
              Preview & publish <ArrowUpRight size={15} />
            </ButtonLink>
          </div>
        </div>
      </div>
    </>
  );
}
