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
const stream_1 = require("stream");
const Core = require("../..");
/**
 * Stream candle generated.
 */
class IQOptionStreamOptionClose extends stream_1.Readable {
    /**
     * Constructor.
     *
     * @param iqOptionWS
     * @param market
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
    async startStream() {
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
    parseMessage(message) {
        const messageJSON = JSON.parse(message);
        if (messageJSON.name === Core.IQOptionAction.BINARY_OPTION_CLOSE ||
            messageJSON.name === Core.IQOptionAction.DIGITAL_OPEN_CLOSED) {
            this.emit("data", messageJSON.msg);
        }
    }
}
exports.IQOptionStreamOptionClose = IQOptionStreamOptionClose;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVFPcHRpb25TdHJlYW1PcHRpb25DbG9zZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9saWIvU2VydmljZS9JUU9wdGlvblNlcnZpY2UvSVFPcHRpb25TdHJlYW1PcHRpb25DbG9zZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7O0dBT0c7QUFDSCxtQ0FBa0M7QUFDbEMsOEJBQThCO0FBSTlCOztHQUVHO0FBQ0gsTUFBYSx5QkFBMEIsU0FBUSxpQkFBUTtJQU9uRDs7Ozs7T0FLRztJQUNILFlBQW1CLFVBQXNCO1FBQ3JDLEtBQUssQ0FBQyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0lBQ2pDLENBQUM7SUFFRDs7T0FFRztJQUNJLEtBQUssS0FBVSxDQUFDO0lBRXZCOztPQUVHO0lBQ0ksS0FBSyxDQUFDLFdBQVc7UUFDcEIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO1FBQzlELElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLEVBQUUsRUFBRTtZQUMvQixPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsMEJBQTBCLENBQUMsQ0FBQztTQUNyRDtRQUNELElBQUksQ0FBQyxVQUFVO2FBQ1YsTUFBTSxFQUFFO2FBQ1IsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pFLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssWUFBWSxDQUFDLE9BQWU7UUFDaEMsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN4QyxJQUNJLFdBQVcsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLGNBQWMsQ0FBQyxtQkFBbUI7WUFDNUQsV0FBVyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsY0FBYyxDQUFDLG1CQUFtQixFQUM5RDtZQUNFLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUN0QztJQUNMLENBQUM7Q0FDSjtBQW5ERCw4REFtREMifQ==