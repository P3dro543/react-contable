const fs = require('fs');
const pdf = require('pdf-parse');

async function readPdf() {
    let dataBuffer = fs.readFileSync('c:/Sitios final/Proyecto Sistema Contable V2.pdf');
    try {
        const data = await pdf(dataBuffer);
        console.log("--- TEXTO EXTRAIDO ---");
        console.log(data.text);
        console.log("--- FIN ---");
    } catch (error) {
        console.log("PDF ERROR:", error.message);
    }
}

readPdf();
