# 基本使用

* 装包

```shel
npm run bootstrap
```

* 运行官网

```shell
npm run dev
```

* 运行普通示例

```shell
npm run dev:play
```

* 打包

```shell
npm run dist
```

# ElementUI 源码解读

详细讲解了 ElementUI 源码架构

* 配套文章：

  * [掘金](https://juejin.cn/post/6935977815342841892)
  * [微信公众号](https://mp.weixin.qq.com/s?__biz=MzA3NTk4NjQ1OQ==&mid=2247484649&idx=1&sn=8ee67553193fda33e7c637568bb0a86f&chksm=9f69679da81eee8bba046776de07f8848ad9061e6c04ca781bf052fc9bcee70ea34a48c81864&token=1017613621&lang=zh_CN#rd)

* 配套视频：

  * [B 站](https://www.bilibili.com/video/BV1pN41197t6?spm_id_from=333.999.0.0)

# 框架依赖

https://github.com/sass/node-sass/releases/tag/v4.14.1

很多人在本地跑 ElementUI 项目会报 node-sass 相关的错误，这里会涉及一个 node 版本兼容性的问题，我这边用的是 node@14