var md = require('markdown-it')()
var katex = require('katex')

module.exports = function(md) {
    function inline_math(state, silent) {
        // get starting $ position
        var startMathPos = state.pos

        // ensure start char is a $
        if (state.src.charCodeAt(startMathPos) !== 0x24) {
            return false
        }

        // get char right after $
        var afterStartMarker = state.src.charCodeAt(++startMathPos)

        // ensure char after $ is a space
        // this is to allow something like "$5, $10" to render properly...
        if (afterStartMarker !== 0x20) {
            return false
        }

        // get closing $ position
        var endMarkerPos = state.src.indexOf('$', startMathPos)

        // if no closing $ found, return false
        if (endMarkerPos === -1) {
            return false
        }

        // char before closing $ must be a space
        if (state.src.charCodeAt(endMarkerPos - 1) !== 0x20) {
            return false
        }

        // push token
        if (!silent) {
            var token = state.push('inline_math', '', 0)
            token.content = state.src.slice(startMathPos, endMarkerPos)
        }

        state.pos = endMarkerPos + 1
        return true
    }

    md.inline.ruler.push('inline_math', inline_math)

    md.renderer.rules.inline_math = function(tokens, idx) {
        return katex.renderToString(tokens[idx].content)
    }
}
