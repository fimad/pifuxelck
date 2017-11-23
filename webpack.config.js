module.exports = {
  entry: "./src/web/index.tsx",
  output: {
    filename: "bundle.js",
    path: __dirname + "/dist-web"
  },

  // Enable sourcemaps for debugging webpack's output.
  devtool: "source-map",

  resolve: {
    // Add '.ts' and '.tsx' as resolvable extensions.
    extensions: [".ts", ".tsx", ".js", ".json"]
  },

  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: true,
              localIdentName: '[name]__[local]___[hash:base64:5]',
            },
          },
          'postcss-loader'
        ]
      },

      // All files with a '.ts' or '.tsx' extension will be handled by
      // 'awesome-typescript-loader'.
      { test: /\.tsx?$/, loader: "awesome-typescript-loader" },

      // All output '.js' files will have any sourcemaps re-processed by
      // 'source-map-loader'.
      { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
    ]
  },

  devServer: {
    port: 3000,
    historyApiFallback: {
      index: 'index.html'
    }
  }

  // When importing a module whose path matches one of the following, just
  // assume a corresponding global variable exists and use that instead.  This
  // is important because it allows us to avoid bundling all of our
  // dependencies, which allows browsers to cache those libraries between
  // builds.
//  externals: {
//    "react": "React",
//    "react-dom": "ReactDOM"
//  },
};
