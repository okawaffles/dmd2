/**
 * The type of EEW information sent in an Earthquake Early Warning report.
 */
export enum EEW_TYPE {
    FORECAST = 'eew_forecast',
    WARNING = 'eew_warning',
    CANCEL = 'eew_cancel'
}

export enum ShindoValue {
    UNKNOWN = 'over',
    ONE = '1',
    TWO = '2',
    THREE = '3',
    FOUR = '4',
    FIVE_LOWER = '5-',
    FIVE_UPPER = '5+',
    SIX_LOWER = '6-',
    SIX_UPPER = '6+',
    SEVEN = '7'
}

export interface EEW_Information {
    isLastInfo: boolean,
    isCanceled: boolean,
    isWarning: boolean,

}