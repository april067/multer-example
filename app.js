const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const books = require('./db/books.json');

const app = express();

app.use(cors());
app.use(express.json());

const tempDir = path.join(__dirname, 'temp');

const multerConfig = multer.diskStorage({
	destination: tempDir,
	filename: (req, file, callback) => {
		callback(null, file.originalname);
	},
});

const upload = multer({
	storage: multerConfig,
});

app.get('/api/books', (_, res) => {
	res.json(books);
});

app.post('/api/books', upload.single('cover'), (req, res) => {
	console.log(req.body);
	console.log(req.file);
});

app.listen(3000, console.log('Server is running'));
