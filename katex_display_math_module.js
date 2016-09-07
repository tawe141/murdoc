var md = require('markdown-it')()
var katex = require('katex')

module.exports = function(md) {
    function display_math(state, startLine, endLine, silent) {
        var pos = state.bMarks[startLine] + state.tShift[startLine]
        var max = state.eMarks[startLine]

        // ensure it starts with $$
        if (state.src.slice(pos, pos + 2) !== '$$') {
            return false
        }

        // check if it's a one-line expression
        var firstLine = state.src.slice(pos, max)

        if(firstLine !== '$$' && firstLine.trim().slice(-2) === '$$'){
            var latex = firstLine.trim().slice(2, -2)
            state.line += 1
        }

        // not a one-line expression, so look for the next $$

        else {
            for (var nextLine = startLine + 1; nextLine <= endLine; nextLine++) {
                pos = state.bMarks[nextLine] + state.tShift[nextLine]
                max = state.eMarks[nextLine]

                if (state.src.slice(pos, max).trim().slice(-2) === '$$') {
                    break
                }
            }

            var latex = state.getLines(startLine + 1, nextLine)
            state.line = nextLine + 1
        }

        // push token
        if (!silent) {
            var token = state.push('display_math', '', 0)
            token.content = latex
            token.markup = '$$'
            token.block = true
        }

        return true
    }

    md.block.ruler.before('blockquote', 'display_math', display_math)
    md.renderer.rules.display_math = function(tokens, idx) {
        if (tokens[idx].content === "") {
            return '<code>Nothing was rendered for this LaTeX equation. Perhaps your markdown syntax is wrong?</code>'
        }
        return '<div class="container-fluid">'
            + '<div class="col-sm-8 col-sm-offset-2">'
            + katex.renderToString(tokens[idx].content, {
                displayMode: true
            })
            + '</div>'
            + '<div class="col-sm-2">'
            + '<p class="equation-label">'
            + '(1)'
            + '</p>'
            + '</div>'
            + '</div>'
    }
}
