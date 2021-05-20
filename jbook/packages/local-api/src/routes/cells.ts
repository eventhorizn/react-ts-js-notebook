import express from 'express';
import fs from 'fs/promises';
import path from 'path';

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
			// Send list of cells back to browser*uu
			res.send(JSON.parse(result));
		} catch (err) {
			// If read throws an error
			// Inspect the error, see if it says file doesn't exist
			if (err.code === 'ENOENT') {
				await fs.writeFile(fullPath, '[]', encoding);

				res.send([]);
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
