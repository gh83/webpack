const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

const optimization = () => {
  const config = {
    splitChunks: { chunks: 'all' }
  }
  if (isProd) {
    config.minimizer = [
      new OptimizeCssAssetWebpackPlugin(),
      new TerserWebpackPlugin()
    ]
  }
  return config
}

const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`

const cssLoaders = extra => {
  const loaders = [
    {
      loader: MiniCssExtractPlugin.loader,
      options: { hmr: isDev, reloadAll: true },
    },
    'css-loader'
  ]
  if (extra) loaders.push(extra)

  return loaders
}

const babelOptions = preset => {
  const opts = {
    presets: ['@babel/preset-env']
  }
  if (preset) opts.presets.push(preset)

  return opts
}

const jsLoaders = () => {
  const loaders = [{
    loader: 'babel-loader',
    options: babelOptions()
  }]

  if (isDev) loaders.push('eslint-loader')

  return loaders
}

const plugins = () => {
  return [
    new HTMLWebpackPlugin({
      template: './index.html',
      minify: { collapseWhitespace: isProd }
    }),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin([{
      from: path.resolve(__dirname, 'src/static/'), to: path.resolve(__dirname, 'dist')
    }]),
    new MiniCssExtractPlugin({
      filename: filename('css')
    })
  ]
}

module.exports = {
  context: path.resolve(__dirname, 'src'),
  mode: 'development',
  entry: {
    main: ['@babel/polyfill', './index.js'],
    analytics: './analytics.js'
  },
  output: {
    filename: filename('js'),
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  },
  optimization: optimization(),
  devServer: {
    port: 8081,
    hot: isDev
  },
  devtool: isDev ? 'source-map' : '',
  plugins: plugins(),
  module: {
    rules: [
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: cssLoaders()
      },
      {
        test: /\.less$/,
        exclude: /node_modules/,
        use: cssLoaders('less-loader')
      },
      {
        test: /\.(png|jpg|svg|gif)$/,
        loader: 'file-loader',
        options: {
          name: filename('[ext]'),
          outputPath: `assets/img`
        }
      },
      {
        test: /\.(ttf|woff|woff2|eot)$/,
        loader: 'file-loader',
        options: {
          name: filename('[ext]'),
          outputPath: `assets/fonts`
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: jsLoaders()
      },
      // {
      //   test: /\.jsx$/,
      //   exclude: /node_modules/,
      //   loader: {
      //     loader: 'babel-loader',
      //     options: babelOptions('@babel/preset-react')
      //   }
      // }
    ]
  }
}
