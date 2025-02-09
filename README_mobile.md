## Use Node 20 (if not already, build may fail if not)

```bash
# Switch to zsh
source ~/.zshrc
nvm use 20
```

## Build for ios:

```bash
# From project root...

# To run in dev with hot-reload:
quasar dev -m capacitor -T ios

# To build and deploy:

quasar build -m capacitor -T ios
```

## Run in Xcode:

```bash
# Nav to src-capacitor
cd src-capacitor
# Open Xcode project
npx cap open ios
```

:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

## Build for android:

```bash
# From project root...

# To run in dev with hot-reload:
quasar dev -m capacitor -T android

# To build and deploy:

quasar build -m capacitor -T android
```

## Run in Android Studio:

```bash
# Nav to src-capacitor
cd src-capacitor
# Open Xcode project
npx cap open android
```
