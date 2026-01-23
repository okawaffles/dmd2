# dmd2
The dmd2 package is a successor to the now-deprecated package lily-dmdata. The APIs are/will be similar but different enough to where it cannot be used as a drop-in replacement.
It is a package to help interface with Project DM-D.S.S (DMData).

> [!IMPORTANT]
> This package is not finished. I won't say you shouldn't use it, as I believe testers are important.
> However, if you *do* choose to use it, please be aware that it is subject to change at any point during unfinished development.

## Websocket Events
### `WebSocketEvent.WS_CONNECTED`
Fires when the websocket is successfully opened and connected.

### `WebSocketEvent.WS_FAIL` (Not Implemented)
Fires when the websocket fails to connect for any reason.
When this event is fired, dmd2 will automatically try and reconnect.

### `WebSocketEvent.WS_FAIL_NO_RETRY`
This event is the same as `WebSocketEvent.WS_FAIL`, except that dmd2 will **not** try and reconnect automatically.

### `WebSocketEvent.WS_RECONNECTING`
Fires when dmd2 automatically tries to reconnect to DMData.

### `WebSocketEvent.WS_PING`
DMData periodically (every 20 seconds or so) sends a ping to the websocket to ensure it is alive. 
dmd2 will automatically handle the "pong" message when this event is fired.

### `WebSocketEvent.WS_DATA` (Not Implemented)
Fires when data has been processed, alongside the data.

## Help Wanted!
- Translation of documentation into Japanese would be helpful!
Project DM-D.S.S is primarily a Japanese service, however, I am an English developer.
- General usage with any purpose would be extremely appreciated.