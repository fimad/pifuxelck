const OfflinePlugin = require('offline-plugin');

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

  plugins: [
    new OfflinePlugin({
      responseStrategy: 'network-first',
      externals: [
        '/',
        '/favicon-16x16.png',
        '/favicon-32x32.png',
        '/favicon.ico',
        '/images/icon-144.png',
        '/images/icon-192.png',
        '/images/icon-48.png',
        '/images/icon-72.png',
        '/images/icon-96.png',
        '/manifest.json',
      ],
      ServiceWorker: {
        navigateFallbackURL: '/',
      },
      AppCache: false,
    }),
  ],

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
    host: '0.0.0.0',
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
