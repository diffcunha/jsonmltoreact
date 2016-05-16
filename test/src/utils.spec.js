import { expect } from 'chai';

import {
  reactHTMLTags,
  reactConverters,
  toStyleObject
} from '../../src/utils';


describe('reactConverters array', () => {
  it('is a object with all HTML tags as keys and a function as value', function () {
    expect(reactConverters).to.have.all.keys(reactHTMLTags);
  });
});


describe('toStyleObject function', () => {
  it('returns class object parsed from the CSS style string', () => {
    let css = 'display: block; color: #fff;';
    let result = toStyleObject(css);

    expect(result.display).to.be.equal('block');
    expect(result.color).to.be.equal('#fff');
  });
});
