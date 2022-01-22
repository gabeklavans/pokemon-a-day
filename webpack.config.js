// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WorkboxWebpackPlugin = require("workbox-webpack-plugin");
const { ProvidePlugin } = require("webpack");
const WebpackPwaManifest = require("webpack-pwa-manifest");

const isProduction = process.env.NODE_ENV == "production";

const stylesHandler = "style-loader";

const config = {
	entry: "./src/index.ts",
	output: {
		path: path.resolve(__dirname, "docs"),
		clean: true,
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: "Pokemon-a-Day Calendar",
			template: "index.html",
		}),
		new ProvidePlugin({
			$: "jquery",
			jQuery: "jquery",
		}),
		new WorkboxWebpackPlugin.GenerateSW({
			clientsClaim: true,
			skipWaiting: true,
			mode: "development",
			runtimeCaching: [
				{
					handler: "CacheFirst",
					urlPattern: new RegExp(
						"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork"
					),
					options: {
						cacheName: "riolu",
						expiration: {
							maxEntries: 50,
						},
						cacheableResponse: {
							statuses: [0, 200],
						},
					},
				},
			],
		}),
		new WebpackPwaManifest({
			name: "Pokemon-a-Day Calendar",
			short_name: "pkmn-a-day",
			start_url: "./",
			orientation: "landscape",
			publicPath: "./",
		}),
	],
	module: {
		rules: [
			{
				test: /\.(ts|tsx)$/i,
				loader: "ts-loader",
				exclude: ["/node_modules/"],
			},
			{
				test: /\.css$/i,
				use: [stylesHandler, "css-loader"],
			},
			{
				test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
				type: "asset/resource",
			},

			// Add your rules for custom modules here
			// Learn more about loaders from https://webpack.js.org/loaders/
		],
	},
	resolve: {
		extensions: [".tsx", ".ts", ".js"],
	},
};

module.exports = () => {
	if (isProduction) {
		config.mode = "production";
	} else {
		config.mode = "development";
	}
	return config;
};
