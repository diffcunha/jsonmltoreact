import expect from 'must'
import { toStyleObject } from '../../src/utils'

describe('toStyleObject function', () => {
  it('returns class object parsed from the CSS style string', () => {
    const css = 'display: block; color: #fff'
    const result = toStyleObject(css)

    expect(result.display).to.be.equal('block')
    expect(result.color).to.be.equal('#fff')
  })
})
