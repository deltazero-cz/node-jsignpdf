import signPDF from '../index.js'
import { readFileSync } from 'fs'
import { expect } from "chai"

const pdf = readFileSync('tests/test.pdf'),
      p12 = readFileSync('tests/foo.p12'),
      preSigned = readFileSync('tests/test_signed.pdf'),
      pass = 'test1234'

describe('Sign Certificate', () => {
  let signed = Buffer.alloc(0)
  before(async () => {
    signed = await signPDF(pdf, p12, pass)
    // writeFileSync('tests/test_signed.pdf', signed)
  })

  it ('Sign Certificate', async () => {
    expect(signed.length).gt(0)
    expect(signed).to.be.instanceof(Buffer)
  })

  it ('PDF Integrity', () => {
    const trim = signed.toString('utf8').toString().trim()
    expect(trim.indexOf('%PDF-1')).to.be.eq(0)
    expect(trim.match(/\s%%EOF$/)).not.to.be.null
  })

  it ('Signature has a ByteRange', () => {
    expect(signed.toString('utf8').indexOf('/Sig/ByteRange')).gt(0)
  })

  it ('Same Size as a Presigned Document', () => {
    expect(signed.length === preSigned.length).to.be.true
  })
})
