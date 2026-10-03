import 'server-only';

import type { Locale } from '@/lib/i18n/config';

/**
 * E-mail bodies.
 *
 * Every interpolated value passes through `escapeHtml` first. A member's
 * display name is attacker-controlled input, and an unescaped name in an HTML
 * mail is a live injection vector in the recipient's client.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const PALETTE = {
  canvas: '#1E0A29',
  surface: '#2D0E3F',
  text: '#EFEEEA',
  muted: 'rgba(239,238,234,0.72)',
  accent: '#FFB938',
  border: 'rgba(239,238,234,0.18)',
};

function shell(bodyHtml: string, previewText: string): string {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Candelaria Solar Car</title>
  </head>
  <body style="margin:0;padding:0;background:${PALETTE.canvas};color:${PALETTE.text};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(previewText)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PALETTE.canvas};padding:32px 24px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${PALETTE.surface};border:1px solid ${PALETTE.border};border-radius:24px;">
            <tr>
              <td style="padding:32px;">
                <p style="margin:0 0 24px;font-size:16px;font-weight:500;letter-spacing:0;color:${PALETTE.accent};">CANDELARIA SOLAR CAR</p>
                ${bodyHtml}
              </td>
            </tr>
          </table>
          <p style="max-width:560px;margin:24px auto 0;font-size:16px;color:${PALETTE.muted};text-align:left;">
            Universidad de los Andes. Si no esperabas este mensaje, puedes ignorarlo.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function button(href: string, label: string): string {
  return `<a href="${escapeHtml(href)}" style="display:inline-block;background:${PALETTE.accent};color:${PALETTE.canvas};text-decoration:none;font-weight:500;font-size:16px;padding:16px 24px;border-radius:12px;">${escapeHtml(label)}</a>`;
}

const copy = {
  es: {
    resetSubject: 'Restablece tu contraseña de Candelaria',
    resetHeading: 'Restablece tu contraseña',
    resetBody:
      'Pediste un enlace para definir una contraseña nueva. El enlace caduca en una hora y solo se puede usar una vez.',
    resetCta: 'Definir una contraseña nueva',
    resetIgnore: 'Si no fuiste tú, no hace falta hacer nada. Tu contraseña actual sigue activa.',
    verifySubject: 'Confirma tu correo en Candelaria',
    verifyHeading: 'Confirma tu correo',
    verifyBody:
      'Confirma esta dirección para activar tu cuenta y poder entrar al sitio.',
    verifyCta: 'Confirmar el correo',
    changedSubject: 'Tu contraseña de Candelaria cambió',
    changedHeading: 'Tu contraseña cambió',
    changedBody:
      'La contraseña de tu cuenta se actualizó hace unos segundos. Se cerraron todas las sesiones abiertas.',
    changedWarning:
      'Si no fuiste tú, escribe de inmediato a diseno@candelaria.website desde este mismo correo.',
    greeting: (name: string) => `Hola, ${name}.`,
  },
  en: {
    resetSubject: 'Reset your Candelaria password',
    resetHeading: 'Reset your password',
    resetBody:
      'You asked for a link to set a new password. The link expires in one hour and can only be used once.',
    resetCta: 'Set a new password',
    resetIgnore: 'If this was not you, no action is needed. Your current password still works.',
    verifySubject: 'Confirm your e-mail at Candelaria',
    verifyHeading: 'Confirm your e-mail',
    verifyBody: 'Confirm this address to activate your account and sign in.',
    verifyCta: 'Confirm the e-mail',
    changedSubject: 'Your Candelaria password changed',
    changedHeading: 'Your password changed',
    changedBody:
      'Your account password was updated moments ago. Every open session was signed out.',
    changedWarning:
      'If this was not you, write to diseno@candelaria.website from this same address right away.',
    greeting: (name: string) => `Hello, ${name}.`,
  },
} satisfies Record<Locale, Record<string, unknown>>;

type Strings = (typeof copy)['es'];

function strings(locale: Locale): Strings {
  return locale === 'en' ? (copy.en as Strings) : copy.es;
}

export function passwordResetEmail(opts: { name: string; url: string; locale: Locale }) {
  const s = strings(opts.locale);
  const body = `
    <h1 style="margin:0 0 16px;font-size:32px;line-height:1.1;color:${PALETTE.text};">${escapeHtml(s.resetHeading)}</h1>
    <p style="margin:0 0 8px;color:${PALETTE.muted};">${escapeHtml(s.greeting(opts.name))}</p>
    <p style="margin:0 0 24px;color:${PALETTE.text};">${escapeHtml(s.resetBody)}</p>
    <p style="margin:0 0 24px;">${button(opts.url, s.resetCta)}</p>
    <p style="margin:0;font-size:16px;color:${PALETTE.muted};">${escapeHtml(s.resetIgnore)}</p>`;

  return {
    subject: s.resetSubject,
    html: shell(body, s.resetBody),
    text: `${s.greeting(opts.name)}\n\n${s.resetBody}\n\n${opts.url}\n\n${s.resetIgnore}`,
  };
}

export function verifyEmail(opts: { name: string; url: string; locale: Locale }) {
  const s = strings(opts.locale);
  const body = `
    <h1 style="margin:0 0 16px;font-size:32px;line-height:1.1;color:${PALETTE.text};">${escapeHtml(s.verifyHeading)}</h1>
    <p style="margin:0 0 8px;color:${PALETTE.muted};">${escapeHtml(s.greeting(opts.name))}</p>
    <p style="margin:0 0 24px;color:${PALETTE.text};">${escapeHtml(s.verifyBody)}</p>
    <p style="margin:0;">${button(opts.url, s.verifyCta)}</p>`;

  return {
    subject: s.verifySubject,
    html: shell(body, s.verifyBody),
    text: `${s.greeting(opts.name)}\n\n${s.verifyBody}\n\n${opts.url}`,
  };
}

export function passwordChangedEmail(opts: { name: string; locale: Locale }) {
  const s = strings(opts.locale);
  const body = `
    <h1 style="margin:0 0 16px;font-size:32px;line-height:1.1;color:${PALETTE.text};">${escapeHtml(s.changedHeading)}</h1>
    <p style="margin:0 0 8px;color:${PALETTE.muted};">${escapeHtml(s.greeting(opts.name))}</p>
    <p style="margin:0 0 24px;color:${PALETTE.text};">${escapeHtml(s.changedBody)}</p>
    <p style="margin:0;font-size:16px;color:${PALETTE.accent};">${escapeHtml(s.changedWarning)}</p>`;

  return {
    subject: s.changedSubject,
    html: shell(body, s.changedBody),
    text: `${s.greeting(opts.name)}\n\n${s.changedBody}\n\n${s.changedWarning}`,
  };
}

export function contactEmail(opts: {
  name: string;
  email: string;
  topic: string;
  message: string;
}) {
  const body = `
    <h1 style="margin:0 0 16px;font-size:32px;line-height:1.1;color:${PALETTE.text};">Nuevo mensaje de contacto</h1>
    <p style="margin:0 0 8px;color:${PALETTE.muted};">Tema: ${escapeHtml(opts.topic)}</p>
    <p style="margin:0 0 8px;color:${PALETTE.muted};">De: ${escapeHtml(opts.name)} (${escapeHtml(opts.email)})</p>
    <div style="margin:24px 0 0;padding:24px;border:1px solid ${PALETTE.border};border-radius:16px;color:${PALETTE.text};white-space:pre-wrap;">${escapeHtml(opts.message)}</div>`;

  return {
    subject: `Contacto: ${opts.topic}`,
    html: shell(body, `Mensaje de ${opts.name}`),
    text: `De: ${opts.name} <${opts.email}>\nTema: ${opts.topic}\n\n${opts.message}`,
  };
}
