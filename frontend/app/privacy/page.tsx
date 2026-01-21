export default function PrivacyPage(): React.ReactNode {
  return (
    <div className="min-h-screen bg-white text-lctextprimary">
      <header className="border-b border-lcborder">
        <div className="site-container py-6">
          <nav className="flex items-center justify-between">
            <a href="/" className="inline-flex items-center gap-2 font-bold text-2xl hover:opacity-80 transition">
              <img src="/logo.png" alt="Legal Connect" className="h-8 w-8" />
              <span>Legal Connect</span>
            </a>
            <a href="/" className="text-lctextsecondary hover:text-lctextprimary transition">? Back</a>
          </nav>
        </div>
      </header>

      <main className="site-container py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-lg text-lctextsecondary mb-12">Last Updated: December 2025</p>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">Introduction</h2>
            <p className="text-lctextsecondary leading-relaxed mb-4">
              This Global Privacy Policy (the "Policy") describes how Legal Connect ("Company," "we," "our," or "us") collects, uses, discloses, and safeguards personal information across all current and future websites, subdomains, and online services (collectively, the "Services"). This Policy sets a global standard for privacy compliance and data protection in accordance with the highest international legal frameworks, including but not limited to the General Data Protection Regulation (EU) 2016/679 ("GDPR"), the California Consumer Privacy Act and Privacy Rights Act (CCPA/CPRA), the Virginia Consumer Data Protection Act (VCDPA), the Canadian Personal Information Protection and Electronic Documents Act (PIPEDA), and the Brazilian General Data Protection Law (LGPD). It applies to all users regardless of geographic location.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">1. Scope and Applicability</h2>
            <p className="text-lctextsecondary leading-relaxed">
              This Policy applies to all visitors, customers, and users of our Services, and to all data collected online or offline through any form of interaction. By using our Services, you consent to the practices described herein.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">2. Information We Collect</h2>
            <p className="text-lctextsecondary leading-relaxed mb-4">
              We collect personal data directly and automatically, including:
            </p>
            <ul className="space-y-2 text-lctextsecondary ml-6 mb-4">
              <li><strong>Identifiers:</strong> Name, email, phone number, address, bar number (for attorneys)</li>
              <li><strong>Commercial Data:</strong> Transactions, consultations, payment methods, billing information</li>
              <li><strong>Biometric and Health Data:</strong> Where applicable and with explicit consent</li>
              <li><strong>Geolocation:</strong> Jurisdiction and practice area information</li>
              <li><strong>Internet Activity:</strong> Browsing history, IP address, device identifiers</li>
              <li><strong>Behavioral Analytics:</strong> User interactions, preferences, platform usage patterns</li>
              <li><strong>Professional Data:</strong> For attorneys - bar admissions, experience, practice areas, conflict of interest information</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">3. Automated and AI-Based Processing</h2>
            <p className="text-lctextsecondary leading-relaxed">
              We utilize Artificial Intelligence and Machine Learning ("AI/ML") technologies to analyze behavioral data, enhance service personalization, perform automated conflict screening, detect fraud, and improve user experience. Automated decision-making may influence attorney-client matching recommendations or fraud prevention mechanisms, never without appropriate human oversight and legal safeguards. All automated conflict checks include transparent logging and human review capabilities.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">4. How We Use Information</h2>
            <p className="text-lctextsecondary leading-relaxed mb-4">
              We process data for legitimate business purposes:
            </p>
            <ul className="space-y-2 text-lctextsecondary ml-6">
              <li>Service delivery and client-attorney matching</li>
              <li>Account management and user authentication</li>
              <li>Communication and customer support</li>
              <li>Legal compliance and regulatory obligations</li>
              <li>Analytics and platform improvement</li>
              <li>Marketing (with opt-in consent)</li>
              <li>Conflict of interest screening and verification</li>
              <li>Platform security and fraud prevention</li>
            </ul>
            <p className="text-lctextsecondary leading-relaxed mt-4">
              Processing is always grounded in a lawful basis under applicable law.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">5. Disclosure and Data Sharing</h2>
            <p className="text-lctextsecondary leading-relaxed mb-4">
              We do not sell personal data. We share information only with:
            </p>
            <ul className="space-y-2 text-lctextsecondary ml-6 mb-4">
              <li>Trusted service providers and payment processors</li>
              <li>Affiliated entities (with equivalent privacy obligations)</li>
              <li>Analytics and security vendors</li>
              <li>Legal authorities when required by law or valid legal process</li>
            </ul>
            <p className="text-lctextsecondary leading-relaxed">
              Each third-party partner is contractually obligated to maintain equivalent data protection standards and use data only for specified purposes.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">6. International Data Transfers</h2>
            <p className="text-lctextsecondary leading-relaxed">
              Data may be processed and stored in the United States and other jurisdictions. All transfers comply with GDPR Chapter V and equivalent safeguards through Standard Contractual Clauses, adequacy decisions, or binding corporate rules. For users in the EU or other regions with transfer restrictions, we employ Privacy Shield frameworks and additional safeguards where applicable.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">7. Data Retention</h2>
            <p className="text-lctextsecondary leading-relaxed">
              Personal data is retained only for as long as necessary to fulfill the purposes for which it was collected or as required by law. For clients: data is retained for the duration of legal representation plus applicable statute of limitations periods. For attorneys: profile data is retained while the account is active, with inactive accounts reviewed annually. Retention schedules are periodically reviewed for compliance and data minimization.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">8. Children's Privacy</h2>
            <p className="text-lctextsecondary leading-relaxed">
              We comply with the Children's Online Privacy Protection Act (COPPA) and do not knowingly collect data from children under 13 years old (or 16 in applicable jurisdictions) without verifiable parental consent. Our Services are intended for adults seeking or providing legal services. Parents may contact us to review or delete their child's data at any time using the contact information below.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">9. Your Rights</h2>
            <p className="text-lctextsecondary leading-relaxed mb-4">
              Depending on your jurisdiction, you may have the right to:
            </p>
            <ul className="space-y-2 text-lctextsecondary ml-6 mb-4">
              <li><strong>Access:</strong> Obtain a copy of your personal data in a commonly used format</li>
              <li><strong>Correct:</strong> Update or correct inaccurate information</li>
              <li><strong>Delete:</strong> Request deletion ("right to be forgotten")</li>
              <li><strong>Restrict:</strong> Limit how your data is processed</li>
              <li><strong>Object:</strong> Opt-out of specific processing activities</li>
              <li><strong>Port:</strong> Receive your data in a portable format</li>
              <li><strong>Withdraw Consent:</strong> Withdraw previously granted consent at any time</li>
            </ul>
            <p className="text-lctextsecondary leading-relaxed">
              Requests can be submitted using the contact information below. We will respond within 30 days (or as required by applicable law).
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">10. Security and Safeguards</h2>
            <p className="text-lctextsecondary leading-relaxed">
              We employ administrative, technical, and physical safeguards that meet or exceed industry standards, including:
            </p>
            <ul className="space-y-2 text-lctextsecondary ml-6 mb-4">
              <li>End-to-end encryption for communications and sensitive data</li>
              <li>Pseudonymization and data minimization techniques</li>
              <li>Role-based access controls and least-privilege principles</li>
              <li>Multi-factor authentication for user accounts</li>
              <li>Continuous security monitoring and threat detection</li>
              <li>Regular security audits and penetration testing</li>
              <li>Employee training and confidentiality agreements</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">11. Cookies and Tracking Technologies</h2>
            <p className="text-lctextsecondary leading-relaxed">
              We use cookies, web beacons, and similar technologies for site functionality, analytics, and marketing. Users can control cookie preferences via browser settings or our Cookie Management Tool. See our separate Cookie Policy for detailed information.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">12. Cross-Border Compliance</h2>
            <p className="text-lctextsecondary leading-relaxed">
              This Policy incorporates global privacy principles such as lawfulness, fairness, transparency, purpose limitation, data minimization, accuracy, integrity, and accountability. These principles apply uniformly across all operations, subsidiaries, and service providers worldwide.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">13. Data Protection Officer and Contact</h2>
            <p className="text-lctextsecondary leading-relaxed mb-4">
              We maintain a designated Data Protection Officer ("DPO") to oversee compliance and handle data protection inquiries. Users may exercise their rights or submit complaints via:
            </p>
            <div className="bg-blue-50 border border-lcborder rounded-lg p-6 text-lctextsecondary">
              <p className="mb-2"><strong>Email:</strong> privacy@legalconnect.com</p>
              <p className="mb-2"><strong>Phone:</strong> 207-947-1999</p>
              <p className="mb-2"><strong>Mail:</strong> Legal Connect, Inc.<br />Data Protection Officer<br />PO Box 52,<br />Detroit, ME 04929</p>
              <p><strong>Response Time:</strong> 30 days or as required by law</p>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">14. Updates to This Policy</h2>
            <p className="text-lctextsecondary leading-relaxed">
              We may update this Policy to reflect legal, technical, or business developments. The latest version will always be available on our website, with a new 'Last Updated' date. Continued use of our Services constitutes acceptance of any modifications. For material changes, we will provide prominent notice or seek your consent.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">15. California Privacy Rights (CCPA/CPRA)</h2>
            <p className="text-lctextsecondary leading-relaxed mb-4">
              California residents have specific rights under the CCPA and CPRA, including the right to know, delete, and opt-out. We do not sell personal information as defined by the CCPA. You may opt-out of any future sales by contacting us at privacy@legalconnect.com.
            </p>
          </section>

          <div className="mt-16 pt-8 border-t border-lcborder text-center text-lctextsecondary text-sm">
            <p>&copy; 2025 Legal Connect, Inc. All rights reserved.</p>
          </div>
        </div>
      </main>
    </div>
  );
}




