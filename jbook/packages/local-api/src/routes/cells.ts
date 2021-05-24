import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const intitalCells = [
	{
		content:
			'# JSNote\n\nThis is an interactive coding environment. You can write Javascript, see it executed, and write comprehensive documentation using markdown.\n\n- Click any text cell (including this one) to edit it\n- The code in each code editor is all joined together into one file. If you define a variable in cell #1, you can refer to it in any following cell\n- You can show any React component, string, number, or anything else by calling the  ```show``` function\n  - This is a function built into this environment\n  - Call show multiple times to show multiple values\n- Re-order or delete cells using the buttons on the top right\n- Add new cells by hovering on the divider between each cell\n\nAll of your changes get saved to the file you opened with JSNote with. So if you ran ```npx ghake-jsnote serve test.js```, all of the text and code you write will be saved to the ```test.js``` file.',
		type: 'text',
		id: '90i7h',
	},
	{
		content:
			"import { useState } from 'react';\r\n\r\nconst Counter = () => {\r\n    const [count, setCount] = useState(0);\r\n\r\n    return (\r\n        <div>\r\n            <button onClick={() => setCount(count + 1)}>Click</button>\r\n            <h3>Count: {count}</h3>\r\n        </div>\r\n    );\r\n};\r\n\r\n// Display any variable or React Component by calling 'show'\r\nshow(<Counter/>);",
		type: 'code',
		id: 'zpc82',
	},
	{
		content:
			'const App = () => {\r\n  return (\r\n    <div>\r\n      <h3>App Says Hi!</h3>\r\n      <i>Counter component will be rendered below...</i>\r\n      <hr />\r\n      {/*\r\n        Counter was declared in an earlier cell- we can reference it here\r\n       */}\r\n       <Counter />\r\n    </div>\r\n  );\r\n};\r\n\r\nshow(<App/>);',
		type: 'code',
		id: '7d5nk',
	},
];

interface Cell {
	id: string;
	content: string;
	type: 'text' | 'code';
}

export const createCellsRouter = (filename: string, dir: string) => {
	const router = express.Router();
	const fullPath = path.join(dir, filename);
	const encoding = 'utf-8';

	//json parser for router
	router.use(express.json());

	router.get('/cells', async (req, res) => {
		try {
			// Read the file
			const result = await fs.readFile(fullPath, { encoding: encoding });

			// Parse a list of cells out of it
			// Send list of cells back to browser
			res.send(JSON.parse(result));
		} catch (err) {
			// If read throws an error
			// Inspect the error, see if it says file doesn't exist
			if (err.code === 'ENOENT') {
				await fs.writeFile(fullPath, JSON.stringify(intitalCells), encoding);

				res.send(intitalCells);
			} else {
				throw err;
			}
		}
	});

	router.post('/cells', async (req, res) => {
		// Take the list of cells from the request obj
		// serialize them
		const { cells }: { cells: Cell[] } = req.body;

		// Write cells into the file
		await fs.writeFile(fullPath, JSON.stringify(cells), encoding);

		res.send({ status: 'ok' });
	});

	return router;
};
