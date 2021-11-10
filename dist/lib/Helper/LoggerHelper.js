"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
/*
 * Copyright (C) 2020 Wellington Rocha
 * All Rights Reserved.
 *
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * Proprietary and confidential.
 */
const Winston = require("winston");
/**
 * Logger helper.
 */
class LoggerHelper {
    /**
     * Load service.
     */
    static load() {
        if (LoggerHelper.logger === undefined) {
            const transports = {
                console: new Winston.transports.Console({
                    level: process.env.IQC_LOG_LEVEL || "info",
                    format: Winston.format.combine(Winston.format.colorize(), Winston.format.simple()),
                }),
            };
            LoggerHelper.logger = Winston.createLogger({
                transports: [transports.console],
            });
        }
        return LoggerHelper.logger;
    }
}
const logger = () => LoggerHelper.load();
exports.logger = logger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9nZ2VySGVscGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9IZWxwZXIvTG9nZ2VySGVscGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBOzs7Ozs7O0dBT0c7QUFDSCxtQ0FBbUM7QUFFbkM7O0dBRUc7QUFDSCxNQUFNLFlBQVk7SUFDZDs7T0FFRztJQUNJLE1BQU0sQ0FBQyxJQUFJO1FBQ2QsSUFBSSxZQUFZLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBRTtZQUNuQyxNQUFNLFVBQVUsR0FBRztnQkFDZixPQUFPLEVBQUUsSUFBSSxPQUFPLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQztvQkFDcEMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBYSxJQUFJLE1BQU07b0JBQzFDLE1BQU0sRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FDMUIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsRUFDekIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FDMUI7aUJBQ0osQ0FBQzthQUNMLENBQUM7WUFDRixZQUFZLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxZQUFZLENBQUM7Z0JBQ3ZDLFVBQVUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUM7YUFDbkMsQ0FBQyxDQUFDO1NBQ047UUFDRCxPQUFPLFlBQVksQ0FBQyxNQUFNLENBQUM7SUFDL0IsQ0FBQztDQU1KO0FBQ00sTUFBTSxNQUFNLEdBQUcsR0FBbUIsRUFBRSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUFuRCxRQUFBLE1BQU0sVUFBNkMifQ==