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
            maxConcurrent: 1,
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
        // return this.orderPlacementQueue.schedule(() => {
        Core.logger().silly(`IQOptionApi::sendOrder`, {
            market,
            side,
            time,
            amount,
        });
        const requestID = orderId !== null && orderId !== void 0 ? orderId : await this.getNextRequestID();
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
        // });
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
        const requestID = orderId !== null && orderId !== void 0 ? orderId : await this.getNextRequestID();
        const timeCalculated = Math.floor(parseInt(moment()
            .tz("UTC")
            .add(realTime, "minutes")
            .format("mm"), undefined) / realTime) * realTime;
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
                        this.iqOptionWs
                            .socket()
                            .off("message", listener);
                        resolve(messageJSON.msg);
                    }
                    if (messageJSON.name ===
                        Core.IQOptionAction.DIGITAL_OPEN_PLACED &&
                        messageJSON.request_id === String(requestID) &&
                        messageJSON.status === 5000) {
                        this.iqOptionWs
                            .socket()
                            .off("message", listener);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVFPcHRpb25BcGkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGliL1NlcnZpY2UvSVFPcHRpb25TZXJ2aWNlL0lRT3B0aW9uQXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBOzs7Ozs7O0dBT0c7QUFDSCwyQ0FBb0M7QUFDcEMsMENBQTBDO0FBQzFDLDhCQUE4QjtBQUM5Qix1REFBb0Q7QUFDcEQsNkNBQTBDO0FBRTFDOztHQUVHO0FBQ0gsTUFBYSxXQUFXO0lBbURwQjs7Ozs7T0FLRztJQUNILFlBQVksS0FBYSxFQUFFLFFBQWdCO1FBeEQzQzs7V0FFRztRQUNjLG1CQUFjLEdBQVcsSUFBSSxDQUFDO1FBRS9DOztXQUVHO1FBQ2MsdUJBQWtCLEdBQVcsSUFBSSxDQUFDO1FBRW5EOztXQUVHO1FBQ2MsZ0NBQTJCLEdBQVcsSUFBSSxDQUFDO1FBRTVEOztXQUVHO1FBQ2Msc0NBQWlDLEdBQVcsSUFBSSxDQUFDO1FBRWxFOztXQUVHO1FBQ0ssY0FBUyxHQUFXLENBQUMsQ0FBQztRQVk5Qjs7V0FFRztRQUNjLHdCQUFtQixHQUFHLElBQUksb0JBQVUsQ0FBQztZQUNsRCxhQUFhLEVBQUUsQ0FBQztZQUNoQixPQUFPLEVBQUUsQ0FBQztTQUNiLENBQUMsQ0FBQztRQUVIOztXQUVHO1FBQ2UsdUJBQWtCLEdBQUcsSUFBSSxvQkFBVSxDQUFDO1lBQ2xELGFBQWEsRUFBRSxDQUFDO1NBQ25CLENBQUMsQ0FBQztRQVNDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQztRQUNoRCxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksaUNBQWUsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDNUQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLHVCQUFVLEVBQUUsQ0FBQztJQUN2QyxDQUFDO0lBRUQ7O09BRUc7SUFDSSxZQUFZO1FBQ2YsSUFBSSxDQUFDLE1BQU0s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