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
class IQOptionStreamOptionTradersSentiment extends stream_1.Readable {
    /**
     * Constructor.
     *
     * @param iqOptionWS
     * @param market
     */
    constructor(iqOptionWS, market) {
        super({ objectMode: true });
        this.iqOptionWS = iqOptionWS;
        this.market = market;
    }
    /**
     * Default read
     */
    _read() { }
    /**
     * Start stream.
     */
    async startStream() {
        Core.logger().silly("IQOptionStreamOptionTradersSentiment::startStream");
        return this.subscribeTradersSentiments()
            .then(() => this.iqOptionWS
            .socket()
            .on("message", (data) => this.parseMessage(data.toString())))
            .then(() => Promise.resolve())
            .catch((e) => Promise.reject(e));
    }
    /**
     * Candle subscribe.
     */
    subscribeTradersSentiments() {
        Core.logger().silly("IQOptionStreamOptionTradersSentiment::subscribeTradersSentiments");
        if (this.iqOptionWS.isConnected()) {
            return Promise.reject("Socket is not connected.");
        }
        const message = {
            name: Core.IQOptionAction.TRADERS_MOOD_CHANGED,
            params: {
                routingFilters: {
                    instrument: "turbo-option",
                    asset_id: this.market,
                },
            },
        };
        return Promise.resolve(this.iqOptionWS.send(Core.IQOptionName.SUBSCRIBE_MESSAGE, message));
    }
    /**
     * On message.
     *
     * @param message
     */
    parseMessage(message) {
        const messageJSON = JSON.parse(message);
        if (messageJSON.name === Core.IQOptionAction.TRADERS_MOOD_CHANGED) {
            this.emit("data", messageJSON.msg);
        }
    }
}
exports.IQOptionStreamOptionTradersSentiment = IQOptionStreamOptionTradersSentiment;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVFPcHRpb25TdHJlYW1UcmFkZXJzU2VudGltZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpYi9TZXJ2aWNlL0lRT3B0aW9uU2VydmljZS9JUU9wdGlvblN0cmVhbVRyYWRlcnNTZW50aW1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7OztHQU9HO0FBQ0gsbUNBQWtDO0FBQ2xDLDhCQUE4QjtBQUk5Qjs7R0FFRztBQUNILE1BQWEsb0NBQXFDLFNBQVEsaUJBQVE7SUFZOUQ7Ozs7O09BS0c7SUFDSCxZQUFtQixVQUFzQixFQUFFLE1BQTJCO1FBQ2xFLEtBQUssQ0FBQyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3pCLENBQUM7SUFFRDs7T0FFRztJQUNJLEtBQUssS0FBVSxDQUFDO0lBRXZCOztPQUVHO0lBQ0ksS0FBSyxDQUFDLFdBQVc7UUFDcEIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FDZixtREFBbUQsQ0FDdEQsQ0FBQztRQUNGLE9BQU8sSUFBSSxDQUFDLDBCQUEwQixFQUFFO2FBQ25DLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FDUCxJQUFJLENBQUMsVUFBVTthQUNWLE1BQU0sRUFBRTthQUNSLEVBQUUsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FDbkU7YUFDQSxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQzdCLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFRDs7T0FFRztJQUNLLDBCQUEwQjtRQUM5QixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsS0FBSyxDQUNmLGtFQUFrRSxDQUNyRSxDQUFDO1FBQ0YsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsRUFBRSxFQUFFO1lBQy9CLE9BQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1NBQ3JEO1FBQ0QsTUFBTSxPQUFPLEdBQUc7WUFDWixJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxvQkFBb0I7WUFDOUMsTUFBTSxFQUFFO2dCQUNKLGNBQWMsRUFBRTtvQkFDWixVQUFVLEVBQUUsY0FBYztvQkFDMUIsUUFBUSxFQUFFLElBQUksQ0FBQyxNQUFNO2lCQUN4QjthQUNKO1NBQ0osQ0FBQztRQUNGLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FDbEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsRUFBRSxPQUFPLENBQUMsQ0FDckUsQ0FBQztJQUNOLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssWUFBWSxDQUFDLE9BQWU7UUFDaEMsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN4QyxJQUFJLFdBQVcsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLGNBQWMsQ0FBQyxvQkFBb0IsRUFBRTtZQUMvRCxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDdEM7SUFDTCxDQUFDO0NBQ0o7QUFqRkQsb0ZBaUZDIn0=