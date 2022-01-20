/// <reference types="node" />
import { Readable } from "stream";
import { IIQOptionStream } from "./Interface/IIQOptionStream";
import { IQOptionWs } from "./IQOptionWs";
/**
 * Stream user alerts generated.
 */
export declare class IQOptionStreamUserAlerts extends Readable implements IIQOptionStream {
    /**
     * Socket.
     */
    private readonly iqOptionWS;
    /**
     * Constructor.
     *
     * @param iqOptionWS
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
     * Subcribe.
     */
    subscribe(): Promise<void>;
    /**
     * Listerner event
     */
    listener(): Promise<void>;
    /**
     * On message.
     *
     * @param message
     */
    private parseMessage;
}
