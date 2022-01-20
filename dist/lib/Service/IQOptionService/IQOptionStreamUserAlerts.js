"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IQOptionStreamUserAlerts = void 0;
/*
 * Copyright (C) 2020 Wellington Rocha
 * All Rights Reserved.
 *
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * Proprietary and confidential.
 */
const stream_1 = require("stream");
const Core = require("../..");
/**
 * Stream user alerts generated.
 */
class IQOptionStreamUserAlerts extends stream_1.Readable {
    /**
     * Constructor.
     *
     * @param iqOptionWS
     */
    constructor(iqOptionWS) {
        super({ objectMode: true });
        this.iqOptionWS = iqOptionWS;
    }
    /**
     * Default read
     */
    _read() { }
    /**
     * Start stream.
     */
    startStream() {
        return Promise.resolve();
    }
    /**
     * Listerner event
     */
    async listener() {
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
    parseMessage(message) {
        const messageJSON = JSON.parse(message);
        if (messageJSON.microserviceName === Core.IQOptionAction.USER_ALERTS) {
            this.emit("data", messageJSON.msg);
        }
    }
}
exports.IQOptionStreamUserAlerts = IQOptionStreamUserAlerts;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVFPcHRpb25TdHJlYW1Vc2VyQWxlcnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpYi9TZXJ2aWNlL0lRT3B0aW9uU2VydmljZS9JUU9wdGlvblN0cmVhbVVzZXJBbGVydHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7Ozs7Ozs7R0FPRztBQUNILG1DQUFrQztBQUNsQyw4QkFBOEI7QUFJOUI7O0dBRUc7QUFDSCxNQUFhLHdCQUNULFNBQVEsaUJBQVE7SUFRaEI7Ozs7T0FJRztJQUNILFlBQ0ksVUFBc0I7UUFFdEIsS0FBSyxDQUFDLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFDNUIsSUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7SUFDakMsQ0FBQztJQUVEOztPQUVHO0lBQ0ksS0FBSyxLQUFVLENBQUM7SUFFdkI7O09BRUc7SUFDSSxXQUFXO1FBQ2QsT0FBTyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUE7SUFDNUIsQ0FBQztJQUVEOztPQUVHO0lBQ0ksS0FBSyxDQUFDLFFBQVE7UUFDakIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxvQ0FBb0MsQ0FBQyxDQUFDO1FBQzFELElBQUksQ0FBQyxVQUFVO2FBQ1YsTUFBTSxFQUFFO2FBQ1IsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pFLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssWUFBWSxDQUFDLE9BQWU7UUFDaEMsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN4QyxJQUFJLFdBQVcsQ0FBQyxnQkFBZ0IsS0FBSyxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRTtZQUNsRSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDdEM7SUFDTCxDQUFDO0NBQ0o7QUF2REQsNERBdURDIn0=