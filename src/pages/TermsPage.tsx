import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageMeta } from "@/components/PageMeta";

export default function TermsPage() {
  const navigate = useNavigate();

  const sections = [
    {
      title: "1. Acceptance of Terms",
      content: `By accessing or using the LoadHawk platform ("Service"), including our website at loadhawk.ai, mobile applications, and all related services, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service. LoadHawk reserves the right to modify these Terms at any time. Continued use of the Service after any modification constitutes acceptance of the updated Terms. We will notify registered users of material changes via email or in-app notification at least thirty (30) days before they take effect.`
    },
    {
      title: "2. Account Registration",
      content: `To use certain features of the Service, you must create an account. You agree to provide accurate, current, and complete information during registration, including your full legal name, valid email address, phone number, and CDL classification (if applicable). You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify LoadHawk immediately of any unauthorized use of your account. LoadHawk reserves the right to suspend or terminate accounts that contain false or misleading information, or that violate these Terms. You must be at least 18 years of age and legally authorized to operate commercial motor vehicles in the United States (if registering as a driver) to create an account.`
    },
    {
      title: "3. Description of Service",
      content: `LoadHawk is a freight load board and management platform designed for owner-operators, small fleet carriers, and dispatchers operating within the United States. The Service provides tools for discovering and booking freight loads, managing shipments, tracking earnings, rating freight brokers, and utilizing AI-powered negotiation assistance. LoadHawk acts solely as a technology platform connecting carriers with available freight. LoadHawk is not a freight broker, freight forwarder, or motor carrier, and does not assume responsibility for the transportation of any goods.`
    },
    {
      title: "4. Load Booking and Freight Transactions",
      content: `When you book a load through the LoadHawk platform, you are entering into a transportation agreement with the freight broker or shipper who posted the load, not with LoadHawk. You are solely responsible for verifying load details, pickup and delivery requirements, equipment compatibility, and all regulatory compliance before accepting any load. LoadHawk does not guarantee the accuracy, completeness, or availability of any load listing. Loads may be modified, cancelled, or reassigned by the posting party at any time. LoadHawk is not liable for any disputes, damages, or losses arising from freight transactions conducted through the platform. You agree to fulfill all loads you accept in a professional and timely manner, in compliance with all applicable federal and state transportation regulations, including FMCSA requirements.`
    },
    {
      title: "5. Payment Terms",
      content: `LoadHawk offers both free and paid subscription tiers. Paid subscriptions are billed on a recurring monthly basis at the rate displayed at the time of purchase. All fees are quoted in U.S. dollars. Subscription fees are non-refundable except as required by applicable law. LoadHawk reserves the right to change subscription pricing with thirty (30) days advance notice to existing subscribers. Payment processing is handled by third-party payment processors. LoadHawk does not store your complete payment card information on its servers. Freight payment for loads booked through the platform is handled directly between you and the broker or shipper. LoadHawk does not process, hold, or guarantee freight payments and is not responsible for non-payment, late payment, or payment disputes between carriers and brokers.`
    },
    {
      title: "6. Broker Ratings and Reviews",
      content: `LoadHawk provides a broker rating system that allows carriers to share their experiences working with freight brokers. By submitting a rating or review, you represent that your review is based on a genuine business interaction, is truthful and accurate to the best of your knowledge, and does not contain defamatory, obscene, or unlawful content. LoadHawk reserves the right to remove, edit, or decline to publish any review that violates these Terms or our content policies. Broker ratings are user-generated content and reflect the opinions of individual users, not of LoadHawk. LoadHawk does not verify the accuracy of reviews and is not liable for any claims arising from user-submitted ratings or reviews.`
    },
    {
      title: "7. AI Negotiation Tool",
      content: `LoadHawk offers an AI-powered negotiation assistant designed to help carriers evaluate rate offers and generate counter-offer suggestions. You acknowledge and agree that the AI Negotiator provides suggestions only and does not constitute financial, legal, or business advice. All rate suggestions, market analyses, and negotiation strategies generated by the AI tool are based on available data and algorithmic models and may not reflect actual market conditions. You are solely responsible for any negotiation decisions you make, whether or not you use the AI Negotiator. LoadHawk does not guarantee that using the AI Negotiator will result in higher rates, accepted counter-offers, or any particular financial outcome. The AI Negotiator does not enter into agreements on your behalf. You must independently review and approve any counter-offer before it is submitted.`
    },
    {
      title: "8. Acceptable Use",
      content: `You agree not to use the Service to: (a) violate any applicable federal, state, or local law or regulation, including FMCSA, DOT, and FHWA regulations; (b) post false, misleading, or fraudulent load listings, broker information, or account details; (c) harass, threaten, or abuse other users of the platform; (d) interfere with or disrupt the Service or servers connected to the Service; (e) attempt to gain unauthorized access to any portion of the Service or any other systems or networks; (f) scrape, crawl, or use automated tools to extract data from the platform without written permission; (g) use the Service to transmit spam, chain letters, or unsolicited communications; (h) manipulate broker ratings or reviews through fake accounts or coordinated inauthentic activity; or (i) sublicense, resell, or redistribute access to the Service. Violation of this section may result in immediate account suspension or termination without notice.`
    },
    {
      title: "9. Intellectual Property",
      content: `All content, features, and functionality of the Service, including but not limited to text, graphics, logos, icons, images, software, algorithms, and the LoadHawk name and brand, are the exclusive property of LoadHawk or its licensors and are protected by United States and international copyright, trademark, patent, and other intellectual property laws. You may not copy, modify, distribute, sell, or lease any part of the Service or its content without LoadHawk's prior written consent. You retain ownership of any content you submit to the platform (such as reviews and ratings), but you grant LoadHawk a non-exclusive, royalty-free, worldwide, perpetual license to use, display, reproduce, and distribute such content in connection with the operation and promotion of the Service.`
    },
    {
      title: "10. Privacy",
      content: `Your use of the Service is also governed by our Privacy Policy, available at loadhawk.ai/privacy. The Privacy Policy explains how we collect, use, and protect your personal information. By using the Service, you consent to the collection and use of your information as described in the Privacy Policy.`
    },
    {
      title: "11. Disclaimer of Warranties",
      content: `THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY. LOADHAWK DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. LOADHAWK DOES NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS. LOADHAWK DOES NOT WARRANT THE ACCURACY OR COMPLETENESS OF ANY LOAD LISTINGS, BROKER RATINGS, MARKET DATA, OR AI-GENERATED RECOMMENDATIONS. YOU USE THE SERVICE AT YOUR OWN RISK.`
    },
    {
      title: "12. Limitation of Liability",
      content: `TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL LOADHAWK, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, OR AFFILIATES BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION LOSS OF PROFITS, DATA, BUSINESS OPPORTUNITIES, OR GOODWILL, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF OR INABILITY TO USE THE SERVICE. LOADHAWK'S TOTAL AGGREGATE LIABILITY FOR ALL CLAIMS ARISING FROM OR RELATED TO THE SERVICE SHALL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID TO LOADHAWK IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED DOLLARS ($100). THIS LIMITATION APPLIES REGARDLESS OF THE THEORY OF LIABILITY AND EVEN IF LOADHAWK HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.`
    },
    {
      title: "13. Indemnification",
      content: `You agree to indemnify, defend, and hold harmless LoadHawk, its officers, directors, employees, agents, and affiliates from and against any and all claims, damages, obligations, losses, liabilities, costs, or debt, and expenses (including attorney's fees) arising from: (a) your use of the Service; (b) your violation of these Terms; (c) your violation of any third-party right, including any intellectual property, privacy, or contractual right; (d) any freight transaction you enter into through the platform; or (e) any content you submit, post, or transmit through the Service.`
    },
    {
      title: "14. Termination",
      content: `You may terminate your account at any time by contacting us at legal@loadhawk.ai or through the account settings page. LoadHawk may suspend or terminate your account at any time, with or without cause and with or without notice, including if LoadHawk believes you have violated these Terms. Upon termination, your right to use the Service will immediately cease. Provisions of these Terms that by their nature should survive termination shall survive, including but not limited to intellectual property provisions, disclaimers, limitations of liability, and dispute resolution provisions. If you have an active paid subscription at the time of termination initiated by LoadHawk without cause, LoadHawk will provide a prorated refund for the unused portion of your subscription period.`
    },
    {
      title: "15. Dispute Resolution and Arbitration",
      content: `Any dispute, controversy, or claim arising out of or relating to these Terms or the Service shall be resolved through binding arbitration administered by the American Arbitration Association ("AAA") under its Commercial Arbitration Rules. The arbitration shall take place in Wilmington, Delaware. The arbitrator's award shall be final and binding, and judgment upon the award may be entered in any court of competent jurisdiction. YOU AGREE THAT ANY ARBITRATION SHALL BE CONDUCTED ON AN INDIVIDUAL BASIS AND NOT AS A CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION. If for any reason a claim proceeds in court rather than in arbitration, you and LoadHawk each waive any right to a jury trial. Notwithstanding the foregoing, either party may seek injunctive or other equitable relief in any court of competent jurisdiction to prevent the actual or threatened infringement or misappropriation of intellectual property rights.`
    },
    {
      title: "16. Governing Law",
      content: `These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law provisions. Any legal action or proceeding not subject to arbitration shall be brought exclusively in the state or federal courts located in Wilmington, Delaware, and you consent to the personal jurisdiction of such courts.`
    },
    {
      title: "17. Severability",
      content: `If any provision of these Terms is held to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect. The invalid or unenforceable provision shall be modified to the minimum extent necessary to make it valid and enforceable while preserving the original intent.`
    },
    {
      title: "18. Entire Agreement",
      content: `These Terms, together with the Privacy Policy and any other policies referenced herein, constitute the entire agreement between you and LoadHawk regarding the Service and supersede all prior agreements, understandings, and communications, whether written or oral.`
    },
    {
      title: "19. Contact Information",
      content: `If you have any questions about these Terms of Service, please contact us at:\n\nLoadHawk\nEmail: legal@loadhawk.ai\nWebsite: loadhawk.ai`
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageMeta title="Terms of Service" />
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm mb-2"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="animate-fade-up">
          <h1 className="font-display text-4xl tracking-tight mb-2">Terms of Service</h1>
          <p className="text-muted-foreground text-sm">
            Last updated: March 18, 2026
          </p>
        </div>

        <div className="bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#1f1f1f] rounded-2xl shadow-sm p-6 sm:p-8 animate-fade-up" style={{ animationDelay: "100ms" }}>
          <p className="text-muted-foreground text-[15px] leading-relaxed mb-6">
            Welcome to LoadHawk. These Terms of Service govern your access to and use of the LoadHawk platform and services.
            Please read these Terms carefully before using the Service. By creating an account or using LoadHawk, you agree to
            be bound by these Terms.
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
          LoadHawk -- loadhawk.ai -- legal@loadhawk.ai
        </div>
      </div>
    </div>
  );
}
