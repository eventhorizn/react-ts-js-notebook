# Getting Started

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
