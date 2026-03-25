import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageMeta } from "@/components/PageMeta";

export default function PrivacyPage() {
  const navigate = useNavigate();

  const sections = [
    {
      title: "1. Introduction",
      content: `LoadHawk ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you use our freight load board and management platform at loadhawk.ai, including our website, mobile applications, and related services (collectively, the "Service"). By using the Service, you consent to the data practices described in this policy. If you do not agree with this Privacy Policy, please do not use the Service.`
    },
    {
      title: "2. Information We Collect",
      content: `We collect the following categories of information:

Account Information: When you register for an account, we collect your full legal name, email address, phone number, CDL class and license information, and account credentials (password stored in hashed form).

Profile Information: Information you provide to complete your profile, including home base location, preferred freight lanes, fleet size, company name, DOT number, and MC number.

Usage Data: We automatically collect information about how you interact with the Service, including pages visited, features used, loads searched and viewed, loads booked, negotiation activity, broker ratings submitted, session duration, and click patterns.

Device and Technical Data: We collect your IP address, browser type and version, operating system, device identifiers, screen resolution, and referring URLs.

Location Data: With your permission, we may collect precise or approximate geolocation data from your device to provide location-based load recommendations and route planning.

Communications: We retain records of your communications with us, including support requests and feedback.

Transaction Data: We collect information about your subscription purchases, payment history, and billing details. Full payment card numbers are processed and stored by our third-party payment processors, not by LoadHawk directly.`
    },
    {
      title: "3. How We Use Your Information",
      content: `We use the information we collect for the following purposes:

Service Operation: To create and manage your account, provide load board functionality, process load bookings, and deliver the features you request.

Personalization: To customize your experience, including personalized load recommendations, route suggestions, and market rate analyses based on your preferences and history.

AI Features: To power our AI Negotiator and other intelligent features, using aggregated and anonymized usage data to improve model accuracy and rate predictions.

Communications: To send you service-related notices, security alerts, subscription confirmations, and (with your consent) marketing communications about new features and promotions.

Analytics and Improvement: To understand how users interact with the Service, identify trends, diagnose technical issues, and improve our platform's performance and features.

Safety and Compliance: To detect and prevent fraud, abuse, and security threats, and to comply with legal obligations.

Broker Ratings: To display your submitted broker ratings and reviews (associated with your display name) to other users of the platform.`
    },
    {
      title: "4. Third-Party Service Providers",
      content: `We share your information with the following categories of third-party service providers who assist us in operating the Service:

Supabase: We use Supabase for database hosting, authentication, and backend infrastructure. Your account data, profile information, and application data are stored on Supabase servers. Supabase's privacy practices are governed by their own privacy policy.

Vercel: Our web application is hosted on Vercel's infrastructure. Vercel may process technical data such as IP addresses, request headers, and performance metrics. Vercel's data handling is governed by their privacy policy.

Payment Processors: We use third-party payment processors to handle subscription billing. These processors collect and store your payment information directly and are PCI-DSS compliant. We do not have access to your full payment card numbers.

Analytics Providers: We may use analytics services to understand Service usage patterns. These providers receive anonymized or pseudonymized usage data.

We require all third-party service providers to protect your information and use it only for the purposes for which it was disclosed. We do not sell your personal information to third parties.`
    },
    {
      title: "5. Cookies and Tracking Technologies",
      content: `We use cookies and similar tracking technologies to operate and improve the Service:

Essential Cookies: Required for the Service to function, including authentication tokens, session management, and security features. These cannot be disabled.

Functional Cookies: Remember your preferences, such as display settings and saved search filters, to provide a personalized experience.

Analytics Cookies: Help us understand how users interact with the Service by collecting anonymized usage statistics.

You can manage cookie preferences through your browser settings. Disabling certain cookies may affect the functionality of the Service. We do not use cookies for third-party advertising purposes. We honor Do Not Track (DNT) browser signals where technically feasible.`
    },
    {
      title: "6. Data Retention",
      content: `We retain your personal information for as long as your account is active or as needed to provide you with the Service. Specifically:

Account Data: Retained for the duration of your account and for thirty (30) days after account deletion to allow for account recovery.

Usage Data: Retained in identifiable form for up to twenty-four (24) months, after which it is anonymized or deleted.

Transaction Records: Retained for seven (7) years to comply with tax and financial reporting obligations.

Broker Ratings: Retained for the lifetime of the platform unless you request deletion, in which case your display name will be anonymized on existing reviews.

Communications: Support communications are retained for up to three (3) years.

After the applicable retention period, data is securely deleted or irreversibly anonymized.`
    },
    {
      title: "7. Your Rights and Choices",
      content: `You have the following rights regarding your personal information:

Access: You may request a copy of the personal information we hold about you by contacting us at privacy@loadhawk.ai or through your account settings.

Correction: You may update or correct your personal information at any time through your account settings page.

Deletion: You may request deletion of your account and associated personal data. We will process deletion requests within thirty (30) days, subject to any legal retention requirements.

Data Export: You may request a portable copy of your data in a commonly used, machine-readable format (JSON or CSV).

Opt-Out of Communications: You may opt out of marketing emails at any time by clicking the unsubscribe link in any marketing email or by updating your notification preferences in account settings. You cannot opt out of essential service communications.

Restrict Processing: You may request that we limit the processing of your personal data in certain circumstances, such as when you contest the accuracy of your data.

To exercise any of these rights, contact us at privacy@loadhawk.ai. We will respond to verified requests within thirty (30) days.`
    },
    {
      title: "8. California Consumer Privacy Act (CCPA) Compliance",
      content: `If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA) and the California Privacy Rights Act (CPRA):

Right to Know: You have the right to know what personal information we collect, use, disclose, and sell (we do not sell personal information).

Right to Delete: You have the right to request deletion of your personal information, subject to certain exceptions.

Right to Opt-Out of Sale: We do not sell your personal information. If this practice changes, we will provide a "Do Not Sell My Personal Information" link.

Right to Non-Discrimination: We will not discriminate against you for exercising your CCPA rights. You will not receive different pricing or service quality for exercising these rights.

Authorized Agent: You may designate an authorized agent to make requests on your behalf. We may require verification of the agent's authority.

Categories of Information: In the preceding twelve (12) months, we have collected the categories of personal information described in Section 2 of this Privacy Policy. We collect this information for the business purposes described in Section 3.

To submit a CCPA request, email privacy@loadhawk.ai with the subject line "CCPA Request" or call us. We will verify your identity before processing any request.`
    },
    {
      title: "9. Data Security",
      content: `We implement industry-standard technical and organizational security measures to protect your personal information, including encryption of data in transit (TLS 1.2+) and at rest, secure password hashing using bcrypt, role-based access controls for internal systems, regular security audits and vulnerability assessments, and monitoring for unauthorized access attempts. While we strive to protect your personal information, no method of electronic transmission or storage is completely secure. We cannot guarantee absolute security, and you transmit information to us at your own risk. In the event of a data breach that affects your personal information, we will notify you and applicable regulatory authorities as required by law.`
    },
    {
      title: "10. Children's Privacy",
      content: `The Service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If we become aware that we have collected personal information from a child under 18, we will promptly delete that information. If you believe we have inadvertently collected information from a child under 18, please contact us immediately at privacy@loadhawk.ai.`
    },
    {
      title: "11. International Data Transfers",
      content: `The Service is operated in the United States and is intended for users located in the United States. If you access the Service from outside the United States, you understand and consent to the transfer of your personal information to the United States, where data protection laws may differ from those in your jurisdiction. We will take reasonable steps to ensure your information receives an adequate level of protection in the jurisdictions in which we process it.`
    },
    {
      title: "12. Changes to This Privacy Policy",
      content: `We may update this Privacy Policy from time to time to reflect changes in our practices, technologies, or legal requirements. We will notify you of material changes by posting the updated policy on our website and, for registered users, sending an email notification or in-app notification at least thirty (30) days before the changes take effect. The "Last updated" date at the top of this policy indicates when the most recent revisions were made. Your continued use of the Service after any changes constitutes acceptance of the updated Privacy Policy.`
    },
    {
      title: "13. Contact Us",
      content: `If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:\n\nLoadHawk\nEmail: privacy@loadhawk.ai\nWebsite: loadhawk.ai\n\nFor Terms of Service inquiries, please contact legal@loadhawk.ai.`
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageMeta title="Privacy Policy" />
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm mb-2"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="animate-fade-up">
          <h1 className="font-display text-4xl tracking-tight mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground text-sm">
            Last updated: March 18, 2026
          </p>
        </div>

        <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-2xl shadow-sm p-6 sm:p-8 animate-fade-up" style={{ animationDelay: "100ms" }}>
          <p className="text-muted-foreground text-[15px] leading-relaxed mb-6">
            This Privacy Policy describes how LoadHawk collects, uses, and protects your personal information when you use our
            freight load board and management platform. We are committed to transparency and to safeguarding your data.
          </p>

          <div className="space-y-8 max-w-prose">
            {sections.map((section, i) => (
              <div key={i}>
                <h2 className="font-display text-lg tracking-tight mb-3">{section.title}</h2>
                <p className="text-muted-foreground text-[15px] leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center text-muted-foreground text-xs pb-8 animate-fade-up" style={{ animationDelay: "200ms" }}>
          LoadHawk -- loadhawk.ai -- privacy@loadhawk.ai
        </div>
      </div>
    </div>
  );
}
