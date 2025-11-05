# xtreme-vue2

## Project setup
Ensure you are running Node.js 22 for compatibility with the provided tooling.

```
npm install
```

### Compiles and hot-reloads for development
```
npm run dev
```
The development server now configures Webpack to use a SHA-256 hashing algorithm, letting the Vue CLI based toolchain run on Node.js 22 without legacy OpenSSL providers.

### Compiles and minifies for production
```
npm run build
```
Production builds leverage the same hashing configuration so the build pipeline stays compatible with Node.js 22.

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
