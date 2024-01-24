import express from 'express'
import multer from 'multer'
import path from 'path'
import { PDFDocument } from 'pdf-lib'
import fs from 'fs'

const __dirname = path.resolve()

const upload = multer({
	dest: 'temp/',
	fileFilter: function (req, file, cb) {
		if (path.extname(file.originalname) !== '.pdf') {
			return cb('Only PDFs are allowed!!!')
		}
		cb(null, true)
	},
})

const app = express()
app.disable('x-powered-by')
app.use(express.static(__dirname))

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html')
})

app.post('/merge', upload.array('files'), async function (req, res) {
	const pdfs = req.files
	let pdfDoc = await PDFDocument.create()

	for (let i = 0; i < pdfs.length; i++) {
		let uint8Array = await PDFDocument.load(fs.readFileSync(pdfs[i].path))
		const copiedPages = await pdfDoc.copyPages(uint8Array, uint8Array.getPageIndices())
		copiedPages.forEach((page) => pdfDoc.addPage(page))
		fs.unlinkSync(pdfs[i].path)
	}
	const concatFilename = pdfs.map((x) => path.parse(x.originalname).name)
	const finalFilename = `./temp/${concatFilename.join('_') + '_' + Date.now()}_merged.pdf`
	fs.writeFileSync(finalFilename, await pdfDoc.save())
	res.download(finalFilename, (err) => {
		if (err) console.log(err)
		fs.unlinkSync(finalFilename)
	})
})

app.listen(3000, function () {
	console.log('Server started on port 3000')
})
