import type { Metadata } from 'next';
import { LegalLayout, type TocItem } from '@/components/legal/LegalLayout';
import { pageMetadata } from '@/lib/seo';

const TOC: TocItem[] = [
  { id: "acceptance-of-terms", label: "1. Acceptance of Terms" },
  { id: "description-of-service", label: "2. Description of Service" },
  { id: "user-eligibility", label: "3. User Eligibility" },
  { id: "user-accounts-and-credentials", label: "4. User Accounts and Credentials" },
  { id: "client-responsibilities", label: "5. Client Responsibilities" },
  { id: "attorney-responsibilities", label: "6. Attorney Responsibilities" },
  { id: "fees-and-payment", label: "7. Fees and Payment" },
  { id: "conflict-of-interest-screening", label: "8. Conflict of Interest Screening" },
  { id: "intellectual-property-rights", label: "9. Intellectual Property Rights" },
  { id: "user-generated-content", label: "10. User-Generated Content" },
  { id: "limitation-of-liability", label: "11. Limitation of Liability" },
  { id: "indemnification", label: "12. Indemnification" },
  { id: "termination", label: "13. Termination" },
  { id: "dispute-resolution-and-governing-law", label: "14. Dispute Resolution and Governing Law" },
  { id: "compliance-with-laws", label: "15. Compliance with Laws" },
  { id: "contact-information", label: "16. Contact Information" },
];

export const metadata: Metadata = pageMetadata({
  title: 'Terms of Service',
  description: 'The terms for using Legal Connect, a technology platform that connects people with independent, licensed attorneys.',
  path: '/terms',
});

export default function TermsPage(): React.ReactNode {
  return (
    <LegalLayout title="Terms of Service" updated="Last Updated: December 2025" toc={TOC}>
  <section>
    <h2 id="acceptance-of-terms">1. Acceptance of Terms</h2>
    <p>
      By accessing and using Legal Connect (the "Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Platform. We reserve the right to modify these Terms at any time, and your continued use constitutes acceptance of any changes.
    </p>
  </section>

  <section>
    <h2 id="description-of-service">2. Description of Service</h2>
    <p>
      Legal Connect is a digital platform that:
    </p>
    <ul>
      <li>Allows clients to describe their legal matters through guided intake forms</li>
      <li>Performs automated conflict-of-interest screening</li>
      <li>Matches clients with qualified, available attorneys in their jurisdiction</li>
      <li>Facilitates secure messaging and document exchange between clients and attorneys</li>
      <li>Provides payment processing and billing services</li>
    </ul>
    <p>
      <strong>Important Disclaimer:</strong> Legal Connect is not a law firm and does not provide legal advice. We are a technology platform connecting clients with independent licensed attorneys. Any legal advice or representation is provided by the matched attorney, not by Legal Connect.
    </p>
  </section>

  <section>
    <h2 id="user-eligibility">3. User Eligibility</h2>
    <p>
      To use Legal Connect, you must:
    </p>
    <ul>
      <li>Be at least 18 years old (or 21 in certain jurisdictions)</li>
      <li>Have the authority to enter into a legally binding agreement</li>
      <li>Not be prohibited from using the Platform by applicable law</li>
      <li><strong>For Attorneys:</strong> Hold an active license to practice law in the United States or applicable jurisdiction</li>
      <li><strong>For Attorneys:</strong> Be in good standing with your state bar</li>
    </ul>
  </section>

  <section>
    <h2 id="user-accounts-and-credentials">4. User Accounts and Credentials</h2>
    <p>
      You are responsible for maintaining the confidentiality of your account credentials and for all activities occurring under your account. You agree to:
    </p>
    <ul>
      <li>Provide accurate, complete, and truthful information during registration</li>
      <li>Update your information promptly if changes occur</li>
      <li>Notify us immediately of any unauthorized access or use</li>
      <li>Not share your account with anyone else</li>
      <li>Comply with all applicable laws in your jurisdiction</li>
    </ul>
  </section>

  <section>
    <h2 id="client-responsibilities">5. Client Responsibilities</h2>
    <p>
      As a client, you agree to:
    </p>
    <ul>
      <li>Provide complete and honest information about your legal matter</li>
      <li>Pay all agreed-upon fees in a timely manner</li>
      <li>Communicate professionally with matched attorneys</li>
      <li>Comply with all instructions from your attorney</li>
      <li>Not engage in illegal activity or fraud</li>
      <li>Not misuse confidential information shared by attorneys</li>
    </ul>
  </section>

  <section>
    <h2 id="attorney-responsibilities">6. Attorney Responsibilities</h2>
    <p>
      As an attorney on our Platform, you agree to:
    </p>
    <ul>
      <li>Maintain current and accurate licensing information</li>
      <li>Conduct conflict-of-interest checks before accepting referrals</li>
      <li>Comply with all Rules of Professional Conduct in your jurisdiction</li>
      <li>Provide competent, ethical legal representation</li>
      <li>Maintain client confidentiality and attorney-client privilege</li>
      <li>Pay Legal Connect referral fees as agreed</li>
      <li>Respond to client referrals within the specified timeframe</li>
    </ul>
  </section>

  <section>
    <h2 id="fees-and-payment">7. Fees and Payment</h2>
    <p>
      <strong>For Clients:</strong> You agree to pay attorney fees and any platform fees as mutually agreed. Fees are processed securely through our payment partner. You are responsible for any applicable taxes.
    </p>
    <p>
      <strong>For Attorneys:</strong> You agree to pay Legal Connect a referral fee on successfully completed engagements. Fee structure and payment terms are outlined in your service agreement.
    </p>
  </section>

  <section>
    <h2 id="conflict-of-interest-screening">8. Conflict of Interest Screening</h2>
    <p>
      Legal Connect employs automated systems to screen for conflicts of interest. However, you acknowledge that:
    </p>
    <ul>
      <li>Our system relies on party names and information provided by clients</li>
      <li>It is ultimately the attorney's responsibility to conduct independent conflict checks</li>
      <li>We do not guarantee 100% conflict detection</li>
      <li>Attorneys must review all information before accepting a referral</li>
    </ul>
  </section>

  <section>
    <h2 id="intellectual-property-rights">9. Intellectual Property Rights</h2>
    <p>
      All content, features, and functionality of Legal Connect (including software, text, graphics, logos) are owned by Legal Connect, its licensors, or service providers and are protected by copyright and other intellectual property laws. You may not reproduce, distribute, or transmit any content without our prior written permission.
    </p>
  </section>

  <section>
    <h2 id="user-generated-content">10. User-Generated Content</h2>
    <p>
      You retain ownership of any content you submit (documents, messages, case information). By submitting content, you grant Legal Connect a non-exclusive, royalty-free license to use, copy, modify, and display that content as necessary to provide the Platform's services. Your content may be encrypted and stored securely.
    </p>
  </section>

  <section>
    <h2 id="limitation-of-liability">11. Limitation of Liability</h2>
    <p>
      TO THE FULLEST EXTENT PERMITTED BY LAW:
    </p>
    <ul>
      <li>Legal Connect is provided "as-is" without warranties of any kind</li>
      <li>We are not liable for indirect, incidental, special, or consequential damages</li>
      <li>Our liability is limited to the amount you paid in the past 12 months</li>
      <li>We are not responsible for attorney misconduct or professional negligence</li>
      <li>We are not responsible for outcomes of legal representation</li>
    </ul>
    <p>
      Nothing in these Terms limits liability for gross negligence, willful misconduct, or fraud.
    </p>
  </section>

  <section>
    <h2 id="indemnification">12. Indemnification</h2>
    <p>
      You agree to indemnify and hold harmless Legal Connect, its officers, employees, and agents from any claims, damages, or costs arising from: (1) your use of the Platform, (2) your violation of these Terms, (3) your violation of applicable law, or (4) your infringement of any third-party rights.
    </p>
  </section>

  <section>
    <h2 id="termination">13. Termination</h2>
    <p>
      We may terminate or suspend your account if you violate these Terms, engage in fraud, or for other legitimate business reasons. Upon termination, your right to use the Platform ceases immediately. We will provide notice where possible, except in cases of urgent security concerns.
    </p>
  </section>

  <section>
    <h2 id="dispute-resolution-and-governing-law">14. Dispute Resolution and Governing Law</h2>
    <p>
      These Terms are governed by the laws of the State of Florida, without regard to conflicts of law principles. Any disputes arising from these Terms or your use of the Platform shall be:
    </p>
    <ul>
      <li>First subject to informal resolution attempts</li>
      <li>Then subject to binding arbitration in Miami, Florida</li>
      <li>Governed by the rules of JAMS (Judicial Arbitration and Mediation Services)</li>
    </ul>
    <p>
      You waive the right to a jury trial and class action lawsuit. However, you retain the right to pursue claims in small claims court if eligible.
    </p>
  </section>

  <section>
    <h2 id="compliance-with-laws">15. Compliance with Laws</h2>
    <p>
      Legal Connect complies with all applicable laws, including:
    </p>
    <ul>
      <li>State bar regulations and ethics rules</li>
      <li>Data protection laws (GDPR, CCPA, LGPD, etc.)</li>
      <li>Consumer protection laws</li>
      <li>Anti-money laundering and sanctions regulations</li>
      <li>Export control and tariff regulations</li>
    </ul>
  </section>

  <section>
    <h2 id="contact-information">16. Contact Information</h2>
    <p>
      For questions about these Terms, please contact:
    </p>
    <div className="card mt-4 p-6 [&>p]:mt-2">
      <p><strong>Legal Connect, Inc.</strong></p>
      <p>Florida, USA</p>
      <p><strong>Email:</strong> legal@legalconnect.com</p>
      <p><strong>Website:</strong> www.legalconnect.com</p>
    </div>
  </section>

      <p className="mt-16 border-t border-hairline pt-6 text-sm text-mute">© 2025 Legal Connect, Inc. All rights reserved.</p>
    </LegalLayout>
  );
}
