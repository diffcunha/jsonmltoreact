import camelCase from 'lodash.camelcase'

/**
 * CSS style to React style object
 * @param {String} styleCSS - CSS style string
 * @returns {Object} - React style object
 */
export function toStyleObject (styleCSS) {
  return styleCSS
    .split(/;\s*/g)
    .reduce((acc, rule) => {
      const [key, value] = rule.split(/:\s*/g)
      acc[camelCase(key)] = value
      return acc
    }, {})
}
