##
'''git clone https://github.com/GridLights/mobileapp
'''cd mobileapp

## Install the dependencies

```bash
yarn
# or
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)

```bash
quasar dev
```

### Lint the files

```bash
yarn lint
# or
npm run lint
```

### Format the files

```bash
yarn format
# or
npm run format
```

### Build the app for production

```bash
quasar build
```

### Customize the configuration

See [Configuring quasar.config.js](https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js).

### Also see the README MOBILE for more info

## Features

### Custom WLED Effects Detection

The app now automatically detects and manages custom WLED effects installed on your devices. When you connect to a WLED instance, the app will:

- Poll the device for its complete effects list
- Compare against the default WLED effects (103 built-in effects)
- Identify and store any custom effects
- Display custom effect counts in the UI
- Cache analysis results in localStorage

#### Quick Start

1. Go to Settings page
2. Select a WLED device
3. The app automatically analyzes the device
4. Custom effects (if any) are detected and stored
5. Custom effect count is displayed below the device name

#### Using Custom Effects in Your Code

```javascript
import { useWledEffects } from '@/utils/useWledEffects';

// In your component
const { customEffects, hasCustomEffects, analyzeDevice } = useWledEffects('192.168.1.101');

// Display custom effects
if (hasCustomEffects.value) {
  customEffects.value.forEach(effect => {
    console.log(`${effect.name} - ID: ${effect.id}`);
  });
}
```

See [WLED_EFFECTS_GUIDE.md](./WLED_EFFECTS_GUIDE.md) for complete documentation.

#### Example Component

An example component `CustomEffectsList.vue` is included to demonstrate:
- Displaying custom effects
- Applying effects to WLED
- Re-analyzing devices
- Showing device information

Import and use in any page:
```vue
<template>
  <CustomEffectsList />
</template>

<script>
import CustomEffectsList from '@/components/CustomEffectsList.vue';

export default {
  components: { CustomEffectsList }
};
</script>
```
