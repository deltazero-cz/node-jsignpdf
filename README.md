# Node Wrapper for JSignPdf

Programatically add Digital Signatures (p12 certificates) to PDFs.  

Based on [JSignPDF](https://github.com/intoolswetrust/jsignpdf) by [@kwart](https://github.com/kwart/)

> JSignPdf is a Java application which adds digital signatures to PDF documents. The application uses the OpenPDF library for PDF manipulations.
> 
> Project home-page: [jsignpdf.sourceforge.net](http://jsignpdf.sourceforge.net/)

This node wrapper uses child_process.exec and temp files to run java app JSignPDF in non-interactive mode.
Returns a Promise&lt;Buffer&gt;

Required Java

### Quick Usage

```ts
import signPDF from 'jsignpdf'

const signed : Buffer = await signPDF(
  pdf: Buffer,        // your existing PDF
  p12: Buffer,        // your signing p12 certificate 
  passhrase: string   // passhrase to your certificate
)
// => Signed PDF as a Buffer
```
