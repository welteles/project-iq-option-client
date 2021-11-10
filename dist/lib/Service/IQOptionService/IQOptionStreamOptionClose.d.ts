/// <reference types="node" />
import { Readable } from "stream";
import { IIQOptionStream } from "./Interface/IIQOptionStream";
import { IQOptionWs } from "./IQOptionWs";
/**
 * Stream candle generated.
 */
export declare class IQOptionStreamOptionClose extends Readable implements IIQOptionStream {
    /**
     * Socket.
     */
    private readonly iqOptionWS;
    /**
     * Constructor.
     *
     * @param iqOptionWS
     * @param market
     */
    constructor(iqOptionWS: IQOptionWs);
    /**
     * Default read
     */
    _read(): void;
    /**
     * Start stream.
     */
    startStream(): Promise<void>;
    /**
     * On message.
     *
     * @param message
     */
    private parseMessage;
}
