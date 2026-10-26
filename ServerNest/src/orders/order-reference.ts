import { CryptoService } from '../auth/crypto.service';

// The reference to an order in a URL: its UUID, or the encrypted value used in the links of e-mails (longer than 40 characters,
// optionally with the "order||" prefix of the QR code text). The e-mails encrypt the UUID; older links encrypted the numeric id,
// so a decrypted value of only digits is the numeric id. (A UUID is never matched against the numeric column: MySQL would read
// "12ab..." as 12.) null for an encrypted value that is not valid. A plain reference of only digits is the numeric id: the admin
// app addresses orders by it (`PUT /order/<id>`), while it was the UUID in the body that the old Server actually used.
export const orderWhere = (reference: string, crypto: CryptoService): { uuid_id: string } | { id: number } | null => {
  if (reference.length <= 40) return /^\d{1,12}$/.test(reference) ? { id: Number(reference) } : { uuid_id: reference };
  const value = crypto.decrypt(reference.replace(/^order\|\|/, ''));
  if (value === null) return null;
  return /^\d+$/.test(value) ? { id: Number(value) } : { uuid_id: value };
};
