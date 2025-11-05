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
The development script wraps the Vue CLI with `node --openssl-legacy-provider` so that Webpack 4 based tooling continues to run under Node.js 22's OpenSSL defaults.

### Compiles and minifies for production
```
npm run build
```
The production build uses the same compatibility flag to ensure consistent behavior when targeting Node.js 22.

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
