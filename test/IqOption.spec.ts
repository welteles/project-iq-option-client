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
describe("IqOptionApi", () => {
    describe("IqOptionClient", () => {
        test("Should return not authenticated user", async (done) => {
            const iqOptionClient = new IQOptionApi("", "");
            iqOptionClient.connectAsync().catch(async () => done());
        });
        test("Should return authenticated user", async (done) => {
            const iqOptionClient = new IQOptionApi(email, password);
            iqOptionClient.connectAsync().then(async () => done());
        });
        test("Should create reject order binary 1M - BUY", async (done) => {
            const iqOptionClient = new IQOptionApi(email, password);
            const profile = await iqOptionClient.connectAsync();
            const balance = profile.balances
                .filter((f) => f.type === IQOptionCurrencyType.TEST)
                .shift();
            await iqOptionClient
                .sendOrderBinary(
                    market,
                    IQOptionModel.BUY,
                    iqOptionExpired(1),
                    balance!.id,
                    120,
                    10
                )
                .catch(done());
        });
        test("Should create order binary 1M - BUY", async (done) => {
            const iqOptionClient = new IQOptionApi(email, password);
            const profile = await iqOptionClient.connectAsync();
            const balance = profile.balances
                .filter((f) => f.type === IQOptionCurrencyType.TEST)
                .shift();
            const initializationData =
                await iqOptionClient.getInitializationData();
            const percent =
                100 -
                initializationData[IQOptionMode.TURBO].actives[market].option
                    .profit.commission;
            await iqOptionClient.sendOrderBinary(
                market,
                IQOptionModel.BUY,
                iqOptionExpired(1),
                balance!.id,
                percent,
                10
            );
            done();
        });
        test("Should create order binary 1M - SELL", async (done) => {
            const iqOptionClient = new IQOptionApi(email, password);
            const profile = await iqOptionClient.connectAsync();
            const balance = profile.balances
                .filter((f) => f.type === IQOptionCurrencyType.TEST)
                .shift();
            const initializationData =
                await iqOptionClient.getInitializationData();
            const percent =
                100 -
                initializationData[IQOptionMode.TURBO].actives[market].option
                    .profit.commission;
            await iqOptionClient.sendOrderBinary(
                market,
                IQOptionModel.SELL,
                iqOptionExpired(1),
                balance!.id,
                percent,
                10
            );
            done();
        });
        test("Should create order binary 2M - BUY", async (done) => {
            const iqOptionClient = new IQOptionApi(email, password);
            const profile = await iqOptionClient.connectAsync();
            const balance = profile.balances
                .filter((f) => f.type === IQOptionCurrencyType.TEST)
                .shift();
            const initializationData =
                await iqOptionClient.getInitializationData();
            const percent =
                100 -
                initializationData[IQOptionMode.TURBO].actives[market].option
                    .profit.commission;
            await iqOptionClient.sendOrderBinary(
                market,
                IQOptionModel.BUY,
                iqOptionExpired(2),
                balance!.id,
                percent,
                10
            );
            done();
        });
        test("Should create order binary 2M - SELL", async (done) => {
            const iqOptionClient = new IQOptionApi(email, password);
            const profile = await iqOptionClient.connectAsync();
            const balance = profile.balances
                .filter((f) => f.type === IQOptionCurrencyType.TEST)
                .shift();
            const initializationData =
                await iqOptionClient.getInitializationData();
            const percent =
                100 -
                initializationData[IQOptionMode.TURBO].actives[market].option
                    .profit.commission;
            await iqOptionClient.sendOrderBinary(
                market,
                IQOptionModel.SELL,
                iqOptionExpired(2),
                balance!.id,
                percent,
                10
            );
            done();
        });
        test("Should create order binary 3M - BUY", async (done) => {
            const iqOptionClient = new IQOptionApi(email, password);
            const profile = await iqOptionClient.connectAsync();
            const balance = profile.balances
                .filter((f) => f.type === IQOptionCurrencyType.TEST)
                .shift();
            const initializationData =
                await iqOptionClient.getInitializationData();
            const percent =
                100 -
                initializationData[IQOptionMode.TURBO].actives[market].option
                    .profit.commission;
            await iqOptionClient.sendOrderBinary(
                market,
                IQOptionModel.BUY,
                iqOptionExpired(3),
                balance!.id,
                percent,
                10
            );
            done();
        });
        test("Should create order binary 3M - SELL", async (done) => {
            const iqOptionClient = new IQOptionApi(email, password);
            const profile = await iqOptionClient.connectAsync();
            const balance = profile.balances
                .filter((f) => f.type === IQOptionCurrencyType.TEST)
                .shift();
            const initializationData =
                await iqOptionClient.getInitializationData();
            const percent =
                100 -
                initializationData[IQOptionMode.TURBO].actives[market].option
                    .profit.commission;
            await iqOptionClient.sendOrderBinary(
                market,
                IQOptionModel.SELL,
                iqOptionExpired(3),
                balance!.id,
                percent,
                10
            );
            done();
        });
        test("Should create order binary 4M - BUY", async (done) => {
            const iqOptionClient = new IQOptionApi(email, password);
            const profile = await iqOptionClient.connectAsync();
            const balance = profile.balances
                .filter((f) => f.type === IQOptionCurrencyType.TEST)
                .shift();
            const initializationData =
                await iqOptionClient.getInitializationData();
            const percent =
                100 -
                initializationData[IQOptionMode.TURBO].actives[market].option
                    .profit.commission;
            await iqOptionClient.sendOrderBinary(
                market,
                IQOptionModel.BUY,
                iqOptionExpired(4),
                balance!.id,
                percent,
                10
            );
            done();
        });
        test("Should create order binary 4M - SELL", async (done) => {
            const iqOptionClient = new IQOptionApi(email, password);
            const profile = await iqOptionClient.connectAsync();
            const balance = profile.balances
                .filter((f) => f.type === IQOptionCurrencyType.TEST)
                .shift();
            const initializationData =
                await iqOptionClient.getInitializationData();
            const percent =
                100 -
                initializationData[IQOptionMode.TURBO].actives[market].option
                    .profit.commission;
            await iqOptionClient.sendOrderBinary(
                market,
                IQOptionModel.SELL,
                iqOptionExpired(4),
                balance!.id,
                percent,
                10
            );
            done();
        });
        test("Should create order binary 5M - BUY", async (done) => {
            const iqOptionClient = new IQOptionApi(email, password);
            const profile = await iqOptionClient.connectAsync();
            const balance = profile.balances
                .filter((f) => f.type === IQOptionCurrencyType.TEST)
                .shift();
            const initializationData =
                await iqOptionClient.getInitializationData();
            const percent =
                100 -
                initializationData[IQOptionMode.TURBO].actives[market].option
                    .profit.commission;
            await iqOptionClient.sendOrderBinary(
                market,
                IQOptionModel.BUY,
                iqOptionExpired(5),
                balance!.id,
                percent,
                10
            );
            done();
        });
        test("Should create order binary 5M - SELL", async (done) => {
            const iqOptionClient = new IQOptionApi(email, password);
            const profile = await iqOptionClient.connectAsync();
            const balance = profile.balances
                .filter((f) => f.type === IQOptionCurrencyType.TEST)
                .shift();
            const initializationData =
                await iqOptionClient.getInitializationData();
            const percent =
                100 -
                initializationData[IQOptionMode.TURBO].actives[market].option
                    .profit.commission;
            await iqOptionClient.sendOrderBinary(
                market,
                IQOptionModel.SELL,
                iqOptionExpired(5),
                balance!.id,
                percent,
                10
            );
            done();
        });
        test("Should create order digital 1M - BUY", async (done) => {
            const iqOptionClient = new IQOptionApi(email, password);
            const profile = await iqOptionClient.connectAsync();
            const balance = profile.balances
                .filter((f) => f.type === IQOptionCurrencyType.TEST)
                .shift();
            const time = 1;
            const digitalInstruments =
                await iqOptionClient.getDigitalOptionInstruments(market);
            const instrument = digitalInstruments.instruments
                .filter((f: any) => f.period === time * 60)
                .pop();
            const amount = 10;
            await iqOptionClient.sendOrderDigital(
                market,
                IQOptionModel.BUY,
                time,
                balance!.id,
                amount,
                instrument!.index
            );
            done();
        });
        test("Should create order digital 1M - SELL", async (done) => {
            const iqOptionClient = new IQOptionApi(email, password);
            const profile = await iqOptionClient.connectAsync();
            const balance = profile.balances
                .filter((f) => f.type === IQOptionCurrencyType.TEST)
                .shift();
            const time = 1;
            const digitalInstruments =
                await iqOptionClient.getDigitalOptionInstruments(market);
            const instrument = digitalInstruments.instruments
                .filter((f: any) => f.period === time * 60)
                .pop();
            const amount = 10;
            await iqOptionClient.sendOrderDigital(
                market,
                IQOptionModel.SELL,
                time,
                balance!.id,
                amount,
                instrument!.index
            );
            done();
        });
        test("Should create order digital 5M - BUY", async (done) => {
            const iqOptionClient = new IQOptionApi(email, password);
            const profile = await iqOptionClient.connectAsync();
            const balance = profile.balances
                .filter((f) => f.type === IQOptionCurrencyType.TEST)
                .shift();
            const time = 5;
            const digitalInstruments =
                await iqOptionClient.getDigitalOptionInstruments(market);
            const instrument = digitalInstruments.instruments
                .filter((f: any) => f.period === time * 60)
                .pop();
            const amount = 5;
            await iqOptionClient.sendOrderDigital(
                market,
                IQOptionModel.BUY,
                time,
                balance!.id,
                amount,
                instrument!.index
            );
            done();
        });
        test("Should create order digital 5M - SELL", async (done) => {
            const iqOptionClient = new IQOptionApi(email, password);
            const profile = await iqOptionClient.connectAsync();
            const balance = profile.balances
                .filter((f) => f.type === IQOptionCurrencyType.TEST)
                .shift();
            const time = 5;
            const digitalInstruments =
                await iqOptionClient.getDigitalOptionInstruments(market);
            const instrument = digitalInstruments.instruments
                .filter((f: any) => f.period === time * 60)
                .pop();
            const amount = 10;
            await iqOptionClient.sendOrderDigital(
                market,
                IQOptionModel.SELL,
                time,
                balance!.id,
                amount,
                instrument!.index
            );
            done();
        });
        test("Should create order digital 15M - BUY", async (done) => {
            const iqOptionClient = new IQOptionApi(email, password);
            const profile = await iqOptionClient.connectAsync();
            const balance = profile.balances
                .filter((f) => f.type === IQOptionCurrencyType.TEST)
                .shift();
            const time = 15;
            const digitalInstruments =
                await iqOptionClient.getDigitalOptionInstruments(market);
            const instrument = digitalInstruments.instruments
                .filter((f: any) => f.period === time * 60)
                .pop();
            const amount = 10;
            await iqOptionClient.sendOrderDigital(
                market,
                IQOptionModel.BUY,
                time,
                balance!.id,
                amount,
                instrument!.index
            );
            done();
        });
        test("Should create order digital 15M - SELL", async (done) => {
            const iqOptionClient = new IQOptionApi(email, password);
            const profile = await iqOptionClient.connectAsync();
            const balance = profile.balances
                .filter((f) => f.type === IQOptionCurrencyType.TEST)
                .shift();
            const time = 15;
            const digitalInstruments =
                await iqOptionClient.getDigitalOptionInstruments(market);
            const instrument = digitalInstruments.instruments
                .filter((f: any) => f.period === time * 60)
                .pop();
            const amount = 10;
            await iqOptionClient.sendOrderDigital(
                market,
                IQOptionModel.SELL,
                time,
                balance!.id,
                amount,
                instrument!.index
            );
            done();
        });
    });
});
