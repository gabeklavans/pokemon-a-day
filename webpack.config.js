// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WorkboxWebpackPlugin = require("workbox-webpack-plugin");
const { ProvidePlugin } = require("webpack");
const WebpackPwaManifest = require("webpack-pwa-manifest");
const FaviconsWebpackPlugin = require("favicons-webpack-plugin");

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
		new FaviconsWebpackPlugin(
			path.resolve(__dirname, "src/assets/pokeball.png")
		),
		new ProvidePlugin({
			$: "jquery",
			jQuery: "jquery",
		}),
		new WorkboxWebpackPlugin.GenerateSW({
			clientsClaim: true,
			skipWaiting: true,
			runtimeCaching: [
				{
					handler: "StaleWhileRevalidate",
					urlPattern: new RegExp(
						"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork"
					),
					options: {
						cacheName: "sprites",
						expiration: {
							maxEntries: 7,
						},
						cacheableResponse: {
							statuses: [0, 200],
						},
					},
				},
				{
					handler: "StaleWhileRevalidate",
					urlPattern: new RegExp("https://pokeapi.co/api/v2"),
					options: {
						cacheName: "pokeApi",
						expiration: {
							maxEntries: 7 * 3,
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
			short_name: "Pokemon-a-Day",
			start_url: "./",
			orientation: "landscape",
			publicPath: "./",
			background_color: "#6cba48",
			theme_color: "#6cba48",
			icons: [
				{
					src: path.resolve(__dirname, "src/assets/pokeball.png"),
					sizes: [96, 128, 192, 256, 384, 512],
					ios: "default",
				},
				{
					src: path.resolve(__dirname, "src/assets/pokeball.png"),
					size: 1024,
					ios: "startup",
				},
			],
			inject: true,
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
