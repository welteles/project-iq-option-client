"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IQOptionApi = void 0;
/*
 * Copyright (C) 2020 Wellington Rocha
 * All Rights Reserved.
 *
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * Proprietary and confidential.
 */
const bottleneck_1 = require("bottleneck");
const moment = require("moment-timezone");
const Core = require("../..");
const IQOptionWrapper_1 = require("./IQOptionWrapper");
const IQOptionWs_1 = require("./IQOptionWs");
/**
 * IQOption api.
 */
class IQOptionApi {
    /**
     * IQOption API.
     *
     * @param email
     * @param password
     */
    constructor(email, password) {
        /**
         * Max wait profile response.
         */
        this.maxWaitProfile = 5000;
        /**
         * Max wait profile response.
         */
        this.maxWaitToSendOrder = 5000;
        /**
         * Max wait profile response.
         */
        this.maxWaitToInitializationData = 5000;
        /**
         * Max wait profile response.
         */
        this.maxWaitToGetDigitalInstrumentData = 5000;
        /**
         * Request ID.
         */
        this.requestID = 0;
        /**
         *  Queue order send.
         */
        this.orderPlacementQueue = new bottleneck_1.default({
            maxConcurrent: 5,
            minTime: 1,
        });
        /**
         *  Queue order send.
         */
        this.nextRequestIDQueue = new bottleneck_1.default({
            maxConcurrent: 1,
        });
        Core.logger().silly("IQOptionApi::constructor");
        this.iqOptionWrapper = new IQOptionWrapper_1.IQOptionWrapper(email, password);
        this.iqOptionWs = new IQOptionWs_1.IQOptionWs();
    }
    /**
     * Connect async.
     */
    connectAsync() {
        Core.logger().silly("IQOptionApi::connectAsync");
        return this.iqOptionWrapper
            .auth()
            .then((token) => {
            return this.iqOptionWs
                .connect()
                .then(async () => this.iqOptionWs.send(Core.IQOptionName.SSID, token, await this.getNextRequestID()))
                .then(() => this.profileAsync())
                .catch((e) => Promise.reject(e));
        })
            .catch((e) => Promise.reject(e));
    }
    /**
     * Get iq option ws.
     */
    getIQOptionWs() {
        return this.iqOptionWs;
    }
    /**
     * Wait to get user profile.
     */
    profileAsync() {
        Core.logger().silly("IQOptionApi::profileAsync");
        return new Promise((resolve, reject) => {
            const listener = (message) => {
                const messageJSON = JSON.parse(message.toString());
                if (messageJSON.name === Core.IQOptionAction.PROFILE) {
                    this.iqOptionWs.socket().off("message", listener);
                    resolve(messageJSON.msg);
                }
            };
            this.iqOptionWs.socket().on("message", listener);
            setTimeout(() => {
                this.iqOptionWs.socket().off("message", listener);
                reject("It was not possible to receive the profile.");
            }, this.maxWaitProfile);
        });
    }
    /**
     * Send order.
     *
     * @param market
     * @param side
     * @param time
     * @param userBalanceId
     * @param profitPercent
     * @param amount
     */
    async sendOrderBinary(market, side, time, userBalanceId, profitPercent, amount, orderId) {
        return this.orderPlacementQueue.schedule(async () => {
            Core.logger().silly(`IQOptionApi::sendOrder`, {
                market,
                side,
                time,
                amount,
            });
            const requestID = orderId !== null && orderId !== void 0 ? orderId : (await this.getNextRequestID());
            return this.iqOptionWs
                .send(Core.IQOptionName.SEND_MESSAGE, {
                name: Core.IQOptionAction.BINARY_OPEN_OPTION,
                version: "1.0",
                body: {
                    active_id: market,
                    direction: side,
                    option_type_id: 3,
                    expired: time,
                    price: amount,
                    user_balance_id: userBalanceId,
                    refund_value: 0,
                    profit_percent: profitPercent,
                },
            }, requestID)
                .then(() => {
                return new Promise((resolve, reject) => {
                    const listener = (message) => {
                        var _a;
                        const messageJSON = JSON.parse(message.toString());
                        if (messageJSON.name ===
                            Core.IQOptionAction.BINARY_OPTION_OPENED) {
                            if (messageJSON.request_id === String(requestID)) {
                                if ((_a = messageJSON.msg) === null || _a === void 0 ? void 0 : _a.message) {
                                    this.iqOptionWs
                                        .socket()
                                        .off("message", listener);
                                    reject(messageJSON.msg);
                                }
                                this.iqOptionWs
                                    .socket()
                                    .off("message", listener);
                                resolve(messageJSON.msg);
                            }
                        }
                        if (messageJSON.name ===
                            Core.IQOptionAction.BINARY_OPTION_REJECT) {
                            if (messageJSON.request_id === String(requestID)) {
                            }
                        }
                    };
                    this.iqOptionWs.socket().on("message", listener);
                    setTimeout(() => {
                        this.iqOptionWs.socket().off("message", listener);
                        reject("It was not possible to send order.");
                    }, this.maxWaitToSendOrder);
                });
            });
        });
    }
    /**
     * Send order digital.
     *
     * @param market
     * @param side
     * @param realTime
     * @param userBalanceId
     * @param amount
     * @param instrumentIndex
     * @param orderId
     */
    async sendOrderDigital(market, side, realTime, userBalanceId, amount, instrumentIndex, orderId) {
        // return this.orderPlacementQueue.schedule(() => {
        Core.logger().silly(`IQOptionApi::sendOrder`, {
            market,
            side,
            realTime,
            amount,
        });
        const requestID = orderId !== null && orderId !== void 0 ? orderId : (await this.getNextRequestID());
        const timeCalculated = Math.floor(parseInt(moment().tz("UTC").add(realTime, "minutes").format("mm"), undefined) / realTime) * realTime;
        const time = moment
            .tz(moment().tz("UTC").format("YYYY-MM-DD HH:00:00"), "UTC")
            .add(timeCalculated, "minutes")
            .format("HHmmss");
        const sideDigital = side === Core.IQOptionModel.BUY ? "C" : "P";
        const date = moment().tz("UTC").format("YYYYMMDD");
        return this.iqOptionWs
            .send(Core.IQOptionName.SEND_MESSAGE, {
            name: Core.IQOptionAction.DIGITAL_OPEN_OPTION,
            version: "2.0",
            body: {
                user_balance_id: userBalanceId,
                instrument_id: `do${market}A${date}D${time}T${realTime}M${sideDigital}SPT`,
                amount: String(amount),
                asset_id: market,
                instrument_index: instrumentIndex,
            },
        }, requestID)
            .then(() => {
            return new Promise((resolve, reject) => {
                const listener = (message) => {
                    const messageJSON = JSON.parse(message.toString());
                    if (messageJSON.name ===
                        Core.IQOptionAction.DIGITAL_OPEN_PLACED &&
                        messageJSON.request_id === String(requestID) &&
                        messageJSON.status === 2000) {
                        this.iqOptionWs.socket().off("message", listener);
                        resolve(messageJSON.msg);
                    }
                    if (messageJSON.name ===
                        Core.IQOptionAction.DIGITAL_OPEN_PLACED &&
                        messageJSON.request_id === String(requestID) &&
                        messageJSON.status === 5000) {
                        this.iqOptionWs.socket().off("message", listener);
                        reject(messageJSON.msg);
                    }
                };
                this.iqOptionWs.socket().on("message", listener);
                setTimeout(() => {
                    this.iqOptionWs.socket().off("message", listener);
                    reject("It was not possible to send order.");
                }, this.maxWaitToSendOrder);
            });
        });
        // });
    }
    /**
     * Get initialization data.
     */
    getInitializationData() {
        return this.orderPlacementQueue.schedule(async () => {
            Core.logger().silly(`IQOptionApi::getInitializationData`);
            const requestID = await this.getNextRequestID();
            return this.iqOptionWs
                .send(Core.IQOptionName.SEND_MESSAGE, {
                name: Core.IQOptionAction.GET_INITIALIZATION_DATA,
                version: "3.0",
                body: {},
            }, requestID)
                .then(() => {
                return new Promise((resolve, reject) => {
                    const listener = (message) => {
                        const messageJSON = JSON.parse(message.toString());
                        if (messageJSON.name ===
                            Core.IQOptionAction.INITIALIZATION_DATA) {
                            this.iqOptionWs
                                .socket()
                                .off("message", listener);
                            resolve(messageJSON.msg);
                        }
                    };
                    this.iqOptionWs.socket().on("message", listener);
                    setTimeout(() => {
                        this.iqOptionWs.socket().off("message", listener);
                        reject("No initialization data.");
                    }, this.maxWaitToInitializationData);
                });
            });
        });
    }
    /**
     *
     * @param market
     * @returns
     */
    getDigitalOptionInstruments(market) {
        return this.orderPlacementQueue.schedule(async () => {
            Core.logger().silly(`IQOptionApi::getDigitalOptionInstruments`);
            const requestID = await this.getNextRequestID();
            return this.iqOptionWs
                .send(Core.IQOptionName.SEND_MESSAGE, {
                name: Core.IQOptionAction
                    .GET_DIGITAL_OPTION_INSTRUMENTS,
                version: "1.0",
                body: {
                    instrument_type: "digital-option",
                    asset_id: market,
                },
            }, requestID)
                .then(() => {
                return new Promise((resolve, reject) => {
                    const listener = (message) => {
                        const messageJSON = JSON.parse(message.toString());
                        if (messageJSON.request_id === String(requestID)) {
                            this.iqOptionWs
                                .socket()
                                .off("message", listener);
                            resolve(messageJSON.msg);
                        }
                    };
                    this.iqOptionWs.socket().on("message", listener);
                    setTimeout(() => {
                        this.iqOptionWs.socket().off("message", listener);
                        reject("No digital instruments data.");
                    }, this.maxWaitToGetDigitalInstrumentData);
                });
            });
        });
    }
    /**
     * Get next request id.
     */
    getNextRequestID() {
        return this.nextRequestIDQueue.schedule(() => {
            this.requestID++;
            return Promise.resolve(this.requestID);
        });
    }
}
exports.IQOptionApi = IQOptionApi;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVFPcHRpb25BcGkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGliL1NlcnZpY2UvSVFPcHRpb25TZXJ2aWNlL0lRT3B0aW9uQXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBOzs7Ozs7O0dBT0c7QUFDSCwyQ0FBb0M7QUFDcEMsMENBQTBDO0FBQzFDLDhCQUE4QjtBQUM5Qix1REFBb0Q7QUFDcEQsNkNBQTBDO0FBRTFDOztHQUVHO0FBQ0gsTUFBYSxXQUFXO0lBbURwQjs7Ozs7T0FLRztJQUNILFlBQVksS0FBYSxFQUFFLFFBQWdCO1FBeEQzQzs7V0FFRztRQUNjLG1CQUFjLEdBQVcsSUFBSSxDQUFDO1FBRS9DOztXQUVHO1FBQ2MsdUJBQWtCLEdBQVcsSUFBSSxDQUFDO1FBRW5EOztXQUVHO1FBQ2MsZ0NBQTJCLEdBQVcsSUFBSSxDQUFDO1FBRTVEOztXQUVHO1FBQ2Msc0NBQWlDLEdBQVcsSUFBSSxDQUFDO1FBRWxFOztXQUVHO1FBQ0ssY0FBUyxHQUFXLENBQUMsQ0FBQztRQVk5Qjs7V0FFRztRQUNjLHdCQUFtQixHQUFHLElBQUksb0JBQVUsQ0FBQztZQUNsRCxhQUFhLEVBQUUsQ0FBQztZQUNoQixPQUFPLEVBQUUsQ0FBQztTQUNiLENBQUMsQ0FBQztRQUVIOztXQUVHO1FBQ2MsdUJBQWtCLEdBQUcsSUFBSSxvQkFBVSxDQUFDO1lBQ2pELGFBQWEsRUFBRSxDQUFDO1NBQ25CLENBQUMsQ0FBQztRQVNDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQztRQUNoRCxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksaUNBQWUsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDNUQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLHVCQUFVLEVBQUUsQ0FBQztJQUN2QyxDQUFDO0lBRUQ7O09BRUc7SUFDSSxZQUFZO1FBQ2YsSUFBSSxDQUFDLE1BQU0s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