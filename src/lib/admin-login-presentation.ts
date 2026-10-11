/** Presentation only: Identity calls, role checks and validators stay in login.astro. */
export const administratorAccessMessage = 'This account does not have administrator access.';
export function loginFailureMessage(flow: 'login' | 'invite' | 'reset', invalidCredentials = false, accessDenied = false): string {
  if (accessDenied) return administratorAccessMessage;
  if (flow === 'login') return invalidCredentials ? 'Invalid email or password.' : 'Unable to sign in. Try again shortly.';
  if (flow === 'invite') return 'Unable to activate this invitation. Try again or request a new invitation.';
  return 'Unable to set the new password. Try again or request a new recovery link.';
}

export function loginStatus(status: HTMLElement | null, message: string, error = false): void {
  if (!status) return;
  status.setAttribute('role', error ? 'alert' : 'status');
  status.setAttribute('aria-live', error ? 'assertive' : 'polite');
  status.setAttribute('aria-atomic', 'true');
  status.className = error ? 'status status--err' : 'status status--info';
  status.textContent = message;
}

export function clearLoginErrors(form: HTMLFormElement): void {
  for (const field of form.querySelectorAll<HTMLInputElement>('input')) {
    field.removeAttribute('aria-invalid');
    const descriptions = (field.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(id => id && id !== 'status');
    if (descriptions.length) field.setAttribute('aria-describedby', descriptions.join(' '));
    else field.removeAttribute('aria-describedby');
  }
}

export function loginFieldError(status: HTMLElement | null, message: string, fields: HTMLInputElement[], focus = false): void {
  loginStatus(status, message, true);
  for (const field of fields) {
    field.setAttribute('aria-invalid', 'true');
    const descriptions = new Set((field.getAttribute('aria-describedby') ?? '').split(/\s+/).filter(Boolean));
    descriptions.add('status');
    field.setAttribute('aria-describedby', [...descriptions].join(' '));
  }
  if (focus) fields[0]?.focus();
}

/** aria-disabled retains keyboard focus; each submit handler checks this guard. */
export function beginLoginSubmission(button: HTMLButtonElement): boolean {
  if (button.getAttribute('aria-disabled') === 'true') return false;
  button.setAttribute('aria-disabled', 'true');
  return true;
}
export function endLoginSubmission(button: HTMLButtonElement): void {
  button.removeAttribute('aria-disabled');
}
