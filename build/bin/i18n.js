'use strict';

var fs = require('fs');
var path = require('path');
// 官网页面翻译配置，内置了四种语言
var langConfig = require('../../examples/i18n/page.json');

// 遍历所有语言
langConfig.forEach(lang => {
  // 创建 /examples/pages/{lang}，比如: /examples/pages/zh-CN
  try {
    fs.statSync(path.resolve(__dirname, `../../examples/pages/${ lang.lang }`));
  } catch (e) {
    fs.mkdirSync(path.resolve(__dirname, `../../examples/pages/${ lang.lang }`));
  }

  // 遍历所有的页面，根据 page.tpl 自动生成对应语言的 .vue 文件
  Object.keys(lang.pages).forEach(page => {
    // 比如 /examples/pages/template/index.tpl
    var templatePath = path.resolve(__dirname, `../../examples/pages/template/${ page }.tpl`);
    // /examples/pages/zh-CN/index.vue
    var outputPath = path.resolve(__dirname, `../../examples/pages/${ lang.lang }/${ page }.vue`);
    // 读取模版文件
    var content = fs.readFileSync(templatePath, 'utf8');
    // 读取 index 页面的所有键值对的配置
    var pairs = lang.pages[page];

    // 遍历这些键值对，通过正则匹配的方式替换掉模版中对应的 key
    Object.keys(pairs).forEach(key => {
      content = content.replace(new RegExp(`<%=\\s*${ key }\\s*>`, 'g'), pairs[key]);
    });

    // 将替换后的内容写入 vue 文件
    fs.writeFileSync(outputPath, content);
  });
});
