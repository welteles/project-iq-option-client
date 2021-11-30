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
        // return this.orderPlacementQueue.schedule(() => {
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
    sendOrderDigital(market, side, realTime, userBalanceId, amount, instrumentIndex, orderId) {
        // return this.orderPlacementQueue.schedule(() => {
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
        // });
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