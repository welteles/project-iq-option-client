"use strict";
/*
 * Copyright (C) 2020 Wellington Rocha
 * All Rights Reserved.
 *
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * Proprietary and confidential.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.IQOptionMarket = void 0;
/**
 * Option Market.
 */
var IQOptionMarket;
(function (IQOptionMarket) {
    IQOptionMarket[IQOptionMarket["EURUSD"] = 1] = "EURUSD";
    IQOptionMarket[IQOptionMarket["EURGBP"] = 2] = "EURGBP";
    IQOptionMarket[IQOptionMarket["GBPJPY"] = 3] = "GBPJPY";
    IQOptionMarket[IQOptionMarket["EURJPY"] = 4] = "EURJPY";
    IQOptionMarket[IQOptionMarket["GBPUSD"] = 5] = "GBPUSD";
    IQOptionMarket[IQOptionMarket["USDJPY"] = 6] = "USDJPY";
    IQOptionMarket[IQOptionMarket["AUDCAD"] = 7] = "AUDCAD";
    IQOptionMarket[IQOptionMarket["NZDUSD"] = 8] = "NZDUSD";
    IQOptionMarket[IQOptionMarket["EURRUB"] = 9] = "EURRUB";
    IQOptionMarket[IQOptionMarket["USDRUB"] = 10] = "USDRUB";
    IQOptionMarket[IQOptionMarket["AUDCHF"] = 943] = "AUDCHF";
    IQOptionMarket[IQOptionMarket["AUDNZD"] = 944] = "AUDNZD";
    IQOptionMarket[IQOptionMarket["EURCHF"] = 946] = "EURCHF";
    IQOptionMarket[IQOptionMarket["GBPNZD"] = 947] = "GBPNZD";
    IQOptionMarket[IQOptionMarket["COMMBK"] = 13] = "COMMBK";
    IQOptionMarket[IQOptionMarket["DAIM"] = 14] = "DAIM";
    IQOptionMarket[IQOptionMarket["DBFRA"] = 15] = "DBFRA";
    IQOptionMarket[IQOptionMarket["EOAN"] = 16] = "EOAN";
    IQOptionMarket[IQOptionMarket["BPLON"] = 23] = "BPLON";
    IQOptionMarket[IQOptionMarket["GAZPROM"] = 27] = "GAZPROM";
    IQOptionMarket[IQOptionMarket["ROSNEFT"] = 28] = "ROSNEFT";
    IQOptionMarket[IQOptionMarket["SBERS"] = 29] = "SBERS";
    IQOptionMarket[IQOptionMarket["AMAZON"] = 31] = "AMAZON";
    IQOptionMarket[IQOptionMarket["APPLE"] = 32] = "APPLE";
    IQOptionMarket[IQOptionMarket["BAIDU"] = 33] = "BAIDU";
    IQOptionMarket[IQOptionMarket["CISCO"] = 34] = "CISCO";
    IQOptionMarket[IQOptionMarket["FACEBOOK"] = 35] = "FACEBOOK";
    IQOptionMarket[IQOptionMarket["GOOGLE"] = 36] = "GOOGLE";
    IQOptionMarket[IQOptionMarket["INTEL"] = 37] = "INTEL";
    IQOptionMarket[IQOptionMarket["MSFT"] = 38] = "MSFT";
    IQOptionMarket[IQOptionMarket["YAHOO"] = 40] = "YAHOO";
    IQOptionMarket[IQOptionMarket["AIG"] = 41] = "AIG";
    IQOptionMarket[IQOptionMarket["BOA"] = 42] = "BOA";
    IQOptionMarket[IQOptionMarket["CITI"] = 45] = "CITI";
    IQOptionMarket[IQOptionMarket["COKE"] = 46] = "COKE";
    IQOptionMarket[IQOptionMarket["GM"] = 49] = "GM";
    IQOptionMarket[IQOptionMarket["GS"] = 50] = "GS";
    IQOptionMarket[IQOptionMarket["JPM"] = 51] = "JPM";
    IQOptionMarket[IQOptionMarket["MCDON"] = 52] = "MCDON";
    IQOptionMarket[IQOptionMarket["MORSTAN"] = 53] = "MORSTAN";
    IQOptionMarket[IQOptionMarket["NIKE"] = 54] = "NIKE";
    IQOptionMarket[IQOptionMarket["VERIZON"] = 56] = "VERIZON";
    IQOptionMarket[IQOptionMarket["WMART"] = 57] = "WMART";
    IQOptionMarket[IQOptionMarket["DAX30"] = 66] = "DAX30";
    IQOptionMarket[IQOptionMarket["DJIA"] = 67] = "DJIA";
    IQOptionMarket[IQOptionMarket["FTSE"] = 68] = "FTSE";
    IQOptionMarket[IQOptionMarket["NSDQ"] = 69] = "NSDQ";
    IQOptionMarket[IQOptionMarket["NK"] = 70] = "NK";
    IQOptionMarket[IQOptionMarket["SP"] = 71] = "SP";
    IQOptionMarket[IQOptionMarket["USDCHF"] = 72] = "USDCHF";
    IQOptionMarket[IQOptionMarket["BTCX"] = 73] = "BTCX";
    IQOptionMarket[IQOptionMarket["XAUUSD"] = 74] = "XAUUSD";
    IQOptionMarket[IQOptionMarket["XAGUSD"] = 75] = "XAGUSD";
    IQOptionMarket[IQOptionMarket["EURUSD_OTC"] = 76] = "EURUSD_OTC";
    IQOptionMarket[IQOptionMarket["EURGBP_OTC"] = 77] = "EURGBP_OTC";
    IQOptionMarket[IQOptionMarket["USDCHF_OTC"] = 78] = "USDCHF_OTC";
    IQOptionMarket[IQOptionMarket["EURJPY_OTC"] = 79] = "EURJPY_OTC";
    IQOptionMarket[IQOptionMarket["NZDUSD_OTC"] = 80] = "NZDUSD_OTC";
    IQOptionMarket[IQOptionMarket["GBPUSD_OTC"] = 81] = "GBPUSD_OTC";
    IQOptionMarket[IQOptionMarket["EURRUB_OTC"] = 82] = "EURRUB_OTC";
    IQOptionMarket[IQOptionMarket["USDRUB_OTC"] = 83] = "USDRUB_OTC";
    IQOptionMarket[IQOptionMarket["GBPJPY_OTC"] = 84] = "GBPJPY_OTC";
    IQOptionMarket[IQOptionMarket["USDJPY_OTC"] = 85] = "USDJPY_OTC";
    IQOptionMarket[IQOptionMarket["AUDCAD_OTC"] = 86] = "AUDCAD_OTC";
    IQOptionMarket[IQOptionMarket["ALIBABA"] = 87] = "ALIBABA";
    IQOptionMarket[IQOptionMarket["YANDEX"] = 95] = "YANDEX";
    IQOptionMarket[IQOptionMarket["PAN"] = 97] = "PAN";
    IQOptionMarket[IQOptionMarket["AUDUSD"] = 99] = "AUDUSD";
    IQOptionMarket[IQOptionMarket["USDCAD"] = 100] = "USDCAD";
    IQOptionMarket[IQOptionMarket["AUDJPY"] = 101] = "AUDJPY";
    IQOptionMarket[IQOptionMarket["GBPCAD"] = 102] = "GBPCAD";
    IQOptionMarket[IQOptionMarket["GBPCHF"] = 103] = "GBPCHF";
    IQOptionMarket[IQOptionMarket["GBPAUD"] = 104] = "GBPAUD";
    IQOptionMarket[IQOptionMarket["EURCAD"] = 105] = "EURCAD";
    IQOptionMarket[IQOptionMarket["CHFJPY"] = 106] = "CHFJPY";
    IQOptionMarket[IQOptionMarket["CADCHF"] = 107] = "CADCHF";
    IQOptionMarket[IQOptionMarket["EURAUD"] = 108] = "EURAUD";
    IQOptionMarket[IQOptionMarket["BMW"] = 110] = "BMW";
    IQOptionMarket[IQOptionMarket["LUFTHANSA"] = 111] = "LUFTHANSA";
    IQOptionMarket[IQOptionMarket["TWITTER"] = 113] = "TWITTER";
    IQOptionMarket[IQOptionMarket["FERRARI"] = 133] = "FERRARI";
    IQOptionMarket[IQOptionMarket["SMI_INDEX"] = 166] = "SMI_INDEX";
    IQOptionMarket[IQOptionMarket["TESLA"] = 167] = "TESLA";
    IQOptionMarket[IQOptionMarket["USDNOK"] = 168] = "USDNOK";
    IQOptionMarket[IQOptionMarket["SSE_INDEX"] = 169] = "SSE_INDEX";
    IQOptionMarket[IQOptionMarket["HANG_SENG"] = 170] = "HANG_SENG";
    IQOptionMarket[IQOptionMarket["SPASX200"] = 208] = "SPASX200";
    IQOptionMarket[IQOptionMarket["TOPIX500"] = 209] = "TOPIX500";
    IQOptionMarket[IQOptionMarket["DX"] = 210] = "DX";
    IQOptionMarket[IQOptionMarket["EURNZD"] = 212] = "EURNZD";
    IQOptionMarket[IQOptionMarket["SIN_FAKE"] = 213] = "SIN_FAKE";
    IQOptionMarket[IQOptionMarket["BRENT_OIL_JUL_16"] = 215] = "BRENT_OIL_JUL_16";
    IQOptionMarket[IQOptionMarket["NTDOY"] = 218] = "NTDOY";
    IQOptionMarket[IQOptionMarket["USDSEK"] = 219] = "USDSEK";
    IQOptionMarket[IQOptionMarket["USDTRY"] = 220] = "USDTRY";
})(IQOptionMarket = exports.IQOptionMarket || (exports.IQOptionMarket = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSVFPcHRpb25NYXJrZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvbGliL1NlcnZpY2UvSVFPcHRpb25TZXJ2aWNlL01vZGVsL0lRT3B0aW9uTWFya2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7OztHQU9HOzs7QUFFSDs7R0FFRztBQUNILElBQVksY0FvSFg7QUFwSEQsV0FBWSxjQUFjO0lBQ3RCLHVEQUFVLENBQUE7SUFDVix1REFBVSxDQUFBO0lBQ1YsdURBQVUsQ0FBQTtJQUNWLHVEQUFVLENBQUE7SUFDVix1REFBVSxDQUFBO0lBQ1YsdURBQVUsQ0FBQTtJQUNWLHVEQUFVLENBQUE7SUFDVix1REFBVSxDQUFBO0lBQ1YsdURBQVUsQ0FBQTtJQUNWLHdEQUFXLENBQUE7SUFDWCx5REFBWSxDQUFBO0lBQ1oseURBQVksQ0FBQTtJQUNaLHlEQUFZLENBQUE7SUFDWix5REFBWSxDQUFBO0lBRVosd0RBQVcsQ0FBQTtJQUNYLG9EQUFTLENBQUE7SUFDVCxzREFBVSxDQUFBO0lBQ1Ysb0RBQVMsQ0FBQTtJQUVULHNEQUFVLENBQUE7SUFFViwwREFBWSxDQUFBO0lBQ1osMERBQVksQ0FBQTtJQUNaLHNEQUFVLENBQUE7SUFFVix3REFBVyxDQUFBO0lBQ1gsc0RBQVUsQ0FBQTtJQUNWLHNEQUFVLENBQUE7SUFDVixzREFBVSxDQUFBO0lBQ1YsNERBQWEsQ0FBQTtJQUNiLHdEQUFXLENBQUE7SUFDWCxzREFBVSxDQUFBO0lBQ1Ysb0RBQVMsQ0FBQTtJQUVULHNEQUFVLENBQUE7SUFDVixrREFBUSxDQUFBO0lBQ1Isa0RBQVEsQ0FBQTtJQUVSLG9EQUFTLENBQUE7SUFDVCxvREFBUyxDQUFBO0lBRVQsZ0RBQU8sQ0FBQTtJQUNQLGdEQUFPLENBQUE7SUFDUCxrREFBUSxDQUFBO0lBQ1Isc0RBQVUsQ0FBQTtJQUNWLDBEQUFZLENBQUE7SUFDWixvREFBUyxDQUFBO0lBRVQsMERBQVksQ0FBQTtJQUNaLHNEQUFVLENBQUE7SUFFVixzREFBVSxDQUFBO0lBQ1Ysb0RBQVMsQ0FBQTtJQUNULG9EQUFTLENBQUE7SUFDVCxvREFBUyxDQUFBO0lBQ1QsZ0RBQU8sQ0FBQTtJQUNQLGdEQUFPLENBQUE7SUFDUCx3REFBVyxDQUFBO0lBQ1gsb0RBQVMsQ0FBQTtJQUNULHdEQUFXLENBQUE7SUFDWCx3REFBVyxDQUFBO0lBQ1gsZ0VBQWUsQ0FBQTtJQUNmLGdFQUFlLENBQUE7SUFDZixnRUFBZSxDQUFBO0lBQ2YsZ0VBQWUsQ0FBQTtJQUNmLGdFQUFlLENBQUE7SUFDZixnRUFBZSxDQUFBO0lBQ2YsZ0VBQWUsQ0FBQTtJQUNmLGdFQUFlLENBQUE7SUFDZixnRUFBZSxDQUFBO0lBQ2YsZ0VBQWUsQ0FBQTtJQUNmLGdFQUFlLENBQUE7SUFDZiwwREFBWSxDQUFBO0lBRVosd0RBQVcsQ0FBQTtJQUVYLGtEQUFRLENBQUE7SUFFUix3REFBVyxDQUFBO0lBQ1gseURBQVksQ0FBQTtJQUNaLHlEQUFZLENBQUE7SUFDWix5REFBWSxDQUFBO0lBQ1oseURBQVksQ0FBQTtJQUNaLHlEQUFZLENBQUE7SUFDWix5REFBWSxDQUFBO0lBQ1oseURBQVksQ0FBQTtJQUNaLHlEQUFZLENBQUE7SUFDWix5REFBWSxDQUFBO0lBRVosbURBQVMsQ0FBQTtJQUNULCtEQUFlLENBQUE7SUFFZiwyREFBYSxDQUFBO0lBRWIsMkRBQWEsQ0FBQTtJQUViLCtEQUFlLENBQUE7SUFDZix1REFBVyxDQUFBO0lBQ1gseURBQVksQ0FBQTtJQUNaLCtEQUFlLENBQUE7SUFDZiwrREFBZSxDQUFBO0lBRWYsNkRBQWMsQ0FBQTtJQUNkLDZEQUFjLENBQUE7SUFDZCxpREFBUSxDQUFBO0lBRVIseURBQVksQ0FBQTtJQUNaLDZEQUFjLENBQUE7SUFFZCw2RUFBc0IsQ0FBQTtJQUV0Qix1REFBVyxDQUFBO0lBQ1gseURBQVksQ0FBQTtJQUNaLHlEQUFZLENBQUE7QUFDaEIsQ0FBQyxFQXBIVyxjQUFjLEdBQWQsc0JBQWMsS0FBZCxzQkFBYyxRQW9IekIifQ==