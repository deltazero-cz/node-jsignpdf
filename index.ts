import * as os from 'os'
import * as fs from 'fs/promises'
import { exec } from 'child_process'
import { resolve as resolvePath } from 'path'

export default async function signPDF(pdf: Buffer, p12: Buffer, pass: string, timeout = 15000) : Promise<Buffer> {
  const tmpdir = os.tmpdir(),
        uniq = `node-jsignpdf-${new Date().getTime()}`,
        infile = `${tmpdir}/${uniq}.pdf`,
        outfile = infile.replace(/\.pdf$/, '_signed.pdf'),
        certfile = `${tmpdir}/${uniq}.p12`

  await fs.writeFile(certfile, p12)
  await fs.writeFile(infile, pdf)

  return new Promise((resolve, reject) => {
    exec(`java -jar JSignPDF.jar -kst PKCS12 -d "${tmpdir}" -ksf "${certfile}" -ksp ${pass} "${infile}"`, {
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
      if (!data || !data.length) return reject(new Error('Result is Empty'))
      resolve(data)
    })
  }).catch(e => {
    if (e.code === 143)
      throw new Error('Unable to Sign. Command Failed. Timeout?')

    const msg = e.message.match(/java.io.IOException: (.*)\n/)?.[1]
    throw new Error(msg || 'Unable to Sign. Incorrect Password?')
  }) as Promise<Buffer>
}
