"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleepHelper = void 0;
/**
 * Sleep helper.
 *
 * @param time
 */
const sleepHelper = (time) => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(), time);
    });
};
exports.sleepHelper = sleepHelper;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2xlZXBIZWxwZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL0hlbHBlci9TbGVlcEhlbHBlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBQTs7OztHQUlHO0FBQ0ksTUFBTSxXQUFXLEdBQUcsQ0FBQyxJQUFZLEVBQWlCLEVBQUU7SUFDdkQsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFO1FBQzNCLFVBQVUsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUN0QyxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQztBQUpXLFFBQUEsV0FBVyxlQUl0QiJ9