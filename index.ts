import { tmpdir } from 'os'
import { writeFile, readFile, unlink } from 'fs/promises'
import { exec } from 'child_process'
import { resolve as resolvePath } from 'path'

/**
 * Asynchronously Sign PDF with PKCS #12 certificate
 *
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

export type PDFSigningOptions = {
  reason ?: string
  location ?: string
  location2 ?: string
  location4 ?: string
  contact ?: string
  appendSignature ?: boolean
  level ?: 'NOT_CERTIFIED'|'CERTIFIED_NO_CHANGES_ALLOWED'|'CERTIFIED_FORM_FILLING'|'CERTIFIED_FORM_FILLING_AND_ANNOTATIONS'
  keyType ?: string
  hashAlgorithm ?: 'SHA1'|'SHA256'|'SHA384'|'SHA512'|'RIPEMD160'
  tsa ?: string,
  crl ?: boolean
  ocsp ?: boolean
  ocspResponder ?: string
  visible ?: boolean
  llx ?: number,
  lly ?: number,
  urx ?: number,
  ury ?: number,
  fontSize ?: number
  renderMode ?: 'DESCRIPTION_ONLY'|'GRAPHIC_AND_DESCRIPTION'|'SIGNAME_AND_DESCRIPTION'
  pageNumber ?: number
  timeout ?: number
}

export default async function signPDF(pdf: Buffer, p12: Buffer, pass?: string, options ?: PDFSigningOptions) : Promise<Buffer> {
  const dir = tmpdir(),
        uniq = `node-jsignpdf-${new Date().getTime()}`,
        infile = `${dir}/${uniq}.pdf`,
        outfile = infile.replace(/\.pdf$/, '_signed.pdf'),
        certfile = `${dir}/${uniq}.p12`,
        timeout = options?.timeout || 10000

  await writeFile(certfile, p12)
  await writeFile(infile, pdf)

  return new Promise((resolve, reject) => {
    const command = [
        `java -jar JSignPdf.jar`,
        `--keystore-type ${options?.keyType || 'PKCS12'}`,
        `--keystore-file "${certfile}"`,
        pass && `--keystore-password "${pass}"`,
        options?.appendSignature && `--append`,
        options?.reason && `--reason "${options?.reason}"`,
        options?.contact && `--contact "${options?.contact}"`,
        options?.location && `--location "${options?.location}"`,
        options?.location2 && `--l2-text "${options?.location2}"`,
        options?.location4 && `--l4-text "${options?.location4}"`,
        options?.level && `--certification-level ${options?.level}`,
        options?.hashAlgorithm  && `--hash-algorithm ${options?.hashAlgorithm}`,
        options?.tsa  && `--tsa-server-url "${options?.tsa}"`,
        options?.crl && `--crl`,
        options?.ocsp && `--ocsp`,
        options?.ocspResponder  && `--ocsp-server-url "${options?.ocspResponder}"`,
        options?.visible && `--visible-signature `,
        options?.llx && `-llx ${options?.llx}`,
        options?.lly && `-lly ${options?.lly}`,
        options?.urx && `-urx ${options?.urx}`,
        options?.ury && `-ury ${options?.ury}`,
        options?.fontSize && `--font-size ${options?.fontSize}`,
        options?.renderMode && `--render-mode ${options?.renderMode}`,
        options?.pageNumber && `--page ${options?.pageNumber}`,
        `--out-directory "${dir}"`,
        `"${infile}"`
    ].filter(r => !!r)
    // console.warn(command); throw 'STOP'

    exec(command.join(' '), {
      cwd: resolvePath(__dirname.replace(/\/dist$/, ''), 'lib/jsignpdf-2.2.0'),
      timeout
    }, async err => {
      const data = !err && await readFile(outfile).catch(() => null)
      await Promise.all([
        unlink(certfile),
        unlink(infile),
        data && unlink(outfile)
      ])

      if (err) return reject (err)
      if (!data || !data.length) return reject(new Error('Unable to Sign PDF. Result is Empty'))
      resolve(data)
    })
  }).catch(e => {
    if (e.code === 127)
      throw new Error(`Unable to Sign PDF. Java Not Installed?`)
    if (e.code === 126)
      throw new Error(`Unable to Sign PDF. Permissions denied for [java]`)
    if (e.killed)
      throw new Error(`Unable to Sign PDF. Process Killed. Timeout?`)

    const msg = e.message?.match(/java.io.IOException: (.*)\n/)?.[1]
    throw new Error(msg || 'Unable to Sign PDF. Incorrect Password?')
  }) as Promise<Buffer>
}
