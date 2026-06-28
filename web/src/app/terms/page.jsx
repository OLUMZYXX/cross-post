import LegalShell from "@/components/legal/LegalShell";

const SUPPORT_EMAIL = "akinwumiolumide5@gmail.com";

export const metadata = {
  title: "Terms of Service — Cross-Post",
  description: "The terms that govern your use of Cross-Post.",
};

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service" updated="June 28, 2026">
      <p>
        By creating an account or using Cross-Post, you agree to these terms. If you do not agree,
        please do not use the service.
      </p>

      <h2>Using the service</h2>
      <p>
        Cross-Post lets you compose content and publish it to social media accounts you connect. You are
        responsible for the content you publish and for complying with the terms of each connected platform.
      </p>

      <h2>Your account</h2>
      <p>
        You must provide accurate information when signing up and keep your credentials secure. You are
        responsible for activity that occurs under your account.
      </p>

      <h2>Pricing</h2>
      <p>
        Cross-Post is provided free of charge. There are no subscriptions or in-app purchases.
      </p>

      <h2>Acceptable use</h2>
      <p>
        Do not use Cross-Post to publish unlawful, infringing, or abusive content, or to violate the
        rules of any connected platform. We may suspend accounts that abuse the service.
      </p>

      <h2>Account deletion</h2>
      <p>
        You can delete your account at any time from Settings &gt; Delete Account. Deletion is permanent
        and removes your account, posts, and connected accounts.
      </p>

      <h2>Disclaimer</h2>
      <p>
        The service is provided &quot;as is&quot; without warranties. We are not liable for any loss arising
        from publishing failures or platform changes outside our control.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms? Email us at <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    </LegalShell>
  );
}
