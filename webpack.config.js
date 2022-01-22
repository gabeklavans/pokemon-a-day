// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const WorkboxWebpackPlugin = require("workbox-webpack-plugin");
const { ProvidePlugin } = require("webpack");

const isProduction = process.env.NODE_ENV == "production";

const stylesHandler = "style-loader";

const config = {
	entry: "./src/index.ts",
	watch: true,
	output: {
		path: path.resolve(__dirname, "dist"),
		clean: true,
	},
	devServer: {
		open: true,
		static: {
			directory: path.join(__dirname, "dist"),
		},
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
			mode: 'development'
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
