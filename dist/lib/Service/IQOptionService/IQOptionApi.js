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
            minTime: 1000,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVFPcHRpb25BcGkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGliL1NlcnZpY2UvSVFPcHRpb25TZXJ2aWNlL0lRT3B0aW9uQXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBOzs7Ozs7O0dBT0c7QUFDSCwyQ0FBb0M7QUFDcEMsMENBQTBDO0FBQzFDLDhCQUE4QjtBQUM5Qix1REFBb0Q7QUFDcEQsNkNBQTBDO0FBRTFDOztHQUVHO0FBQ0gsTUFBYSxXQUFXO0lBbURwQjs7Ozs7T0FLRztJQUNILFlBQVksS0FBYSxFQUFFLFFBQWdCO1FBeEQzQzs7V0FFRztRQUNjLG1CQUFjLEdBQVcsSUFBSSxDQUFDO1FBRS9DOztXQUVHO1FBQ2MsdUJBQWtCLEdBQVcsSUFBSSxDQUFDO1FBRW5EOztXQUVHO1FBQ2MsZ0NBQTJCLEdBQVcsSUFBSSxDQUFDO1FBRTVEOztXQUVHO1FBQ2Msc0NBQWlDLEdBQVcsSUFBSSxDQUFDO1FBRWxFOztXQUVHO1FBQ0ssY0FBUyxHQUFXLENBQUMsQ0FBQztRQVk5Qjs7V0FFRztRQUNjLHdCQUFtQixHQUFHLElBQUksb0JBQVUsQ0FBQztZQUNsRCxhQUFhLEVBQUUsQ0FBQztZQUNoQixPQUFPLEVBQUUsSUFBSTtTQUNoQixDQUFDLENBQUM7UUFFSDs7V0FFRztRQUNjLHVCQUFrQixHQUFHLElBQUksb0JBQVUsQ0FBQztZQUNqRCxhQUFhLEVBQUUsQ0FBQztTQUNuQixDQUFDLENBQUM7UUFTQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLDBCQUEwQixDQUFDLENBQUM7UUFDaEQsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLGlDQUFlLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQzVELElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSx1QkFBVSxFQUFFLENBQUM7SUFDdkMsQ0FBQztJQUVEOztPQUVHO0lBQ0ksWUFBWTtRQUNmLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQztRQUNqRCxPQUFPLElBQUksQ0FBQyxlQUFlO2FBQ3RCLElBQUksRUFBRTthQUNOLElBQUksQ0FBQyxDQUFDLEtBQUssRUFBRSxFQUFFO1lBQ1osT0FBTyxJQUFJLENBQUMsVUFBVTtpQkFDakIsT0FBTyxFQUFFO2lCQUNULElBQUksQ0FBQyxLQUFLLElBQUksRUFBRSxDQUNiLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUNoQixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksRUFDdEIsS0FBSyxFQUNMLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQ2hDLENBQ0o7aUJBQ0EsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztpQkFDL0IsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDekMsQ0FBQyxDQUFDO2FBQ0QsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVEOztPQUVHO0lBQ0ksYUFBYTtRQUNoQixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUM7SUFDM0IsQ0FBQztJQUVEOztPQUVHO0lBQ0ksWUFBWTtRQUNmLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQztRQUNqRCxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQ25DLE1BQU0sUUFBUSxHQUFHLENBQUMsT0FBWSxFQUFFLEVBQUU7Z0JBQzlCLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7Z0JBQ25ELElBQUksV0FBVyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRTtvQkFDbEQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO29CQUNsRCxPQUFPLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUM1QjtZQUNMLENBQUMsQ0FBQztZQUNGLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUNqRCxVQUFVLENBQUMsR0FBRyxFQUFFO2dCQUNaLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDbEQsTUFBTSxDQUFDLDZDQUE2QyxDQUFDLENBQUM7WUFDMUQsQ0FBQyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUM1QixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7Ozs7Ozs7O09BU0c7SUFDSSxLQUFLLENBQUMsZUFBZSxDQUN4QixNQUEyQixFQUMzQixJQUF3QixFQUN4QixJQUFZLEVBQ1osYUFBcUIsRUFDckIsYUFBcUIsRUFDckIsTUFBYyxFQUNkLE9BQWdCO1FBRWhCLE9BQU8sSUFBSSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsQ0FBQyxLQUFLLElBQUksRUFBRTtZQUNoRCxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLHdCQUF3QixFQUFFO2dCQUMxQyxNQUFNO2dCQUNOLElBQUk7Z0JBQ0osSUFBSTtnQkFDSixNQUFNO2FBQ1QsQ0FBQyxDQUFDO1lBQ0gsTUFBTSxTQUFTLEdBQUcsT0FBTyxhQUFQLE9BQU8sY0FBUCxPQUFPLEdBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7WUFDN0QsT0FBTyxJQUFJLENBQUMsVUFBVTtpQkFDakIsSUFBSSxDQUNELElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUM5QjtnQkFDSSxJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxrQkFBa0I7Z0JBQzVDLE9BQU8sRUFBRSxLQUFLO2dCQUNkLElBQUksRUFBRTtvQkFDRixTQUFTLEVBQUUsTUFBTTtvQkFDakIsU0FBUyxFQUFFLElBQUk7b0JBQ2YsY0FBYyxFQUFFLENBQUM7b0JBQ2pCLE9BQU8sRUFBRSxJQUFJO29CQUNiLEtBQUssRUFBRSxNQUFNO29CQUNiLGVBQWUsRUFBRSxhQUFhO29CQUM5QixZQUFZLEVBQUUsQ0FBQztvQkFDZixjQUFjLEVBQUUsYUFBYTtpQkFDaEM7YUFDSixFQUNELFNBQVMsQ0FDWjtpQkFDQSxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUNQLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7b0JBQ25DLE1BQU0sUUFBUSxHQUFHLENBQUMsT0FBWSxFQUFFLEVBQUU7O3dCQUM5QixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO3dCQUNuRCxJQUNJLFdBQVcsQ0FBQyxJQUFJOzRCQUNoQixJQUFJLENBQUMsY0FBYyxDQUFDLG9CQUFvQixFQUMxQzs0QkFDRSxJQUNJLFdBQVcsQ0FBQyxVQUFVLEtBQUssTUFBTSxDQUFDLFNBQVMsQ0FBQyxFQUM5QztnQ0FDRSxJQUFJLE1BQUEsV0FBVyxDQUFDLEdBQUcsMENBQUUsT0FBTyxFQUFFO29DQUMxQixJQUFJLENBQUMsVUFBVTt5Q0FDVixNQUFNLEVBQUU7eUNBQ1IsR0FBRyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztvQ0FDOUIsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztpQ0FDM0I7Z0NBQ0QsSUFBSSxDQUFDLFVBQVU7cUNBQ1YsTUFBTSxFQUFFO3FDQUNSLEdBQUcsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0NBQzlCLE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7NkJBQzVCO3lCQUNKO3dCQUNELElBQ0ksV0FBVyxDQUFDLElBQUk7NEJBQ2hCLElBQUksQ0FBQyxjQUFjLENBQUMsb0JBQW9CLEVBQzFDOzRCQUNFLElBQ0ksV0FBVyxDQUFDLFVBQVUsS0FBSyxNQUFNLENBQUMsU0FBUyxDQUFDLEVBQzlDOzZCQUNEO3lCQUNKO29CQUNMLENBQUMsQ0FBQztvQkFDRixJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7b0JBQ2pELFVBQVUsQ0FBQyxHQUFHLEVBQUU7d0JBQ1osSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO3dCQUNsRCxNQUFNLENBQUMsb0NBQW9DLENBQUMsQ0FBQztvQkFDakQsQ0FBQyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2dCQUNoQyxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7Ozs7Ozs7Ozs7T0FVRztJQUNJLEtBQUssQ0FBQyxnQkFBZ0IsQ0FDekIsTUFBMkIsRUFDM0IsSUFBd0IsRUFDeEIsUUFBZ0IsRUFDaEIsYUFBcUIsRUFDckIsTUFBYyxFQUNkLGVBQXVCLEVBQ3ZCLE9BQWdCO1FBRWhCLG1EQUFtRDtRQUNuRCxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLHdCQUF3QixFQUFFO1lBQzFDLE1BQU07WUFDTixJQUFJO1lBQ0osUUFBUTtZQUNSLE1BQU07U0FDVCxDQUFDLENBQUM7UUFDSCxNQUFNLFNBQVMsR0FBRyxPQUFPLGFBQVAsT0FBTyxjQUFQLE9BQU8sR0FBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztRQUM3RCxNQUFNLGNBQWMsR0FDaEIsSUFBSSxDQUFDLEtBQUssQ0FDTixRQUFRLENBQ0osTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUN4RCxTQUFTLENBQ1osR0FBRyxRQUFRLENBQ2YsR0FBRyxRQUFRLENBQUM7UUFDakIsTUFBTSxJQUFJLEdBQUcsTUFBTTthQUNkLEVBQUUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLEVBQUUsS0FBSyxDQUFDO2FBQzNELEdBQUcsQ0FBQyxjQUFjLEVBQUUsU0FBUyxDQUFDO2FBQzlCLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN0QixNQUFNLFdBQVcsR0FBRyxJQUFJLEtBQUssSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO1FBQ2hFLE1BQU0sSUFBSSxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDbkQsT0FBTyxJQUFJLENBQUMsVUFBVTthQUNqQixJQUFJLENBQ0QsSUFBSSxDQUFDLFlBQVksQ0FBQyxZQUFZLEVBQzlCO1lBQ0ksSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsbUJBQW1CO1lBQzdDLE9BQU8sRUFBRSxLQUFLO1lBQ2QsSUFBSSxFQUFFO2dCQUNGLGVBQWUsRUFBRSxhQUFhO2dCQUM5QixhQUFhLEVBQUUsS0FBSyxNQUFNLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxRQUFRLElBQUksV0FBVyxLQUFLO2dCQUMxRSxNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQztnQkFDdEIsUUFBUSxFQUFFLE1BQU07Z0JBQ2hCLGdCQUFnQixFQUFFLGVBQWU7YUFDcEM7U0FDSixFQUNELFNBQVMsQ0FDWjthQUNBLElBQUksQ0FBQyxHQUFHLEVBQUU7WUFDUCxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUNuQyxNQUFNLFFBQVEsR0FBRyxDQUFDLE9BQVksRUFBRSxFQUFFO29CQUM5QixNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxDQUFDO29CQUNuRCxJQUNJLFdBQVcsQ0FBQyxJQUFJO3dCQUNaLElBQUksQ0FBQyxjQUFjLENBQUMsbUJBQW1CO3dCQUMzQyxXQUFXLENBQUMsVUFBVSxLQUFLLE1BQU0sQ0FBQyxTQUFTLENBQUM7d0JBQzVDLFdBQVcsQ0FBQyxNQUFNLEtBQUssSUFBSSxFQUM3Qjt3QkFDRSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7d0JBQ2xELE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7cUJBQzVCO29CQUNELElBQ0ksV0FBVyxDQUFDLElBQUk7d0JBQ1osSUFBSSxDQUFDLGNBQWMsQ0FBQyxtQkFBbUI7d0JBQzNDLFdBQVcsQ0FBQyxVQUFVLEtBQUssTUFBTSxDQUFDLFNBQVMsQ0FBQzt3QkFDNUMsV0FBVyxDQUFDLE1BQU0sS0FBSyxJQUFJLEVBQzdCO3dCQUNFLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQzt3QkFDbEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztxQkFDM0I7Z0JBQ0wsQ0FBQyxDQUFDO2dCQUNGLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDakQsVUFBVSxDQUFDLEdBQUcsRUFBRTtvQkFDWixJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7b0JBQ2xELE1BQU0sQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO2dCQUNqRCxDQUFDLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUM7WUFDaEMsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUNQLE1BQU07SUFDVixDQUFDO0lBRUQ7O09BRUc7SUFDSSxxQkFBcUI7UUFDeEIsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLEtBQUssSUFBSSxFQUFFO1lBQ2hELElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsb0NBQW9DLENBQUMsQ0FBQztZQUMxRCxNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1lBQ2hELE9BQU8sSUFBSSxDQUFDLFVBQVU7aUJBQ2pCLElBQUksQ0FDRCxJQUFJLENBQUMsWUFBWSxDQUFDLFlBQVksRUFDOUI7Z0JBQ0ksSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsdUJBQXVCO2dCQUNqRCxPQUFPLEVBQUUsS0FBSztnQkFDZCxJQUFJLEVBQUUsRUFBRTthQUNYLEVBQ0QsU0FBUyxDQUNaO2lCQUNBLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQ1AsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtvQkFDbkMsTUFBTSxRQUFRLEdBQUcsQ0FBQyxPQUFZLEVBQUUsRUFBRTt3QkFDOUIsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQzt3QkFDbkQsSUFDSSxXQUFXLENBQUMsSUFBSTs0QkFDaEIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxtQkFBbUIsRUFDekM7NEJBQ0UsSUFBSSxDQUFDLFVBQVU7aUNBQ1YsTUFBTSxFQUFFO2lDQUNSLEdBQUcsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7NEJBQzlCLE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7eUJBQzVCO29CQUNMLENBQUMsQ0FBQztvQkFDRixJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7b0JBQ2pELFVBQVUsQ0FBQyxHQUFHLEVBQUU7d0JBQ1osSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO3dCQUNsRCxNQUFNLENBQUMseUJBQXlCLENBQUMsQ0FBQztvQkFDdEMsQ0FBQyxFQUFFLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO2dCQUN6QyxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7Ozs7T0FJRztJQUNJLDJCQUEyQixDQUM5QixNQUEyQjtRQUUzQixPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsS0FBSyxJQUFJLEVBQUU7WUFDaEQsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQywwQ0FBMEMsQ0FBQyxDQUFDO1lBQ2hFLE1BQU0sU0FBUyxHQUFHLE1BQU0sSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7WUFDaEQsT0FBTyxJQUFJLENBQUMsVUFBVTtpQkFDakIsSUFBSSxDQUNELElBQUksQ0FBQyxZQUFZLENBQUMsWUFBWSxFQUM5QjtnQkFDSSxJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWM7cUJBQ3BCLDhCQUE4QjtnQkFDbkMsT0FBTyxFQUFFLEtBQUs7Z0JBQ2QsSUFBSSxFQUFFO29CQUNGLGVBQWUsRUFBRSxnQkFBZ0I7b0JBQ2pDLFFBQVEsRUFBRSxNQUFNO2lCQUNuQjthQUNKLEVBQ0QsU0FBUyxDQUNaO2lCQUNBLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQ1AsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtvQkFDbkMsTUFBTSxRQUFRLEdBQUcsQ0FBQyxPQUFZLEVBQUUsRUFBRTt3QkFDOUIsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQzt3QkFDbkQsSUFBSSxXQUFXLENBQUMsVUFBVSxLQUFLLE1BQU0sQ0FBQyxTQUFTLENBQUMsRUFBRTs0QkFDOUMsSUFBSSxDQUFDLFVBQVU7aUNBQ1YsTUFBTSxFQUFFO2lDQUNSLEdBQUcsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7NEJBQzlCLE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7eUJBQzVCO29CQUNMLENBQUMsQ0FBQztvQkFDRixJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7b0JBQ2pELFVBQVUsQ0FBQyxHQUFHLEVBQUU7d0JBQ1osSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO3dCQUNsRCxNQUFNLENBQUMsOEJBQThCLENBQUMsQ0FBQztvQkFDM0MsQ0FBQyxFQUFFLElBQUksQ0FBQyxpQ0FBaUMsQ0FBQyxDQUFDO2dCQUMvQyxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQ7O09BRUc7SUFDSSxnQkFBZ0I7UUFDbkIsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRTtZQUN6QyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDakIsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUMzQyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQXJZRCxrQ0FxWUMifQ==