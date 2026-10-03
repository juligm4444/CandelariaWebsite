'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';

import {
  deletePublicationAction,
  inviteMemberAction,
  revokeMemberAction,
  setColeaderAction,
  transferLeadershipAction,
  type ActionState,
} from '@/app/actions/dashboard';
import { Button } from '@/components/ui/button';
import { FormMessage, SelectField, TextField } from '@/components/ui/field';
import type { Dictionary } from '@/lib/i18n/dictionary';

const initial: ActionState = { status: 'idle' };

/**
 * Destructive actions ask for confirmation before the request leaves the
 * browser. The server re-checks authorisation on every one of them, so the
 * confirmation is a courtesy, never the control.
 */
function ConfirmSubmit({
  label,
  confirmation,
  tone = 'secondary',
}: {
  label: string;
  confirmation: string;
  tone?: 'secondary' | 'ghost' | 'accent';
}) {
  const { pending } = useFormStatus();
  const [armed, setArmed] = useState(false);

  if (!armed) {
    return (
      <Button type="button" variant={tone} onClick={() => setArmed(true)}>
        {label}
      </Button>
    );
  }

  return (
    <span className="flex flex-wrap items-center gap-2">
      <span className="text-base text-ink-muted">{confirmation}</span>
      <Button type="submit" variant="accent" disabled={pending}>
        {pending ? '...' : label}
      </Button>
      <Button type="button" variant="ghost" onClick={() => setArmed(false)}>
        ✕
      </Button>
    </span>
  );
}

export function InviteForm({ t, canInviteColeader }: { t: Dictionary; canInviteColeader: boolean }) {
  const [state, action] = useActionState(inviteMemberAction, initial);

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <TextField
          label={t.dashboard.members.inviteLabel}
          name="email"
          type="email"
          autoComplete="off"
          required
        />
        <SelectField label={t.dashboard.members.inviteRole} name="role" defaultValue="member">
          <option value="member">{t.team.roles.member}</option>
          {canInviteColeader ? (
            <option value="coleader">{t.team.roles.coleader}</option>
          ) : null}
        </SelectField>
      </div>

      {state.status === 'success' ? (
        <FormMessage tone="success">{t.dashboard.members.invited}</FormMessage>
      ) : null}
      {state.status === 'error' ? (
        <FormMessage tone="error">
          {state.message === 'EMAIL_DOMAIN_NOT_ALLOWED'
            ? t.dashboard.members.inviteDomainError
            : t.dashboard.members.inviteError}
        </FormMessage>
      ) : null}

      <SubmitButton label={t.dashboard.members.inviteSubmit} />
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="self-start">
      {label}
    </Button>
  );
}

export function RevokeMemberForm({ t, targetId }: { t: Dictionary; targetId: string }) {
  const [, action] = useActionState(revokeMemberAction, initial);
  return (
    <form action={action}>
      <input type="hidden" name="targetId" value={targetId} />
      <ConfirmSubmit
        label={t.dashboard.members.remove}
        confirmation={t.dashboard.members.confirmRemove}
      />
    </form>
  );
}

export function ColeaderForm({
  t,
  targetId,
  promote,
}: {
  t: Dictionary;
  targetId: string;
  promote: boolean;
}) {
  const [, action] = useActionState(setColeaderAction, initial);
  return (
    <form action={action}>
      <input type="hidden" name="targetId" value={targetId} />
      <input type="hidden" name="promote" value={String(promote)} />
      <SubmitButton label={promote ? t.dashboard.members.promote : t.dashboard.members.demote} />
    </form>
  );
}

export function TransferLeadForm({ t, targetId }: { t: Dictionary; targetId: string }) {
  const [, action] = useActionState(transferLeadershipAction, initial);
  return (
    <form action={action}>
      <input type="hidden" name="targetId" value={targetId} />
      <ConfirmSubmit
        label={t.dashboard.members.transfer}
        confirmation={t.dashboard.members.confirmTransfer}
      />
    </form>
  );
}

export function DeletePublicationForm({ t, id }: { t: Dictionary; id: string }) {
  const [, action] = useActionState(deletePublicationAction, initial);
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <ConfirmSubmit
        label={t.common.delete}
        confirmation={t.dashboard.publications.confirmDelete}
        tone="ghost"
      />
    </form>
  );
}
