/**
 * 通过 babel 将 ES Module 风格的翻译文件转译成 UMD 风格
 */
var fs = require('fs');
var save = require('file-save');
var resolve = require('path').resolve;
var basename = require('path').basename;

// 翻译文件目录，这些文件用于官网
var localePath = resolve(__dirname, '../../src/locale/lang');
// 得到目录下的所有翻译文件
var fileList = fs.readdirSync(localePath);

// 转换函数
var transform = function(filename, name, cb) {
  require('babel-core').transformFile(resolve(localePath, filename), {
    plugins: [
      'add-module-exports',
      ['transform-es2015-modules-umd', {loose: true}]
    ],
    moduleId: name
  }, cb);
};

// 遍历所有文件
fileList
  // 只处理 js 文件，其实目录下不存在非 js 文件
  .filter(function(file) {
    return /\.js$/.test(file);
  })
  .forEach(function(file) {
    var name = basename(file, '.js');

    // 调用转换函数，将转换后的代码写入到 lib/umd/locale 目录下
    transform(file, name, function(err, result) {
      if (err) {
        console.error(err);
      } else {
        var code = result.code;

        code = code
          .replace('define(\'', 'define(\'element/locale/')
          .replace('global.', 'global.ELEMENT.lang = global.ELEMENT.lang || {}; \n    global.ELEMENT.lang.');
        save(resolve(__dirname, '../../lib/umd/locale', file)).write(code);

        console.log(file);
      }
    });
  });
