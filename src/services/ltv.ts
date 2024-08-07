// Constants
const ONE_18 = BigInt('1000000000000000000');
const ORACLE_PRICE_SCALE = BigInt('1000000000000000000000000000000000000');

export function mulDivUp(x: bigint, y: bigint, z: bigint): bigint {
  return (x * y + z - BigInt(1)) / z;
}

export function mulDivDown(x: bigint, y: bigint, z: bigint): bigint {
  return (x * y) / z;
}

export function wMulDown(x: bigint, y: bigint): bigint {
  return (x * y) / ONE_18;
}

export function wTaylorCompounded(x: bigint, n: bigint): bigint {
  const firstTerm = x * n;
  const secondTerm = mulDivDown(firstTerm, firstTerm, ONE_18 * BigInt(2));
  const thirdTerm = mulDivDown(secondTerm, firstTerm, ONE_18 * BigInt(3));
  return x + firstTerm + secondTerm + thirdTerm;
}

export function toAssetsUp(shares: bigint, totalAssets: bigint, totalShares: bigint): bigint {
  const VIRTUAL_SHARES = BigInt('1000000');
  const VIRTUAL_ASSETS = BigInt(1);
  return mulDivUp(
    shares,
    totalAssets + VIRTUAL_ASSETS,
    totalShares + VIRTUAL_SHARES
  );
}

export function computeLtv(
  borrowShares: bigint,
  lastTotalBorrowAssets: bigint,
  lastTotalBorrowShares: bigint,
  lastUpdateTimestamp: bigint,
  currentTimestamp: bigint,
  lastRate: bigint,
  oraclePrice: bigint,
  collateral: bigint,
  lltv: bigint
): number {
  if (currentTimestamp > lastUpdateTimestamp && lastRate > BigInt(0)) {
    const elapsed = currentTimestamp - lastUpdateTimestamp;
    const interests = wMulDown(lastTotalBorrowAssets, wTaylorCompounded(lastRate, elapsed));
    lastTotalBorrowAssets = lastTotalBorrowAssets + interests;
  }
  
  const lastBorrowAssets = toAssetsUp(borrowShares, lastTotalBorrowAssets, lastTotalBorrowShares);
  
  if (oraclePrice === BigInt(0) || lastBorrowAssets === BigInt(0)) {
    return 0;
  }
  
  const maxBorrow = wMulDown(mulDivDown(collateral, oraclePrice, ORACLE_PRICE_SCALE), lltv);
  
  if (maxBorrow === BigInt(0)) {
    return 1;
  } else {
    return Number(lastBorrowAssets) / Number(maxBorrow);
  }
}