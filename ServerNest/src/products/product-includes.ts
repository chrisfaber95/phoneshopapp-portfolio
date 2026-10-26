import { Includeable } from 'sequelize';
import {
  CustomerHasFavorite,
  Department,
  Discounts,
  Levertijden,
  NutrientRecords,
  NutrientTypes,
  Nutrients,
  PortionUoMs,
  PrecisionTypes,
  Product,
  ProductAdditionInformation,
  ProductHasDiscount,
  ProductVariant,
  Productinformation,
  RecordUoMs,
} from '../database/models';

// The related data the old Server loaded with every product (same associations, same aliases)
export const productInformation: Includeable = {
  model: Productinformation,
  as: 'product_information',
  required: false,
  include: [{ model: ProductAdditionInformation, as: 'product_additional_information_list' }],
};

// the same without the additional information (discounts and the single-product answer load it like this)
export const productInformationPlain: Includeable = { model: Productinformation, as: 'product_information' };

export const variants: Includeable = { model: ProductVariant, as: 'variant_list' };
export const deliveryTime: Includeable = { model: Levertijden, as: 'levertijd' };
export const department: Includeable = { model: Department, as: 'department' };
export const departmentOptional: Includeable = { model: Department, required: false, as: 'department' };

export const discounts: Includeable = {
  model: ProductHasDiscount,
  as: 'product_has_discount_list',
  required: false,
  include: [{ model: Discounts, as: 'discount_info' }],
};

export const favoritesOf = (customerId: string): Includeable => ({
  model: CustomerHasFavorite,
  as: 'favorite_products_list',
  where: { customer_id: customerId },
  required: false,
});

// Nutrition facts of a product, only loaded for the single-product answer
export const nutrients: Includeable = {
  model: Nutrients,
  as: 'nutrients',
  include: [
    {
      model: NutrientRecords,
      as: 'nutrient_records',
      include: [
        { model: PrecisionTypes, as: 'precision_type' },
        { model: RecordUoMs, as: 'record_uom' },
        { model: NutrientTypes, as: 'nutrient_type' },
      ],
    },
    { model: PortionUoMs, as: 'portion_uom' },
  ],
};

export { Product };
