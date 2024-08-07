import Queue from 'bull';
import { Market, User } from '../models';
import { computeLtv } from './ltv';
import { REDIS_URL } from '../constants';
import { getOraclePrice } from './oracle';

const eventQueue = new Queue('event-processing', REDIS_URL);

eventQueue.process(async (job) => {
  const { eventName, eventData } = job.data;

  switch (eventName) {
    case 'MarketCreated':
      await handleMarketCreated(eventData);
      break;
    case 'Supplied':
    case 'Withdrawn':
    case 'Borrowed':
    case 'Repaid':
    case 'Liquidated':
      await handleUserEvent(eventName, eventData);
      break;
  }
});

async function handleMarketCreated(data: any) {
  await Market.create({
    address: data.marketAddress,
    lltv: data.lltv,
    totalBorrowAssets: '0',
    totalBorrowShares: '0',
    lastUpdateTimestamp: Math.floor(Date.now() / 1000),
    lastRate: '0',
  });
}

async function handleUserEvent(eventName: string, data: any) {
  let user = await User.findOne({
    where: { address: data.user, marketAddress: data.marketAddress },
  });

  if (!user) {
    user = await User.create({
      address: data.user,
      marketAddress: data.marketAddress,
      borrowShares: '0',
      collateral: '0',
      ltv: 0,
    });
  }

  // Update user data based on event type
  // This is a simplified example, you'll need to implement the actual logic
  switch (eventName) {
    case 'Supplied':
      user.collateral = (BigInt(user.collateral) + BigInt(data.amount)).toString();
      break;
    case 'Withdrawn':
      user.collateral = (BigInt(user.collateral) - BigInt(data.amount)).toString();
      break;
    case 'Borrowed':
      user.borrowShares = (BigInt(user.borrowShares) + BigInt(data.shares)).toString();
      break;
    case 'Repaid':
      user.borrowShares = (BigInt(user.borrowShares) - BigInt(data.shares)).toString();
      break;
    case 'Liquidated':
      user.collateral = (BigInt(user.collateral) - BigInt(data.seizedAssets)).toString();
      user.borrowShares = (BigInt(user.borrowShares) - BigInt(data.repaidShares)).toString();
      break;
  }

  await user.save();
  await updateUserLTV(user);
}

async function updateUserLTV(user: User) {
  const market = await Market.findByPk(user.marketAddress);
  if (!market) return;

  const oraclePrice = await getOraclePrice(user.marketAddress);
  const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));

  const ltv = computeLtv(
    BigInt(user.borrowShares),
    BigInt(market.totalBorrowAssets),
    BigInt(market.totalBorrowShares),
    BigInt(market.lastUpdateTimestamp),
    currentTimestamp,
    BigInt(market.lastRate),
    BigInt(oraclePrice),
    BigInt(user.collateral),
    BigInt(market.lltv)
  );

  user.ltv = ltv;
  await user.save();
}

export { eventQueue };