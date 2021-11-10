"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.iqOptionExpired = void 0;
/*
 * Copyright (C) 2020 Wellington Rocha
 * All Rights Reserved.
 *
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * Proprietary and confidential.
 */
const moment = require("moment");
/**
 * IQOption Expired.
 *
 * @param time
 */
const iqOptionExpired = (time) => {
    if (moment().seconds() > 30) {
        time = time + 1;
    }
    const m = moment().add(time, "minutes").utcOffset(0);
    m.set({ second: 0, millisecond: 0 });
    return m.unix();
};
exports.iqOptionExpired = iqOptionExpired;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVFPcHRpb25FeHBpcmVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpYi9TZXJ2aWNlL0lRT3B0aW9uU2VydmljZS9JUU9wdGlvbkV4cGlyZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUE7Ozs7Ozs7R0FPRztBQUNILGlDQUFrQztBQUdsQzs7OztHQUlHO0FBQ0ksTUFBTSxlQUFlLEdBQUcsQ0FBQyxJQUFrQixFQUFVLEVBQUU7SUFDMUQsSUFBSSxNQUFNLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLEVBQUU7UUFDekIsSUFBSSxHQUFHLElBQUksR0FBRyxDQUFDLENBQUM7S0FDbkI7SUFDRCxNQUFNLENBQUMsR0FBRyxNQUFNLEVBQUUsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNyRCxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxXQUFXLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNyQyxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNwQixDQUFDLENBQUM7QUFQVyxRQUFBLGVBQWUsbUJBTzFCIn0=