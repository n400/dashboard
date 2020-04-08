# DEPRECATED

This repository has been archived and is no longer being maintained. 

[Sign up for FaunaDB in the cloud](https://dashboard.fauna.com/) to try the new dashboard.

## To Run in Development

First get a Fauna secret that you want to use as your root. It's better if this
is an admin secret but we support any type of secret by using capability detection.

Clone this repo, install the dependencies, and launch the development server.

```sh
git clone https://github.com/fauna/dashboard
cd dashboard
npm install
npm start
```

Alternatively, Docker may be used to run the server.

```sh
git clone https://github.com/fauna/dashboard
cd dashboard
make run
```

Visit http://localhost:3000/ and your app will be available. Enter the Fauna key
secret and start browsing your data.

### Running tests

On macOS you'll need to install watchman using `brew install watchman`.

Then you can run the tests with `npm run test` (for Docker, use `make test`).

## Build for production

The console is packaged for bundling with the Fauna JAR using `npm run build`.

## Toolchain info

This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

Tooling guide [here](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md).
