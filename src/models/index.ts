import { Sequelize, DataTypes, Model, Op } from 'sequelize';
import { DATABASE_URL } from '../constants';

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

class Market extends Model {
    public address!: string;
    public lltv!: string;
    public totalBorrowAssets!: string;
    public totalBorrowShares!: string;
    public lastUpdateTimestamp!: number;
    public lastRate!: string;
    public oracleAddress!: string;
  }
  
  Market.init(
    {
      address: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      lltv: DataTypes.STRING,
      totalBorrowAssets: DataTypes.STRING,
      totalBorrowShares: DataTypes.STRING,
      lastUpdateTimestamp: DataTypes.INTEGER,
      lastRate: DataTypes.STRING,
      oracleAddress: DataTypes.STRING,
    },
    { sequelize, modelName: 'market' }
);

class User extends Model {
  public address!: string;
  public marketAddress!: string;
  public borrowShares!: string;
  public collateral!: string;
  public ltv!: number;
}

User.init(
  {
    address: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    marketAddress: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    borrowShares: DataTypes.STRING,
    collateral: DataTypes.STRING,
    ltv: DataTypes.FLOAT,
  },
  { sequelize, modelName: 'user' }
);

export { sequelize, Market, User, Op };