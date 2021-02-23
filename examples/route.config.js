// 根据路由配置自动生成官网项目的路由
import navConfig from './nav.config';
// 支持的所有语言
import langs from './i18n/route';

// 加载官网各个页面的 .vue 文件
const LOAD_MAP = {
  'zh-CN': name => {
    return r => require.ensure([], () =>
      r(require(`./pages/zh-CN/${name}.vue`)),
    'zh-CN');
  },
  'en-US': name => {
    return r => require.ensure([], () =>
      r(require(`./pages/en-US/${name}.vue`)),
    'en-US');
  },
  'es': name => {
    return r => require.ensure([], () =>
      r(require(`./pages/es/${name}.vue`)),
    'es');
  },
  'fr-FR': name => {
    return r => require.ensure([], () =>
      r(require(`./pages/fr-FR/${name}.vue`)),
    'fr-FR');
  }
};

const load = function(lang, path) {
  return LOAD_MAP[lang](path);
};

// 加载官网组件页面各个组件的 markdown 文件
const LOAD_DOCS_MAP = {
  'zh-CN': path => {
    return r => require.ensure([], () =>
      r(require(`./docs/zh-CN${path}.md`)),
    'zh-CN');
  },
  'en-US': path => {
    return r => require.ensure([], () =>
      r(require(`./docs/en-US${path}.md`)),
    'en-US');
  },
  'es': path => {
    return r => require.ensure([], () =>
      r(require(`./docs/es${path}.md`)),
    'es');
  },
  'fr-FR': path => {
    return r => require.ensure([], () =>
      r(require(`./docs/fr-FR${path}.md`)),
    'fr-FR');
  }
};

const loadDocs = function(lang, path) {
  return LOAD_DOCS_MAP[lang](path);
};

// 添加组件页的各个路由配置，以下这段代码要看懂必须明白 nav.config.json 文件的结构
const registerRoute = (navConfig) => {
  let route = [];
  // 遍历配置，生成四种语言的组件路由配置
  Object.keys(navConfig).forEach((lang, index) => {
    // 指定语言的配置，比如 lang = zh-CN，navs 就是所有配置项都是中文写的
    let navs = navConfig[lang];
    // 组件页面 lang 语言的路由配置
    route.push({
      // 比如： /zh-CN/component
      path: `/${ lang }/component`,
      redirect: `/${ lang }/component/installation`,
      // 加载组件页的 component.vue
      component: load(lang, 'component'),
      // 组件页的所有子路由，即各个组件，放这里，最后的路由就是 /zh-CN/component/comp-path
      children: []
    });
    // 遍历指定语言的所有配置项
    navs.forEach(nav => {
      if (nav.href) return;
      if (nav.groups) {
        // 该项为组件
        nav.groups.forEach(group => {
          group.list.forEach(nav => {
            addRoute(nav, lang, index);
          });
        });
      } else if (nav.children) {
        // 该项为开发指南
        nav.children.forEach(nav => {
          addRoute(nav, lang, index);
        });
      } else {
        // 其它，比如更新日志、Element React、Element Angular
        addRoute(nav, lang, index);
      }
    });
  });
  // 生成子路由配置，并填充到 children 中
  function addRoute(page, lang, index) {
    // 根据 path 决定是加载 vue 文件还是加载 markdown 文件
    const component = page.path === '/changelog'
      ? load(lang, 'changelog')
      : loadDocs(lang, page.path);
    let child = {
      path: page.path.slice(1),
      meta: {
        title: page.title || page.name,
        description: page.description,
        lang
      },
      name: 'component-' + lang + (page.title || page.name),
      component: component.default || component
    };
    // 将子路由添加在上面的 children 中
    route[index].children.push(child);
  }

  return route;
};

// 得到组件页面所有侧边栏的路由配置
let route = registerRoute(navConfig);

const generateMiscRoutes = function(lang) {
  let guideRoute = {
    path: `/${ lang }/guide`, // 指南
    redirect: `/${ lang }/guide/design`,
    component: load(lang, 'guide'),
    children: [{
      path: 'design', // 设计原则
      name: 'guide-design' + lang,
      meta: { lang },
      component: load(lang, 'design')
    }, {
      path: 'nav', // 导航
      name: 'guide-nav' + lang,
      meta: { lang },
      component: load(lang, 'nav')
    }]
  };

  let themeRoute = {
    path: `/${ lang }/theme`,
    component: load(lang, 'theme-nav'),
    children: [
      {
        path: '/', // 主题管理
        name: 'theme' + lang,
        meta: { lang },
        component: load(lang, 'theme')
      },
      {
        path: 'preview', // 主题预览编辑
        name: 'theme-preview-' + lang,
        meta: { lang },
        component: load(lang, 'theme-preview')
      }]
  };

  let resourceRoute = {
    path: `/${ lang }/resource`, // 资源
    meta: { lang },
    name: 'resource' + lang,
    component: load(lang, 'resource')
  };

  let indexRoute = {
    path: `/${ lang }`, // 首页
    meta: { lang },
    name: 'home' + lang,
    component: load(lang, 'index')
  };

  return [guideRoute, resourceRoute, themeRoute, indexRoute];
};

langs.forEach(lang => {
  route = route.concat(generateMiscRoutes(lang.lang));
});

route.push({
  path: '/play',
  name: 'play',
  component: require('./play/index.vue')
});

let userLanguage = localStorage.getItem('ELEMENT_LANGUAGE') || window.navigator.language || 'en-US';
let defaultPath = '/en-US';
if (userLanguage.indexOf('zh-') !== -1) {
  defaultPath = '/zh-CN';
} else if (userLanguage.indexOf('es') !== -1) {
  defaultPath = '/es';
} else if (userLanguage.indexOf('fr') !== -1) {
  defaultPath = '/fr-FR';
}

route = route.concat([{
  path: '/',
  redirect: defaultPath
}, {
  path: '*',
  redirect: defaultPath
}]);

export default route;
