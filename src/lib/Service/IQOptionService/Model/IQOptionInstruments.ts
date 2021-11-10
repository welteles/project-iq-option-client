export interface IQOptionInstruments {
    instruments: IQOptionInstrument[];
}
export interface IQOptionInstrument {
    index: number;
    instrument_type: string;
    asset_id: number;
    user_group_id: number;
    expiration: number;
    period: number;
    quote: number;
    volatility: number;
    generated_at: number;
    data: IQOptionInstrumentData[];
    deadtime: number;
    buyback_deadtime: number;
}
export interface IQOptionInstrumentData {
    strike: string;
    symbol: string;
    direction: string;
}