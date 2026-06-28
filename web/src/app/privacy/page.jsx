import LegalShell from "@/components/legal/LegalShell";

const SUPPORT_EMAIL = "akinwumiolumide5@gmail.com";

export const metadata = {
  title: "Privacy Policy — Cross-Post",
  description: "How Cross-Post collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="June 28, 2026">
      <p>
        Cross-Post (&quot;we&quot;, &quot;us&quot;) is a tool that lets you publish content to your
        connected social media accounts. This policy explains what data we collect and how we use it.
      </p>

      <h2>Information we collect</h2>
      <p>
        We collect the account information you provide when you sign up (name and email), the content
        you create in the app, and OAuth access tokens for the social platforms you choose to connect.
        If you grant permission, we access photos and videos you select in order to attach them to your posts.
      </p>

      <h2>How we use your information</h2>
      <p>
        We use your information solely to provide the service: authenticating you, publishing your posts
        to the platforms you select, scheduling posts, and showing your analytics. We do not sell your data.
      </p>

      <h2>Photo and media access</h2>
      <p>
        When you attach media to a post, the app accesses only the specific photos or videos you choose.
        Selected media is uploaded to deliver it to your connected platforms and is not used for any other purpose.
      </p>

      <h2>Data storage and security</h2>
      <p>
        Passwords are encrypted and OAuth tokens are stored securely. We never store your social media
        platform passwords.
      </p>

      <h2>Account deletion</h2>
      <p>
        You can permanently delete your account at any time from Settings &gt; Delete Account. This removes
        your account, posts, and connected accounts. You may also email us to request deletion.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy? Email us at <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    </LegalShell>
  );
}
