import * as os from 'os'
import * as fs from 'fs/promises'
import { exec } from 'child_process'
import { resolve as resolvePath } from 'path'

/**
 * Asynchronously Sign PDF with PKCS #12 certificate
 *
 * @param {Buffer} pdf - existing PDF to Sign
 * @param {Buffer} p12 - signature PKCS #12 certificate
 * @param {string} pass - signature certificate passphrase
 * @param {number} timeout - optional timeout, default 10.000 ms
 * @return {Promise<Buffer>} Signed PDF
 */

export default async function signPDF(pdf: Buffer, p12: Buffer, pass: string, timeout = 10000) : Promise<Buffer> {
  const tmpdir = os.tmpdir(),
        uniq = `node-jsignpdf-${new Date().getTime()}`,
        infile = `${tmpdir}/${uniq}.pdf`,
        outfile = infile.replace(/\.pdf$/, '_signed.pdf'),
        certfile = `${tmpdir}/${uniq}.p12`

  await fs.writeFile(certfile, p12)
  await fs.writeFile(infile, pdf)

  return new Promise((resolve, reject) => {
    exec(`java -jar JSignPDF.jar -kst PKCS12 -d "${tmpdir}" -ksf "${certfile}" -ksp "${pass}" "${infile}"`, {
      cwd: resolvePath(__dirname.replace(/\/dist$/, ''), 'lib/jsignpdf-2.2.0'),
      timeout
    }, async err => {
      const data = !err && await fs.readFile(outfile).catch(() => null)
      await Promise.all([
        fs.unlink(certfile),
        fs.unlink(infile),
        data && fs.unlink(outfile)
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

    const msg = e.message.match(/java.io.IOException: (.*)\n/)?.[1]
    throw new Error(msg || 'Unable to Sign PDF. Incorrect Password?')
  }) as Promise<Buffer>
}
