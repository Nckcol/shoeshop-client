const webpack = require('webpack')
const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const MinifyPlugin = require('babel-minify-webpack-plugin')
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin')
const PreloadWebpackPlugin = require('preload-webpack-plugin')
const { getIfUtils, removeEmpty } = require('webpack-config-utils')

const { ifProduction, ifNotProduction } = getIfUtils(process.env.NODE_ENV || 'development')

const HOST = process.env.HOST || 'localhost'
const PORT = process.env.PORT || 3000
const PATHS = {
  source: path.join(__dirname, './app'),
  build: path.join(__dirname, './public'),
  modules: path.resolve(__dirname, 'node_modules')
}

const STATS = {
  assets: true,
  children: false,
  chunks: false,
  hash: false,
  modules: false,
  publicPath: false,
  timings: true,
  version: false,
  warnings: true,
  colors: {
    green: '\u001b[32m'
  }
}

module.exports = function (options) {
  return {
    context: PATHS.source,

    entry: {
      main: removeEmpty([
        // activate HMR for React
        ifNotProduction('react-hot-loader/patch'),

        // bundle the client for webpack-dev-server
        // and connect to the provided endpoint
        ifNotProduction(`webpack-dev-server/client?http://${HOST}:${PORT}`),

        // bundle the client for hot reloading
        // only- means to only hot reload for successful updates
        ifNotProduction('webpack/hot/only-dev-server'),

        './index.js'
      ])
    },

    output: {
      path: PATHS.build,
      publicPath: '',
      filename: 'scripts/[name]-[hash:8].js',
      chunkFilename: 'scripts/[name]-[chunkhash:8].js'
    },

    module: {
      rules: [
        /* SCRIPTS */
        {
          test: /\.(jsx?)$/,
          exclude: /node_modules/,
          use: ['babel-loader']
        },

        /* STYLES */
        {
          test: /\.css$/,
          exclude: /node_modules/,
          use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: [
              {
                loader: 'css-loader',
                options: { importLoaders: 1 }
              },
              'postcss-loader'
            ]
          })
        },

        /* ASSETS */
        {
          test: /\.(jpe?g|png)$/,
          exclude: /node_modules/,
          use: {
            loader: 'file-loader',
            options: {
              name: 'assets/[name].[ext]'
            }
          }
        },
        {
          test: /\.svg$/,
          use: [
            {
              loader: 'file-loader'
            },
            {
              loader: 'svgo-loader',
              options: {
                plugins: [
                  {
                    removeTitle: true
                  },
                  {
                    convertColors: {
                      shorthex: false
                    }
                  },
                  {
                    convertPathData: false
                  }
                ]
              }
            }
          ]
        },
        {
          test: /\.woff$/,
          use: {
            loader: 'url-loader',
            options: {
              limit: 65000,
              mimetype: 'application/font-woff',
              name: 'assets/fonts/[name].[ext]'
            }
          }
        },
        {
          test: /\.woff2$/,
          use: {
            loader: 'url-loader',
            options: {
              limit: 65000,
              mimetype: 'application/font-woff2',
              name: 'assets/fonts/[name].[ext]'
            }
          }
        }
      ]
    },

    resolve: {
      extensions: ['.webpack-loader.js', '.web-loader.js', '.loader.js', '.js', '.jsx'],
      modules: [
        PATHS.modules
      ],
      alias: {
        components: path.resolve(PATHS.source, 'components'),
        ducks: path.resolve(PATHS.source, 'ducks'),
        store: path.resolve(PATHS.source, 'store'),
        pages: path.resolve(PATHS.source, 'pages'),
        utils: path.resolve(PATHS.source, 'utils')
      }
    },

    plugins: removeEmpty([
      new webpack.optimize.CommonsChunkPlugin({
        async: true,
        children: true,
        minChunks: 2
      }),

      // setting production environment will strip out
      // some of the development code from the app
      // and libraries
      new webpack.DefinePlugin({
        'process.env': {
          'NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        }
      }),

      // create css bundle
      new ExtractTextPlugin('styles/style-[contenthash:8].css'),

      // create index.html
      new HtmlWebpackPlugin({
        template: './index.ejs',
        inject: true,
        production: ifProduction(),
        minify: ifProduction({
          removeComments: true,
          // collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          // removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true
        })
      }),

      // make sure script tags are async to avoid blocking html render
      new ScriptExtHtmlWebpackPlugin({
        defaultAttribute: 'async'
      }),

      // preload chunks
      new PreloadWebpackPlugin(),

      new CopyPlugin([
        {
          from: 'static',
          ignore: [
            '.*'
          ]
        }
      ]),

      ifProduction(new MinifyPlugin()),

      // make hot reloading work
      ifNotProduction(new webpack.HotModuleReplacementPlugin()),

      // show module names instead of numbers in webpack stats
      ifNotProduction(new webpack.NamedModulesPlugin()),

      // don't spit out any errors in compiled assets
      ifNotProduction(new webpack.NoEmitOnErrorsPlugin())

      /* new ServiceworkerPlugin({
        entry: path.join(PATHS.source, 'service-worker.js'),
        includes: ['**!/!*.{html,js,css,svg,png,jpe?g}']
      }) */

    ]),

    devtool: ifProduction(false, 'source-map'),

    performance: ifProduction({
      maxAssetSize: 300000,
      maxEntrypointSize: 300000,
      hints: 'warning'
    }),

    stats: STATS,

    devServer: {
      contentBase: PATHS.source,
      publicPath: PATHS.public,
      historyApiFallback: true,
      port: PORT,
      host: HOST,
      hot: ifNotProduction(),
      compress: ifProduction(),
      stats: STATS
    }
  }
}
