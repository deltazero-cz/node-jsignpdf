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
  pdf : Buffer,         // your existing PDF
  p12 : Buffer,         // your signing p12 certificate 
  pass ?: string,       // passhrase to your certificate (optional)
  options ?: { ... }    // see options
)
// => Signed PDF as a Buffer
```

### Docs 
```js
/**
 * @param {Buffer} pdf existing PDF to Sign
 * @param {Buffer} p12 signature PKCS #12 certificate
 * @param {string} [pass] signature certificate passphrase (optional)
 * @param {Object} [options] options
 * @param {string} [options.reason] reason of signature, empty by default
 * @param {string} [options.location] location of signature, empty by default
 * @param {string} [options.location2] location additional text, empty by default
 * @param {string} [options.location4] location additional text, empty by default
 * @param {string} [options.contact] signer's contact, empty by default
 * @param {string} [options.appendSignature] append signature to existing signatures, default false
 * @param {string} [options.level] level of certification, default: NOT_CERTIFIED.
 *    Available options: NOT_CERTIFIED, CERTIFIED_NO_CHANGES_ALLOWED, CERTIFIED_FORM_FILLING, CERTIFIED_FORM_FILLING_AND_ANNOTATIONS
 * @param {string} [options.keyType] certificate key type, default: PKCS12
 * @param {string} [options.hashAlgorithm] hashing algorithm for the signature, SHA1
 *    Available options: SHA1, SHA256, SHA384, SHA512, RIPEMD160
 * @param {string} [options.tsa] URL of timestamping server, i.e. http://tsa.izenpe.com (default null)
 * @param {string} [options.tsaHashAlgorithm] hashing algorithm for the timestamp, SHA1
 *    Available options: SHA1, SHA256, SHA384, SHA512
 * @param {boolean} [options.crl] enable CRL certificate validation, default false
 * @param {boolean} [options.crl] enable CRL certificate validation, default false
 * @param {boolean} [options.ocsp] enable OCSP certificate validation, default false
 * @param {string} [options.ocspResponder] override URL of OCSP responder (default null)
 * @param {boolean} [options.visible] make signature visible, default false
 * @param {number} [options.llx] lower left X postion for visible signature (0 - 100), default 0
 * @param {number} [options.lly] lower left Y postion for visible signature (0 - 100), default 0
 * @param {number} [options.urx] upper right X postion for visible signature (0 - 100), default 100
 * @param {number} [options.ury] upper right Y postion for visible signature (0 - 100), default 100
 * @param {number} [options.fontSize] font size for visible signature, default: 10
 * @param {number} [options.pageNumber] page number for visible signature, default: 1
 * @param {string} [options.renderMode] render mode for visible signature, default: DESCRIPTION_ONLY
 *    Available options: DESCRIPTION_ONLY, GRAPHIC_AND_DESCRIPTION, SIGNAME_AND_DESCRIPTION
 * @param {number} [options.timeout] timeout of java process, default 10.000 ms
 * @return {Promise<Buffer>} Signed PDF
 */
```
