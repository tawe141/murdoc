var md = require('markdown-it')()
var katex = require('katex')

module.exports = function(md) {
    function inline_math(state, silent) {
        // get starting $ position
        var startMathPos = state.pos

        // get char right after $
        var afterStartMarker = state.src.charCodeAt(startMathPos + 1)

        // get closing $ position
        var endMarkerPos = state.src.indexOf('$', startMathPos + 1)

        // ensure start char is a $
        if (state.src.charCodeAt(startMathPos) !== 0x24) {
            return false
        }

        // ensure char before start $ is not a backslash
        if (state.src.charCodeAt(startMathPos - 1) === 0x5C) {
            return false
        }

        // ensure char after $ is not a space or another $
        if (afterStartMarker === 0x20 || afterStartMarker === 0x24) {
            return false
        }

        // if no closing $ found, return false
        if (endMarkerPos === -1) {
            return false
        }

        // char before end $ must not be space or a backslash \
        if (state.src.charCodeAt(endMarkerPos - 1) === 0x20 || state.src.charCodeAt(endMarkerPos -1) === 0x5C) {
            return false
        }

        // check if char after end $ is blank (ie end of line). If not, then...
        if(!state.src.charAt(endMarkerPos + 1) === '') {
            // ...ensure char after $ is not a number or another $
            if(!isNaN(state.src.charAt(endMarkerPos + 1)) || state.src.charCodeAt(endMarkerPos + 1) === 0x24) {
                return false
            }
        }

        // push token
        if (!silent) {
            var token = state.push('inline_math', '', 0)
            token.content = state.src.slice(startMathPos + 1, endMarkerPos)
            token.markup = '$'
        }

        state.pos = endMarkerPos + 1
        return true
    }

    md.inline.ruler.push('inline_math', inline_math)

    md.renderer.rules.inline_math = function(tokens, idx) {
        return katex.renderToString(tokens[idx].content)
    }
}
