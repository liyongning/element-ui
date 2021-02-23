/**
 * 自动在 /packages/theme-chalk/src/index.scss|css 中引入各个组件包的样式
 * 在全量注册组件库时需要用到该样式文件，即 import 'packages/theme-chalk/src/index.scss
 */
var fs = require('fs');
var path = require('path');
var Components = require('../../components.json');
var themes = [
  'theme-chalk'
];
// 得到所有的包名
Components = Object.keys(Components);
// 所有组件包的基础路径，/packages
var basepath = path.resolve(__dirname, '../../packages/');

// 判断指定文件是否存在
function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (err) {
    return false;
  }
}

// 遍历所有组件包，生成引入所有组件包样式的 import 语句，然后自动生成 packages/theme-chalk/src/index.scss|css 文件
themes.forEach((theme) => {
  // 是否是 scss，element-ui 默认使用 scss 编写样式
  var isSCSS = theme !== 'theme-default';
  // 导入基础样式文件 @import "./base.scss|css";\n
  var indexContent = isSCSS ? '@import "./base.scss";\n' : '@import "./base.css";\n';
  // 遍历所有组件包，并生成 @import "./comp-package.scss|css";\n
  Components.forEach(function(key) {
    // 跳过这三个组件包
    if (['icon', 'option', 'option-group'].indexOf(key) > -1) return;
    // comp-package.scss|css
    var fileName = key + (isSCSS ? '.scss' : '.css');
    // 导入语句，@import "./comp-package.scss|css";\n
    indexContent += '@import "./' + fileName + '";\n';
    // 如果该组件包的样式文件不存在，比如 /packages/form-item/theme-chalk/src/form-item.scss 不存在，则认为其被遗漏了，创建该文件
    var filePath = path.resolve(basepath, theme, 'src', fileName);
    if (!fileExists(filePath)) {
      fs.writeFileSync(filePath, '', 'utf8');
      console.log(theme, ' 创建遗漏的 ', fileName, ' 文件');
    }
  });
  // 生成 /packages/theme-chalk/src/index.scss|css，负责引入所有组件包的样式
  fs.writeFileSync(path.resolve(basepath, theme, 'src', isSCSS ? 'index.scss' : 'index.css'), indexContent);
});
