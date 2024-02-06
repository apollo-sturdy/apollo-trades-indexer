import {
  CosmosEvent,
} from "@subql/types-cosmos";
import { CoinPrice, Swap, UserSummary } from "../types";
import fetch, {Response} from 'node-fetch';

const APOLLO_DENOM = "factory/neutron154gg0wtm2v4h9ur8xg32ep64e8ef0g5twlsgvfeajqwghdryvyqsqhgk8e/APOLLO";
const WSTETH_DENOM = "factory/neutron1ug740qrkquxzrk2hh29qrlx3sktkfml3je7juusc2te7xmvsscns0n2wry/wstETH";
const ASTRO_DENOM = "ibc/5751B8BCDA688FD0A8EC0B292EEF1CDEAB4B766B63EC632778B196D317C40C3A";
const NOBLE_USDC_DENOM = "ibc/B559A80D62249C8AA07A380E2A2BEA6E5CA9A6F079C912C3A9E9B494105E4F81";

const COINGECKO_IDS: Record<string,string> = {
  [WSTETH_DENOM]: "wrapped-steth",
  [ASTRO_DENOM]: "astroport-fi",
  [NOBLE_USDC_DENOM]: "usd-coin",
}

const DENOM_DECIMALS: Record<string, number> = {
  [APOLLO_DENOM]: 6,
  [WSTETH_DENOM]: 18,
  [ASTRO_DENOM]: 6,
  [NOBLE_USDC_DENOM]: 6,
}

/// Creates a new date object with the time set to 00:00:00
function dateWithNoTime(date: Date): Date {
  return new Date(date.toISOString().split('T')[0]);
}

async function getCoingeckoPrice(denom: string, date: Date): Promise<number> {
  date = dateWithNoTime(date);
  const coingeckoId = COINGECKO_IDS[denom];
  if (!coingeckoId) {
    throw new Error(`No coingecko id found for ${denom}`);
  }

  // Try reading from db for this date
  logger.info(`Fetching price from database for ${coingeckoId} at ${date.toISOString()}`);
  const coinPrice: CoinPrice | undefined = (await CoinPrice.getByFields([
    ["id", "=", `${coingeckoId}-${date.toISOString()}`],
    // ["date", "=", date],
  ]))[0];
  if (coinPrice) {
    return coinPrice.price;
  }

  // If not stored, fetch from coingecko
  // Get date string in dd-mm-yyyy format
  const dateStr = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  const url = `https://api.coingecko.com/api/v3/coins/${coingeckoId}/history?date=${dateStr}&localization=false`;

  let response: Response | undefined = undefined;
  const retries = 5;
  for (let i = 0; i < retries; i++) {
    logger.info(`Fetching price for ${denom} at ${dateStr}`);
    response = await fetch(url);
    if (response.status !== 429) {
      break;
    }
    // Exponential back off
    logger.info(`response: ${JSON.stringify(response.json(), null, 2)}`);
    logger.info(`headers: ${JSON.stringify(response.headers, null, 2)}`);
    const waitTime = 10 * Math.pow(2, i + 1);
    logger.info(`Rate limited by coingecko, retrying in ${waitTime} seconds`);
    await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
  }
  if (!response || response.status !== 200) {
    logger.error(`Failed to fetch price for ${denom} at ${dateStr}`);
    throw new Error(`Failed to fetch price for ${denom} at ${dateStr}`);
  }

  const data: any = await response.json();
  if (!data || !data.market_data || !data.market_data.current_price || !data.market_data.current_price.usd) {
    logger.error(`Invalid response from coingecko for ${denom} at ${date}`);
    logger.error(`url: ${url} | response: ${JSON.stringify(data, null, 2)}`)
    throw new Error(`Invalid response from coingecko for ${denom} at ${date}`);
  }
  const price = Number(data.market_data.current_price.usd);
  if (!price || price === null || isNaN(price) || price <= 0 || !isFinite(price)) {
    throw new Error(`Invalid price for ${denom} at ${date}`);
  }

  // Save to db
  const newCoinPrice = CoinPrice.create({
    coingeckoId,
    date,
    id: `${coingeckoId}-${date.toISOString()}`,
    price
  });
  await newCoinPrice.save();

  return price;
}


export async function handleSwap(event: CosmosEvent): Promise<void> {
  logger.info(`Handling swap event`);
  const attributes = event.event.attributes;
  const msg = event.msg;
  const sender = msg.msg.decodedMsg.sender;
  const date = dateWithNoTime(new Date(event.block.header.time.toISOString()));
  if (!sender) {
    logger.error(`No sender found in swap event`);
    // logger.info(`event: ${JSON.stringify(event, null, 2)}`);
    logger.info(`msg: ${JSON.stringify(msg, null, 2)}`);
    return;
  }

  const offerAsset = attributes.find(attr => attr.key === 'offer_asset')?.value;
  const askAsset = attributes.find(attr => attr.key === 'ask_asset')?.value;
  const offerAmount = attributes.find(attr => attr.key === 'offer_amount')?.value;
  const returnAmount = attributes.find(attr => attr.key === 'return_amount')?.value;
  const recipient = attributes.find(attr => attr.key === 'receiver')?.value;

  if (!offerAsset || !askAsset || !offerAmount || !returnAmount || !recipient) {
    logger.error(`Missing required attributes for swap event: ${offerAsset} | ${askAsset} | ${offerAmount} | ${returnAmount} | ${recipient}`);
    return;
  }
  logger.info(`Swap Event: ${offerAsset} -> ${askAsset} | ${offerAmount} -> ${returnAmount} | ${recipient}`);

  let swapType: 'buy' | 'sell' = 'buy';
  if (offerAsset === APOLLO_DENOM) {
    swapType = 'sell';
  }

  // Get price for non APOLLO asset
  let otherAsset = swapType === 'buy' ? offerAsset : askAsset;
  let decimals = DENOM_DECIMALS[otherAsset];
  let price = await getCoingeckoPrice(otherAsset, date);

  const swap = Swap.create({
    offerAsset,
    askAsset,
    offerAmount: BigInt(offerAmount),
    returnAmount: BigInt(returnAmount),
    recipient,
    sender,
    blockHeight: BigInt(event.block.block.header.height),
    date,
    id: `${event.tx.hash}-${event.idx}`,
    transactionHash: event.tx.hash,
  });
  await swap.save();

  // Increment the users summary
  await UserSummary.get(sender).then(async (userSummary) => {
    if (!userSummary) {
      userSummary = UserSummary.create({
        id: sender,
        address: sender,
        totalBought: BigInt(0),
        totalSold: BigInt(0),
        totalUSDReceived: BigInt(0),
        totalUSDSpent: BigInt(0),
      });
    }
    if (swapType === 'buy') {
      userSummary.totalBought += swap.returnAmount;
      logger.info(`offerAsset: ${offerAsset} | offerAmount: ${offerAmount} | price: ${price}`);
      const offerAmountScaled = Number(offerAmount) / Math.pow(10,decimals);
      logger.info(`returnAmountScaled: ${offerAmountScaled} | price: ${price}`);
      const usdSpent = BigInt((offerAmountScaled * price).toFixed(0));
      logger.info(`usdSpent: ${usdSpent}`);
      userSummary.totalUSDSpent += usdSpent;
    } else {
      userSummary.totalSold += swap.offerAmount;
      logger.info(`askAsset ${askAsset} | returnAmount: ${returnAmount} | price: ${price}`);
      const returnAmountScaled = Number(returnAmount) / Math.pow(10,decimals);
      logger.info(`offerAmountScaled: ${returnAmountScaled} | price: ${price}`);
      const usdReceived = BigInt((returnAmountScaled * price).toFixed(0));
      logger.info(`usdReceived: ${usdReceived}`);
      userSummary.totalUSDReceived += usdReceived;
    }
    await userSummary.save();
  });
}
