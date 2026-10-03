'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth/client';

export function SignOutButton({ label }: { label: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <Button
      variant="secondary"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await signOut();
        router.push('/');
        router.refresh();
      }}
      className="self-start"
    >
      {label}
    </Button>
  );
}
