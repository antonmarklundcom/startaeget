"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "../actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <form className="adm-form adm-form--narrow" action={action}>
      <input type="hidden" name="next" value={next} />
      <label htmlFor="password">Lösenord</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        autoFocus
      />
      <button type="submit" className="adm-btn adm-btn--primary" disabled={pending}>
        {pending ? "Loggar in …" : "Logga in"}
      </button>
      {state.error ? (
        <p className="adm-chip adm-chip--error" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
