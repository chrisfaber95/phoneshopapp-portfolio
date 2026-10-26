import { Sequelize } from 'sequelize-typescript';
import { SHOP_MODELS } from '../../src/database/models';

// Puts all models on an in-memory Sequelize instance that never connects, so model metadata (attributes, associations) works in
// unit tests without a database.
export const initModels = (): Sequelize => new Sequelize({ dialect: 'mysql', models: SHOP_MODELS, logging: false });
