// Invoice number of an order: NL<store number>_<year><month><day>_<number of the order today, 4 digits>. Same format as the old
// Server, including its month counting from 0 (January = 0), so the numbers stay in the same series.
const STORE_NUMBER = '3555';

const padNumber = (number: number): string => String(number).padStart(4, '0');

export const startOfDay = (date: Date): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const invoiceNumber = (date: Date, ordersToday: number): string =>
  `NL${STORE_NUMBER}_${date.getFullYear()}${date.getMonth()}${date.getDate()}_${padNumber(ordersToday + 1)}`;
