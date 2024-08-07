import { ethers } from 'ethers';
import { ETHEREUM_RPC_URL, MORPHO_CONTRACT_ADDRESS } from '../constants';

const provider = new ethers.JsonRpcProvider(ETHEREUM_RPC_URL);
const morphoContractAddress = MORPHO_CONTRACT_ADDRESS;
import morphoAbi from '../abi/morpho.json';

const morphoContract = new ethers.Contract(morphoContractAddress, morphoAbi, provider);

export interface Borrower {
    address: string;
    collateral: number;
    debt: number;
}

export async function getBorrowers(): Promise<Borrower[]> {
    try {
        const borrowers: string[] = await morphoContract.getBorrowers();
        const borrowerData = await Promise.all(borrowers.map(async (address: string) => {
        const [collateral, debt] = await morphoContract.getPosition(address);
            return {
                address,
                collateral: parseFloat(ethers.formatEther(collateral)),
                debt: parseFloat(ethers.formatEther(debt))
            };
        }));

        return borrowerData;
    } catch (error) {
        console.error('Error fetching borrowers:', error);
        return [];
    }
}