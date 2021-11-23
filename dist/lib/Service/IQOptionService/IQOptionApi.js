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
                .then(() => this.iqOptionWs.send(Core.IQOptionName.SSID, token, this.getNextRequestID()))
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
    sendOrderBinary(market, side, time, userBalanceId, profitPercent, amount, orderId) {
        return this.orderPlacementQueue.schedule(() => {
            Core.logger().silly(`IQOptionApi::sendOrder`, {
                market,
                side,
                time,
                amount,
            });
            const requestID = orderId !== null && orderId !== void 0 ? orderId : this.getNextRequestID();
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
                        const messageJSON = JSON.parse(message.toString());
                        if (messageJSON.name ===
                            Core.IQOptionAction.BINARY_OPTION_OPENED) {
                            if (messageJSON.request_id === String(requestID)) {
                                this.iqOptionWs
                                    .socket()
                                    .off("message", listener);
                                resolve(messageJSON.msg);
                            }
                        }
                        if (messageJSON.name ===
                            Core.IQOptionAction.BINARY_OPTION_REJECT) {
                            if (messageJSON.request_id === String(requestID)) {
                                this.iqOptionWs
                                    .socket()
                                    .off("message", listener);
                                reject(messageJSON.msg);
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
    sendOrderDigital(market, side, realTime, userBalanceId, amount, instrumentIndex, orderId) {
        return this.orderPlacementQueue.schedule(() => {
            Core.logger().silly(`IQOptionApi::sendOrder`, {
                market,
                side,
                realTime,
                amount,
            });
            const requestID = orderId !== null && orderId !== void 0 ? orderId : this.getNextRequestID();
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
        });
    }
    /**
     * Get initialization data.
     */
    getInitializationData() {
        return this.orderPlacementQueue.schedule(() => {
            Core.logger().silly(`IQOptionApi::getInitializationData`);
            const requestID = this.getNextRequestID();
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
        return this.orderPlacementQueue.schedule(() => {
            Core.logger().silly(`IQOptionApi::getDigitalOptionInstruments`);
            const requestID = this.getNextRequestID();
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
        this.requestID++;
        return this.requestID;
    }
}
exports.IQOptionApi = IQOptionApi;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVFPcHRpb25BcGkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGliL1NlcnZpY2UvSVFPcHRpb25TZXJ2aWNlL0lRT3B0aW9uQXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBOzs7Ozs7O0dBT0c7QUFDSCwyQ0FBb0M7QUFDcEMsMENBQTBDO0FBQzFDLDhCQUE4QjtBQUM5Qix1REFBb0Q7QUFDcEQsNkNBQTBDO0FBRTFDOztHQUVHO0FBQ0gsTUFBYSxXQUFXO0lBNENwQjs7Ozs7T0FLRztJQUNILFlBQVksS0FBYSxFQUFFLFFBQWdCO1FBakQzQzs7V0FFRztRQUNjLG1CQUFjLEdBQVcsSUFBSSxDQUFDO1FBRS9DOztXQUVHO1FBQ2MsdUJBQWtCLEdBQVcsSUFBSSxDQUFDO1FBRW5EOztXQUVHO1FBQ2MsZ0NBQTJCLEdBQVcsSUFBSSxDQUFDO1FBRTVEOztXQUVHO1FBQ2Msc0NBQWlDLEdBQVcsSUFBSSxDQUFDO1FBRWxFOztXQUVHO1FBQ0ssY0FBUyxHQUFXLENBQUMsQ0FBQztRQVk5Qjs7V0FFRztRQUNjLHdCQUFtQixHQUFHLElBQUksb0JBQVUsQ0FBQztZQUNsRCxhQUFhLEVBQUUsQ0FBQztZQUNoQixPQUFPLEVBQUUsQ0FBQztTQUNiLENBQUMsQ0FBQztRQVNDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsMEJBQTBCLENBQUMsQ0FBQztRQUNoRCxJQUFJLENBQUMsZUFBZSxHQUFHLElBQUksaUNBQWUsQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDNUQsSUFBSSxDQUFDLFVBQVUsR0FBRyxJQUFJLHVCQUFVLEVBQUUsQ0FBQztJQUN2QyxDQUFDO0lBRUQ7O09BRUc7SUFDSSxZQUFZO1FBQ2YsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO1FBQ2pELE9BQU8sSUFBSSxDQUFDLGVBQWU7YUFDdEIsSUFBSSxFQUFFO2FB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