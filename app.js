const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs/promises');
const { v4: uuidv4 } = require('uuid');

const booksData = require('./db/books.json');
const booksDataPath = path.join(__dirname, 'db', 'books.json');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public')); //the request for static files (eg 7habits.jpg) must be searched in the public folder

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
	res.json(booksData);
});

/*
//multiple fields with max count of files in value-field
upload.fields([
	{ name: 'cover', maxCount: 1 },
	{ name: 'subCover', maxCount: 2 },
]); 

// one key-field with multiple files in value-field => ('field name', amount of files)
upload.array('cover', 8); 
*/

app.post('/api/books', upload.single('cover'), async (req, res) => {
	const { path: tempPath, filename } = req.file;
	const resultPath = path.join(__dirname, 'public', 'books', filename);
	const coverPublicPath = path.join('books', filename); //don't use a public folder in the path because express middleware only looks for static files in the public folder

	// console.log('coverPublicPath :>> ', coverPublicPath);

	await fs.rename(tempPath, resultPath);

	const newBook = {
		id: uuidv4(),
		...req.body,
		coverPublicPath,
	};

	booksData.push(newBook);

	await fs.writeFile(booksDataPath, JSON.stringify(booksData, null, 2));

	res.status(201).json(newBook);
});

app.listen(3000, console.log('Server is running'));
