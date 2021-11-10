"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
    sendOrderBinary(market, side, time, userBalanceId, profitPercent, amount) {
        return this.orderPlacementQueue.schedule(() => {
            Core.logger().silly(`IQOptionApi::sendOrder`, {
                market,
                side,
                time,
                amount,
            });
            const requestID = this.getNextRequestID();
            return this.iqOptionWs
                .send(Core.IQOptionName.SEND_MESSAGE, {
                name: Core.IQOptionAction.BINARY_OPEN_OPTION,
                version: "1.0",
                body: {
                    user_balance_id: userBalanceId,
                    active_id: market,
                    option_type_id: 3,
                    direction: side,
                    expired: time,
                    refund_value: 0,
                    price: amount,
                    profit_percent: profitPercent,
                },
            }, requestID)
                .then(() => {
                return new Promise((resolve, reject) => {
                    const listener = (message) => {
                        const messageJSON = JSON.parse(message.toString());
                        if (messageJSON.name ===
                            Core.IQOptionAction.BINARY_OPTION_OPENED) {
                            if (messageJSON.msg.active_id === market) {
                                this.iqOptionWs
                                    .socket()
                                    .off("message", listener);
                                resolve(messageJSON.msg);
                            }
                        }
                        if (messageJSON.name ===
                            Core.IQOptionAction.BINARY_OPTION_REJECT) {
                            if (messageJSON.msg.active_id === market) {
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
     * Send order.
     *
     * @param market
     * @param side
     * @param realTime
     * @param userBalanceId
     * @param amount
     */
    sendOrderDigital(market, side, realTime, userBalanceId, amount) {
        return this.orderPlacementQueue.schedule(() => {
            Core.logger().silly(`IQOptionApi::sendOrder`, {
                market,
                side,
                realTime,
                amount,
            });
            const requestID = this.getNextRequestID();
            let time = moment()
                .tz("UTC")
                .add(realTime, "minutes")
                .format("HHmm");
            if (realTime === 5 || realTime === 15) {
                const timeCalculated = Math.floor(parseInt(moment()
                    .tz("UTC")
                    .add(realTime, "minutes")
                    .format("mm"), undefined) / realTime) * realTime;
                time = moment
                    .tz(moment().tz("UTC").format("YYYY-MM-DD HH:00:00"), "UTC")
                    .add(timeCalculated, "minutes")
                    .format("HHmm");
            }
            const sideDigital = side === Core.IQOptionModel.BUY ? "C" : "P";
            const date = moment().tz("UTC").format("YYYYMMDD");
            return this.iqOptionWs
                .send(Core.IQOptionName.SEND_MESSAGE, {
                name: Core.IQOptionAction.DIGITAL_OPEN_OPTION,
                version: "1.0",
                body: {
                    user_balance_id: userBalanceId,
                    instrument_id: `do${Core.IQOptionMarketInvert[market]}${date}${time}${sideDigital}T${realTime}MCSPT`,
                    amount: String(amount),
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
     * Get next request id.
     */
    getNextRequestID() {
        this.requestID++;
        return this.requestID;
    }
}
exports.IQOptionApi = IQOptionApi;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVFPcHRpb25BcGkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGliL1NlcnZpY2UvSVFPcHRpb25TZXJ2aWNlL0lRT3B0aW9uQXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7Ozs7R0FPRztBQUNILDJDQUFvQztBQUNwQywwQ0FBMEM7QUFDMUMsOEJBQThCO0FBQzlCLHVEQUFvRDtBQUNwRCw2Q0FBMEM7QUFFMUM7O0dBRUc7QUFDSCxNQUFhLFdBQVc7SUF1Q3BCOzs7OztPQUtHO0lBQ0gsWUFBWSxLQUFhLEVBQUUsUUFBZ0I7UUE1QzNDOztXQUVHO1FBQ2MsbUJBQWMsR0FBVyxJQUFJLENBQUM7UUFFL0M7O1dBRUc7UUFDYyx1QkFBa0IsR0FBVyxJQUFJLENBQUM7UUFFbkQ7O1dBRUc7UUFDYyxnQ0FBMkIsR0FBVyxJQUFJLENBQUM7UUFFNUQ7O1dBRUc7UUFDSyxjQUFTLEdBQVcsQ0FBQyxDQUFDO1FBWTlCOztXQUVHO1FBQ2Msd0JBQW1CLEdBQUcsSUFBSSxvQkFBVSxDQUFDO1lBQ2xELGFBQWEsRUFBRSxDQUFDO1lBQ2hCLE9BQU8sRUFBRSxDQUFDO1NBQ2IsQ0FBQyxDQUFDO1FBU0MsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBQ2hELElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxpQ0FBZSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztRQUM1RCxJQUFJLENBQUMsVUFBVSxHQUFHLElBQUksdUJBQVUsRUFBRSxDQUFDO0lBQ3ZDLENBQUM7SUFFRDs7T0FFRztJQUNJLFlBQVk7UUFDZixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUM7UUFDakQsT0FBTyxJQUFJLENBQUMsZUFBZTthQUN0QixJQUFJLEVBQUU7YUFDTixJQUFJLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUNaLE9B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