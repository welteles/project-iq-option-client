/*
 * Copyright (C) 2020 Wellington Rocha
 * All Rights Reserved.
 *
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * Proprietary and confidential.
 */
import { Readable } from "stream";
import * as Core from "../..";
import { IIQOptionStream } from "./Interface/IIQOptionStream";
import { IQOptionWs } from "./IQOptionWs";

/**
 * Stream candle generated.
 */
export class IQOptionStreamOptionTradersSentiment
    extends Readable
    implements IIQOptionStream
{
    /**
     * Socket.
     */
    private readonly iqOptionWS: IQOptionWs;

    /**
     * Market.
     */
    private readonly market: Core.IQOptionMarket;

    /**
     * Constructor.
     *
     * @param iqOptionWS
     * @param market
     */
    public constructor(iqOptionWS: IQOptionWs, market: Core.IQOptionMarket) {
        super({ objectMode: true });
        this.iqOptionWS = iqOptionWS;
        this.market = market;
    }

    /**
     * Default read
     */
    public _read(): void {}

    /**
     * Start stream.
     */
    public async startStream(): Promise<void> {
        Core.logger().silly(
            "IQOptionStreamOptionTradersSentiment::startStream"
        );
        return this.subscribe(this.market)
            .then(() => this.listener())
            .catch((e) => Promise.reject(e));
    }

    /**
     * Listerner event
     */
    public async listener(): Promise<void> {
        Core.logger().silly("IQOptionStreamOptionTradersSentiment::listener");
        this.iqOptionWS
            .socket()
            .on("message", (data) => this.parseMessage(data.toString()));
        return Promise.resolve();
    }

    /**
     * Candle subscribe.
     */
    public subscribe(market: Core.IQOptionMarket): Promise<void> {
        Core.logger().silly(
            "IQOptionStreamOptionTradersSentiment::subscribeTradersSentiments"
        );
        if (this.iqOptionWS.isConnected()) {
            return Promise.reject("Socket is not connected.");
        }
        const message = {
            name: Core.IQOptionAction.TRADERS_MOOD_CHANGED,
            params: {
                routingFilters: {
                    instrument: "turbo-option",
                    asset_id: market,
                },
            },
        };
        return Promise.resolve(
            this.iqOptionWS.send(Core.IQOptionName.SUBSCRIBE_MESSAGE, message)
        );
    }

    /**
     * On message.
     *
     * @param message
     */
    private parseMessage(message: string) {
        const messageJSON = JSON.parse(message);
        if (messageJSON.name === Core.IQOptionAction.TRADERS_MOOD_CHANGED) {
            this.emit("data", messageJSON.msg);
        }
    }
}
