import { Component, useEffect, type ReactNode } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { DemoProvider } from '../hooks/useDemo';
import { PublicLayout } from '../shell/PublicLayout';
import { WorkspaceLayout } from '../shell/WorkspaceLayout';
import { HomePage } from '../features/discovery/HomePage';
import { SearchPage } from '../features/discovery/SearchPage';
import { ProfilePage, ProjectPage } from '../features/discovery/ProfilePage';
import { AuthPage } from '../features/auth/AuthPage';
import { EnquiryForm } from '../features/enquiries/EnquiryForm';
import {
  ClientEnquiries,
  ClientProposal,
  CompareProposals,
  SavedProfessionals,
} from '../features/enquiries/ClientEnquiries';
import { DashboardPage } from '../features/workspace/DashboardPage';
import { ProfileEditor, PublishPage } from '../features/workspace/ProfileEditor';
import { SetupPage } from '../features/workspace/SetupPage';
import { ServicesPage } from '../features/workspace/ServicesPage';
import { PortfolioPage, ProjectEditor } from '../features/workspace/PortfolioPage';
import { EnquiriesPage, EnquiryDetail, ProposalEditor } from '../features/workspace/EnquiriesPage';
import {
  WalletPage,
  BuyConnectsPage,
  PaymentPage,
  ReferralsPage,
} from '../features/connects/ConnectsPages';
import {
  AdminProfessionals,
  AdminPayments,
  AdminEnquiries,
  AdminReports,
  AdminLogin,
} from '../features/admin/AdminPages';
import { DemoPage, LegalPage, NotFoundPage } from '../features/static/StaticPages';
import { getPageMetadata } from './metadata';

function NavigationEffects() {
  const location = useLocation();
  useEffect(() => {
    const meta = getPageMetadata(location.pathname + location.search);
    document.title = meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', meta.description);
    let robots = document.querySelector('meta[name="robots"]');
    if (meta.private && !robots) {
      robots = document.createElement('meta');
      robots.setAttribute('name', 'robots');
      document.head.append(robots);
    }
    if (meta.private) robots?.setAttribute('content', 'noindex,nofollow');
    else robots?.remove();
  }, [location.pathname, location.search]);
  useEffect(() => {
    if (location.hash)
      document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
    else {
      window.scrollTo(0, 0);
      document.getElementById('main')?.focus({ preventScroll: true });
    }
  }, [location.pathname, location.hash]);
  return null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <main className="container section">
        <h1>Let’s try that again.</h1>
        <p>This page couldn’t be loaded. Your saved demo changes are still in your browser.</p>
        <a className="button button--primary" href="/">
          Return home
        </a>
      </main>
    ) : (
      this.props.children
    );
  }
}

export function App() {
  return (
    <ErrorBoundary>
      <DemoProvider>
        <NavigationEffects />
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="architects/:city?" element={<SearchPage />} />
            <Route path="p/:slug" element={<ProfilePage />} />
            <Route path="p/:slug/project/:projectId" element={<ProjectPage />} />
            <Route path="join" element={<AuthPage mode="join" />} />
            <Route path="login" element={<AuthPage mode="login" />} />
            <Route path="forgot-password" element={<AuthPage mode="reset" />} />
            <Route path="enquiry/:slug" element={<EnquiryForm />} />
            <Route path="my-enquiries" element={<ClientEnquiries />} />
            <Route path="my-enquiries/saved" element={<SavedProfessionals />} />
            <Route path="my-enquiries/proposal/:enquiryId" element={<ClientProposal />} />
            <Route path="my-enquiries/compare/:requirementId" element={<CompareProposals />} />
            <Route path="terms" element={<LegalPage />} />
            <Route path="privacy" element={<LegalPage privacy />} />
            <Route path="playground" element={<DemoPage />} />
            <Route path="admin/login" element={<AdminLogin />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route path="dashboard" element={<WorkspaceLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="setup" element={<SetupPage />} />
            <Route path="profile" element={<ProfileEditor />} />
            <Route path="publish" element={<PublishPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="portfolio" element={<PortfolioPage />} />
            <Route path="portfolio/new" element={<ProjectEditor />} />
            <Route path="portfolio/:projectId" element={<ProjectEditor />} />
            <Route path="enquiries" element={<EnquiriesPage />} />
            <Route path="enquiries/:enquiryId" element={<EnquiryDetail />} />
            <Route path="enquiries/:enquiryId/proposal" element={<ProposalEditor />} />
            <Route path="connects" element={<WalletPage />} />
            <Route path="connects/buy" element={<BuyConnectsPage />} />
            <Route path="connects/payment/:pack" element={<PaymentPage />} />
            <Route path="referrals" element={<ReferralsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route path="admin" element={<WorkspaceLayout admin />}>
            <Route index element={<AdminProfessionals />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="enquiries" element={<AdminEnquiries />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </DemoProvider>
    </ErrorBoundary>
  );
}
