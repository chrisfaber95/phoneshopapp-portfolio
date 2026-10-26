// Which fields of a customer may be written by whom. The old Server wrote every field of the request body to the database
// (Customer.update(body), Customer.create(body)): a customer could change their own loyalty points, access token or activation.

// what a new customer may send when signing up (the fields of the Klant sign-up page)
export const SIGNUP_FIELDS = ['first_name', 'surname', 'email', 'password', 'updates', 'dob', 'gender', 'klantenkaart'] as const;

// what a customer may change in their own profile (the fields of the Klant profile pages); the password has its own flow
export const PROFILE_FIELDS = [
  'first_name', 'surname', 'email', 'gender', 'dob', 'phone', 'updates', 'klantenkaart', 'coopkaart',
  'default_information', 'default_invoice_information', 'default_work_information',
] as const;

export const SETTINGS_FIELDS = ['shopheight', 'shoptype', 'easy_order', 'standard_promotions', 'standard_storestamps', 'quick_scan'] as const;

export const INFORMATION_FIELDS = [
  'first_name', 'surname', 'phone', 'street', 'house_number', 'house_addition', 'city', 'zipcode',
  'business', 'kvk', 'btw', 'title', 'contactperson', 'businessphone', 'custom_label',
] as const;

// never sent to a client
export const SECRET_COLUMNS = ['password', 'accessToken', 'resettoken'];
// not sent in customer answers either (the old Server's list, which also missed `resettoken` because of a typo)
export const HIDDEN_COLUMNS = [...SECRET_COLUMNS, 'createdAt', 'updatedAt', 'deletedAt'];

export const pick = <K extends string>(source: Record<string, unknown>, keys: readonly K[]): Partial<Record<K, unknown>> => {
  const picked: Partial<Record<K, unknown>> = {};
  for (const key of keys) if (Object.prototype.hasOwnProperty.call(source, key) && source[key] !== undefined) picked[key] = source[key];
  return picked;
};

export const asRecord = (value: unknown): Record<string, unknown> => (value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {});

export const normalizeEmail = (email: unknown): string | null => (typeof email === 'string' && email.trim() !== '' ? email.toLowerCase().replace(/ /g, '') : null);
