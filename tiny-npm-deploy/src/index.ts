
#!/usr/bin/env ts-node
import express from 'express';

const app = express();

app.get('/', (req, res) => {
	res.send('hi there');
});

app.listen(3005, () => {
	console.log('Listening on 3005');
});
