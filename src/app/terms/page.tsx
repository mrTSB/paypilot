import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service | PayPilot',
  description: 'PayPilot Terms of Service - Read our terms and conditions for using the PayPilot platform.',
}

export default function TermsOfServicePage() {
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
            <Link href="/privacy" className="text-sm text-slate-600 hover:text-slate-900">
              Privacy Policy
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Terms of Service</h1>
          <p className="text-slate-500">Last updated: February 15, 2026</p>
        </div>

        <div className="prose prose-slate max-w-none prose-headings:scroll-mt-20">
          {/* Table of Contents */}
          <nav className="bg-slate-50 rounded-lg p-6 mb-10 not-prose">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Table of Contents</h2>
            <ol className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <li><a href="#definitions" className="text-primary hover:underline">1. Definitions</a></li>
              <li><a href="#acceptance" className="text-primary hover:underline">2. Acceptance of Terms</a></li>
              <li><a href="#description" className="text-primary hover:underline">3. Description of Service</a></li>
              <li><a href="#account" className="text-primary hover:underline">4. Account Registration</a></li>
              <li><a href="#subscription" className="text-primary hover:underline">5. Subscription and Billing</a></li>
              <li><a href="#acceptable-use" className="text-primary hover:underline">6. Acceptable Use Policy</a></li>
              <li><a href="#data-processing" className="text-primary hover:underline">7. Data Processing</a></li>
              <li><a href="#intellectual-property" className="text-primary hover:underline">8. Intellectual Property</a></li>
              <li><a href="#confidentiality" className="text-primary hover:underline">9. Confidentiality</a></li>
              <li><a href="#warranties" className="text-primary hover:underline">10. Warranties and Disclaimers</a></li>
              <li><a href="#limitation" className="text-primary hover:underline">11. Limitation of Liability</a></li>
              <li><a href="#indemnification" className="text-primary hover:underline">12. Indemnification</a></li>
              <li><a href="#termination" className="text-primary hover:underline">13. Termination</a></li>
              <li><a href="#governing-law" className="text-primary hover:underline">14. Governing Law</a></li>
              <li><a href="#dispute-resolution" className="text-primary hover:underline">15. Dispute Resolution</a></li>
              <li><a href="#general" className="text-primary hover:underline">16. General Provisions</a></li>
              <li><a href="#contact" className="text-primary hover:underline">17. Contact Information</a></li>
            </ol>
          </nav>

          <p className="lead">
            Welcome to PayPilot. These Terms of Service (&quot;Terms&quot;, &quot;Agreement&quot;) constitute a legally binding agreement between you and PayPilot, Inc. (&quot;PayPilot&quot;, &quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) governing your access to and use of the PayPilot platform, including all related websites, applications, services, and tools (collectively, the &quot;Service&quot;).
          </p>

          <p>
            By accessing or using the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you are entering into this Agreement on behalf of a company, organization, or other legal entity (&quot;Entity&quot;), you represent and warrant that you have the authority to bind such Entity to these Terms, in which case &quot;you&quot; or &quot;your&quot; shall refer to such Entity.
          </p>

          <h2 id="definitions">1. Definitions</h2>

          <p>For the purposes of these Terms, the following definitions shall apply:</p>

          <ul>
            <li><strong>&quot;Account&quot;</strong> means a unique account created for you to access our Service or parts of our Service.</li>
            <li><strong>&quot;Affiliate&quot;</strong> means an entity that controls, is controlled by, or is under common control with a party, where &quot;control&quot; means ownership of 50% or more of the shares, equity interest, or other securities entitled to vote for election of directors or other managing authority.</li>
            <li><strong>&quot;Authorized User&quot;</strong> means any individual who is authorized by you to use the Service and who has been supplied user identification and password credentials by you or on your behalf.</li>
            <li><strong>&quot;Business Day&quot;</strong> means any day other than a Saturday, Sunday, or public holiday in the State of Delaware, United States.</li>
            <li><strong>&quot;Confidential Information&quot;</strong> means all non-public information disclosed by one party to the other, whether orally or in writing, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and the circumstances of disclosure.</li>
            <li><strong>&quot;Customer Data&quot;</strong> means all electronic data, information, or materials submitted by you or your Authorized Users to the Service, including but not limited to employee records, payroll data, benefits information, and personal information.</li>
            <li><strong>&quot;Documentation&quot;</strong> means the user guides, help files, and technical documentation for the Service made available by PayPilot.</li>
            <li><strong>&quot;Effective Date&quot;</strong> means the date on which you first access or use the Service or accept these Terms, whichever occurs first.</li>
            <li><strong>&quot;Fees&quot;</strong> means the subscription fees and any other charges payable by you for use of the Service as set forth in the applicable Order Form or pricing page.</li>
            <li><strong>&quot;Intellectual Property Rights&quot;</strong> means all patent rights, copyrights, trademark rights, trade secret rights, and any other intellectual property rights recognized in any jurisdiction worldwide.</li>
            <li><strong>&quot;Order Form&quot;</strong> means an ordering document or online order specifying the Service to be provided and the applicable Fees.</li>
            <li><strong>&quot;Personal Data&quot;</strong> means any information relating to an identified or identifiable natural person, as defined under applicable data protection laws.</li>
            <li><strong>&quot;Professional Services&quot;</strong> means implementation, configuration, training, or consulting services provided by PayPilot.</li>
            <li><strong>&quot;Service Level Agreement&quot;</strong> or &quot;SLA&quot; means the service level commitments set forth in our Service Level Agreement document.</li>
            <li><strong>&quot;Subscription Term&quot;</strong> means the period during which you have agreed to subscribe to the Service as specified in your Order Form.</li>
            <li><strong>&quot;Third-Party Services&quot;</strong> means any third-party products, applications, services, software, networks, systems, directories, websites, databases, or information that the Service links to, or that you may connect to or enable in conjunction with the Service.</li>
          </ul>

          <h2 id="acceptance">2. Acceptance of Terms</h2>

          <h3>2.1 Agreement to Terms</h3>
          <p>
            By creating an Account, accessing, or using the Service, you agree to be bound by these Terms and all applicable laws and regulations. If you do not agree with any part of these Terms, you must not use the Service. Your continued use of the Service following the posting of any changes to these Terms constitutes acceptance of those changes.
          </p>

          <h3>2.2 Eligibility</h3>
          <p>
            You must be at least 18 years of age and capable of forming a binding contract to use the Service. By using the Service, you represent and warrant that you meet these eligibility requirements. If you are using the Service on behalf of an Entity, you represent and warrant that you have the legal authority to bind that Entity to these Terms.
          </p>

          <h3>2.3 Modifications to Terms</h3>
          <p>
            PayPilot reserves the right to modify these Terms at any time. We will provide notice of material changes by posting the updated Terms on our website and updating the &quot;Last Updated&quot; date. For material changes that negatively affect your rights, we will provide at least 30 days&apos; advance notice via email to the address associated with your Account. Your continued use of the Service after the effective date of any modifications constitutes your acceptance of the modified Terms.
          </p>

          <h2 id="description">3. Description of Service</h2>

          <h3>3.1 Service Overview</h3>
          <p>
            PayPilot provides a cloud-based human resources and payroll management platform that enables businesses to manage employee data, process payroll, administer benefits, track time and attendance, and perform related human resources functions. The specific features and functionality available to you depend on your subscription tier.
          </p>

          <h3>3.2 Service Availability</h3>
          <p>
            PayPilot will use commercially reasonable efforts to make the Service available 24 hours a day, 7 days a week, except for: (a) planned maintenance, for which we will provide advance notice when practicable; (b) emergency maintenance; (c) circumstances beyond our reasonable control, including force majeure events; and (d) failures or malfunctions of Third-Party Services.
          </p>

          <h3>3.3 Service Modifications</h3>
          <p>
            PayPilot reserves the right to modify, update, or discontinue any aspect of the Service at any time. We will provide reasonable advance notice of any material changes that negatively impact the core functionality of the Service you are using. Minor updates, bug fixes, and improvements may be made without notice.
          </p>

          <h3>3.4 Beta Features</h3>
          <p>
            From time to time, we may offer beta or preview features (&quot;Beta Features&quot;). Beta Features are provided &quot;as-is&quot; without any warranties and may be modified or discontinued at any time without notice. Your use of Beta Features is at your own risk, and PayPilot shall have no liability for any issues arising from your use of Beta Features.
          </p>

          <h2 id="account">4. Account Registration and Security</h2>

          <h3>4.1 Account Creation</h3>
          <p>
            To use the Service, you must create an Account by providing accurate, complete, and current information as prompted by the registration process. You agree to update your Account information promptly to keep it accurate, complete, and current. Failure to do so may result in your inability to access the Service or our ability to contact you with important information.
          </p>

          <h3>4.2 Account Security</h3>
          <p>
            You are responsible for maintaining the confidentiality of your Account credentials and for all activities that occur under your Account. You agree to: (a) create strong, unique passwords; (b) not share your credentials with any third party; (c) notify PayPilot immediately of any unauthorized access or security breach; and (d) ensure that you log out of your Account at the end of each session, particularly when using shared or public devices.
          </p>

          <h3>4.3 Authorized Users</h3>
          <p>
            You may authorize individuals within your organization to access and use the Service as Authorized Users, subject to the user limitations of your subscription plan. You are responsible for ensuring that all Authorized Users comply with these Terms. Any action taken by an Authorized User is deemed to be an action taken by you, and you shall be liable for such actions.
          </p>

          <h3>4.4 Account Administrator</h3>
          <p>
            The individual who creates the Account or is designated as the administrator shall have the ability to manage Account settings, add or remove Authorized Users, and access all Customer Data within the Account. You are responsible for designating appropriate administrators and maintaining appropriate access controls.
          </p>

          <h2 id="subscription">5. Subscription, Fees, and Payment</h2>

          <h3>5.1 Subscription Plans</h3>
          <p>
            The Service is offered through various subscription plans with different features, limitations, and pricing. The specific terms of your subscription, including the Subscription Term, number of users, and applicable Fees, are set forth in your Order Form or as displayed at the time of purchase on our website.
          </p>

          <h3>5.2 Fees and Payment</h3>
          <p>
            You agree to pay all Fees in accordance with your Order Form or the pricing displayed at purchase. Unless otherwise specified: (a) Fees are quoted and payable in U.S. dollars; (b) payment is due within 30 days of invoice date for invoiced accounts, or immediately for credit card payments; (c) Fees are non-refundable except as expressly set forth herein; and (d) you are responsible for all taxes, duties, and other governmental assessments related to your use of the Service, excluding taxes based on PayPilot&apos;s net income.
          </p>

          <h3>5.3 Automatic Renewal</h3>
          <p>
            Unless you provide written notice of non-renewal at least 30 days before the end of your current Subscription Term, your subscription will automatically renew for successive periods equal to your initial Subscription Term. Fees for renewal periods may be subject to increase; we will provide at least 60 days&apos; notice of any Fee increases.
          </p>

          <h3>5.4 Late Payments</h3>
          <p>
            If any Fees are not paid when due, PayPilot may: (a) charge interest on the overdue amount at the rate of 1.5% per month or the maximum rate permitted by law, whichever is less; (b) suspend your access to the Service until payment is received; and (c) pursue collection through appropriate legal means. You shall reimburse PayPilot for all costs incurred in collecting overdue amounts, including reasonable attorneys&apos; fees.
          </p>

          <h3>5.5 Refund Policy</h3>
          <p>
            Annual subscriptions may be cancelled within 14 days of the initial purchase for a full refund. After the 14-day period, no refunds will be provided for the remainder of the Subscription Term. Monthly subscriptions may be cancelled at any time, but no refunds will be provided for the current billing period.
          </p>

          <h2 id="acceptable-use">6. Acceptable Use Policy</h2>

          <h3>6.1 Permitted Use</h3>
          <p>
            You may use the Service only for lawful purposes and in accordance with these Terms. You agree to use the Service solely for your internal business purposes related to human resources management, payroll processing, and related administrative functions.
          </p>

          <h3>6.2 Prohibited Activities</h3>
          <p>You agree not to, and not to permit any Authorized User to:</p>
          <ul>
            <li>Use the Service in any way that violates any applicable federal, state, local, or international law or regulation, including laws regarding data protection, employment, tax, and financial reporting;</li>
            <li>Transmit any material that is defamatory, obscene, threatening, harassing, or otherwise objectionable;</li>
            <li>Impersonate or attempt to impersonate PayPilot, a PayPilot employee, another user, or any other person or entity;</li>
            <li>Interfere with, disrupt, or create an undue burden on the Service or the networks or servers connected to the Service;</li>
            <li>Attempt to gain unauthorized access to any portion of the Service, other accounts, computer systems, or networks connected to the Service;</li>
            <li>Use any robot, spider, scraper, or other automated means to access the Service without our express written permission;</li>
            <li>Reverse engineer, decompile, disassemble, or otherwise attempt to derive the source code of the Service;</li>
            <li>Copy, modify, create derivative works of, distribute, sell, lease, or sublicense any part of the Service;</li>
            <li>Remove, alter, or obscure any proprietary notices on the Service;</li>
            <li>Use the Service to store or transmit malicious code, viruses, or harmful data;</li>
            <li>Use the Service to send unsolicited communications, promotions, or advertisements;</li>
            <li>Use the Service in any manner that could damage, disable, overburden, or impair the Service.</li>
          </ul>

          <h3>6.3 Compliance Monitoring</h3>
          <p>
            PayPilot reserves the right to monitor your use of the Service to ensure compliance with these Terms. We may investigate any reported violation of these Terms and take appropriate action, including removing content, suspending access, or terminating your Account.
          </p>

          <h2 id="data-processing">7. Data Processing and Security</h2>

          <h3>7.1 Customer Data Ownership</h3>
          <p>
            As between you and PayPilot, you retain all right, title, and interest in and to your Customer Data. You grant PayPilot a limited, non-exclusive license to access, process, and use Customer Data solely to provide the Service and as otherwise permitted by these Terms.
          </p>

          <h3>7.2 Data Processing</h3>
          <p>
            To the extent that PayPilot processes Personal Data on your behalf, such processing shall be governed by our Data Processing Agreement, which is incorporated into these Terms by reference. You represent and warrant that you have all necessary rights and consents to provide Personal Data to PayPilot for processing.
          </p>

          <h3>7.3 Data Security</h3>
          <p>
            PayPilot implements and maintains reasonable administrative, technical, and physical security measures designed to protect Customer Data from unauthorized access, disclosure, alteration, or destruction. These measures include encryption of data in transit and at rest, access controls, regular security assessments, and employee training.
          </p>

          <h3>7.4 Data Location</h3>
          <p>
            Customer Data is stored and processed in data centers located in the United States. By using the Service, you consent to the transfer and processing of Customer Data in the United States and any other jurisdiction where PayPilot or its service providers operate facilities.
          </p>

          <h3>7.5 Data Retention and Deletion</h3>
          <p>
            Upon termination of your Account, PayPilot will retain your Customer Data for a period of 30 days, during which you may request export of your data. After this period, PayPilot will delete your Customer Data from our active systems, except as required to comply with legal obligations, resolve disputes, or enforce our agreements. Backup copies may be retained for an additional period in accordance with our backup and disaster recovery procedures.
          </p>

          <h2 id="intellectual-property">8. Intellectual Property Rights</h2>

          <h3>8.1 PayPilot Intellectual Property</h3>
          <p>
            The Service and all materials therein, including software, algorithms, text, graphics, logos, icons, images, audio clips, and data compilations, are the property of PayPilot or its licensors and are protected by United States and international intellectual property laws. Nothing in these Terms grants you any right, title, or interest in the Service or any PayPilot intellectual property, except for the limited license to use the Service as expressly set forth herein.
          </p>

          <h3>8.2 License to Use Service</h3>
          <p>
            Subject to your compliance with these Terms and payment of all applicable Fees, PayPilot grants you a limited, non-exclusive, non-transferable, non-sublicensable license to access and use the Service during the Subscription Term solely for your internal business purposes.
          </p>

          <h3>8.3 Feedback</h3>
          <p>
            If you provide PayPilot with any feedback, suggestions, or ideas regarding the Service (&quot;Feedback&quot;), you grant PayPilot a perpetual, irrevocable, worldwide, royalty-free license to use, modify, and incorporate such Feedback into the Service or other products or services without any obligation to you.
          </p>

          <h3>8.4 Third-Party Components</h3>
          <p>
            The Service may include third-party software components subject to separate license terms. Such license terms will be made available to you upon request and are incorporated into these Terms by reference.
          </p>

          <h2 id="confidentiality">9. Confidentiality</h2>

          <h3>9.1 Confidential Information</h3>
          <p>
            Each party agrees to protect the other party&apos;s Confidential Information using the same degree of care it uses to protect its own confidential information, but in no event less than reasonable care. Neither party shall disclose the other party&apos;s Confidential Information to any third party except to employees, contractors, and agents who need to know such information and who are bound by confidentiality obligations at least as protective as those herein.
          </p>

          <h3>9.2 Exceptions</h3>
          <p>Confidential Information does not include information that: (a) is or becomes publicly available through no fault of the receiving party; (b) was rightfully in the receiving party&apos;s possession prior to disclosure; (c) is rightfully obtained by the receiving party from a third party without restriction on disclosure; or (d) is independently developed by the receiving party without use of the disclosing party&apos;s Confidential Information.</p>

          <h3>9.3 Required Disclosures</h3>
          <p>
            A party may disclose Confidential Information if required by law, regulation, or court order, provided that the party gives the other party prompt notice of such requirement (to the extent legally permitted) and reasonably cooperates with the other party&apos;s efforts to obtain a protective order.
          </p>

          <h2 id="warranties">10. Warranties and Disclaimers</h2>

          <h3>10.1 PayPilot Warranties</h3>
          <p>PayPilot warrants that: (a) the Service will perform materially in accordance with the Documentation during the Subscription Term; (b) PayPilot will not materially decrease the functionality of the Service during your Subscription Term; and (c) PayPilot has implemented reasonable security measures to protect Customer Data.</p>

          <h3>10.2 Customer Warranties</h3>
          <p>You warrant that: (a) you have the authority to enter into these Terms; (b) you will comply with all applicable laws in your use of the Service; (c) you have all necessary rights and consents to provide Customer Data to PayPilot; and (d) your use of the Service will not violate any third-party rights.</p>

          <h3>10.3 Disclaimer</h3>
          <p>
            EXCEPT AS EXPRESSLY SET FORTH IN THIS SECTION, THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE,&quot; WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. PAYPILOT DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR COMPLETELY SECURE. PAYPILOT DOES NOT WARRANT THE ACCURACY OR COMPLETENESS OF ANY INFORMATION PROVIDED THROUGH THE SERVICE, INCLUDING PAYROLL CALCULATIONS, TAX CALCULATIONS, OR COMPLIANCE RECOMMENDATIONS. YOU ARE SOLELY RESPONSIBLE FOR VERIFYING THE ACCURACY OF ALL CALCULATIONS AND ENSURING COMPLIANCE WITH APPLICABLE LAWS.
          </p>

          <h2 id="limitation">11. Limitation of Liability</h2>

          <h3>11.1 Exclusion of Consequential Damages</h3>
          <p>
            IN NO EVENT SHALL EITHER PARTY BE LIABLE TO THE OTHER FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES, EVEN IF THE PARTY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
          </p>

          <h3>11.2 Cap on Liability</h3>
          <p>
            EXCEPT FOR LIABILITY ARISING FROM (A) YOUR BREACH OF SECTION 6 (ACCEPTABLE USE POLICY), (B) YOUR INDEMNIFICATION OBLIGATIONS, OR (C) YOUR PAYMENT OBLIGATIONS, THE TOTAL LIABILITY OF EITHER PARTY ARISING OUT OF OR RELATED TO THESE TERMS SHALL NOT EXCEED THE TOTAL FEES PAID OR PAYABLE BY YOU TO PAYPILOT DURING THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
          </p>

          <h3>11.3 Basis of the Bargain</h3>
          <p>
            THE LIMITATIONS OF LIABILITY IN THIS SECTION REFLECT THE ALLOCATION OF RISK BETWEEN THE PARTIES AND ARE AN ESSENTIAL ELEMENT OF THE BASIS OF THE BARGAIN BETWEEN THE PARTIES. THE SERVICE WOULD NOT BE PROVIDED WITHOUT THESE LIMITATIONS.
          </p>

          <h2 id="indemnification">12. Indemnification</h2>

          <h3>12.1 Your Indemnification</h3>
          <p>
            You agree to indemnify, defend, and hold harmless PayPilot and its officers, directors, employees, agents, and successors from and against any claims, liabilities, damages, losses, and expenses (including reasonable attorneys&apos; fees) arising out of or related to: (a) your use of the Service; (b) your breach of these Terms; (c) your violation of any applicable law or regulation; (d) your Customer Data; or (e) any claim that your Customer Data infringes any third-party rights.
          </p>

          <h3>12.2 PayPilot Indemnification</h3>
          <p>
            PayPilot agrees to indemnify, defend, and hold harmless you from and against any third-party claims that the Service, as provided by PayPilot, infringes any valid United States patent, copyright, or trademark, provided that you give PayPilot prompt written notice of the claim and cooperate with PayPilot&apos;s defense.
          </p>

          <h3>12.3 Indemnification Procedure</h3>
          <p>
            The indemnifying party shall have sole control over the defense and settlement of any claim subject to indemnification, provided that the indemnifying party shall not settle any claim in a manner that imposes any obligation or liability on the indemnified party without the indemnified party&apos;s prior written consent.
          </p>

          <h2 id="termination">13. Termination</h2>

          <h3>13.1 Termination for Convenience</h3>
          <p>
            You may terminate your Account at any time by providing written notice to PayPilot. Termination will be effective at the end of your current billing period. No refunds will be provided for the remainder of the Subscription Term.
          </p>

          <h3>13.2 Termination for Cause</h3>
          <p>
            Either party may terminate these Terms immediately upon written notice if the other party: (a) breaches any material term of these Terms and fails to cure such breach within 30 days of receiving written notice; or (b) becomes the subject of any bankruptcy, insolvency, receivership, or similar proceeding.
          </p>

          <h3>13.3 Suspension</h3>
          <p>
            PayPilot may suspend your access to the Service immediately if: (a) you fail to pay Fees when due; (b) your use of the Service poses a security risk or may adversely impact the Service or other users; (c) you violate the Acceptable Use Policy; or (d) we are required to do so by law.
          </p>

          <h3>13.4 Effect of Termination</h3>
          <p>
            Upon termination: (a) your right to use the Service will immediately cease; (b) you must pay any outstanding Fees; (c) you may request export of your Customer Data within 30 days; and (d) each party shall return or destroy the other party&apos;s Confidential Information. The following sections shall survive termination: Definitions, Intellectual Property Rights, Confidentiality, Warranties and Disclaimers, Limitation of Liability, Indemnification, and General Provisions.
          </p>

          <h2 id="governing-law">14. Governing Law</h2>

          <p>
            These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law principles. The United Nations Convention on Contracts for the International Sale of Goods does not apply to these Terms.
          </p>

          <h2 id="dispute-resolution">15. Dispute Resolution</h2>

          <h3>15.1 Informal Resolution</h3>
          <p>
            Before initiating any formal dispute resolution proceeding, the parties agree to first attempt to resolve any dispute informally by contacting each other and negotiating in good faith for a period of at least 30 days.
          </p>

          <h3>15.2 Binding Arbitration</h3>
          <p>
            Any dispute, controversy, or claim arising out of or relating to these Terms that cannot be resolved informally shall be resolved by binding arbitration administered by the American Arbitration Association (&quot;AAA&quot;) in accordance with its Commercial Arbitration Rules. The arbitration shall take place in Wilmington, Delaware, before a single arbitrator. The arbitrator&apos;s award shall be final and binding, and judgment on the award may be entered in any court of competent jurisdiction.
          </p>

          <h3>15.3 Class Action Waiver</h3>
          <p>
            YOU AND PAYPILOT AGREE THAT EACH MAY BRING CLAIMS AGAINST THE OTHER ONLY IN YOUR OR ITS INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE ACTION. The arbitrator may not consolidate more than one person&apos;s claims and may not preside over any form of representative or class proceeding.
          </p>

          <h3>15.4 Exceptions</h3>
          <p>
            Notwithstanding the foregoing, either party may seek injunctive or other equitable relief in any court of competent jurisdiction to prevent the actual or threatened infringement of intellectual property rights or the actual or threatened disclosure of Confidential Information.
          </p>

          <h2 id="general">16. General Provisions</h2>

          <h3>16.1 Entire Agreement</h3>
          <p>
            These Terms, together with any Order Forms, the Privacy Policy, and any other documents incorporated by reference, constitute the entire agreement between you and PayPilot regarding the Service and supersede all prior and contemporaneous agreements, proposals, and communications.
          </p>

          <h3>16.2 Amendment</h3>
          <p>
            These Terms may only be amended as set forth in Section 2.3 or by a written agreement signed by both parties.
          </p>

          <h3>16.3 Waiver</h3>
          <p>
            The failure of either party to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision. Any waiver must be in writing and signed by the waiving party.
          </p>

          <h3>16.4 Severability</h3>
          <p>
            If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that these Terms shall otherwise remain in full force and effect.
          </p>

          <h3>16.5 Assignment</h3>
          <p>
            You may not assign or transfer these Terms or any rights hereunder without PayPilot&apos;s prior written consent. PayPilot may assign these Terms without your consent in connection with a merger, acquisition, corporate reorganization, or sale of all or substantially all of its assets.
          </p>

          <h3>16.6 No Third-Party Beneficiaries</h3>
          <p>
            These Terms do not create any third-party beneficiary rights in any individual or entity that is not a party to these Terms.
          </p>

          <h3>16.7 Force Majeure</h3>
          <p>
            Neither party shall be liable for any failure or delay in performing its obligations under these Terms (except for payment obligations) due to circumstances beyond its reasonable control, including acts of God, natural disasters, war, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, accidents, strikes, or shortages of transportation, facilities, fuel, energy, labor, or materials.
          </p>

          <h3>16.8 Notices</h3>
          <p>
            All notices under these Terms shall be in writing and shall be deemed given when: (a) delivered personally; (b) sent by confirmed email; (c) sent by commercial overnight courier with tracking; or (d) sent by registered or certified mail, postage prepaid, return receipt requested. Notices to PayPilot shall be sent to legal@paypilot.com. Notices to you shall be sent to the email address associated with your Account.
          </p>

          <h3>16.9 Export Compliance</h3>
          <p>
            You agree to comply with all applicable export and import control laws and regulations in your use of the Service. You shall not export, re-export, or transfer the Service or any data or materials related thereto to any prohibited country, entity, or person.
          </p>

          <h3>16.10 Government Users</h3>
          <p>
            If you are a U.S. government entity or the Service is being acquired for use by the U.S. government, the Service is &quot;commercial computer software&quot; and &quot;commercial computer software documentation&quot; as defined in FAR 12.212 and DFARS 227.7202, and the government&apos;s rights are limited to those specifically granted in these Terms.
          </p>

          <h2 id="contact">17. Contact Information</h2>

          <p>If you have any questions about these Terms, please contact us at:</p>

          <div className="bg-slate-50 rounded-lg p-6 not-prose">
            <p className="font-semibold text-slate-900">PayPilot, Inc.</p>
            <p className="text-slate-600">Legal Department</p>
            <p className="text-slate-600">Email: legal@paypilot.com</p>
            <p className="text-slate-600">Address: 548 Market Street, Suite 35000</p>
            <p className="text-slate-600">San Francisco, CA 94104</p>
            <p className="text-slate-600">United States</p>
          </div>

          <hr className="my-12" />

          <p className="text-sm text-slate-500">
            By using PayPilot, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
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
