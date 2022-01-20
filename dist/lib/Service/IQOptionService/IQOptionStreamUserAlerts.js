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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVFPcHRpb25TdHJlYW1Vc2VyQWxlcnRzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpYi9TZXJ2aWNlL0lRT3B0aW9uU2VydmljZS9JUU9wdGlvblN0cmVhbVVzZXJBbGVydHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7Ozs7Ozs7R0FPRztBQUNILG1DQUFrQztBQUNsQyw4QkFBOEI7QUFJOUI7O0dBRUc7QUFDSCxNQUFhLHdCQUNULFNBQVEsaUJBQVE7SUFRaEI7Ozs7T0FJRztJQUNILFlBQW1CLFVBQXNCO1FBQ3JDLEtBQUssQ0FBQyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0lBQ2pDLENBQUM7SUFFRDs7T0FFRztJQUNJLEtBQUssS0FBVSxDQUFDO0lBRXZCOztPQUVHO0lBQ0ksV0FBVztRQUNkLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFFRDs7T0FFRztJQUNJLEtBQUssQ0FBQyxRQUFRO1FBQ2pCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsb0NBQW9DLENBQUMsQ0FBQztRQUMxRCxJQUFJLENBQUMsVUFBVTthQUNWLE1BQU0sRUFBRTthQUNSLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqRSxPQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUM3QixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLFlBQVksQ0FBQyxPQUFlO1FBQ2hDLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDeEMsSUFBSSxXQUFXLENBQUMsZ0JBQWdCLEtBQUssSUFBSSxDQUFDLGNBQWMsQ0FBQyxXQUFXLEVBQUU7WUFDbEUsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ3RDO0lBQ0wsQ0FBQztDQUNKO0FBckRELDREQXFEQyJ9