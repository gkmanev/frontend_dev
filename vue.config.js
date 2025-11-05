module.exports = {
  publicPath: "/",
  chainWebpack: (config) => {
    config.output.hashFunction("sha256");
  },
};
