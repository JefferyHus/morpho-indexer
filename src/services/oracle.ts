import { ethers } from 'ethers';
import { ETHEREUM_RPC_URL } from '../constants';

const oracleABI = [
  {
    "inputs": [],
    "name": "price",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const provider = new ethers.JsonRpcProvider(ETHEREUM_RPC_URL);

export async function getOraclePrice(oracleAddress: string): Promise<bigint> {
  const oracleContract = new ethers.Contract(oracleAddress, oracleABI, provider);
  try {
    const price = await oracleContract.price();
    return price;
  } catch (error) {
    console.error(`Error fetching oracle price for address ${oracleAddress}:`, error);
    return BigInt(0);
  }
}