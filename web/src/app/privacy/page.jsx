import LegalShell from "@/components/legal/LegalShell";

const SUPPORT_EMAIL = "akinwumiolumide5@gmail.com";

export const metadata = {
  title: "Privacy Policy — Cross-Post",
  description: "How Cross-Post collects, uses, shares, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="July 24, 2026">
      <p>
        This Privacy Policy explains how Cross-Post (&quot;Cross-Post&quot;, &quot;we&quot;,
        &quot;us&quot;, or &quot;our&quot;) collects, uses, shares, and protects your information when
        you use our mobile application and website (together, the &quot;Service&quot;). Cross-Post is a
        social media management tool that lets you compose content once and publish it to the social
        media accounts you choose to connect. By using the Service, you agree to the practices
        described in this policy.
      </p>

      <h2>1. Information we collect</h2>
      <p>We collect the following categories of information:</p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>
          <strong>Account information.</strong> Your name, email address, and password (stored only in
          encrypted form). If you sign in with Google or Apple, we receive your name, email, and a
          unique identifier from that provider.
        </li>
        <li>
          <strong>Content you create.</strong> The captions, posts, drafts, scheduled posts, and any
          photos or videos you choose to attach in order to publish them.
        </li>
        <li>
          <strong>Connected platform data.</strong> When you connect a social account, we store the
          OAuth access and refresh tokens that platform issues, plus basic profile details it returns
          (such as your username, account ID, and, for Facebook, the Pages you manage). We do not
          receive or store your passwords for any connected platform.
        </li>
        <li>
          <strong>Media you select.</strong> With your permission, we access only the specific photos
          or videos you pick to attach to a post. We do not scan or access your wider photo library.
        </li>
        <li>
          <strong>Usage and device information.</strong> Basic technical data such as app version,
          device type, and log data needed to operate the Service, diagnose errors, and prevent abuse.
        </li>
        <li>
          <strong>Subscription information.</strong> If you purchase a subscription, the transaction is
          processed by Apple or Google. We receive confirmation of your subscription status but not your
          full payment card details.
        </li>
      </ul>

      <h2>2. Data from connected platforms (TikTok, Meta, Google, X and others)</h2>
      <p>
        When you connect a third-party platform such as TikTok, Instagram, Facebook, LinkedIn, YouTube,
        X (Twitter), Reddit, or Telegram, you authorize Cross-Post to access that platform on your
        behalf using the scopes you approve during login. We use this access only to (a) confirm your
        identity and account, (b) publish the content you explicitly choose to post, and (c) display the
        status of those posts. We request the minimum scopes required for these features. We do not use
        data obtained from a connected platform to build advertising profiles, and we do not sell it.
        Our use of information received from Google APIs adheres to the{" "}
        <a href="https://developers.google.com/terms/api-services-user-data-policy">
          Google API Services User Data Policy
        </a>
        , including its Limited Use requirements. Likewise, our handling of data from TikTok, Meta, and
        X complies with each platform&apos;s developer terms and policies.
      </p>

      <h2>3. How we use your information</h2>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>Authenticate you and keep your account secure.</li>
        <li>Publish, schedule, and retry the posts you create to the platforms you select.</li>
        <li>Show you post history, delivery status, and analytics.</li>
        <li>Provide optional AI features (for example, rephrasing a caption you submit).</li>
        <li>Operate, maintain, troubleshoot, and improve the Service.</li>
        <li>Detect, prevent, and respond to fraud, abuse, or security incidents.</li>
        <li>Comply with legal obligations.</li>
      </ul>

      <h2>4. How we share information</h2>
      <p>
        We do not sell your personal information. We share it only in these limited cases:
      </p>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>
          <strong>Connected platforms.</strong> The content you choose to publish is sent to the social
          platforms you select, at your direction.
        </li>
        <li>
          <strong>Service providers.</strong> We use trusted third parties strictly to operate the
          Service, including cloud hosting and database providers, Cloudinary (media storage and
          delivery), and OpenAI (to process text you submit for AI rephrasing). These providers process
          data only on our behalf and under confidentiality obligations.
        </li>
        <li>
          <strong>Legal reasons.</strong> Where required by law, or to protect the rights, safety, and
          security of our users or the Service.
        </li>
      </ul>

      <h2>5. Data retention</h2>
      <p>
        We keep your information for as long as your account is active or as needed to provide the
        Service. When you delete your account, we delete your account data, posts, and connected-account
        tokens. We may retain limited records where required for legal, security, or fraud-prevention
        purposes.
      </p>

      <h2>6. Data security</h2>
      <p>
        We protect your data with industry-standard measures. Passwords are hashed, OAuth tokens are
        stored securely, and data is transmitted over encrypted connections. No method of transmission or
        storage is completely secure, but we work to protect your information and promptly address any
        issues.
      </p>

      <h2>7. Your rights and choices</h2>
      <p>
        Depending on your location, you may have the right to access, correct, export, or delete your
        personal information, and to object to or restrict certain processing. You can exercise these
        rights in the app or by emailing us. You can disconnect any social platform at any time from
        Settings, which revokes our stored access for that platform.
      </p>

      <h2>8. Account and data deletion</h2>
      <p>
        You can permanently delete your account at any time from{" "}
        <strong>Settings &gt; Delete Account</strong> in the app. This removes your account, posts, and
        connected-account tokens from our systems. You may also email us at{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> to request deletion.
      </p>

      <h2>9. Children&apos;s privacy</h2>
      <p>
        Cross-Post is not directed to children under 13 (or the minimum age required in your country),
        and we do not knowingly collect data from them. If you believe a child has provided us
        information, contact us and we will delete it.
      </p>

      <h2>10. International data transfers</h2>
      <p>
        Your information may be processed in countries other than your own. Where we transfer data
        internationally, we take steps to ensure it remains protected in line with this policy.
      </p>

      <h2>11. Third-party platforms</h2>
      <p>
        The social platforms you connect are governed by their own privacy policies. We encourage you to
        review the policies of TikTok, Meta (Instagram/Facebook), Google/YouTube, X, LinkedIn, Reddit,
        and Telegram for how they handle your data.
      </p>

      <h2>12. Changes to this policy</h2>
      <p>
        We may update this policy from time to time. We will revise the &quot;Last updated&quot; date
        above and, where appropriate, notify you within the app.
      </p>

      <h2>13. Contact us</h2>
      <p>
        If you have questions or requests regarding this policy or your data, email us at{" "}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    </LegalShell>
  );
}
