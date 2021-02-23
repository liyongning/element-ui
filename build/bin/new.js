'use strict';

/**
 * 添加新组件
 *  比如：make new city 城市列表
 *  1、在 /packages 目录下新建组件目录，并完成目录结构的创建
 *  2、创建组件文档，/examples/docs/{lang}/city.md
 *  3、创建组件单元测试文件，/test/unit/specs/city.spec.js
 *  4、创建组件样式文件，/packages/theme-chalk/src/city.scss
 *  5、创建组件类型声明文件，/types/city.d.ts
 *  6、配置
 *      在 /components.json 文件中配置组件信息
 *      在 /examples/nav.config.json 中添加该组件的路由配置
 *      在 /packages/theme-chalk/src/index.scss 文件中自动引入该组件的样式文件
 *      将类型声明文件在 /types/element-ui.d.ts 中自动引入
 *  总之，该脚本的存在，让你只需专注于编写你的组件代码，其它的一概不用管
 */

console.log();
process.on('exit', () => {
  console.log();
});

if (!process.argv[2]) {
  console.error('[组件名]必填 - Please enter new component name');
  process.exit(1);
}

const path = require('path');
const fs = require('fs');
const fileSave = require('file-save');
const uppercamelcase = require('uppercamelcase');
// 组件名称，比如 city
const componentname = process.argv[2];
// 组件的中文名称
const chineseName = process.argv[3] || componentname;
// 将组件名称转换为大驼峰形式，city => City
const ComponentName = uppercamelcase(componentname);
// 组件包目录，/packages/city
const PackagePath = path.resolve(__dirname, '../../packages', componentname);
// 需要添加的文件列表和文件内容的基本结构
const Files = [
  // /packages/city/index.js
  {
    filename: 'index.js',
    // 文件内容，引入组件，定义组件静态方法 install 用来注册组件，然后导出组件
    content: `import ${ComponentName} from './src/main';

/* istanbul ignore next */
${ComponentName}.install = function(Vue) {
  Vue.component(${ComponentName}.name, ${ComponentName});
};

export default ${ComponentName};`
  },
  // 定义组件的基本结构，/packages/city/src/main.vue
  {
    filename: 'src/main.vue',
    // 文件内容，sfc
    content: `<template>
  <div class="el-${componentname}"></div>
</template>

<script>
export default {
  name: 'El${ComponentName}'
};
</script>`
  },
  // 四种语言的文档，/examples/docs/{lang}/city.md，并设置文件标题
  {
    filename: path.join('../../examples/docs/zh-CN', `${componentname}.md`),
    content: `## ${ComponentName} ${chineseName}`
  },
  {
    filename: path.join('../../examples/docs/en-US', `${componentname}.md`),
    content: `## ${ComponentName}`
  },
  {
    filename: path.join('../../examples/docs/es', `${componentname}.md`),
    content: `## ${ComponentName}`
  },
  {
    filename: path.join('../../examples/docs/fr-FR', `${componentname}.md`),
    content: `## ${ComponentName}`
  },
  // 组件测试文件，/test/unit/specs/city.spec.js
  {
    filename: path.join('../../test/unit/specs', `${componentname}.spec.js`),
    // 文件内容，给出测试文件的基本结构
    content: `import { createTest, destroyVM } from '../util';
import ${ComponentName} from 'packages/${componentname}';

describe('${ComponentName}', () => {
  let vm;
  afterEach(() => {
    destroyVM(vm);
  });

  it('create', () => {
    vm = createTest(${ComponentName}, true);
    expect(vm.$el).to.exist;
  });
});
`
  },
  // 组件样式文件，/packages/theme-chalk/src/city.scss
  {
    filename: path.join('../../packages/theme-chalk/src', `${componentname}.scss`),
    // 文件基本结构
    content: `@import "mixins/mixins";
@import "common/var";

@include b(${componentname}) {
}`
  },
  // 组件类型声明文件
  {
    filename: path.join('../../types', `${componentname}.d.ts`),
    // 类型声明文件基本结构
    content: `import { ElementUIComponent } from './component'

/** ${ComponentName} Component */
export declare class El${ComponentName} extends ElementUIComponent {
}`
  }
];

// 将组件添加到 components.json，{ City: './packages/city/index.js' }
const componentsFile = require('../../components.json');
if (componentsFile[componentname]) {
  console.error(`${componentname} 已存在.`);
  process.exit(1);
}
componentsFile[componentname] = `./packages/${componentname}/index.js`;
fileSave(path.join(__dirname, '../../components.json'))
  .write(JSON.stringify(componentsFile, null, '  '), 'utf8')
  .end('\n');

// 将组件样式文件在 index.scss 中引入
const sassPath = path.join(__dirname, '../../packages/theme-chalk/src/index.scss');
const sassImportText = `${fs.readFileSync(sassPath)}@import "./${componentname}.scss";`;
fileSave(sassPath)
  .write(sassImportText, 'utf8')
  .end('\n');

// 将组件的类型声明文件在 element-ui.d.ts 中引入
const elementTsPath = path.join(__dirname, '../../types/element-ui.d.ts');

let elementTsText = `${fs.readFileSync(elementTsPath)}
/** ${ComponentName} Component */
export class ${ComponentName} extends El${ComponentName} {}`;

const index = elementTsText.indexOf('export') - 1;
const importString = `import { El${ComponentName} } from './${componentname}'`;

elementTsText = elementTsText.slice(0, index) + importString + '\n' + elementTsText.slice(index);

fileSave(elementTsPath)
  .write(elementTsText, 'utf8')
  .end('\n');

// 遍历 Files 数组，创建列出的所有文件并写入文件内容
Files.forEach(file => {
  fileSave(path.join(PackagePath, file.filename))
    .write(file.content, 'utf8')
    .end('\n');
});

// 在 nav.config.json 中添加新组件对应的路由配置
const navConfigFile = require('../../examples/nav.config.json');

// 遍历配置中的各个语言，在所有语言配置中都增加该组件的路由配置
Object.keys(navConfigFile).forEach(lang => {
  let groups = navConfigFile[lang][4].groups;
  groups[groups.length - 1].list.push({
    path: `/${componentname}`,
    title: lang === 'zh-CN' && componentname !== chineseName
      ? `${ComponentName} ${chineseName}`
      : ComponentName
  });
});

fileSave(path.join(__dirname, '../../examples/nav.config.json'))
  .write(JSON.stringify(navConfigFile, null, '  '), 'utf8')
  .end('\n');

console.log('DONE!');
