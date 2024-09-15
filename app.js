const express = require('express')
const multer = require('multer')
const fs = require('fs')
const path = require('path')
const { PDFDocument } = require('pdf-lib')
const cors = require('cors')

const app = express()
const upload = multer({ dest: 'uploads/' })

// CORS
const corsOptions = {
    origin: 'https://example.com', // Erlaubt nur Anfragen von example.com
    optionsSuccessStatus: 200
}
app.use(cors(corsOptions))

app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public'))) // Serve static files from the 'public' directory
app.disable('x-powered-by')

app.get('/', function (_, res) {
	res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.post('/merge', upload.array('files'), async function (req, res) {
	const pdfs = req.files
	let pdfDoc = await PDFDocument.create()

	for (let i = 0; i < pdfs.length; i++) {
		let filePath = pdfs[i].path
		let fileData = fs.readFileSync(filePath)
		let uint8Array = await PDFDocument.load(fileData)
		const copiedPages = await pdfDoc.copyPages(uint8Array, uint8Array.getPageIndices())
		copiedPages.forEach((page) => pdfDoc.addPage(page))
		fs.unlinkSync(filePath)
	}

	const finalFilename = `./temp/merged_${Date.now()}.pdf`
	fs.writeFileSync(finalFilename, await pdfDoc.save())
	res.download(finalFilename, (err) => {
		if (err) console.log(err)
		fs.unlinkSync(finalFilename)
	})
})

app.listen(3000, () => {
	console.log('Server started on http://localhost:3000')
})