// The login answers of the old Server. Failures are HTTP 200 with { err }, and the clients depend on these exact texts.
export const LOGIN_MESSAGES = {
  incomplete: 'Alle velden moeten zijn ingevuld.',
  invalid: 'Verkeerde gegevens ingevoerd',
  failed: 'Iets ging verkeerd, probeer opnieuw of later.',
} as const;

export type LoginError = { err: string };
export type LoginSuccess = { user: Record<string, unknown> };
export type LoginResult = LoginError | LoginSuccess;
