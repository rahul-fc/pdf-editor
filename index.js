
var express = require('express');
const fs = require('fs');
const {
  PDFDocumentFactory,
  PDFDocumentWriter,
  drawText,
  drawLinesOfText,
  drawImage,
  drawRectangle,
} = require('pdf-lib');

var app =  express();


app.get('/editPdf',function(req,res){

const assets = {
  ubuntuFontBytes: fs.readFileSync('./assets/ubuntu-fonts/Ubuntu-R.ttf'),
  marioPngBytes: fs.readFileSync('./assets/chartrequest-logo.png'),
  taxVoucherPdfBytes: fs.readFileSync('./assets/sample-CV.pdf'),
};

const pdfDoc = PDFDocumentFactory.load(assets.taxVoucherPdfBytes);

const COURIER_FONT = 'Courier';
const UBUNTU_FONT = 'Ubuntu';
const MARIO_PNG = 'MarioPng';

const [courierFontRef] = pdfDoc.embedStandardFont('Courier');
const [ubuntuFontRef] = pdfDoc.embedFont(assets.ubuntuFontBytes);

// we embed the PNG image we read in.
const [marioPngRef, marioPngDims] = pdfDoc.embedPNG(assets.marioPngBytes);

/* ====================== 3. Modify Existing Page =========================== */

const pages = pdfDoc.getPages();

// Now we'll add the Courier font dictionary and Mario PNG image object that we
// embedded into the document earlier.
const existingPage = pages[0]
  .addFontDictionary(COURIER_FONT, courierFontRef)
  .addImageObject(MARIO_PNG, marioPngRef);


const MARIO_PNG_WIDTH = marioPngDims.width * 0.15;
const MARIO_PNG_HEIGHT = marioPngDims.height * 0.15;


  const newContentStream = pdfDoc.createContentStream(
  drawImage(MARIO_PNG, {
    x: 400,
    y: 750,
    width: MARIO_PNG_WIDTH,
    height: MARIO_PNG_HEIGHT,
  }),
  drawRectangle({
    x: 500,
    y:382,
    width: 100,
    height: 20,
    colorRgb:[0,0,0],
  }),
  // Now let's draw 2 lines of red Courier text near the bottom of the page.
  drawLinesOfText(['Rahul is testing the insertion'], {
    x: 50,
    y: 100,
    font: COURIER_FONT,
    size: 25,
    colorRgb: [1, 0, 0],
  }),
);


existingPage.addContentStreams(pdfDoc.register(newContentStream));

/* ================= 4. Setup and Create New First Page ===================== */
const page1 = pdfDoc
  .createPage([600, 250])
  .addFontDictionary(UBUNTU_FONT, ubuntuFontRef);

const PURPLE = [119 / 255, 41 / 255, 83 / 255];
const ORANGE = [224 / 255, 90 / 255, 43 / 255];
const BLACK = [ 0 / 255, 0 / 255, 0 / 255];

const contentStream1 = pdfDoc.createContentStream(
  drawRectangle({
    width: 600,
    height: 250,
    colorRgb: PURPLE,
  }),
  drawLinesOfText(
    ['We are inserting this text dynamically'],
    {
      x: 30,
      y: 130,
      font: UBUNTU_FONT,
      size: 25,
      colorRgb: ORANGE,
    },
  ),
);

page1.addContentStreams(pdfDoc.register(contentStream1));

/* ================= 5. Setup and Create New Third Page ===================== */
const page3 = pdfDoc
  .createPage([600, 250])
  .addFontDictionary(UBUNTU_FONT, ubuntuFontRef);

const contentStream3 = pdfDoc.createContentStream(
  drawRectangle({
    width: 600,
    height: 250,
    colorRgb: ORANGE,
  }),
  drawLinesOfText(
    ['We created a page dynamically', 'and appended with the main page'],
    {
      x: 30,
      y: 130,
      font: UBUNTU_FONT,
      size: 25,
      colorRgb: PURPLE,
    },
  ),
);

page3.addContentStreams(pdfDoc.register(contentStream3));

/* =========== 6. Insert and Add Pages and Convert PDF to Bytes ============= */

pdfDoc.insertPage(0, page1).addPage(page3);

const pdfBytes = PDFDocumentWriter.saveToBytes(pdfDoc);

/* ========================== 7. Write PDF to File ========================== */

const filePath = `${__dirname}/modified.pdf`;
fs.writeFileSync(filePath, pdfBytes);
console.log(`PDF file written to: ${filePath}`);


});


// app.get('/uploadPdf',function(req,res){
//   res.sendFile(__dirname + './upload.html');
//   res.end();
// });

// app.get('/viewPdf', function(req, res){
//  // res.writeHead(200, {'Content-Type': 'application/pdf'});

//   res.end();
      
//   /** here we will place the pdf building code **/
      
//   //res.end();
// });
app.use('/viewOriginalPdf', express.static(__dirname + '/assets/sample-CV.pdf'));
app.use('/viewPdf', express.static(__dirname + '/modified.pdf'));
app.listen(4000,function(){
  console.log("Listening on port 4000");
});
