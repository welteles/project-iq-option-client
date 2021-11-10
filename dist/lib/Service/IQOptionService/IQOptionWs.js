"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright (C) 2020 Wellington Rocha
 * All Rights Reserved.
 *
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * Proprietary and confidential.
 */
const WebSocket = require("ws");
const Core = require("../../index");
/**
 * IqOptionWs;
 */
class IQOptionWs {
    constructor() {
        /**
         * Host..
         */
        this.endpoint = "wss://iqoption.com";
        /**
         * Wait time to restart _socket.
         */
        this.waitToRestart = 1000;
        /**
         * RequestID.
         */
        this.requestID = 1;
    }
    /**
     * Start _socket.
     */
    connect() {
        try {
            Core.logger().silly("IQOptionWs::connect");
            return new Promise((resolve, reject) => {
                this._socket = new WebSocket(`${this.endpoint}//echo/websocket`);
                this._socket.on("open", () => resolve());
                this._socket.on("close", () => this.restartSocket());
            });
        }
        catch (e) {
            return Promise.reject();
        }
    }
    /**
     * Send message.
     *
     * @param name
     * @param msg
     * @param requestID
     */
    send(name, msg, requestID) {
        Core.logger().silly("IQOptionWs::send");
        if (!this._socket) {
            return Promise.reject("Socket is not connected.");
        }
        const message = {
            name,
            msg,
        };
        if (requestID) {
            message.request_id = String(requestID);
        }
        return Promise.resolve(this._socket.send(JSON.stringify(message)));
    }
    /**
     * Get _socket.
     */
    socket() {
        return this._socket;
    }
    /**
     * Is connected.
     */
    isConnected() {
        return this._socket === undefined;
    }
    /**
     * Restart _socket.
     */
    restartSocket() {
        Core.logger().silly("IQOptionWs::restartSocket");
        setTimeout(() => this.connect(), this.waitToRestart);
    }
}
exports.IQOptionWs = IQOptionWs;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVFPcHRpb25Xcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9saWIvU2VydmljZS9JUU9wdGlvblNlcnZpY2UvSVFPcHRpb25Xcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0dBT0c7QUFDSCxnQ0FBZ0M7QUFDaEMsb0NBQW9DO0FBRXBDOztHQUVHO0FBQ0gsTUFBYSxVQUFVO0lBQXZCO1FBQ0k7O1dBRUc7UUFDYyxhQUFRLEdBQVcsb0JBQW9CLENBQUM7UUFPekQ7O1dBRUc7UUFDYyxrQkFBYSxHQUFHLElBQUksQ0FBQztRQUV0Qzs7V0FFRztRQUNLLGNBQVMsR0FBRyxDQUFDLENBQUM7SUFtRTFCLENBQUM7SUFqRUc7O09BRUc7SUFDSSxPQUFPO1FBQ1YsSUFBSTtZQUNBLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQztZQUMzQyxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO2dCQUNuQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksU0FBUyxDQUN4QixHQUFHLElBQUksQ0FBQyxRQUFRLGtCQUFrQixDQUNyQyxDQUFDO2dCQUNGLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO2dCQUN6QyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7WUFDekQsQ0FBQyxDQUFDLENBQUM7U0FDTjtRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsT0FBTyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7U0FDM0I7SUFDTCxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ksSUFBSSxDQUNQLElBQXVCLEVBQ3ZCLEdBQVEsRUFDUixTQUFrQjtRQUVsQixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFDeEMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUU7WUFDZixPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsMEJBQTBCLENBQUMsQ0FBQztTQUNyRDtRQUNELE1BQU0sT0FBTyxHQUFRO1lBQ2pCLElBQUk7WUFDSixHQUFHO1NBQ04sQ0FBQztRQUNGLElBQUksU0FBUyxFQUFFO1lBQ1gsT0FBTyxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDMUM7UUFDRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdkUsQ0FBQztJQUVEOztPQUVHO0lBQ0ksTUFBTTtRQUNULE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN4QixDQUFDO0lBRUQ7O09BRUc7SUFDSSxXQUFXO1FBQ2QsT0FBTyxJQUFJLENBQUMsT0FBTyxLQUFLLFNBQVMsQ0FBQztJQUN0QyxDQUFDO0lBRUQ7O09BRUc7SUFDSyxhQUFhO1FBQ2pCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQztRQUNqRCxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN6RCxDQUFDO0NBQ0o7QUF0RkQsZ0NBc0ZDIn0=