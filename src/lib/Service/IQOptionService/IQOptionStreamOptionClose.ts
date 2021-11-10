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
export class IQOptionStreamOptionClose
    extends Readable
    implements IIQOptionStream
{
    /**
     * Socket.
     */
    private readonly iqOptionWS: IQOptionWs;

    /**
     * Constructor.
     *
     * @param iqOptionWS
     * @param market
     */
    public constructor(iqOptionWS: IQOptionWs) {
        super({ objectMode: true });
        this.iqOptionWS = iqOptionWS;
    }

    /**
     * Default read
     */
    public _read(): void {}

    /**
     * Start stream.
     */
    public async startStream(): Promise<void> {
        Core.logger().silly("IQOptionStreamOptionClose::startStream");
        if (this.iqOptionWS.isConnected()) {
            return Promise.reject("Socket is not connected.");
        }
        this.iqOptionWS
            .socket()
            .on("message", (data) => this.parseMessage(data.toString()));
        return Promise.resolve();
    }

    /**
     * On message.
     *
     * @param message
     */
    private parseMessage(message: string) {
        const messageJSON = JSON.parse(message);
        if (
            messageJSON.name === Core.IQOptionAction.BINARY_OPTION_CLOSE ||
            messageJSON.name === Core.IQOptionAction.DIGITAL_OPEN_CLOSED
        ) {
            this.emit("data", messageJSON.msg);
        }
    }
}
