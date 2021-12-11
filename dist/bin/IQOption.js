"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findUserBalanceFiat = void 0;
/*
 * Copyright (C) 2020 Wellington Rocha
 * All Rights Reserved.
 *
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * Proprietary and confidential.
 */
const Core = require("../lib");
const util = require("util");
const exec = util.promisify(require("child_process").exec);
const iqOptionApi = new Core.IQOptionApi("liie.m@excelbangkok.com", "Code11054");
const candles = {
    open: [],
    close: [],
    high: [],
    low: [],
};
const findUserBalanceFiat = (balances, currency, test = false) => {
    if (test) {
        return balances.filter((f) => f.type === Core.IQOptionCurrencyType.TEST)[0];
    }
    return balances.filter((f) => f.currency === currency && f.type === Core.IQOptionCurrencyType.FIAT)[0];
};
exports.findUserBalanceFiat = findUserBalanceFiat;
iqOptionApi
    .connectAsync()
    .then(async (profile) => {
    // OPTIONS
    const currency = Core.IQOptionCurrency.USD;
    // const profitPercent = 87;
    const market = Core.IQOptionMarket.EURUSD;
    const tradersSentiment = new Core.IQOptionStreamOptionTradersSentiment(iqOptionApi.getIQOptionWs(), market);
    await tradersSentiment.startStream();
    tradersSentiment.on("data", async (data) => {
        console.log(data);
        if (data.value > 0.8) {
            // console.log(data.value)
            console.log("buy");
            // await exec('cd ~/projects/iq.option.bot && pm2 stop all && pm2 start ecosystem.config.js --no-autorestart >> /dev/null 2>&1');
            // process.exit();
        }
        if (data.value < 0.22) {
            console.log("sell");
            // console.log(data.value)
            // await exec('cd ~/projects/iq.option.bot && cp config.sample.sell.json config.sample.json && pm2 stop all && pm2 start ecosystem.config.js --no-autorestart >> /dev/null 2>&1');
            process.exit();
        }
    });
    //
    // await iqOptionApi.getIQOptionWs().send(Core.IQOptionName.SEND_MESSAGE, {"name":"get-traders-mood","version":"1.0","body":{"instrument":"turbo-option","asset_id":1}});
    // await iqOptionApi.getIQOptionWs().socket().send(JSON.stringify({"name":"sendMessage","request_id":"30","local_time":7747,"msg":{"name":"get-traders-mood","version":"1.0","body":{"instrument":"turbo-option","asset_id":1}}}));
    // await iqOptionApi.getIQOptionWs().socket().send(JSON.stringify({"name":"subscribeMessage","request_id":"s_114","local_time":8897,"msg":{"name":"traders-mood-changed","params":{"routingFilters":{"instrument":"turbo-option","asset_id":"1"}}}}));
    const time = Core.IQOptionTime.ONE_MINUTE;
    // const responseData = await iqOptionApi.getInitializationData();
    // console.log(responseData.turbo.actives["76"]);
    // const responseData2 = await iqOptionApi.getInitializationData();
    // console.log(responseData2);
    const candleStream = new Core.IQOptionStreamCandleGenerated(iqOptionApi.getIQOptionWs(), market, time);
    // const balance = findUserBalanceFiat(profile.balances, currency, true);
    // iqOptionApi.getIQOptionWs().socket().on("message", data => console.log(data));
    // await Core.sleepHelper(2000)
    // await iqOptionApi.getIQOptionWs().send(Core.IQOptionName.SEND_MESSAGE, {"name":"get-commissions","version":"1.0","body":{"instrument_type":"digital-option","user_group_id":193}});
    // await iqOptionApi.getIQOptionWs().send(Core.IQOptionName.SEND_MESSAGE, {"name":"get-active-schedule","version":"1.0","body":{"instrument_type":"digital-option","period":7}});
    // await iqOptionApi.getIQOptionWs().send(Core.IQOptionName.SEND_MESSAGE, );
    // START STREAM
    await candleStream.startStream();
    candleStream.on("data", (data) => {
        candles.open.unshift(data.open);
        candles.close.unshift(data.close);
        candles.high.unshift(data.max);
        candles.low.unshift(data.min);
        candles.open = candles.open.slice(0, 100);
        candles.close = candles.close.slice(0, 100);
        candles.open = candles.open.slice(0, 100);
        candles.low = candles.low.slice(0, 100);
        if (candles.close.length > 50) {
            console.log(candles);
            // Core.logger().silly(`RSI: ${talib.RSI(candles.close, 17)[0]}`);
            // Core.logger().silly(`MACD: ${talib.MACD(candles.close, 12, 26, 9).macd}`)
        }
    });
    // const time = 5;
    // SEND ORDER
    // await iqOptionApi.sendOrderDigital(
    //     Core.IQOptionMarket.EURUSD,
    //     Core.IQOptionModel.SELL,
    //     time,
    //     balance.id,
    //     10
    // );
    // await iqOptionApi.sendOrderBinary(
    //     Core.IQOptionMarket.EURUSD,
    //     Core.IQOptionModel.BUY,
    //     time,
    //     balance.id,
    //     profitPercent,
    //     100
    // );
    // console.log('REQUEST ORDER 2')
    // await iqOptionApi.sendOrderBinary(
    //     Core.IQOptionMarket.EURUSD,
    //     Core.IQOptionModel.BUY,
    //     time,
    //     balance.id,
    //     profitPercent,
    //     100
    // );
    // const ordersCreated = await Promise.all([
    //     iqOptionApi.sendOrderBinary(
    //         Core.IQOptionMarket.EURUSD_OTC,
    //         Core.IQOptionModel.BUY,
    //         time,
    //         balance.id,
    //         profitPercent,
    //         100
    //     )
    // ]);
    // const optionCloseStream = new Core.IQOptionStreamOptionClose(
    //     iqOptionApi.getIQOptionWs(),
    //     market
    // );
    // await optionCloseStream.startStream();
    // optionCloseStream.on("data", data => console.log(data));
    // console.log(console.log(ordersCreated));
    // console.log(requestId);
    // iqOptionApi.getInstruments(market, Core.IQOptionInstrumentType.BINARY)
    // let data;
    // data = await iqOptionApi.getInitializationData();
    // data = await iqOptionApi.getInitializationData();
    // data = await iqOptionApi.getInitializationData();
    // data = await iqOptionApi.getInitializationData();
    // data = await iqOptionApi.getInitializationData();
    // data = await iqOptionApi.getInitializationData();
    // data = await iqOptionApi.getInitializationData();
    // data = await iqOptionApi.getInitializationData();
    // data = await iqOptionApi.getInitializationData();
    // data = await iqOptionApi.getInitializationData();
    // data = await iqOptionApi.getInitializationData();
    // data = await iqOptionApi.getInitializationData();
    // data = await iqOptionApi.getInitializationData();
    // data = await iqOptionApi.getInitializationData();
    // data = await iqOptionApi.getInitializationData();
    // data = await iqOptionApi.getInitializationData();
    // data = await iqOptionApi.getInitializationData();
    // data = await iqOptionApi.getInitializationData();
    // data = await iqOptionApi.getInitializationData();
    // data = await iqOptionApi.getInitializationData();
    // data = await iqOptionApi.getInitializationData();
    // iqOptionApi
    //     .getIQOptionWs()
    //     .socket()
    //     .on("message", (data) => console.log(data));
})
    .catch((e) => {
    Core.logger().error(JSON.stringify(e));
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVFPcHRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYmluL0lRT3B0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBOzs7Ozs7O0dBT0c7QUFDSCwrQkFBK0I7QUFDL0IsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBRTNELE1BQU0sV0FBVyxHQUFHLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FDcEMseUJBQXlCLEVBQ3pCLFdBQVcsQ0FDZCxDQUFDO0FBRUYsTUFBTSxPQUFPLEdBaUJUO0lBQ0EsSUFBSSxFQUFFLEVBQUU7SUFDUixLQUFLLEVBQUUsRUFBRTtJQUNULElBQUksRUFBRSxFQUFFO0lBQ1IsR0FBRyxFQUFFLEVBQUU7Q0FDSCxDQUFDO0FBRUYsTUFBTSxtQkFBbUIsR0FBRyxDQUMvQixRQUFnQyxFQUNoQyxRQUErQixFQUMvQixPQUFnQixLQUFLLEVBQ0QsRUFBRTtJQUN0QixJQUFJLElBQUksRUFBRTtRQUNOLE9BQU8sUUFBUSxDQUFDLE1BQU0sQ0FDbEIsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FDbkQsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNSO0lBQ0QsT0FBTyxRQUFRLENBQUMsTUFBTSxDQUNsQixDQUFDLENBQUMsRUFBRSxFQUFFLENBQ0YsQ0FBQyxDQUFDLFFBQVEsS0FBSyxRQUFRLElBQUksQ0FBQyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUMzRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ1QsQ0FBQyxDQUFDO0FBZFcsUUFBQSxtQkFBbUIsdUJBYzlCO0FBRUYsV0FBVztLQUNOLFlB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