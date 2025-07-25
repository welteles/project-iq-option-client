jest.setTimeout(30000); // aumentamos para garantir tempo extra

import {
  IQOptionApi,
  IQOptionCurrencyType,
  iqOptionExpired,
  IQOptionMarket,
  IQOptionMode,
  IQOptionModel,
} from "../src/lib";

const email = "liie.m@excelbangkok.com";
const password = "Code11054";
const market = IQOptionMarket.EURUSD_OTC;

let client: IQOptionApi;
let balance: any;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getProfitPercent = async () => {
  const data = await client.getInitializationData();
  return 100 - data[IQOptionMode.TURBO].actives[market].option.profit.commission;
};

beforeAll(async () => {
  client = new IQOptionApi(email, password);
  const profile = await client.connectAsync();
  balance = profile.balances.find((b) => b.type === IQOptionCurrencyType.TEST);
});

afterEach(async () => {
  await sleep(3000); // espera entre testes para evitar 429
});

describe("IqOptionClient", () => {
  test("Should reject unauthenticated user", async () => {
    const invalidClient = new IQOptionApi("", "");
    await expect(invalidClient.connectAsync()).rejects.toBeDefined();
  });

  test("Should authenticate user", async () => {
    expect(client).toBeDefined();
    expect(balance).toBeDefined();
  });

  const binaryOrders = [1, 2, 3, 4, 5];
  for (const time of binaryOrders) {
    test(`Binary ${time}M - BUY`, async () => {
      const percent = await getProfitPercent();
      await expect(
        client.sendOrderBinary(
          market,
          IQOptionModel.BUY,
          iqOptionExpired(time),
          balance!.id,
          percent,
          10
        )
      ).resolves.toBeDefined();
    });

    test(`Binary ${time}M - SELL`, async () => {
      const percent = await getProfitPercent();
      await expect(
        client.sendOrderBinary(
          market,
          IQOptionModel.SELL,
          iqOptionExpired(time),
          balance!.id,
          percent,
          10
        )
      ).resolves.toBeDefined();
    });
  }

  const digitalOrders = [1, 5, 15];
  for (const time of digitalOrders) {
    test(`Digital ${time}M - BUY`, async () => {
      const instruments = await client.getDigitalOptionInstruments(market);
      const instrument = instruments.instruments.find(
        (f: any) => f.period === time * 60
      );
      expect(instrument).toBeDefined();

      await expect(
        client.sendOrderDigital(
          market,
          IQOptionModel.BUY,
          time,
          balance!.id,
          10,
          instrument!.index
        )
      ).resolves.toBeDefined();
    });

    test(`Digital ${time}M - SELL`, async () => {
      const instruments = await client.getDigitalOptionInstruments(market);
      const instrument = instruments.instruments.find(
        (f: any) => f.period === time * 60
      );
      expect(instrument).toBeDefined();

      await expect(
        client.sendOrderDigital(
          market,
          IQOptionModel.SELL,
          time,
          balance!.id,
          10,
          instrument!.index
        )
      ).resolves.toBeDefined();
    });
  }
});
