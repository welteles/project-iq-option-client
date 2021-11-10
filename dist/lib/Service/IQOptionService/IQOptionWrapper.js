"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IQOptionWrapper = void 0;
/*
 * Copyright (C) 2020 Wellington Rocha
 * All Rights Reserved.
 *
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * Proprietary and confidential.
 */
const axios_1 = require("axios");
const http = require("http");
const https = require("https");
const qs = require("querystring");
const Core = require("../..");
/**
 * IQOptionWrapper
 */
class IQOptionWrapper {
    /**
     * Constructor;
     *
     * @param email
     * @param password
     */
    constructor(email, password) {
        /**
         * Endpoint.
         */
        this.endpoint = "https://auth.iqoption.com";
        Core.logger().silly("IQOptionWrapper::constructor");
        this.email = email;
        this.password = password;
        this.client = axios_1.default.create({
            httpAgent: new http.Agent({ keepAlive: true }),
            httpsAgent: new https.Agent({ keepAlive: true }),
        });
    }
    /**
     * Connect to api.
     */
    auth() {
        Core.logger().silly("IQOptionWrapper::auth");
        return this.request("api/v1.0/login", {
            email: this.email,
            password: this.password,
        })
            .then((r) => r.data.ssid)
            .catch((e) => Promise.reject(e));
    }
    /**
     * Http request.
     *
     * @param path
     * @param data
     */
    request(path, data) {
        Core.logger().silly("IQOptionWrapper::request");
        const options = {};
        options.method = "POST";
        options.baseURL = this.endpoint;
        options.url = path;
        options.headers = {
            "Content-type": "application/x-www-form-urlencoded",
            Accept: "application/json",
        };
        options.data = qs.stringify(data);
        return this.client
            .request(options)
            .then((response) => Promise.resolve(response.data))
            .catch((e) => Promise.reject(e.response.data));
    }
}
exports.IQOptionWrapper = IQOptionWrapper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVFPcHRpb25XcmFwcGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpYi9TZXJ2aWNlL0lRT3B0aW9uU2VydmljZS9JUU9wdGlvbldyYXBwZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7Ozs7Ozs7R0FPRztBQUNILGlDQUE2QztBQUM3Qyw2QkFBNkI7QUFDN0IsK0JBQStCO0FBQy9CLGtDQUFrQztBQUNsQyw4QkFBOEI7QUFFOUI7O0dBRUc7QUFDSCxNQUFhLGVBQWU7SUFxQnhCOzs7OztPQUtHO0lBQ0gsWUFBbUIsS0FBYSxFQUFFLFFBQWdCO1FBMUJsRDs7V0FFRztRQUNjLGFBQVEsR0FBVywyQkFBMkIsQ0FBQztRQXdCNUQsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO1FBQ3BELElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxNQUFNLEdBQUcsZUFBSyxDQUFDLE1BQU0sQ0FBQztZQUN2QixTQUFTLEVBQUUsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUksRUFBRSxDQUFDO1lBQzlDLFVBQVUsRUFBRSxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUM7U0FDbkQsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOztPQUVHO0lBQ0ksSUFBSTtRQUNQLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUM3QyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLEVBQUU7WUFDbEMsS0FBSyxFQUFFLElBQUksQ0FBQyxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUTtTQUMxQixDQUFDO2FBQ0csSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQzthQUN4QixLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSyxPQUFPLENBQUMsSUFBWSxFQUFFLElBQVU7UUFDcEMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEtBQUssQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO1FBQ2hELE1BQU0sT0FBTyxHQUFRLEVBQUUsQ0FBQztRQUN4QixPQUFPLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztRQUN4QixPQUFPLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUM7UUFDaEMsT0FBTyxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUM7UUFDbkIsT0FBTyxDQUFDLE9BQU8sR0FBRztZQUNkLGNBQWMsRUFBRSxtQ0FBbUM7WUFDbkQsTUFBTSxFQUFFLGtCQUFrQjtTQUM3QixDQUFDO1FBQ0YsT0FBTyxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xDLE9BQU8sSUFBSSxDQUFDLE1BQU07YUFDYixPQUFPLENBQUMsT0FBTyxDQUFDO2FBQ2hCLElBQUksQ0FBQyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDbEQsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUN2RCxDQUFDO0NBQ0o7QUF4RUQsMENBd0VDIn0=