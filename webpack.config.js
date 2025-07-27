const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: "./app.js",
  devtool: "source-map",
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "app.js",
  },

  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx", ".scss", ".css", ".json"],
    alias: {
      jquery: path.resolve(__dirname, "./jquery-stub.js"),
    },
  },

  plugins: [],

  module: {
    rules: [
  {
    test: /\.(js|jsx|ts|tsx)$/,
    exclude: /node_modules/,
    use: {
      loader: "babel-loader",
    },
  },
  {
    test: /\.css$/i,
    use: ["style-loader", "css-loader"],
  },
  {
    test: /\.scss$/i,
    use: [
      "style-loader",
      "css-loader",
      {
        loader: "sass-loader",
        options: {
          sassOptions: {
            includePaths: ["./node_modules"],
          },
        },
      },
    ],
  },
]

  },

  devServer: {
    static: {
      directory: path.resolve(__dirname, "public"),
    },
    port: 8080,
    host: "localhost",
    historyApiFallback: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers":
        "X-Requested-With, content-type, Authorization",
    },
    open: true,
    proxy: {
      "/api/*": "http://127.0.0.1:5005",
    },
  },

  // ✅ Properly moved out of devServer
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000,
  },
};
