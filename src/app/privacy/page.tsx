import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | PayPilot',
  description: 'PayPilot Privacy Policy - Learn how we collect, use, and protect your personal information.',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to PayPilot</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="text-sm text-slate-600 hover:text-slate-900">
              Terms of Service
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
          <p className="text-slate-500">Last updated: February 15, 2026</p>
        </div>

        <div className="prose prose-slate max-w-none prose-headings:scroll-mt-20">
          {/* Table of Contents */}
          <nav className="bg-slate-50 rounded-lg p-6 mb-10 not-prose">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Table of Contents</h2>
            <ol className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <li><a href="#introduction" className="text-primary hover:underline">1. Introduction</a></li>
              <li><a href="#information-we-collect" className="text-primary hover:underline">2. Information We Collect</a></li>
              <li><a href="#how-we-use" className="text-primary hover:underline">3. How We Use Your Information</a></li>
              <li><a href="#sharing" className="text-primary hover:underline">4. Information Sharing and Disclosure</a></li>
              <li><a href="#data-retention" className="text-primary hover:underline">5. Data Retention</a></li>
              <li><a href="#security" className="text-primary hover:underline">6. Data Security</a></li>
              <li><a href="#cookies" className="text-primary hover:underline">7. Cookies and Tracking Technologies</a></li>
              <li><a href="#your-rights" className="text-primary hover:underline">8. Your Rights and Choices</a></li>
              <li><a href="#international" className="text-primary hover:underline">9. International Data Transfers</a></li>
              <li><a href="#children" className="text-primary hover:underline">10. Children&apos;s Privacy</a></li>
              <li><a href="#third-party" className="text-primary hover:underline">11. Third-Party Links and Services</a></li>
              <li><a href="#california" className="text-primary hover:underline">12. California Privacy Rights</a></li>
              <li><a href="#european" className="text-primary hover:underline">13. European Privacy Rights</a></li>
              <li><a href="#changes" className="text-primary hover:underline">14. Changes to This Policy</a></li>
              <li><a href="#contact" className="text-primary hover:underline">15. Contact Information</a></li>
            </ol>
          </nav>

          <p className="lead">
            At PayPilot, Inc. (&quot;PayPilot,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy describes how we collect, use, disclose, and safeguard information when you use our cloud-based human resources and payroll management platform (the &quot;Service&quot;), visit our website at paypilot.com (the &quot;Website&quot;), or interact with us in other ways.
          </p>

          <p>
            By accessing or using our Service, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with our policies and practices, please do not use our Service. This Privacy Policy may change from time to time, and your continued use of the Service after we make changes is deemed acceptance of those changes.
          </p>

          <h2 id="introduction">1. Introduction</h2>

          <h3>1.1 Scope of This Policy</h3>
          <p>
            This Privacy Policy applies to all information collected through our Service, Website, mobile applications, and any related services, sales, marketing, or events (collectively, the &quot;Services&quot;). It also applies to information we collect offline or through any other means, including on any other website operated by us or any third party, that links to this Privacy Policy.
          </p>

          <h3>1.2 Data Controller Information</h3>
          <p>
            PayPilot, Inc. is the data controller responsible for your personal information. We are headquartered at 548 Market Street, Suite 35000, San Francisco, CA 94104, United States. For questions about this Privacy Policy or our data practices, please contact our Data Protection Officer at privacy@paypilot.com.
          </p>

          <h3>1.3 Definitions</h3>
          <ul>
            <li><strong>&quot;Personal Information&quot;</strong> means any information that identifies, relates to, describes, is capable of being associated with, or could reasonably be linked, directly or indirectly, with a particular individual or household.</li>
            <li><strong>&quot;Customer Data&quot;</strong> means personal information that our customers upload, submit, or otherwise provide to the Service regarding their employees, contractors, or other individuals.</li>
            <li><strong>&quot;Usage Data&quot;</strong> means information collected automatically when using the Service, such as IP addresses, browser type, pages visited, and time spent on pages.</li>
            <li><strong>&quot;Processing&quot;</strong> means any operation performed on personal information, including collection, recording, organization, storage, adaptation, retrieval, consultation, use, disclosure, erasure, or destruction.</li>
          </ul>

          <h2 id="information-we-collect">2. Information We Collect</h2>

          <h3>2.1 Information You Provide to Us</h3>
          <p>We collect information you provide directly to us, including:</p>

          <h4>Account Information</h4>
          <ul>
            <li>Name, email address, phone number, and postal address</li>
            <li>Company name, job title, and department</li>
            <li>Username, password, and account preferences</li>
            <li>Profile photo and biographical information</li>
            <li>Payment and billing information (credit card numbers, billing address)</li>
          </ul>

          <h4>Customer Data (Employee Information)</h4>
          <p>When you use our Service to manage your workforce, you may provide us with information about your employees, including:</p>
          <ul>
            <li>Full legal name, date of birth, and Social Security Number or tax identification number</li>
            <li>Home address, phone number, and personal email address</li>
            <li>Employment information (hire date, job title, department, salary, employment status)</li>
            <li>Banking information for direct deposit (bank name, routing number, account number)</li>
            <li>Tax withholding information (W-4 elections, state tax forms)</li>
            <li>Benefits enrollment information (health insurance selections, 401(k) contributions)</li>
            <li>Time and attendance records (clock-in/out times, PTO requests, leave balances)</li>
            <li>Emergency contact information</li>
            <li>Immigration and work authorization status (I-9 information)</li>
            <li>Performance review and compensation history</li>
          </ul>

          <h4>Communications</h4>
          <ul>
            <li>Information you provide when you contact us for support</li>
            <li>Survey responses and feedback</li>
            <li>Content of messages sent through the Service</li>
          </ul>

          <h3>2.2 Information We Collect Automatically</h3>
          <p>When you access or use our Service, we automatically collect certain information, including:</p>

          <h4>Device and Connection Information</h4>
          <ul>
            <li>IP address, browser type and version, and operating system</li>
            <li>Device identifiers and hardware information</li>
            <li>Mobile network information and device settings</li>
            <li>Time zone setting and geographic location (country, region, city)</li>
          </ul>

          <h4>Usage Information</h4>
          <ul>
            <li>Pages viewed, features used, and actions taken within the Service</li>
            <li>Date and time of access, session duration, and navigation paths</li>
            <li>Search queries and filters applied</li>
            <li>Error logs and performance data</li>
            <li>Referring website addresses and exit pages</li>
          </ul>

          <h4>Cookies and Similar Technologies</h4>
          <ul>
            <li>Session cookies, persistent cookies, and flash cookies</li>
            <li>Pixel tags, web beacons, and clear GIFs</li>
            <li>Local storage and similar technologies</li>
          </ul>

          <h3>2.3 Information from Third Parties</h3>
          <p>We may receive information about you from third parties, including:</p>
          <ul>
            <li>Identity verification services to confirm your identity</li>
            <li>Background check providers (with your consent)</li>
            <li>Credit reporting agencies for business verification</li>
            <li>Social media platforms if you choose to link your account</li>
            <li>Business partners and integration providers</li>
            <li>Publicly available sources such as public records and directories</li>
          </ul>

          <h2 id="how-we-use">3. How We Use Your Information</h2>

          <h3>3.1 Providing and Improving Our Service</h3>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Create and manage your account</li>
            <li>Process payroll, calculate taxes, and generate pay stubs</li>
            <li>Administer employee benefits and manage enrollments</li>
            <li>Track time and attendance and manage PTO</li>
            <li>Generate reports and analytics for your organization</li>
            <li>Provide customer support and respond to inquiries</li>
            <li>Improve, personalize, and expand our Service</li>
            <li>Develop new products, services, and features</li>
            <li>Monitor and analyze usage patterns and trends</li>
          </ul>

          <h3>3.2 Communications</h3>
          <p>We may use your information to:</p>
          <ul>
            <li>Send transactional messages (payroll confirmations, password resets, account notifications)</li>
            <li>Provide customer support and respond to your requests</li>
            <li>Send marketing communications (with your consent where required)</li>
            <li>Notify you about changes to our Service or policies</li>
            <li>Send product updates, tips, and best practices</li>
          </ul>

          <h3>3.3 Legal and Compliance</h3>
          <p>We may use your information to:</p>
          <ul>
            <li>Comply with applicable laws, regulations, and legal processes</li>
            <li>File required tax forms and reports with government agencies</li>
            <li>Respond to lawful requests from public authorities</li>
            <li>Enforce our Terms of Service and other agreements</li>
            <li>Protect our rights, privacy, safety, or property</li>
            <li>Detect, prevent, or address fraud, security, or technical issues</li>
          </ul>

          <h3>3.4 Legal Basis for Processing (EEA/UK Users)</h3>
          <p>If you are located in the European Economic Area or United Kingdom, our legal basis for collecting and using personal information depends on the specific information and context:</p>
          <ul>
            <li><strong>Contract Performance:</strong> Processing necessary to provide the Service you requested</li>
            <li><strong>Legitimate Interests:</strong> Processing for our legitimate business interests, such as improving our Service, marketing, and fraud prevention</li>
            <li><strong>Legal Obligation:</strong> Processing necessary to comply with applicable laws</li>
            <li><strong>Consent:</strong> Processing based on your explicit consent, which you may withdraw at any time</li>
          </ul>

          <h2 id="sharing">4. Information Sharing and Disclosure</h2>

          <h3>4.1 Service Providers</h3>
          <p>
            We share information with third-party service providers who perform services on our behalf, such as payment processing, data hosting, customer support, email delivery, analytics, and marketing. These providers are contractually obligated to protect your information and may only use it for the purposes we specify.
          </p>

          <h3>4.2 Business Transfers</h3>
          <p>
            If PayPilot is involved in a merger, acquisition, financing, reorganization, bankruptcy, or sale of company assets, your information may be transferred as part of that transaction. We will notify you of any change in ownership or uses of your personal information.
          </p>

          <h3>4.3 Legal Requirements</h3>
          <p>We may disclose your information if required to do so by law or in response to valid requests by public authorities, including:</p>
          <ul>
            <li>Compliance with a legal obligation, court order, or governmental request</li>
            <li>Protection and defense of our rights or property</li>
            <li>Prevention or investigation of possible wrongdoing</li>
            <li>Protection of the personal safety of users or the public</li>
            <li>Protection against legal liability</li>
          </ul>

          <h3>4.4 Government Agencies</h3>
          <p>
            As part of payroll processing, we transmit required information to government agencies, including the Internal Revenue Service (IRS), Social Security Administration (SSA), state tax agencies, and other regulatory bodies as required by law.
          </p>

          <h3>4.5 Third-Party Integrations</h3>
          <p>
            If you choose to connect third-party services to PayPilot (such as accounting software, benefits providers, or time tracking systems), we may share information with those services as necessary to enable the integration. Your use of third-party services is subject to their privacy policies.
          </p>

          <h3>4.6 With Your Consent</h3>
          <p>
            We may share your information with third parties when you give us explicit consent to do so.
          </p>

          <h3>4.7 Aggregated or De-identified Data</h3>
          <p>
            We may share aggregated or de-identified information that cannot reasonably be used to identify you for research, analytics, benchmarking, or other purposes.
          </p>

          <h2 id="data-retention">5. Data Retention</h2>

          <h3>5.1 Retention Periods</h3>
          <p>
            We retain personal information for as long as necessary to fulfill the purposes for which it was collected, including to satisfy legal, accounting, or reporting requirements. The retention period may vary depending on the context of our relationship with you and the type of information:
          </p>
          <ul>
            <li><strong>Account Information:</strong> Retained for the duration of your account plus 7 years</li>
            <li><strong>Payroll Records:</strong> Retained for 7 years after the end of employment, as required by tax laws</li>
            <li><strong>Tax Documents:</strong> Retained for 7 years or longer as required by applicable tax regulations</li>
            <li><strong>Employment Records:</strong> Retained for 7 years after termination of employment</li>
            <li><strong>Benefits Records:</strong> Retained for 6 years after the plan year ends</li>
            <li><strong>Usage Data:</strong> Retained for 3 years</li>
            <li><strong>Marketing Data:</strong> Retained until you unsubscribe or request deletion</li>
          </ul>

          <h3>5.2 Deletion</h3>
          <p>
            When personal information is no longer needed for the purposes for which it was collected, we will securely delete or anonymize it. If deletion is not possible (for example, because the information has been stored in backup archives), we will securely store the information and isolate it from further processing until deletion is possible.
          </p>

          <h2 id="security">6. Data Security</h2>

          <h3>6.1 Security Measures</h3>
          <p>
            We implement appropriate technical and organizational measures to protect personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
          </p>
          <ul>
            <li><strong>Encryption:</strong> All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption</li>
            <li><strong>Access Controls:</strong> Role-based access controls and multi-factor authentication</li>
            <li><strong>Network Security:</strong> Firewalls, intrusion detection systems, and regular security monitoring</li>
            <li><strong>Physical Security:</strong> Data centers with 24/7 security, biometric access controls, and environmental protections</li>
            <li><strong>Employee Training:</strong> Regular security awareness training for all employees</li>
            <li><strong>Vendor Management:</strong> Security assessments of all third-party service providers</li>
            <li><strong>Incident Response:</strong> Documented procedures for responding to security incidents</li>
            <li><strong>Regular Audits:</strong> Annual SOC 2 Type II audits and penetration testing</li>
          </ul>

          <h3>6.2 Your Responsibilities</h3>
          <p>
            While we take extensive measures to protect your information, you also play a role in maintaining security. We encourage you to use strong, unique passwords, enable multi-factor authentication, keep your login credentials confidential, and promptly report any suspected unauthorized access to your account.
          </p>

          <h3>6.3 Breach Notification</h3>
          <p>
            In the event of a security breach that affects your personal information, we will notify you and relevant authorities as required by applicable law. We will provide information about the breach, the information affected, steps we are taking to address the breach, and recommendations for protecting yourself.
          </p>

          <h2 id="cookies">7. Cookies and Tracking Technologies</h2>

          <h3>7.1 Types of Cookies We Use</h3>

          <h4>Strictly Necessary Cookies</h4>
          <p>
            These cookies are essential for the operation of our Service. They enable core functionality such as security, network management, and account access. You cannot opt out of these cookies.
          </p>

          <h4>Functionality Cookies</h4>
          <p>
            These cookies allow us to remember choices you make and provide enhanced, personalized features. They may be set by us or by third-party providers whose services we have added to our pages.
          </p>

          <h4>Analytics Cookies</h4>
          <p>
            These cookies collect information about how visitors use our Service, including which pages are visited most often and whether users receive error messages. We use this information to improve our Service and user experience.
          </p>

          <h4>Marketing Cookies</h4>
          <p>
            These cookies are used to track visitors across websites to display relevant advertisements. They may be set by us or by advertising partners.
          </p>

          <h3>7.2 Managing Cookies</h3>
          <p>
            Most web browsers are set to accept cookies by default. You can usually modify your browser settings to decline cookies if you prefer. However, if you choose to decline cookies, some features of our Service may not function properly. You can also manage your cookie preferences through our cookie consent banner.
          </p>

          <h3>7.3 Do Not Track</h3>
          <p>
            Some browsers include a &quot;Do Not Track&quot; (DNT) feature that signals to websites that you do not want your online activity tracked. Because there is no uniform standard for DNT signals, our Service does not currently respond to DNT browser signals.
          </p>

          <h2 id="your-rights">8. Your Rights and Choices</h2>

          <h3>8.1 Access and Portability</h3>
          <p>
            You have the right to request access to the personal information we hold about you and to receive a copy of that information in a structured, commonly used, and machine-readable format.
          </p>

          <h3>8.2 Correction</h3>
          <p>
            You have the right to request correction of any inaccurate or incomplete personal information we hold about you. You can update much of your information directly through your account settings.
          </p>

          <h3>8.3 Deletion</h3>
          <p>
            You have the right to request deletion of your personal information, subject to certain exceptions. We may retain information as required by law or for legitimate business purposes, such as compliance with legal obligations, resolving disputes, or enforcing our agreements.
          </p>

          <h3>8.4 Restriction and Objection</h3>
          <p>
            You have the right to request restriction of processing of your personal information or to object to processing in certain circumstances. If you object to processing, we will stop processing your information unless we have compelling legitimate grounds to continue.
          </p>

          <h3>8.5 Withdrawal of Consent</h3>
          <p>
            Where we rely on your consent to process personal information, you have the right to withdraw that consent at any time. Withdrawal of consent does not affect the lawfulness of processing based on consent before its withdrawal.
          </p>

          <h3>8.6 Marketing Communications</h3>
          <p>
            You can opt out of receiving marketing communications from us by clicking the &quot;unsubscribe&quot; link in any marketing email, updating your communication preferences in your account settings, or contacting us directly. Even if you opt out of marketing communications, we may still send you transactional messages related to your account.
          </p>

          <h3>8.7 How to Exercise Your Rights</h3>
          <p>
            To exercise any of these rights, please contact us at privacy@paypilot.com or use the contact information provided below. We will respond to your request within the timeframe required by applicable law, typically within 30 days. We may need to verify your identity before processing your request.
          </p>

          <h2 id="international">9. International Data Transfers</h2>

          <h3>9.1 Data Location</h3>
          <p>
            Our Service is operated in the United States, and information we collect is stored and processed in data centers located in the United States. If you are accessing the Service from outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States.
          </p>

          <h3>9.2 Transfer Mechanisms</h3>
          <p>
            When we transfer personal information from the European Economic Area, United Kingdom, or Switzerland to the United States, we rely on appropriate transfer mechanisms, including Standard Contractual Clauses approved by the European Commission, to ensure that your information receives adequate protection.
          </p>

          <h3>9.3 Data Processing Agreement</h3>
          <p>
            If you are a customer subject to GDPR or other data protection laws, we will enter into a Data Processing Agreement that includes Standard Contractual Clauses and outlines our respective responsibilities for protecting personal information.
          </p>

          <h2 id="children">10. Children&apos;s Privacy</h2>

          <p>
            Our Service is not directed to children under the age of 16, and we do not knowingly collect personal information from children under 16. If we become aware that we have collected personal information from a child under 16, we will take steps to delete that information promptly. If you believe that we may have collected information from a child under 16, please contact us at privacy@paypilot.com.
          </p>

          <h2 id="third-party">11. Third-Party Links and Services</h2>

          <p>
            Our Service may contain links to third-party websites, applications, or services that are not operated by us. If you click on a third-party link, you will be directed to that third party&apos;s site. We strongly advise you to review the privacy policy of every site you visit. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services.
          </p>

          <h2 id="california">12. California Privacy Rights (CCPA/CPRA)</h2>

          <h3>12.1 Your Rights Under California Law</h3>
          <p>If you are a California resident, you have the following rights under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA):</p>
          <ul>
            <li><strong>Right to Know:</strong> You can request information about the categories and specific pieces of personal information we have collected about you, the categories of sources from which the information was collected, the business purpose for collecting the information, and the categories of third parties with whom we share the information.</li>
            <li><strong>Right to Delete:</strong> You can request deletion of your personal information, subject to certain exceptions.</li>
            <li><strong>Right to Correct:</strong> You can request correction of inaccurate personal information.</li>
            <li><strong>Right to Opt-Out of Sale/Sharing:</strong> You can opt out of the sale or sharing of your personal information for cross-context behavioral advertising.</li>
            <li><strong>Right to Limit Use of Sensitive Personal Information:</strong> You can limit our use and disclosure of sensitive personal information to purposes necessary to provide the Service.</li>
            <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising any of your privacy rights.</li>
          </ul>

          <h3>12.2 Categories of Information Collected</h3>
          <p>In the preceding 12 months, we have collected the following categories of personal information:</p>
          <ul>
            <li>Identifiers (name, email, phone number, IP address)</li>
            <li>Personal information categories listed in Cal. Civ. Code Section 1798.80(e)</li>
            <li>Protected classification characteristics (age, gender, for equal employment purposes)</li>
            <li>Commercial information (transaction history, products/services purchased)</li>
            <li>Internet or network activity information (browsing history, search history)</li>
            <li>Geolocation data (city, region, country)</li>
            <li>Professional or employment-related information</li>
            <li>Inferences drawn from the above to create a profile</li>
          </ul>

          <h3>12.3 How to Submit a Request</h3>
          <p>
            To exercise your rights, submit a request to privacy@paypilot.com or call us at 1-800-XXX-XXXX. You may also designate an authorized agent to make a request on your behalf. We will verify your identity before processing your request.
          </p>

          <h2 id="european">13. European Privacy Rights (GDPR)</h2>

          <h3>13.1 Your Rights Under GDPR</h3>
          <p>If you are located in the European Economic Area, United Kingdom, or Switzerland, you have additional rights under the General Data Protection Regulation (GDPR):</p>
          <ul>
            <li><strong>Right of Access:</strong> Request a copy of your personal data</li>
            <li><strong>Right to Rectification:</strong> Request correction of inaccurate data</li>
            <li><strong>Right to Erasure:</strong> Request deletion of your data (&quot;right to be forgotten&quot;)</li>
            <li><strong>Right to Restrict Processing:</strong> Request limitation of processing</li>
            <li><strong>Right to Data Portability:</strong> Receive your data in a portable format</li>
            <li><strong>Right to Object:</strong> Object to processing based on legitimate interests or direct marketing</li>
            <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
            <li><strong>Right to Lodge a Complaint:</strong> File a complaint with your local data protection authority</li>
          </ul>

          <h3>13.2 Data Protection Officer</h3>
          <p>
            We have appointed a Data Protection Officer who can be contacted at dpo@paypilot.com for any questions or concerns regarding our data processing practices.
          </p>

          <h3>13.3 Supervisory Authority</h3>
          <p>
            You have the right to lodge a complaint with a supervisory authority if you believe our processing of your personal information violates applicable law. A list of supervisory authorities is available at: https://edpb.europa.eu/about-edpb/board/members_en
          </p>

          <h2 id="changes">14. Changes to This Privacy Policy</h2>

          <p>
            We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make changes, we will update the &quot;Last Updated&quot; date at the top of this policy. For material changes, we will provide more prominent notice, such as by sending you an email notification or displaying a prominent notice within the Service.
          </p>

          <p>
            We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information. Your continued use of the Service after any changes to this Privacy Policy constitutes your acceptance of the revised policy.
          </p>

          <h2 id="contact">15. Contact Information</h2>

          <p>If you have any questions, concerns, or complaints about this Privacy Policy or our data practices, please contact us:</p>

          <div className="bg-slate-50 rounded-lg p-6 not-prose">
            <p className="font-semibold text-slate-900">PayPilot, Inc.</p>
            <p className="text-slate-600">Privacy Team</p>
            <p className="text-slate-600 mt-2">Email: privacy@paypilot.com</p>
            <p className="text-slate-600">Phone: 1-800-XXX-XXXX</p>
            <p className="text-slate-600 mt-2">Address: 548 Market Street, Suite 35000</p>
            <p className="text-slate-600">San Francisco, CA 94104</p>
            <p className="text-slate-600">United States</p>
          </div>

          <div className="bg-slate-50 rounded-lg p-6 not-prose mt-6">
            <p className="font-semibold text-slate-900">Data Protection Officer</p>
            <p className="text-slate-600">Email: dpo@paypilot.com</p>
          </div>

          <div className="bg-slate-50 rounded-lg p-6 not-prose mt-6">
            <p className="font-semibold text-slate-900">EU Representative</p>
            <p className="text-slate-600">For users in the European Economic Area:</p>
            <p className="text-slate-600">Email: eu-representative@paypilot.com</p>
          </div>

          <hr className="my-12" />

          <p className="text-sm text-slate-500">
            By using PayPilot, you acknowledge that you have read and understood this Privacy Policy and agree to our collection, use, and disclosure of your information as described herein.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} PayPilot, Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-sm text-slate-600 hover:text-slate-900">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-slate-600 hover:text-slate-900">
                Terms of Service
              </Link>
              <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">
                Home
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
