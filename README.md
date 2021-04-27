# JavaScript Notebook: React with TypeScript

Building a javascript notebook (think Jupyter notebook) with React and TypeScript

## Inpsired By

1. codepen.io
1. babeljs.io
1. Jupyter

## Transpiling Java Code

The above sites use live transpiling of code. How do we do that in this app?

From our inspirations above..

1. codepen
   - Uses a backend server to transpile code
   - Running babel
   - Sends js as string in request
   - Gets transpiled js back in response
1. babeljs
   - Uses remote transpiling
   - 'In-Browser' Transpiler

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
