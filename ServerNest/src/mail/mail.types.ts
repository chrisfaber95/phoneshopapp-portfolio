// The data the e-mail templates read. Filled from the order / actie order / customer records (Sequelize instances serialised to
// plain objects), so every field is optional text or number.
export interface OrderMailLine {
  amount?: number;
  picked?: number;
  product: { product_information: { title: string; variant: string } };
  actie_order_product_variant_list?: { product_variant: { variant_label: string } }[];
}

export interface OrderMailInfo {
  pickupTime?: string;
  finalPrice?: string | number;
  totalPrice?: string | number;
  delivery?: boolean;
  product_list: OrderMailLine[];
  actie_order_information?: {
    first_name?: string;
    surname?: string;
    customerEmail?: string;
    street?: string;
    house_number?: string;
    house_addition?: string;
    zipcode?: string;
    city?: string;
    createdAt: string;
  };
}

export interface ReminderMailInfo {
  storepoints?: number;
  spaaractie_list: { stamp_amount?: number }[];
}

export interface ActieOrderMailLine {
  amount?: number;
  picked?: number;
  product_id?: string | number;
  product: { product_information: { title: string; variant: string } };
  actie_order_product_variant_list: { product_variant: { variant_label: string } }[];
}

// An order of the spaaractie shop: always has the customer's details and lines with their variants
export interface ActieOrderMailInfo extends Omit<OrderMailInfo, 'product_list' | 'actie_order_information'> {
  product_list: ActieOrderMailLine[];
  actie_order_information: NonNullable<OrderMailInfo['actie_order_information']>;
}
