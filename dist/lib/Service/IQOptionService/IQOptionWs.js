"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IQOptionWs = void 0;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVFPcHRpb25Xcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9saWIvU2VydmljZS9JUU9wdGlvblNlcnZpY2UvSVFPcHRpb25Xcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQTs7Ozs7OztHQU9HO0FBQ0gsZ0NBQWdDO0FBQ2hDLG9DQUFvQztBQUVwQzs7R0FFRztBQUNILE1BQWEsVUFBVTtJQUF2QjtRQUNJOztXQUVHO1FBQ2MsYUFBUSxHQUFXLG9CQUFvQixDQUFDO1FBT3pEOztXQUVHO1FBQ2Msa0JBQWEsR0FBRyxJQUFJLENBQUM7UUFFdEM7O1dBRUc7UUFDSyxjQUFTLEdBQUcsQ0FBQyxDQUFDO0lBbUUxQixDQUFDO0lBakVHOztPQUVHO0lBQ0ksT0FBTztRQUNWLElBQUk7WUFDQSxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLHFCQUFxQixDQUFDLENBQUM7WUFDM0MsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtnQkFDbkMsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLFNBQVMsQ0FDeEIsR0FBRyxJQUFJLENBQUMsUUFBUSxrQkFBa0IsQ0FDckMsQ0FBQztnQkFDRixJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztnQkFDekMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDO1lBQ3pELENBQUMsQ0FBQyxDQUFDO1NBQ047UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLE9BQU8sT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDO1NBQzNCO0lBQ0wsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNJLElBQUksQ0FDUCxJQUF1QixFQUN2QixHQUFRLEVBQ1IsU0FBa0I7UUFFbEIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2YsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLDBCQUEwQixDQUFDLENBQUM7U0FDckQ7UUFDRCxNQUFNLE9BQU8sR0FBUTtZQUNqQixJQUFJO1lBQ0osR0FBRztTQUNOLENBQUM7UUFDRixJQUFJLFNBQVMsRUFBRTtZQUNYLE9BQU8sQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1NBQzFDO1FBQ0QsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7SUFFRDs7T0FFRztJQUNJLE1BQU07UUFDVCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDeEIsQ0FBQztJQUVEOztPQUVHO0lBQ0ksV0FBVztRQUNkLE9BQU8sSUFBSSxDQUFDLE9BQU8sS0FBSyxTQUFTLENBQUM7SUFDdEMsQ0FBQztJQUVEOztPQUVHO0lBQ0ssYUFBYTtRQUNqQixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUM7UUFDakQsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDekQsQ0FBQztDQUNKO0FBdEZELGdDQXNGQyJ9