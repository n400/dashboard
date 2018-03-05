# Developer Dashboard for FaunaDB

This dashboard should eventually provide access to the entire Fauna API as accessible to cloud users and developers at on-premise sites, but at first it will be narrowly focused on a few screens and use cases. It will have a companion UI that is accessible to our cloud ops team, and to on-premise customer ops teams. Both will be shipped as part of the Fauna JAR. The Dev dashboard is where you land when you first join cloud.

[Sign up for FaunaDB in the cloud](https://fauna.com/serverless-cloud-sign-up) to try this dashboard directly.

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
