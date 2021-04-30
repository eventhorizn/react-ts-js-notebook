# JavaScript Notebook: React with TypeScript

Building a javascript notebook (think Jupyter notebook) with React and TypeScript

## Inpsired By

1. codepen.io
1. babeljs.io
1. Jupyter

## Transpiling Java Code

The above sites use live transpiling of code. How do we do that in this app?

1. Backend API Server
   ![](images/trans-server.png)
1. In-Browser Transpiler
   - In React App
     ![](images/trans-local.png)

From our inspirations above..

1. codepen
   - Uses a backend server to transpile code
   - Running babel
   - Sends js as string in request
   - Gets transpiled js back in response
   - API Server
1. babeljs
   - Uses remote transpiling
   - 'In-Browser' Transpiler
   - In React App

## Javascript Modules

A JS file that makes some values available to other files and/or consumes values from other files

Why do we care besides using them in the app?

Our app will allow a user to import js and css files into a code cell

### JS Module Systems

1. AMD
   ```js
   define(['dep'], (dep) => {});
   ```
1. common js
   ```js
   require();
   module.exports;
   ```
1. ES Modules
   ```js
   import a from 'a';
   export default 123;
   ```

- Transpiliers will sometimes take one version and convert to another!
- A bundler (webpack) will take all the individual files and combine into a single file

## Bundling JS Code

![](images/bundler.png)

### Options

1. Backend API Server
   - [NPM Install Plugin](https://webpack.js.org/plugins/npm-install-webpack-plugin/)
   - Weakness is api server will save a ton of dependencies locally
     ![](images/bundle-server.png)
1. Backend API Server with Custom plugin
   - Makes request to npm registry
   - Bundle code instead of save dependency
     ![](images/bundle-server-npm.png)
1. Do everything inside the React app
   - Instead of API Server
     ![](images/bundle-local-npm.png)

## Our Application Approach

We are doing the local, 'in-app', 'in-browser' approach

1. Significantly faster than server approach
1. Big issue, webpack doesn't work in the browser
1. Instead of using webpack and babel (work great locally)
   - We are going to use [ESBuild](https://github.com/evanw/esbuild)
1. ESBuild can transpile + bundle all in the browser
   - Much faster than webpack (much)

### Transpiler

![](images/trans-local.png)

1. ESBuild works out of the box for transpiling
   - 'transform' call

### Bundler

![](images/bundle-local-npm.png)

1. Not using webpack
1. Using [ESBuild](https://github.com/evanw/esbuild)
1. ESBuild usually looks on the local filesystem for files to bundle

- Running in the browser...we don't have a local filesystem
- Instead we are pointing ESBuild at a url where the file exists
- NPM registry will be the url...kind of

1. NPM by itself won't work
   - We will use a service called Unpkg
   - NPM registry is configured to block any request not at a specific url
   - Throws CORS error
1. [UNPKG](https://unpkg.com/)
   - Global content delivery network for everything on NPM
1. So, for ESBuild to work, bundling on the web...we have to define our own version of it's build step (where the bundling occurs)
   ```js
   const result = await ref.current.build({
   	entryPoints: ['index.js'],
   	bundle: true,
   	write: false,
   	plugins: [unpkgPathPlugin()],
   });
   ```
   - Define a 'plugin' and override functions that default ESBuild would use
   - 'onResolve' and 'onLoad': Work together
   - 'onResolve' returns an object that is fed to 'onLoad'
   - filter args for onResolve and filter, namespace args are key

## Cache Layer

We send lots of requests to unpkg, especially if an includes has a lot of it's own includes

We are going to develop a caching layer to store some of these files to limit the number of requests

1. [localforage](https://www.npmjs.com/package/localforage)
   - API over the browser's indexedDB
   - kvp with the path as the key and the loaded package as the value

## Loading css Files

1. Need to have a css loader
1. Issue w/ esbuild on the web
   - When building css and js, it'll generate 2 files
     - But we don't have a local file system
   - It only outputs js on the web, so we need a way to include unpackaged css into jss

![](images/esbuild-js-css.png)

1. Instead, we will write js to take the content of the css and put it in the head tag
   - Something of a hack
