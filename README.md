# IQ Option Client Signal

This project provides a TypeScript client for interacting with the **IQ Option WebSocket API**, supporting real-time data streams, binary/digital order execution, and analytical features like trader sentiment and candle monitoring.

## 📁 Main Files and Responsibilities

- `IQOptionWs.ts`  
  Handles low-level WebSocket connection, event binding, and message dispatching.

- `IQOptionWrapper.ts`  
  Provides utility methods for login, balance retrieval, and initialization data via the IQ Option API.

- `IQOptionStreamUserAlerts.ts`  
  Listens for user alert events such as position limits or platform warnings.

- `IQOptionStreamTradersSentiment.ts`  
  Captures market sentiment data based on trader positions (e.g. BUY vs SELL ratio).

- `IQOptionStreamOptionClose.ts`  
  Streams events when an option closes, including result, profit, or loss.

- `IQOptionStreamCandleGenerated.ts`  
  Streams real-time candle data (OHLC) for specific instruments and timeframes.

- `IQOptionExpired.ts`  
  Utility for calculating expiration timestamps used in binary and digital options.

- `IQOptionApi.ts`  
  Main interface for authenticating, sending orders, and managing IQ Option logic. Relies on `IQOptionWs` internally.

## 📦 Features

- WebSocket connection and authentication (`IQOptionWs.ts`)
- Binary and digital option order execution (`IQOptionApi.ts`, `IQOptionWrapper.ts`)
- Candle data streaming for technical analysis (`IQOptionStreamCandleGenerated.ts`)
- Option close event tracking (`IQOptionStreamOptionClose.ts`)
- Real-time trader sentiment feed (`IQOptionStreamTradersSentiment.ts`)
- Streamed user alerts from IQ Option platform (`IQOptionStreamUserAlerts.ts`)
- Accurate expiration time calculation for trades (`IQOptionExpired.ts`)

## ▶️ Quick Usage Example

```ts
import { IQOptionApi, IQOptionMarket, IQOptionModel, iqOptionExpired } from './lib';

const api = new IQOptionApi("your-email", "your-password");
await api.connectAsync();

const profile = await api.getProfile();
const balance = profile.balances.find(b => b.type === 4); // TEST account

await api.sendOrderBinary(
  IQOptionMarket.EURUSD_OTC,
  IQOptionModel.BUY,
  iqOptionExpired(1),
  balance.id,
  90, // payout %
  10  // amount
);
```

## 🚀 How to Run

```bash
npm install
npm run build
npm run sample:iqoption
```

## 🧪 Run Tests

```bash
npm run test
```

## 👤 Author

Wellington Rocha

## 📝 License

ISC


# 📚 Usage Examples

## `IQOptionApi.ts`

```ts
import { IQOptionApi, IQOptionMarket, IQOptionModel, iqOptionExpired } from './lib';

const api = new IQOptionApi("email", "password");

await api.connectAsync();

const profile = await api.getProfile();
const testBalance = profile.balances.find(b => b.type === 4); // TEST balance

const result = await api.sendOrderBinary(
  IQOptionMarket.EURUSD_OTC,
  IQOptionModel.BUY,
  iqOptionExpired(1),
  testBalance.id,
  90, // payout %
  10  // amount
);
console.log("Order result:", result);
```

## `IQOptionWrapper.ts`

```ts
import { IQOptionWrapper } from './lib';

const wrapper = new IQOptionWrapper();

await wrapper.auth("email", "password");
const initData = await wrapper.getInitializationData();
console.log("Available assets:", initData);
```

## `IQOptionStreamCandleGenerated.ts`

```ts
import { IQOptionStreamCandleGenerated } from './lib';

const stream = new IQOptionStreamCandleGenerated();
stream.subscribe("EURUSD");

stream.on("candle-generated", (candle) => {
  console.log("New candle:", candle);
});
```

## `IQOptionStreamOptionClose.ts`

```ts
import { IQOptionStreamOptionClose } from './lib';

const stream = new IQOptionStreamOptionClose();
stream.subscribe();

stream.on("option-closed", (data) => {
  console.log("Option closed:", data);
});
```

## `IQOptionStreamTradersSentiment.ts`

```ts
import { IQOptionStreamTradersSentiment } from './lib';

const stream = new IQOptionStreamTradersSentiment();
stream.subscribe("EURUSD");

stream.on("sentiment", (data) => {
  console.log("Traders' sentiment:", data);
});
```

## `IQOptionStreamUserAlerts.ts`

```ts
import { IQOptionStreamUserAlerts } from './lib';

const stream = new IQOptionStreamUserAlerts();
stream.subscribe();

stream.on("user-alert", (alert) => {
  console.log("User alert received:", alert);
});
```

## `IQOptionWs.ts`

```ts
import { IQOptionWs } from './lib';

const ws = new IQOptionWs();
await ws.connect();

ws.on("authenticated", () => {
  console.log("WebSocket connected and authenticated.");
});
```

## `IQOptionExpired.ts`

```ts
import { iqOptionExpired } from './lib';

const expireTime = iqOptionExpired(1); // expiration in 1 minute
console.log("Expiration timestamp:", expireTime);
```

