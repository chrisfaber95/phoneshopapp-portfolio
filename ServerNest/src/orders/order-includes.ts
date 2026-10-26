import { Includeable } from 'sequelize';
import { HIDDEN_COLUMNS, SECRET_COLUMNS } from '../customers/customer-fields';
import { Customer, OrderHasProduct, OrderInformation, Product, User } from '../database/models';
import { department, discounts, productInformation } from '../products/product-includes';

// What the old Server loaded with every order (`{ all: true }` plus the product lines and the order information). `{ all: true }`
// also loaded the whole customer, password hash and tokens included, in an answer that anyone with an order link could read:
// the customer is now always loaded without secrets.
const customer = (as: string): Includeable => ({ model: Customer, as, attributes: { exclude: SECRET_COLUMNS } });

export const orderIncludes: Includeable[] = [
  { model: User, as: 'pickingUser' },
  { model: User, as: 'scanningUser' },
  { model: User, as: 'pickupUser' },
  customer('customer'),
  { model: OrderInformation, as: 'invoice_order_information' },
  {
    model: OrderHasProduct,
    as: 'product_list',
    include: [{ model: Product, as: 'product', include: [productInformation, department, discounts] }],
  },
  {
    model: OrderInformation,
    as: 'order_information',
    paranoid: false,
    include: [{ model: Customer, as: 'customer', attributes: { exclude: HIDDEN_COLUMNS } }],
  },
];
