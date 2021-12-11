"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IQOptionStreamCandleGenerated = void 0;
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
class IQOptionStreamCandleGenerated extends stream_1.Readable {
    /**
     * Constructor.
     *
     * @param iqOptionWS
     * @param market
     * @param time
     */
    constructor(iqOptionWS, market, time) {
        super({ objectMode: true });
        this.iqOptionWS = iqOptionWS;
        this.market = market;
        this.time = time;
    }
    /**
     * Default read
     */
    _read() { }
    /**
     * Listerner event
     */
    async listener() {
        Core.logger().silly("IQOptionStreamCandleGenerated::listener");
        this.iqOptionWS
            .socket()
            .on("message", (data) => this.parseMessage(data.toString()));
        return Promise.resolve();
    }
    /**
     * Start stream.
     */
    async startStream() {
        Core.logger().silly("IQOptionStreamCandleGenerated::startStream");
        return this.subscribe(this.market, this.time)
            .then(() => this.listener())
            .then(() => Promise.resolve())
            .catch((e) => Promise.reject(e));
    }
    /**
     * Subscribe
     *
     * @param market string
     * @param time number
     * @returns void
     */
    subscribe(market, time) {
        Core.logger().silly("IQOptionStreamCandleGenerated::subscribe");
        if (this.iqOptionWS.isConnected()) {
            return Promise.reject("Socket is not connected.");
        }
        const message = {
            name: Core.IQOptionAction.CANDLE_GENERATED,
            params: {
                routingFilters: { active_id: market, size: time },
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
        if (messageJSON.name === Core.IQOptionAction.CANDLE_GENERATED) {
            this.emit("data", messageJSON.msg);
        }
    }
}
exports.IQOptionStreamCandleGenerated = IQOptionStreamCandleGenerated;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVFPcHRpb25TdHJlYW1DYW5kbGVHZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvbGliL1NlcnZpY2UvSVFPcHRpb25TZXJ2aWNlL0lRT3B0aW9uU3RyZWFtQ2FuZGxlR2VuZXJhdGVkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBOzs7Ozs7O0dBT0c7QUFDSCxtQ0FBa0M7QUFDbEMsOEJBQThCO0FBSTlCOztHQUVHO0FBQ0gsTUFBYSw2QkFDVCxTQUFRLGlCQUFRO0lBa0JoQjs7Ozs7O09BTUc7SUFDSCxZQUNJLFVBQXNCLEVBQ3RCLE1BQTJCLEVBQzNCLElBQXVCO1FBRXZCLEtBQUssQ0FBQyxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQzVCLElBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO1FBQzdCLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO1FBQ3JCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0lBQ3JCLENBQUM7SUFFRDs7T0FFRztJQUNJLEtBQUssS0FBVSxDQUFDO0lBRXZCOztPQUVHO0lBQ0ksS0FBSyxDQUFDLFFBQVE7UUFDakIsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDO1FBQy9ELElBQUksQ0FBQyxVQUFVO2FBQ1YsTUFBTSxFQUFFO2FBQ1IsRUFBRSxDQUFDLFNBQVMsRUFBRSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2pFLE9BQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQzdCLENBQUM7SUFFRDs7T0FFRztJQUNJLEtBQUssQ0FBQyxXQUFXO1FBQ3BCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsNENBQTRDLENBQUMsQ0FBQztRQUNsRSxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDO2FBQ3hDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7YUFDM0IsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQzthQUM3QixLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ksU0FBUyxDQUNaLE1BQTJCLEVBQzNCLElBQXVCO1FBRXZCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsMENBQTBDLENBQUMsQ0FBQztRQUNoRSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLEVBQUU7WUFDL0IsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLDBCQUEwQixDQUFDLENBQUM7U0FDckQ7UUFDRCxNQUFNLE9BQU8sR0FBRztZQUNaLElBQUksRUFBRSxJQUFJLENBQUMsY0FBYyxDQUFDLGdCQUFnQjtZQUMxQyxNQUFNLEVBQUU7Z0JBQ0osY0FBYyxFQUFFLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFO2FBQ3BEO1NBQ0osQ0FBQztRQUNGLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FDbEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsRUFBRSxPQUFPLENBQUMsQ0FDckUsQ0FBQztJQUNOLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssWUFBWSxDQUFDLE9BQWU7UUFDaEMsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN4QyxJQUFJLFdBQVcsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLGNBQWMsQ0FBQyxnQkFBZ0IsRUFBRTtZQUMzRCxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDdEM7SUFDTCxDQUFDO0NBQ0o7QUFyR0Qsc0VBcUdDIn0=