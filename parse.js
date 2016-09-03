var md = require('markdown-it')()
var nunjucks = require('nunjucks')
var Promise = require('bluebird')
var fs = Promise.promisifyAll(require('fs'))
var dir = require('node-dir')
var async = require('async')
var rimraf = require('rimraf')
var mkdirp = require('mkdirp')

var katex_inline_math_module = require('./katex_inline_math_module')
md.use(katex_inline_math_module)

nunjucks.configure('templates', {
    autoescape: false
})

function clear_dist(callback) {
    rimraf('./dist/*', function(err) {
        if (err) throw err
        callback()
    })
}

function create_subdirs(callback) {
    dir.subdirs('./src', function(err, subdirs) {
        if (err) throw err

        callback(
            subdirs.map(function(p) {
                fs.mkdir(p.replace('src', 'dist'), function(err) {
                    if (err) throw err
                })
                return p
            })
        )

    })
}

function render_one_md(src_file_path) {
    var dist_file_path = src_file_path.replace('src', 'dist').replace('md', 'html')

    fs.readFile(src_file_path, 'utf8', function(err, data) {
        if (err) throw err
        fs.writeFile(dist_file_path, nunjucks.render('base.html', { markdown: md.render(data) }), function(err) {
            if (err) throw err
        })
    })
}

function render_all_md(paths) {
    paths.map(function(p) {
        render_one_md(p)
    })
}

dir.files('./src', function(err, files) {
    if (err) throw err
    async.series([
        clear_dist,
        create_subdirs
    ],
    function() {
        render_all_md(files)
    })
})
