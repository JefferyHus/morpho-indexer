import 'dotenv/config';

export const PORT = String(process.env.PORT);
export const DATABASE_URL = String(process.env.DATABASE_URL);
export const ETHEREUM_RPC_URL = String(process.env.ETHEREUM_RPC_URL);
export const MORPHO_CONTRACT_ADDRESS = String(process.env.MORPHO_CONTRACT_ADDRESS);
export const MORPHO_API_URL = String(process.env.MORPHO_API_URL);
export const REDIS_URL = String(process.env.REDIS_URL);