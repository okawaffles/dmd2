import {Logger} from "okayulogger";
import {Classification, DataTypeCode} from "./typings/dataTypes";
import EventEmitter = require("node:events");
import {ErrorEvent} from "ws";

/**
 * API Regions prefixes for the WebSocket. \<region\>.api.dmdata.jp/v2/websocket
 */
export enum DMDataSocketRegion {
    ANY = 'ws',
    AUTOMATIC = 'ws',
    TOKYO_AND_OSAKA = 'ws',

    TOKYO = 'ws-tokyo',
    TOKYO_AWS_001 = 'ws001',
    TOKYO_AWS_002 = 'ws002',

    OSAKA = 'ws-osaka',
    OSAKA_AWS_003 = 'ws003',
    OSAKA_AWS_004 = 'ws004'
}

/**
 * WebSocket-related events that can be fired by the emitter.
 */
export enum WebSocketEvent {
    WS_FAIL = 'ws_fail',
    WS_FAIL_NO_RETRY = 'ws_fail_no_retry',
    WS_CONNECTED = 'ws_connected',
    WS_DISCONNECTED = 'ws_disconnected',
    WS_RECONNECTING = 'ws_reconnect',
    WS_PING = 'ws_ping'
}

/**
 * Initial configuration parameters for the websocket.
 */
type DMDataSocketConfig = {
    region: DMDataSocketRegion,
    application_name: string,
    debug_logging: boolean,
};

/**
 * A ticket generated to log into the websocket
 */
export interface WSTicket {
    responseId: string,
    responseTime: string,
    status: 'ok' | 'error',
    ticket: string,
    websocket: {
        id: number,
        url: string,
        protocol: Array<string>,
        expiration: 300
    },
    classifications: Array<Classification>,
    test: 'no' | 'including',
    types: Array<DataTypeCode>,
    formats: Array<'xml' | 'a/n' | 'binary'>,
    appName: string,
    error: {
        message: string,
        code: number
    }
}


export class DMDataSocket {
    public readonly app_name: string;
    public readonly region: DMDataSocketRegion;
    public is_connecting: boolean = false;
    public is_connected: boolean = false;
    public readonly socket_id!: number;

    public classifications: Array<Classification> = [];
    public data_types: Array<DataTypeCode> = [];
    public including_tests: boolean = false;

    public emitter = new EventEmitter();

    protected api_key: string;
    protected api_key_as_header: string;
    protected debug_mode: boolean;
    protected logger: Logger;
    protected base_url: string = 'https://api.dmdata.jp';
    protected SOCKET!: WebSocket;

    /**
     * A websocket class for helping interface with Project DM-D.S.S
     * @param api_key Your DMData API key
     * @param config Optional configuration. Highly recommended to set an application name.
     * @param url_override Optional override for the URL. Useful when connecting to a custom server. Format must be `https://example.com` with no trailing slash.
     */
    constructor(api_key: string, config: DMDataSocketConfig = {region: DMDataSocketRegion.AUTOMATIC, debug_logging: false, application_name: 'dmd2 application'}, url_override?: string) {
        if (url_override) this.base_url = url_override;
        this.api_key = api_key;
        this.api_key_as_header = `Basic ${btoa(api_key)}`;
        this.region = config.region;
        this.app_name = config.application_name;
        this.debug_mode = config.debug_logging;
        this.logger = new Logger(`dmd2 (${this.app_name})`);
    }

    /**
     * Gets a ticket for connecting to the websocket.
     * @private
     */
    private async fetchSocketTicket(): Promise<WSTicket | undefined> {
        if (this.debug_mode) this.logger.debug('fetching ticket...');
        const ticket_result = await fetch(this.base_url + '/v2/socket', {
            method: 'POST',
            headers: {
                'Authorization': this.api_key_as_header
            },
            body: JSON.stringify({
                classifications: this.classifications,
                types: this.data_types.length > 0 ? this.data_types : undefined,
                appName: this.app_name,
                test: this.including_tests ? 'include' : 'no',
                formatMode: 'json'
            })
        });

        const ticket: WSTicket = await ticket_result.json();

        if (ticket.status == 'error') {
            this.logger.fatal(`Could not get websocket ticket: Code ${ticket.error.code}; message "${ticket.error.message}"`);
            return;
        }

        return ticket;
    }

    // -- Emitter -- //

    on(event_name: WebSocketEvent, listener: (...args: any[]) => void): void {
        this.emitter.on(event_name, listener);
    }

    off(event_name: WebSocketEvent, listener: (...args: any[]) => void): void {
        this.emitter.off(event_name, listener);
    }

    emit(event_name: WebSocketEvent, ...args: any[]): void {
        if (this.debug_mode) this.logger.debug(`firing event ${event_name}`);
        this.emitter.emit(event_name, ...args);
    }

    /* Public Methods */

    public async Start(options: {
        classifications: Array<Classification>,
        data_types?: Array<DataTypeCode>,
        include_tests?: boolean
    }): Promise<boolean> {
        this.classifications = options.classifications;
        this.data_types = options.data_types || [];
        this.including_tests = options.include_tests || false;

        const ws_ticket = await this.fetchSocketTicket();

        if (!ws_ticket) return false;

        if (this.debug_mode) this.logger.debug(`got ticket (${ws_ticket.ticket}), starting socket...`);

        try {
            this.SOCKET = new WebSocket(`wss://${this.region}.api.dmdata.jp/v2/websocket?ticket=${ws_ticket.ticket}`);
            this.is_connecting = true;

            this.SOCKET.onerror = (ev: Event): any => {
                if (!this.is_connecting && !this.is_connected) return;
                this.is_connecting = false;

                this.logger.error(`There was an error connecting to DMData.`);
                console.error((ev as unknown as ErrorEvent).message);

                this.SOCKET.close();
                this.emit(WebSocketEvent.WS_FAIL_NO_RETRY);
            }

            while (this.SOCKET.readyState == WebSocket.CONNECTING) {
                // wait 1 sec each loop
                await new Promise((resolve) => setTimeout(resolve, 1_000));
                if (this.debug_mode) this.logger.debug(`waiting for connected... (${this.SOCKET.readyState})`);
            }

            if (this.SOCKET.readyState == WebSocket.OPEN) {
                this.emit(WebSocketEvent.WS_CONNECTED);
                this.is_connected = true;
                this.is_connecting = false;

                this.SOCKET.onmessage = (ev) => this.setupSocketHandlers(JSON.parse(ev.data));

                return true;
            } else {
                this.emit(WebSocketEvent.WS_FAIL_NO_RETRY);
                this.is_connecting = false;
                this.is_connected = false;
                return false;
            }
        } catch (err) {
            if (this.debug_mode) console.error(err);
            this.is_connecting = false;
            this.is_connected = false;
            this.emit(WebSocketEvent.WS_FAIL_NO_RETRY);
            return false;
        }
    }

    /* Data handling */
    private setupSocketHandlers(json_message: {type: string, [key: string]: unknown}) {
        if (this.debug_mode) this.logger.debug(`received message: ${JSON.stringify(json_message)}`);
        if (json_message.type == 'ping') {
            if (this.debug_mode) this.logger.debug('PING received, handling automatically.');
            const proper_message = json_message as {type: string, pingId: string};
            this.SOCKET.send(JSON.stringify({type:'pong',pingId:proper_message.pingId}));
            this.emitter.emit(WebSocketEvent.WS_PING);
        }
    }
}