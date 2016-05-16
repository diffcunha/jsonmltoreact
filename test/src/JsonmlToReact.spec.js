import sinon from 'sinon';
import { expect } from 'chai';

import JsonmlToReact from '../../src/JsonmlToReact';


let ReactMock = {
  createElement: (type, props, children) => ({ type, props, children })
};

JsonmlToReact.__Rewire__('React', ReactMock);

const TestComponent = function TestComponent() {};

const converters = {
  'test-tag': (props) => ({
    type: TestComponent,
    props: props
  }),
  'test-tag-with-data': (props, data) => ({
    type: TestComponent,
    props: { data: data }
  })
};

describe('JsonmlToReact class', function () {
  let jsonmlToReact = new JsonmlToReact(converters);

  it('exports a module', function () {
    const actual = typeof JsonmlToReact;
    const expected = 'function';

    expect(actual).to.be.equal(expected);
  });

  it('returns a JsonmlToReact instance', () => {
    expect(jsonmlToReact).to.be.an.instanceOf(JsonmlToReact);
  });

  describe('_visit method', () => {
    it('returns the node if visiting a leaf node', () => {
      let leaf = 'leaf';
      let result = jsonmlToReact._visit(leaf);
      expect(result).to.be.equal(leaf);
    });

    it('returns component with `type` as string, equals to node tag if node is HTML tag', () => {
      let node = ['a'];
      let result = jsonmlToReact._visit(node);

      expect(result.type).to.be.a('string');
      expect(result.type).to.be.equal('a');
    });

    it('returns component with `type` as string, equals to node tag if node is not an HTML tag and if there\'s no registred converter', () => {
      let node = ['random-tag'];
      let result = jsonmlToReact._visit(node);

      expect(result.type).to.be.a('string');
      expect(result.type).to.be.equal('random-tag');
    });

    it('returns component with `props` equal to node attributes', () => {
      let node = ['a', { attr1: 'attr1', attr2: 'attr2' }];
      let result = jsonmlToReact._visit(node);

      expect(result.props.attr1).to.exist;
      expect(result.props.attr1).to.be.equal('attr1');
      expect(result.props.attr2).to.exist;
      expect(result.props.attr2).to.be.equal('attr2');
    });

    it('returns component with `props.className` (and no `props.class`) equal to node `class` attribute', () => {
      let node = ['a', { class: 'class' }];
      let result = jsonmlToReact._visit(node);

      expect(result.props.className).to.exist;
      expect(result.props.className).to.be.equal('class');
      expect(result.props.class).to.not.exist;
    });

    it('returns component with `props.style` as an object parsed from node `style` attribute', () => {
      let node = ['a', { style: 'display: block; color: #fff;' }];
      let result = jsonmlToReact._visit(node);

      expect(result.props.style).to.exist;
      expect(result.props.style.display).to.be.equal('block');
      expect(result.props.style.color).to.be.equal('#fff');
    });

    it('returns component with `props.key` equals to index param', () => {
      let node = ['a', { style: 'display: block; color: #fff;' }];
      let result = jsonmlToReact._visit(node, 987);

      expect(result.props.key).to.exist;
      expect(result.props.key).to.be.equal(987);
    });

    it('returns custom TestComponent with props set', () => {
      let node = ['test-tag', { prop1: 'prop1' }];
      let result = jsonmlToReact._visit(node);

      expect(result.type).to.be.a('function');
      expect(result.type).to.be.equal(TestComponent);
      expect(result.props.prop1).to.exist;
      expect(result.props.prop1).to.be.equal('prop1');
    });

    it('returns custom TestComponent with data passed to the converter', () => {
      let node = ['test-tag-with-data'];
      let data = { data1: 'data1' };
      let result = jsonmlToReact._visit(node, 0, data);

      expect(result.props.data).to.exist;
      expect(result.props.data.data1).to.be.equal('data1');
    });

    it('to be called once for every node', () => {
      let spy = sinon.spy(jsonmlToReact, '_visit');

      let node = ['a', ['a', 'leaf'], ['a', 'leaf']];
      jsonmlToReact._visit(node);

      expect(spy.callCount).to.be.equal(5);

      jsonmlToReact._visit.restore();
    });
  });

  describe('convert method', () => {
    it('should call _visit with `node`, 0 and `data` as parameters', () => {
      let spy = sinon.spy(jsonmlToReact, '_visit');

      let node = ['a'];
      let data = { data1: 'data1' };
      jsonmlToReact.convert(node, data);

      expect(spy.calledWith(node, 0, data)).to.be.true;

      jsonmlToReact._visit.restore();
    });
  });
});
