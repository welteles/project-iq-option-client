/*
 * Copyright (C) 2020 Wellington Rocha
 * All Rights Reserved.
 *
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * Proprietary and confidential.
 */
import Bottleneck from "bottleneck";
import * as moment from "moment-timezone";
import * as Core from "../..";
import { IQOptionWrapper } from "./IQOptionWrapper";
import { IQOptionWs } from "./IQOptionWs";

/**
 * IQOption api.
 */
export class IQOptionApi {
    /**
     * Max wait profile response.
     */
    private readonly maxWaitProfile: number = 5000;

    /**
     * Max wait profile response.
     */
    private readonly maxWaitToSendOrder: number = 5000;

    /**
     * Max wait profile response.
     */
    private readonly maxWaitToInitializationData: number = 5000;

    /**
     * Max wait profile response.
     */
    private readonly maxWaitToGetDigitalInstrumentData: number = 5000;

    /**
     * Request ID.
     */
    private requestID: number = 0;

    /**
     * IQ option wrapper.
     */
    private readonly iqOptionWrapper: IQOptionWrapper;

    /**
     * IQ Option WS.
     */
    private readonly iqOptionWs: IQOptionWs;

    /**
     *  Queue order send.
     */
    private readonly orderPlacementQueue = new Bottleneck({
        maxConcurrent: 1,
        minTime: 1,
    });

    /**
     * IQOption API.
     *
     * @param email
     * @param password
     */
    constructor(email: string, password: string) {
        Core.logger().silly("IQOptionApi::constructor");
        this.iqOptionWrapper = new IQOptionWrapper(email, password);
        this.iqOptionWs = new IQOptionWs();
    }

    /**
     * Connect async.
     */
    public connectAsync(): Promise<Core.IQOptionProfile> {
        Core.logger().silly("IQOptionApi::connectAsync");
        return this.iqOptionWrapper
            .auth()
            .then((token) => {
                return this.iqOptionWs
                    .connect()
                    .then(() =>
                        this.iqOptionWs.send(
                            Core.IQOptionName.SSID,
                            token,
                            this.getNextRequestID()
                        )
                    )
                    .then(() => this.profileAsync())
                    .catch((e) => Promise.reject(e));
            })
            .catch((e) => Promise.reject(e));
    }

    /**
     * Get iq option ws.
     */
    public getIQOptionWs(): IQOptionWs {
        return this.iqOptionWs;
    }

    /**
     * Wait to get user profile.
     */
    public profileAsync(): Promise<Core.IQOptionProfile> {
        Core.logger().silly("IQOptionApi::profileAsync");
        return new Promise((resolve, reject) => {
            const listener = (message: any) => {
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
    public sendOrderBinary(
        market: Core.IQOptionMarket,
        side: Core.IQOptionModel,
        time: number,
        userBalanceId: number,
        profitPercent: number,
        amount: number,
        orderId?: number
    ): Promise<Core.IQOptionOptionOpened> {
        return this.orderPlacementQueue.schedule(() => {
            Core.logger().silly(`IQOptionApi::sendOrder`, {
                market,
                side,
                time,
                amount,
            });
            const requestID = orderId ?? this.getNextRequestID();
            return this.iqOptionWs
                .send(
                    Core.IQOptionName.SEND_MESSAGE,
                    {
                        name: Core.IQOptionAction.BINARY_OPEN_OPTION,
                        version: "1.0",
                        body: {
                            active_id: market,
                            direction: side,
                            option_type_id: 3,
                            expired: time,
                            price: amount,
                            user_balance_id: userBalanceId,
                            refund_value: 0, // todo
                            profit_percent: profitPercent,
                        },
                    },
                    requestID
                )
                .then(() => {
                    return new Promise((resolve, reject) => {
                        const listener = (message: any) => {
                            const messageJSON = JSON.parse(message.toString());
                            if (
                                messageJSON.name ===
                                Core.IQOptionAction.BINARY_OPTION_OPENED
                            ) {
                                if (messageJSON.request_id === String(requestID)) {
                                    this.iqOptionWs
                                        .socket()
                                        .off("message", listener);
                                    resolve(messageJSON.msg);
                                }
                            }
                            if (
                                messageJSON.name ===
                                Core.IQOptionAction.BINARY_OPTION_REJECT
                            ) {
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
    public sendOrderDigital(
        market: Core.IQOptionMarket,
        side: Core.IQOptionModel,
        realTime: number,
        userBalanceId: number,
        amount: number,
        instrumentIndex: number,
        orderId?: number
    ): Promise<Core.IQOptionOptionOpened> {
        return this.orderPlacementQueue.schedule(() => {
            Core.logger().silly(`IQOptionApi::sendOrder`, {
                market,
                side,
                realTime,
                amount,
            });
            const requestID = orderId ?? this.getNextRequestID();
            const timeCalculated =
                Math.floor(
                    parseInt(
                        moment()
                            .tz("UTC")
                            .add(realTime, "minutes")
                            .format("mm"),
                        undefined
                    ) / realTime
                ) * realTime;
            const time = moment
                .tz(moment().tz("UTC").format("YYYY-MM-DD HH:00:00"), "UTC")
                .add(timeCalculated, "minutes")
                .format("HHmmss");
            const sideDigital = side === Core.IQOptionModel.BUY ? "C" : "P";
            const date = moment().tz("UTC").format("YYYYMMDD");
            return this.iqOptionWs
                .send(
                    Core.IQOptionName.SEND_MESSAGE,
                    {
                        name: Core.IQOptionAction.DIGITAL_OPEN_OPTION,
                        version: "2.0",
                        body: {
                            user_balance_id: userBalanceId,
                            instrument_id: `do${market}A${date}D${time}T${realTime}M${sideDigital}SPT`,
                            amount: String(amount),
                            asset_id: market,
                            instrument_index: instrumentIndex,
                        },
                    },
                    requestID
                )
                .then(() => {
                    return new Promise((resolve, reject) => {
                        const listener = (message: any) => {
                            const messageJSON = JSON.parse(message.toString());
                            if (
                                messageJSON.name ===
                                    Core.IQOptionAction.DIGITAL_OPEN_PLACED &&
                                messageJSON.request_id === String(requestID) &&
                                messageJSON.status === 2000
                            ) {
                                this.iqOptionWs
                                    .socket()
                                    .off("message", listener);
                                resolve(messageJSON.msg);
                            }
                            if (
                                messageJSON.name ===
                                    Core.IQOptionAction.DIGITAL_OPEN_PLACED &&
                                messageJSON.request_id === String(requestID) &&
                                messageJSON.status === 5000
                            ) {
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
    public getInitializationData(): Promise<Core.IQOptionInitializationData> {
        return this.orderPlacementQueue.schedule(() => {
            Core.logger().silly(`IQOptionApi::getInitializationData`);
            const requestID = this.getNextRequestID();
            return this.iqOptionWs
                .send(
                    Core.IQOptionName.SEND_MESSAGE,
                    {
                        name: Core.IQOptionAction.GET_INITIALIZATION_DATA,
                        version: "3.0",
                        body: {},
                    },
                    requestID
                )
                .then(() => {
                    return new Promise((resolve, reject) => {
                        const listener = (message: any) => {
                            const messageJSON = JSON.parse(message.toString());
                            if (
                                messageJSON.name ===
                                Core.IQOptionAction.INITIALIZATION_DATA
                            ) {
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
    public getDigitalOptionInstruments(
        market: Core.IQOptionMarket
    ): Promise<Core.IQOptionInstruments> {
        return this.orderPlacementQueue.schedule(() => {
            Core.logger().silly(`IQOptionApi::getDigitalOptionInstruments`);
            const requestID = this.getNextRequestID();
            return this.iqOptionWs
                .send(
                    Core.IQOptionName.SEND_MESSAGE,
                    {
                        name: Core.IQOptionAction
                            .GET_DIGITAL_OPTION_INSTRUMENTS,
                        version: "1.0",
                        body: {
                            instrument_type: "digital-option",
                            asset_id: market,
                        },
                    },
                    requestID
                )
                .then(() => {
                    return new Promise((resolve, reject) => {
                        const listener = (message: any) => {
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
    public getNextRequestID(): number {
        this.requestID++;
        return this.requestID;
    }
}
