/**
 * Data Type Codes (supplied in a WSTicket).
 * EEW_FORECAST is deprecated by DM-D.S.S; use `DataTypeCode.EEW_EARLY_MOTION_FORECAST` instead.
 */
export enum DataTypeCode {
    EEW_FORECAST = 'VXSE44',
    EEW_EARLY_MOTION_FORECAST = 'VXSE45', // Early Earthquake Warning (early motion forecast)
    EEW_TEST = 'VXSE42',
    EEW_WARNING = 'VXSE43',
    REAL_TIME_SEISMIC_INTENSITY = 'VXSE47',
    EARTHQUAKE_INTENSITY_REPORT = 'VXSE51',
    EARTHQUAKE_INFORMATION_EPICENTER = 'VXSE52',
    EARTHQUAKE_INFORMATION_EPICENTER_INTENSITY = 'VXSE53',
    EARTHQUAKE_INFORMATION_ACTIVITY = 'VXSE56',
    EARTHQUAKE_INFORMATION_COUNT = 'VXSE60',
    EARTHQUAKE_INFORMATION_NOTABLE_UPDATES = 'VXSE61',
    EARTHQUAKE_LONG_MOTION_OBSERVATION = 'VXSE62',
    EARTHQUAKE_DATA_INTENSITY_DISTRIBUTION = 'IXAC41',
    NANKAI_TROUGH_EMERGENCY = 'VYSE50',
    NANKAI_TROUGH_EXPLANATORY_NO_PERIODIC = 'VYSE51',
    NANKAI_TROUGH_EXPLANATORY_REGULAR = 'VYSE52',
    HOKKAIDO_SANRIKU_OFFSHORE_EARTHQUAKE_WARNING = 'VYSE60',
    TSUNAMI_ALERTS = 'VTSE41',
    TSUNAMI_INFORMATION = 'VTSE51',
    TSUNAMI_INFORMATION_OFFSHORE = 'VTSE52',
    TSUNAMI_INTERNATIONAL_DOMESTIC = 'WEPA60',
    EARTHQUAKE_AND_TSUNAMI_INFORMATION = 'VZSE40',
}

/**
 * Classifications as to which services you will be using with the websocket.
 */
export enum Classification {
    TELEGRAM_WEATHER = 'telegram.weather',
    TELEGRAM_EARTHQUAKE = 'telegram.earthquake',
    EEW_WARNING = 'eew.warning',
    EEW_FORECAST = 'eew.forecast',
}

/**
 * Interface mapped to documentation at https://dmdata.jp/docs/reference/api/v2/websocket#type-data.
 */
export interface WebSocketData {
    type: 'data',
    version: string,
    classification: Classification,
    id: string,
    passing: Array<{name: string, time: string}>,
    head: {
        type: DataTypeCode,
        author: string,
        time: string,
        test: boolean,
        xml: boolean
    },
    xmlReport: {
        control: {
            title: string,
            dateTime: string,
            status: string,
            editorialOffice: string,
            publishingOffice: string,
        },
        head: {
            title: string,
            reportDateTime: string,
            targetDateTime: string,
            eventId?: string,
            serial?: string,
            infoType: string,
            infoKind: string,
            infoKindVersion: string,
            headline: string,
        }
    },
    format: 'xml' | 'a/n' | 'binary',
    compression: 'gzip' | 'zip',
    encoding: 'base64' | 'utf-8',
    body: string,
}


export interface BodyHeader {
    _originalId: string,
    _schema: {
        type: string,
        version: string
    },
    type: string,
    title: string,
    status: string,
    infoType: string,
    editorialOffice: string,
    publishingOffice: Array<string>,
    pressDateTime: string,
    reportDateTime: string,
    targetDateTime: string,
    eventId: string,
    serialNo: string,
    infoKind: string,
    infoKindVersion: string,
    headline: string,
}