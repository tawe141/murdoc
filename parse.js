var md = require('markdown-it')()
var nunjucks = require('nunjucks')
var fs = require('fs')

var katex_inline_math_module = require('./katex_inline_math_module')
md.use(katex_inline_math_module)

nunjucks.configure('templates', {
    autoescape: false
})

fs.writeFile('test.html', nunjucks.render('base.html', {
    markdown: md.render('# Here is some latex! $ E = mc^2 $')
}), function(err) {
    if (err) throw err
})
