'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { startCheckout, type CheckoutError } from '@/components/commerce/checkout';
import { Button } from '@/components/ui/button';
import { FormMessage } from '@/components/ui/field';
import type { MembershipTierId } from '@/content/catalog';
import type { Dictionary } from '@/lib/i18n/dictionary';

export function MembershipButton({
  tierId,
  t,
  recommended,
  authed,
}: {
  tierId: MembershipTierId;
  t: Dictionary;
  recommended: boolean;
  authed: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<CheckoutError | null>(null);

  const message: Record<CheckoutError, string> = {
    PAYMENTS_DISABLED: t.payments.unavailable,
    AUTH_REQUIRED: t.payments.loginRequiredBody,
    RATE_LIMITED: t.auth.login.errors.tooMany,
    BAD_REQUEST: t.common.loadError,
    FAILED: t.common.loadError,
  };

  const onClick = async () => {
    if (!authed) {
      router.push(`/login?next=${encodeURIComponent('/support')}`);
      return;
    }

    setPending(true);
    setError(null);
    const result = await startCheckout({ kind: 'membership', tierId });
    setError(result);
    setPending(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant={recommended ? 'accent' : 'secondary'}
        size="lg"
        disabled={pending}
        onClick={onClick}
        className="w-full"
      >
        {pending ? t.support.plans.processing : t.support.plans.cta}
      </Button>
      {error ? <FormMessage tone="error">{message[error]}</FormMessage> : null}
    </div>
  );
}
