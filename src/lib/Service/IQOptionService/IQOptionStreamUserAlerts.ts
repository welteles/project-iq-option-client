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
 * Stream user alerts generated.
 */
export class IQOptionStreamUserAlerts
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
    public startStream(): Promise<void> {
        return Promise.resolve();
    }

    /**
     * Listerner event
     */
    public async listener(): Promise<void> {
        Core.logger().silly("IQOptionStreamUserAlerts::listener");
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
        if (messageJSON.microserviceName === Core.IQOptionAction.USER_ALERTS) {
            this.emit("data", messageJSON.msg);
        }
    }
}
