import LegalShell from "@/components/legal/LegalShell";

const SUPPORT_EMAIL = "akinwumiolumide5@gmail.com";

export const metadata = {
  title: "Terms of Service — Cross-Post",
  description: "The terms that govern your use of Cross-Post.",
};

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service" updated="July 24, 2026">
      <p>
        These Terms of Service (&quot;Terms&quot;) are a binding agreement between you and Cross-Post
        (&quot;Cross-Post&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) governing your use
        of our mobile application and website (together, the &quot;Service&quot;). By creating an account
        or using the Service, you agree to these Terms. If you do not agree, do not use the Service.
      </p>

      <h2>1. Eligibility</h2>
      <p>
        You must be at least 13 years old (or the minimum age of digital consent in your country) and
        able to form a binding contract to use the Service. If you use the Service on behalf of an
        organization, you represent that you are authorized to bind that organization to these Terms.
      </p>

      <h2>2. Description of the Service</h2>
      <p>
        Cross-Post lets you compose content once and publish, schedule, and manage it across social
        media accounts you choose to connect, including TikTok, Instagram, Facebook, LinkedIn, YouTube,
        X (Twitter), Reddit, and Telegram. Features and supported platforms may change over time.
      </p>

      <h2>3. Your account</h2>
      <p>
        You must provide accurate information when you sign up and keep your login credentials secure.
        You are responsible for all activity that occurs under your account. Notify us promptly of any
        unauthorized use.
      </p>

      <h2>4. Connected third-party accounts</h2>
      <p>
        When you connect a social platform, you authorize Cross-Post to access that platform on your
        behalf to publish the content you choose. Your use of each platform through Cross-Post remains
        subject to that platform&apos;s own terms and policies (including those of TikTok, Meta, Google,
        and X), and you agree to comply with them. You may disconnect any platform at any time from
        Settings. We are not responsible for the availability, decisions, or actions of third-party
        platforms.
      </p>

      <h2>5. Your content</h2>
      <p>
        You retain ownership of the content you create. You are solely responsible for your content and
        for ensuring you have the rights to publish it. You grant Cross-Post a limited license to store,
        process, and transmit your content only as needed to provide the Service (for example, to
        deliver a post to the platforms you select). You represent that your content does not infringe
        the rights of others and complies with applicable law and each platform&apos;s rules.
      </p>

      <h2>6. Acceptable use</h2>
      <p>You agree not to use the Service to:</p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>Publish unlawful, infringing, deceptive, hateful, or abusive content.</li>
        <li>Violate the terms, policies, or rate limits of any connected platform.</li>
        <li>Send spam, malware, or engage in fraudulent or misleading activity.</li>
        <li>Infringe intellectual-property or privacy rights of others.</li>
        <li>Attempt to disrupt, reverse-engineer, or gain unauthorized access to the Service.</li>
      </ul>
      <p>We may suspend or terminate accounts that violate these Terms.</p>

      <h2>7. Subscriptions and payments</h2>
      <p>
        Cross-Post offers core features at no cost. Certain optional features may require a paid
        subscription (&quot;Cross-Post Pro&quot;). Subscriptions are billed through your Apple App Store
        or Google Play account, renew automatically until cancelled, and can be managed or cancelled at
        any time in your app store account settings. Except where required by law, payments are
        non-refundable. Prices and features may change with notice.
      </p>

      <h2>8. Intellectual property</h2>
      <p>
        The Service, including its software, design, and branding, is owned by Cross-Post and protected
        by intellectual-property laws. We grant you a limited, non-exclusive, non-transferable right to
        use the Service in accordance with these Terms. You may not copy, modify, or create derivative
        works of the Service without our permission.
      </p>

      <h2>9. Account and data deletion</h2>
      <p>
        You can delete your account at any time from <strong>Settings &gt; Delete Account</strong>.
        Deletion is permanent and removes your account, posts, and connected-account tokens. See our{" "}
        <a href="/privacy">Privacy Policy</a> for details on how we handle your data.
      </p>

      <h2>10. Termination</h2>
      <p>
        You may stop using the Service at any time. We may suspend or terminate your access if you
        violate these Terms or if necessary to protect the Service or other users. Provisions that by
        their nature should survive termination will survive.
      </p>

      <h2>11. Disclaimers</h2>
      <p>
        The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any
        kind. We do not guarantee that posts will always publish successfully, as delivery depends on
        third-party platforms outside our control. We disclaim all warranties to the fullest extent
        permitted by law.
      </p>

      <h2>12. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, Cross-Post will not be liable for any indirect,
        incidental, special, consequential, or punitive damages, or for any loss of data, profits, or
        goodwill, arising from your use of the Service or from publishing failures or platform changes
        outside our control.
      </p>

      <h2>13. Indemnification</h2>
      <p>
        You agree to indemnify and hold Cross-Post harmless from any claims, damages, or expenses
        arising from your content, your use of the Service, or your violation of these Terms or any
        third-party platform&apos;s rules.
      </p>

      <h2>14. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. We will revise the &quot;Last updated&quot; date
        above and, where appropriate, notify you within the app. Continued use of the Service after
        changes take effect constitutes acceptance.
      </p>

      <h2>15. Contact us</h2>
      <p>
        Questions about these Terms? Email us at{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    </LegalShell>
  );
}
