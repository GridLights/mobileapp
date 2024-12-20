// import { webservices } from "../webservices";

// const webSocketManager = {
//   isInitialized: false,
//   wsUrl: null,

//   init(wsUrl, onMessageCallback, onLiveStreamCallback, onConnectedCallback) {
//     if (!this.isInitialized) {
//       this.wsUrl = wsUrl;
//       webservices.initWebSocket(
//         wsUrl,
//         onMessageCallback,
//         onLiveStreamCallback,
//         onConnectedCallback
//       );
//       this.isInitialized = true;
//     }
//   },

//   // init(wsUrl) {
//   //   if (!this.isInitialized) {
//   //     this.wsUrl = wsUrl;
//   //     webservices.initWebSocket(wsUrl);
//   //     this.isInitialized = true;
//   //   }
//   // },

//   reconnect(onMessageCallback, onLiveStreamCallback, onConnectedCallback) {
//     webservices.initWebSocket(
//       this.wsUrl,
//       onMessageCallback,
//       onLiveStreamCallback,
//       onConnectedCallback
//     );
//   },
// };

// export default webSocketManager;
