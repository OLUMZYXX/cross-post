"use client";

import useProfileForm from "@/hooks/useProfileForm";
import SubPageHeader from "@/components/settings/SubPageHeader";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function ProfilePage() {
  const { name, email, setName, setEmail, errors, saving, dirty, save } = useProfileForm();

  return (
    <div className="animate-fade-in max-w-lg">
      <SubPageHeader title="Edit profile" subtitle="This is how you appear across Crosspost." />

      <form onSubmit={save} noValidate className="rounded-3xl bg-cp-card border border-cp-rule p-6 space-y-5">
        <Input label="Full name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} error={errors.name} />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
        />
        <Button type="submit" variant="accent" size="md" loading={saving} disabled={!dirty} className="w-full">
          Save changes
        </Button>
      </form>
    </div>
  );
}
