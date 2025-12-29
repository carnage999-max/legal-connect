export default function TermsPage(): React.ReactNode {
  return (
    <div className="min-h-screen bg-white text-lctextprimary">
      <header className="border-b border-lcborder">
        <div className="site-container py-6">
          <nav className="flex items-center justify-between">
            <a href="/" className="font-bold text-2xl">Legal Connect</a>
            <a href="/" className="text-lctextsecondary hover:text-lctextprimary transition">← Back</a>
          </nav>
        </div>
      </header>

      <main className="site-container py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-lg text-lctextsecondary mb-12">Last Updated: December 2025</p>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-lctextsecondary leading-relaxed">
              By accessing and using Legal Connect (the "Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Platform. We reserve the right to modify these Terms at any time, and your continued use constitutes acceptance of any changes.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">2. Description of Service</h2>
            <p className="text-lctextsecondary leading-relaxed mb-4">
              Legal Connect is a digital platform that:
            </p>
            <ul className="space-y-2 text-lctextsecondary ml-6">
              <li>Allows clients to describe their legal matters through guided intake forms</li>
              <li>Performs automated conflict-of-interest screening</li>
              <li>Matches clients with qualified, available attorneys in their jurisdiction</li>
              <li>Facilitates secure messaging and document exchange between clients and attorneys</li>
              <li>Provides payment processing and billing services</li>
            </ul>
            <p className="text-lctextsecondary leading-relaxed mt-4">
              <strong>Important Disclaimer:</strong> Legal Connect is not a law firm and does not provide legal advice. We are a technology platform connecting clients with independent licensed attorneys. Any legal advice or representation is provided by the matched attorney, not by Legal Connect.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">3. User Eligibility</h2>
            <p className="text-lctextsecondary leading-relaxed mb-4">
              To use Legal Connect, you must:
            </p>
            <ul className="space-y-2 text-lctextsecondary ml-6">
              <li>Be at least 18 years old (or 21 in certain jurisdictions)</li>
              <li>Have the authority to enter into a legally binding agreement</li>
              <li>Not be prohibited from using the Platform by applicable law</li>
              <li><strong>For Attorneys:</strong> Hold an active license to practice law in the United States or applicable jurisdiction</li>
              <li><strong>For Attorneys:</strong> Be in good standing with your state bar</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">4. User Accounts and Credentials</h2>
            <p className="text-lctextsecondary leading-relaxed mb-4">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities occurring under your account. You agree to:
            </p>
            <ul className="space-y-2 text-lctextsecondary ml-6">
              <li>Provide accurate, complete, and truthful information during registration</li>
              <li>Update your information promptly if changes occur</li>
              <li>Notify us immediately of any unauthorized access or use</li>
              <li>Not share your account with anyone else</li>
              <li>Comply with all applicable laws in your jurisdiction</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">5. Client Responsibilities</h2>
            <p className="text-lctextsecondary leading-relaxed mb-4">
              As a client, you agree to:
            </p>
            <ul className="space-y-2 text-lctextsecondary ml-6">
              <li>Provide complete and honest information about your legal matter</li>
              <li>Pay all agreed-upon fees in a timely manner</li>
              <li>Communicate professionally with matched attorneys</li>
              <li>Comply with all instructions from your attorney</li>
              <li>Not engage in illegal activity or fraud</li>
              <li>Not misuse confidential information shared by attorneys</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">6. Attorney Responsibilities</h2>
            <p className="text-lctextsecondary leading-relaxed mb-4">
              As an attorney on our Platform, you agree to:
            </p>
            <ul className="space-y-2 text-lctextsecondary ml-6">
              <li>Maintain current and accurate licensing information</li>
              <li>Conduct conflict-of-interest checks before accepting referrals</li>
              <li>Comply with all Rules of Professional Conduct in your jurisdiction</li>
              <li>Provide competent, ethical legal representation</li>
              <li>Maintain client confidentiality and attorney-client privilege</li>
              <li>Pay Legal Connect referral fees as agreed</li>
              <li>Respond to client referrals within the specified timeframe</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">7. Fees and Payment</h2>
            <p className="text-lctextsecondary leading-relaxed mb-4">
              <strong>For Clients:</strong> You agree to pay attorney fees and any platform fees as mutually agreed. Fees are processed securely through our payment partner. You are responsible for any applicable taxes.
            </p>
            <p className="text-lctextsecondary leading-relaxed">
              <strong>For Attorneys:</strong> You agree to pay Legal Connect a referral fee on successfully completed engagements. Fee structure and payment terms are outlined in your service agreement.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">8. Conflict of Interest Screening</h2>
            <p className="text-lctextsecondary leading-relaxed">
              Legal Connect employs automated systems to screen for conflicts of interest. However, you acknowledge that:
            </p>
            <ul className="space-y-2 text-lctextsecondary ml-6 mb-4">
              <li>Our system relies on party names and information provided by clients</li>
              <li>It is ultimately the attorney's responsibility to conduct independent conflict checks</li>
              <li>We do not guarantee 100% conflict detection</li>
              <li>Attorneys must review all information before accepting a referral</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">9. Intellectual Property Rights</h2>
            <p className="text-lctextsecondary leading-relaxed">
              All content, features, and functionality of Legal Connect (including software, text, graphics, logos) are owned by Legal Connect, its licensors, or service providers and are protected by copyright and other intellectual property laws. You may not reproduce, distribute, or transmit any content without our prior written permission.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">10. User-Generated Content</h2>
            <p className="text-lctextsecondary leading-relaxed">
              You retain ownership of any content you submit (documents, messages, case information). By submitting content, you grant Legal Connect a non-exclusive, royalty-free license to use, copy, modify, and display that content as necessary to provide the Platform's services. Your content may be encrypted and stored securely.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">11. Limitation of Liability</h2>
            <p className="text-lctextsecondary leading-relaxed mb-4">
              TO THE FULLEST EXTENT PERMITTED BY LAW:
            </p>
            <ul className="space-y-2 text-lctextsecondary ml-6 mb-4">
              <li>Legal Connect is provided "as-is" without warranties of any kind</li>
              <li>We are not liable for indirect, incidental, special, or consequential damages</li>
              <li>Our liability is limited to the amount you paid in the past 12 months</li>
              <li>We are not responsible for attorney misconduct or professional negligence</li>
              <li>We are not responsible for outcomes of legal representation</li>
            </ul>
            <p className="text-lctextsecondary leading-relaxed">
              Nothing in these Terms limits liability for gross negligence, willful misconduct, or fraud.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">12. Indemnification</h2>
            <p className="text-lctextsecondary leading-relaxed">
              You agree to indemnify and hold harmless Legal Connect, its officers, employees, and agents from any claims, damages, or costs arising from: (1) your use of the Platform, (2) your violation of these Terms, (3) your violation of applicable law, or (4) your infringement of any third-party rights.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">13. Termination</h2>
            <p className="text-lctextsecondary leading-relaxed">
              We may terminate or suspend your account if you violate these Terms, engage in fraud, or for other legitimate business reasons. Upon termination, your right to use the Platform ceases immediately. We will provide notice where possible, except in cases of urgent security concerns.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">14. Dispute Resolution and Governing Law</h2>
            <p className="text-lctextsecondary leading-relaxed mb-4">
              These Terms are governed by the laws of the State of Florida, without regard to conflicts of law principles. Any disputes arising from these Terms or your use of the Platform shall be:
            </p>
            <ul className="space-y-2 text-lctextsecondary ml-6 mb-4">
              <li>First subject to informal resolution attempts</li>
              <li>Then subject to binding arbitration in Miami, Florida</li>
              <li>Governed by the rules of JAMS (Judicial Arbitration and Mediation Services)</li>
            </ul>
            <p className="text-lctextsecondary leading-relaxed">
              You waive the right to a jury trial and class action lawsuit. However, you retain the right to pursue claims in small claims court if eligible.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">15. Compliance with Laws</h2>
            <p className="text-lctextsecondary leading-relaxed">
              Legal Connect complies with all applicable laws, including:
            </p>
            <ul className="space-y-2 text-lctextsecondary ml-6 mb-4">
              <li>State bar regulations and ethics rules</li>
              <li>Data protection laws (GDPR, CCPA, LGPD, etc.)</li>
              <li>Consumer protection laws</li>
              <li>Anti-money laundering and sanctions regulations</li>
              <li>Export control and tariff regulations</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">16. Contact Information</h2>
            <p className="text-lctextsecondary leading-relaxed mb-4">
              For questions about these Terms, please contact:
            </p>
            <div className="bg-blue-50 border border-lcborder rounded-lg p-6 text-lctextsecondary">
              <p className="mb-2"><strong>Legal Connect, Inc.</strong></p>
              <p className="mb-2">Florida, USA</p>
              <p className="mb-2"><strong>Email:</strong> legal@legalconnect.com</p>
              <p><strong>Website:</strong> www.legalconnect.com</p>
            </div>
          </section>

          <div className="mt-16 pt-8 border-t border-lcborder text-center text-lctextsecondary text-sm">
            <p>© 2025 Legal Connect, Inc. All rights reserved.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
