# Node Wrapper for JSignPdf

Programatically add Digital Signatures (PKCS #12 certificates, .p12 or .pdfx) to PDFs.  

Based on [JSignPDF](https://github.com/intoolswetrust/jsignpdf) by [@kwart](https://github.com/kwart/)

> JSignPdf is a Java application which adds digital signatures to PDF documents. The application uses the OpenPDF library for PDF manipulations.
> 
> Project home-page: [jsignpdf.sourceforge.net](http://jsignpdf.sourceforge.net/)

This node wrapper uses child_process.exec and temp files to asynchronously run java app JSignPDF in non-interactive mode.

Requires Java.

### Quick Usage

```ts
import signPDF from 'jsignpdf'

const signed : Buffer = await signPDF(
  pdf: Buffer,        // your existing PDF
  p12: Buffer,        // your signing p12 certificate 
  passhrase: string,  // passhrase to your certificate
  timeout: number     // process timeout, default 10.000 ms
)
// => Signed PDF as a Buffer
```
