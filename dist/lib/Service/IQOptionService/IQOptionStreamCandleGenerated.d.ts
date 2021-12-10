/// <reference types="node" />
import { Readable } from "stream";
import * as Core from "../..";
import { IIQOptionStream } from "./Interface/IIQOptionStream";
import { IQOptionWs } from "./IQOptionWs";
/**
 * Stream candle generated.
 */
export declare class IQOptionStreamCandleGenerated extends Readable implements IIQOptionStream {
    /**
     * Socket.
     */
    private readonly iqOptionWS;
    /**
     * Market.
     */
    private readonly market;
    /**
     * Time.
     */
    private readonly time;
    /**
     * Constructor.
     *
     * @param iqOptionWS
     * @param market
     * @param time
     */
    constructor(iqOptionWS: IQOptionWs, market: Core.IQOptionMarket, time: Core.IQOptionTime);
    /**
     * Default read
     */
    _read(): void;
    /**
     * Listerner event
     */
    listener(): Promise<void>;
    /**
     * Start stream.
     */
    startStream(): Promise<void>;
    /**
     * Subscribe
     *
     * @param market string
     * @param time number
     * @returns void
     */
    subscribe(market: Core.IQOptionMarket, time: Core.IQOptionTime): Promise<void>;
    /**
     * On message.
     *
     * @param message
     */
    private parseMessage;
}
