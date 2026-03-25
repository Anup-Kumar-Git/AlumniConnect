const fs = require('fs');
const PDFDocument = require('pdfkit');
const doc = new PDFDocument();

const outputPath = 'C:/Users/ASUS/Desktop/Alumni/dummy_resume.pdf';
doc.pipe(fs.createWriteStream(outputPath));

doc.fontSize(25).text('John Doe - Software Engineer', 100, 100);
doc.moveDown();
doc.fontSize(14).text('Skills: React, Node.js, Python, AWS, Cloud Computing, Microservices, Data Science, MongoDB');
doc.moveDown();
doc.fontSize(12).text('Experience: 5 years of industry experience building scalable web applications. Passionate about machine learning and system design.');
doc.end();

console.log('Successfully generated ' + outputPath);
