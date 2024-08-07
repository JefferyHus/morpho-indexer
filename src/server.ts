import express from 'express';
import rateLimit from 'express-rate-limit';
import { ethers } from 'ethers';
import { sequelize, Op, User } from './models';
import { eventQueue } from './services/queue';

const app = express();
const port = PORT ?? 3000;

app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

const provider = new ethers.JsonRpcProvider(ETHEREUM_RPC_URL);
import morphoABI from './abi/morpho.json';
import { ETHEREUM_RPC_URL, MORPHO_CONTRACT_ADDRESS, PORT } from './constants';
const morphoContract = new ethers.Contract(MORPHO_CONTRACT_ADDRESS, morphoABI, provider);

async function startIndexing() {
    const latestBlock = await provider.getBlockNumber();
    const fromBlock = BigInt(latestBlock) - 1000n; // Index last 1000 blocks, adjust as needed
  
    const eventFilter = morphoContract.filters.MarketCreated();
    const events = await morphoContract.queryFilter(eventFilter, fromBlock);
  
    for (const event of events) {
      if (event instanceof ethers.EventLog) {
        await eventQueue.add({
          eventName: 'MarketCreated',
          eventData: {
            marketAddress: event.args[0],
            lltv: event.args[1].toString(),
            oracleAddress: event.args[2],
          },
        });
      }
    }
  
    // Listen for new MarketCreated events
    morphoContract.on('MarketCreated', (marketAddress, lltv, oracleAddress, event) => {
      eventQueue.add({
        eventName: 'MarketCreated',
        eventData: {
          marketAddress,
          lltv: lltv.toString(),
          oracleAddress,
        },
      });
    });
  
    // Add other event listeners for Supplied, Withdrawn, Borrowed, Repaid, Liquidated
    const otherEvents = ['Supplied', 'Withdrawn', 'Borrowed', 'Repaid', 'Liquidated'];
    
    for (const eventName of otherEvents) {
      morphoContract.on(eventName, (...args) => {
        const eventData = args.slice(0, -1); // Remove the last element (Event object)
        eventQueue.add({
          eventName,
          eventData,
        });
      });
    }
  }

app.get('/api/users', async (req, res) => {
  try {
    const { alpha } = req.query;
    let where = {};

    if (alpha) {
      const alphaValue = parseFloat(alpha as string);
      where = { ltv: { [Op.gte]: alphaValue } };
    }

    const users = await User.findAll({ where });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
});

app.get('/api/users/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const user = await User.findAll({ where: { address } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user', error });
  }
});

async function start() {
  await sequelize.sync();
  console.log('Database synced');

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    startIndexing();
  });
}

start();