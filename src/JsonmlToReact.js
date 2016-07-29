import React from 'react';
import JsonML from 'jsonml.js/lib/utils';
import isFunction from 'lodash.isfunction';

import {
  reactConverters,
  toStyleObject
} from './utils';


/**
 * JsonmlToReact class
 */
export default class JsonmlToReact {

  /**
   * Constructor
   * @param {Object} converters - Aditional converters
   */
  constructor(converters) {
    this.converters = Object.assign({}, reactConverters, converters);
  }

  /**
   * Visit JsonML nodes recursively and convert to React
   * @param {Array} node - JsonML structure
   * @param {Number} index - Node index to be used as key
   * @param {Object} [data] - Data to be passed to the converters
   * @returns {Object} React component
   * @private
   */
  _visit(node, index, data) {
    // Is leaf node
    if (!node || typeof node === 'string') {
      return node;
    }

    let attrs = Object.assign({ key: index }, JsonML.getAttributes(node));

    if (attrs.class) {
      attrs.className = attrs.class;
      attrs.class = undefined;
    }

    if (attrs.style) {
      attrs.style = toStyleObject(attrs.style);
    }

    const tag = JsonML.getTagName(node);
    const children = JsonML.getChildren(node) || [];

    const converter = this.converters[tag];
    const result = isFunction(converter) ? converter(attrs, data) : {};

    const type = result.type || tag;
    const props = result.props || attrs;

    // reassign key in case `converter` removed it
    props.key = props.key || index;

    return React.createElement(type, props, children.map((child, index) => this._visit(child, index, data)));
  }

  /**
   * Convert JsonML to React component
   * @param {Array} jsonml - JsonML structure
   * @param {Object} [data] - Data to be passed to the converters
   * @returns {Object} React component
   */
  convert(jsonml, data) {
    return this._visit(jsonml, 0, data);
  }

}
