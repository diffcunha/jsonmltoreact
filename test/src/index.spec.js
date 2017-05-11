import sinon from 'sinon'
import expect from 'must'
import JsonmlToReact from '../../src/index'

// Mock react
JsonmlToReact.__Rewire__('React', {
  createElement: (type, props, children) => ({ type, props, children })
})

const TestComponent = function TestComponent () {}

const converters = {
  'test-tag': (props) => ({
    type: TestComponent,
    props: props
  }),
  'test-tag-with-data': (props, data) => ({
    type: TestComponent,
    props: { data: data }
  })
}

describe('JsonmlToReact class', function () {
  const jsonmlToReact = new JsonmlToReact(converters)

  it('exports a module', function () {
    const actual = typeof JsonmlToReact
    const expected = 'function'

    expect(actual).to.be.equal(expected)
  })

  it('returns a JsonmlToReact instance', () => {
    expect(jsonmlToReact).to.be.an.instanceOf(JsonmlToReact)
  })

  describe('constructor', () => {
    it('takes a default value for `converters`', () => {
      const converters = new JsonmlToReact().converters
      expect(converters).to.be.eql({})
    })
  })

  describe('_visit method', () => {
    it('returns the node if visiting a leaf node', () => {
      const leaf = 'leaf'
      const result = jsonmlToReact._visit(leaf)
      expect(result).to.be.equal(leaf)
    })

    it('returns a component without children if void element', () => {
      const node = ['hr']
      const result = jsonmlToReact._visit(node)

      expect(result.type).to.be.a.string()
      expect(result.type).to.be.equal('hr')
      expect(result.children).to.not.exist()
    })

    it('returns component with `type` as string, equals to node tag if node is HTML tag', () => {
      const node = ['a']
      const result = jsonmlToReact._visit(node)

      expect(result.type).to.be.a.string()
      expect(result.type).to.be.equal('a')
    })

    it('returns component with `type` as string, equals to node tag if node is not an HTML tag and if there\'s no registred converter', () => {
      const node = ['random-tag']
      const result = jsonmlToReact._visit(node)

      expect(result.type).to.be.a.string()
      expect(result.type).to.be.equal('random-tag')
    })

    it('returns component with `props` equal to node attributes', () => {
      const node = ['a', { attr1: 'attr1', attr2: 'attr2' }]
      const result = jsonmlToReact._visit(node)

      expect(result.props.attr1).to.exist()
      expect(result.props.attr1).to.be.equal('attr1')
      expect(result.props.attr2).to.exist()
      expect(result.props.attr2).to.be.equal('attr2')
    })

    it('returns component with `props.className` (and no `props.class`) equal to node `class` attribute', () => {
      const node = ['a', { class: 'class' }]
      const result = jsonmlToReact._visit(node)

      expect(result.props.className).to.exist()
      expect(result.props.className).to.be.equal('class')
      expect(result.props.class).to.not.exist()
    })

    it('returns component with `props.style` as an object parsed from node `style` attribute', () => {
      const node = ['a', { style: 'display: block; color: #fff' }]
      const result = jsonmlToReact._visit(node)

      expect(result.props.style).to.exist()
      expect(result.props.style.display).to.be.equal('block')
      expect(result.props.style.color).to.be.equal('#fff')
    })

    it('returns component with `props.key` equals to index param', () => {
      const node = ['a', { style: 'display: block; color: #fff' }]
      const result = jsonmlToReact._visit(node, 987)

      expect(result.props.key).to.exist()
      expect(result.props.key).to.be.equal(987)
    })

    it('returns custom TestComponent with props set', () => {
      const node = ['test-tag', { prop1: 'prop1' }]
      const result = jsonmlToReact._visit(node)

      expect(result.type).to.be.a.function()
      expect(result.type).to.be.equal(TestComponent)
      expect(result.props.prop1).to.exist()
      expect(result.props.prop1).to.be.equal('prop1')
    })

    it('returns custom TestComponent with data passed to the converter', () => {
      const node = ['test-tag-with-data']
      const data = { data1: 'data1' }
      const result = jsonmlToReact._visit(node, 0, data)

      expect(result.props.data).to.exist()
      expect(result.props.data.data1).to.be.equal('data1')
    })

    it('to be called once for every node', () => {
      const spy = sinon.spy(jsonmlToReact, '_visit')

      const node = ['a', ['a', 'leaf'], ['a', 'leaf']]
      jsonmlToReact._visit(node)

      expect(spy.callCount).to.be.equal(5)

      jsonmlToReact._visit.restore()
    })
  })

  describe('convert method', () => {
    it('should call _visit with `node`, 0 and `data` as parameters', () => {
      const spy = sinon.spy(jsonmlToReact, '_visit')

      const node = ['a']
      const data = { data1: 'data1' }
      jsonmlToReact.convert(node, data)

      expect(spy.calledWith(node, 0, data)).to.be.true()

      jsonmlToReact._visit.restore()
    })
  })
})
