# JavaScript Notebook: React with TypeScript

Building a javascript notebook (think Jupyter notebook) with React and TypeScript

# Getting Started

[NPM Link](https://www.npmjs.com/package/ghake-jsnote)

## Running Published App

1. Install globally
   ```bash
   npm install -g ghake-jsnote
   ```
   - Preferred way
   ```bash
   ghake-jsnote serve
   ```
1. Or use npx
   ```bash
   npx ghake-jsnote serve
   ```
1. A notebook will be either created or opened depending on where you launched the app for

### CLI Options

The main command is `serve`

If we just run the main command, we will either open or create a file called `notebook.js`

```
ghake-jsnote serve
```

1. Filename
   ```bash
   ghake-jsnote serve test.js
   ```
   - Make sure you use a .js file
   - It will create a file in the directory you are in
1. If you already have a file created it will open it
   - You can designate the folder in the serve command
   - Folder/file **must** exist
1. Port
   ```
   ghake-jsnote serve --port 4008
   ```
   ```
   ghake-jsnote serve -p 4008
   ```
1. Combination
   - You can combine the filename and port in any order
   ```
   ghake-jsnote serve test.js --port 4008
   ```
   ```
   ghake-jsnote serve -p 4008 test/test.js
   ```

## Running Locally

1. Clone the repo
1. We are using lerna to launce multiple node projects at once
   - Navigate to jbook folder where lerna.json is
   - Run `lerna bootstrap` to install packages for all node apps through lerna
1. Stay in same folder
   - Run `npm run start` which runs a script, but really runs `lerna run start --parallel`
   - Will start all node projects in the solution
1. You'll need to start the cli manually from the dist folder (index.js)
   - It's annoying since you'll have to restart the cli if you do any changes
   - Navigate to jbook/packages/cli/dist
   - Run `node index.js serve` to launch the cli
1. This will launch the app on port 4005 so you can navigate to
   - localhost:4005

## Our App

1. We want to run something like 'jbook serve'
1. This should start a server on localhost:4005
1. User will write code into an editor
   - js or md in a cell
1. We bundle in the browser
1. We execute the users code in an iframe

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

## Code Execution

### Considerations

These are all big issues we have to solve

1. User-provided code might throw errors and cause our program to crash
   ```js
   console.loooog('Error');
   ```
1. User-provided code might mutate the DOM, causing our program to crash
   ```js
   document.body.innerHTML = '';
   ```
1. A user might accidentally run code provided by another malicious user
1. Infinite loops (or really big loops)
   - Future work to fix

What's the solution? **IFrames**

### IFrames

1. Used to embed one element (html element) inside another
   ```html
   <iframe src="/test.html" title="test"></iframe>
   ```
1. Allows you to run js in separate contexts
   - Separate execution contexts
1. You can connect the parent and child contexts to share info
   - In child element, reference 'parent'
   - In parent, reference:
   ```js
   document.querySelector('iframe').contentWindow;
   ```
1. You can also dissalow communication b/t the two
   ![](images/iframe-direct-access.png)
1. Our considerations above are solved by using iframes
   - It crashes the iframe context, not the app's
1. We are using a few properties in IFrames
   - sandbox="allow-scripts"
     - This keeps our parent and children from being able to access each other
     - Obviously can also run scripts w/i the iframe
   - srcDoc={html}
     - Allows us to generate source for the iframe w/o sending a request
     - Much faster
     - Drawback, can't use localStorage on IFrame
1. To allow using localStorage
   - You have to host the iframe on a separate port
   - Lots more work, but a more 'complete' task
1. We can't communicate directly b/t the parent and child, but we can do something...
   - Add Event Listeners!
   - Have an event listener on the child (code changed) and have parent send the events

This completes the backbone of the app

# Code Editor

- Right now we are writing code in a textarea
- We want something like a code editor
  - Line numbers
  - Linter
  - Intellisense?

## Options

1. CodeMirror
   - Super easy to use
   - Doesn't have as many out-of-the-box features
1. Ace Editor
   - Moderately easy to use
   - Widely used
1. [Monaco Editor](https://microsoft.github.io/monaco-editor/) (What this app uses)
   - Same editor VS Code uses
   - Hardest to setup
     - React component makes it easy though
   - Gives an almost-perfect editing experience immediately

## Monaco Editor as React Component

1. [Monaco Editor/React](https://www.npmjs.com/package/@monaco-editor/react)
   - React component around the real Monaco Editor
   - Three different 'Editors' in the props of the component
   - We are using the default editor which is the uncontrolled editor
1. Installation
   ```bash
   npm install --save-exact @monaco-editor/react@3.7.5
   npm install --save-exact monaco-editor
   ```
   - First is the actual component
   - Second allows us to see type defs for settings
1. Add [Prettier](https://www.npmjs.com/package/prettier) to our code editor
   ```bash
   npm install prettier @types/prettier
   ```

## App Styling

1. Using [bulmaswatch](https://www.npmjs.com/package/bulmaswatch)
   ```
   npm install bulmaswatch
   ```
1. [Bulma](https://www.npmjs.com/package/bulma), but with some themes

### Syntax Highlighting in Monaco (JSX)

We will be using packages that aren't super well tested, so potential for breaking

1. monaco-jsx-highlighter
   - Does the actual highlighting, but doesn't know how to get the jsx code
1. jscodeshift
   - Will get jsx code to the highlighter

```bash
npm install --save-exact monaco-jsx-highlighter@0.0.15 jscodeshift@0.11.0 @types/jscodeshift@0.7.2
```

### Resizing Components

1. Vertical spot between code editor and previe
1. Horizontal spot between code cells
1. [React Resizable](https://www.npmjs.com/package/react-resizable)
   ```bash
   npm install --save-exact react-resizable@1.11.1 @types/react-resizable@1.7.2
   ```
1. Resizing w/ an IFrame
   - So the issue w/ IFrames is that it has a different context than the rest of the app
   - So the resizing would 'freeze' if you hovered over the iframe
   - The way to fix is to, when we are hovering over the iframe, to 'draw' a div element
   - The div element is in the app's context
   - Look at the preview.tsx and preview.css files to see how this is implemented

## Markdown Editor

We are using a pre-built react component

1. [React MD Editor](https://www.npmjs.com/package/react-md-editor)
1. Installation
   ```bash
   npm install --save-exact @uiw/react-md-editor@2.1.1
   ```

# Redux

![](images/redux-design.png)

1. Installation
   ```bash
   npm install --save-exact @types/react-redux@7.1.15 react-redux@7.2.2 redux@4.0.5 redux-thunk@2.3.0 axios@0.21.1
   ```

## Immer: Simple State Update

1. [Immer](https://immerjs.github.io/immer/)
   - Allows you to do immutable state updates in a simple way
1. Installation
   ```bash
   npm install immer
   ```

### Without Immer

```js
const { id, content } = action.payload;

return {
	...state,
	data: {
		...state.data,
		[id]: {
			...state.data[id],
			content,
		},
	},
};
```

### With Immer

```js
const { id, content } = action.payload;

state.data[id].content = content;
```

## Connecting Bundles with Redux

1. Bundle state is technically derived from cell state
   - Which is usually where a 'selector' comes in
   - But we have async functions in bundling
1. Should we use a bundles reducer?
   - Or should we use a selector?
     ![](images/bundle-selector.png)
1. We want to avoid using selectors w/ any async functions
   - Use w/ synchronous calcs
   - selectors do caching type calcs for optimization, which can have weird results w/ async code
1. So, we're going to use a bundles reducer
   ![](images/bundler-reducer.png)

## Cumulative Code Execution

![](images/cumulative-bundle.png)

1. Allow all subsuquent cells to reference any previous code cell
   - const color = 'red';
     - Cell 1
   - console.log(color);
     - Cell 2
1. 'Derived' State
   - Inside 'CodeCell', add selector
   - Get code from current cell, and all prior cells
1. We're adding a 'show' function so that we don't have to reference the index of to show anything
   ```js
   show(console.log('hello'));
   ```
   - console.log will actually output to the preview
   - Issue is that subsequent previews will show conent from previous cells
   - We are going to redefine the show function so that subsequent cells get an empty show
     - Current cell gets the real show function

# CLI, Launching App, and Local Storage

![](images/app-infrastructure.png)

1. We want to save and load a user's workbook
   - Single file to user's hardrive
   - Single file so user can share
   - File works independently from application
1. How will we launch the app?
   ```cmd
   npx jbook serve
   ```
   - Open browser and navigate to specific port
1. Node API will be an express server

![](images/app-inf-detail.png)

1. We could go an easy route and use React scripts to host all the different pieces
1. We are instead going to make these separate apps
   - Learn more, and future proof app
1. We are going to create npm packages for each layer in the above stack
   - jbook
   - @jbook/local-api
   - @jbook/public-api
   - @jbook/local-client
1. This allows us to use one part in a different piece
   - react app will use express api
   - express api will use cli
1. Allows us to version pieces and extract common logic into packages
1. We are not building the Public Express API
1. So, we will have multiple packages in our project...how to manage?

## Lerna

[Documentation](https://github.com/lerna/lerna)

1. Tool for managing a multi-package project
1. Makes it easy to consume updates b/t our different modules on our local machine
   - Think about making an update to a package then consuming that update
   - Usually you push out the updated package
   - Conusmer then updates which version it's pointed to
1. Lerna alternatives
   - Yarn workspaces
   - NPM workspaces
   - Bolt
   - Luigi
1. Installation
   ```bash
   npm install -g --save-exact lerna@3.22.1
   ```
1. Lerna Project Directory
   ![](images/lerna-org.png)
1. When using Lerna, we do not manually NPM install modules
   ```bash
   lerna add express --scope=cli
   ```
   - Be careful, base lerna add will add package to each local module if you don't include scope

## CLI

![](images/cli-commands.png)

1. Using [Commander](https://www.npmjs.com/package/commander)

   ```ts
   import { Command } from 'commander';

   export const serveCommand = new Command()
   	.command('serve [filename]')
   	.description('Open a file for editing')
   	.option('-p, --port <number>', 'port to run server on', '4005')
   	.action(() => {
   		console.log('Getting ready to serve a file');
   	});
   ```

   - [] denotes optional parameters
   - <> denotes if they provide the port option, they must provide a n umber

## API

1. Are we actively developing our app on the local machine?
   - Use proxy to local react app dev server
   ```ts
   app.use(
   	createProxyMiddleware({
   		target: 'http://localhost:3000',
   		ws: true,
   		logLevel: 'silent',
   	})
   );
   ```
1. Are we running our app on a user's machine?

   - Serve up built files from build dir

   ```ts
   const packagePath = require.resolve('local-client/build/index.html');

   app.use(express.static(path.dirname(packagePath)));
   ```

## Data Persistence

### Fetching Cells

![](images/fetching-cells.png)

1. We are saving our cells locally as a json document
   ```json
   [
   	{ "content": "# Test", "type": "text", "id": "vqj0q" },
   	{
   		"content": "const a = 'Test';\r\n\r\nshow(a);",
   		"type": "code",
   		"id": "lfwns"
   	}
   ]
   ```
1. Through cli args we can open a file in a specific location, otherwise (since we launch the cli manually)
   - It will be in the cli/dist folder

# NPM Publishing

![](images/npm-publish.png)

1. Make sure package name is unique (self explanatory)
1. Specify which files should be sent to NPM
   ```json
   "files": [
   	"dist"
   ],
   ```
1. Split dependencies
   - Just make sure you don't include dependencies in the "dependencies" section you don't need
   ```json
   "dependencies": {
   	"@types/express": "^4.17.11",
   	"express": "^4.17.1",
   	"typescript": "^4.2.4"
   }
   ```
   - vs
   ```json
   "dependencies": {
   	"express": "^4.17.1"
   },
   "devDependencies": {
   	"@types/express": "^4.17.11",
   	"typescript": "^4.2.4"
   }
   ```
1. Set package to be publicly available
   - It's public by default, but:
   ```json
   "publishConfig": {
   	"access": "public"
   },
   ```
1. If building a cli/configure file to run
   ```json
   "bin": "dist/index.js",
   ```
   - Add `#!/usr/bin/env node` to index
1. npm publish
   ```cmd
   npm login
   npm publish
   ```
   - Make sure you are in the root dir of the project
1. Publishing the application
   ```cmd
   lerna publish
   ```
1. If you build lerna, but new packages aren't published
   ```cmd
   lerna publish from-package
   ```

# TODO

1. If a cell has an error, all subsequent errors show error
   - Limit just to problem cell
1. Make a small change and republish thru lerna
1. Code editor height is fixed
   - Height should adjust based on code in it
1. Better getting started notes in README
1. Context menu for saving?
   - We save automatically now
1. Can we change the command line to launch jbook?
   ```
   ghake-jsnote serve
   ```
1. Dark theme on render side?
