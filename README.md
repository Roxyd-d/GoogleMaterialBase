# GoogleMaterialBase

<div align="center">

![AutoJsPro](https://img.shields.io/badge/Auto.js-4.x+-green.svg)
![Material Design](https://img.shields.io/badge/Material%20Design-3-blue.svg)
![Platform](https://img.shields.io/badge/Platform-Android-orange.svg)

**基于 Material Design 3 的 Auto.js UI 应用模板**

[项目结构](#-项目结构) • [使用说明](#-使用说明) • [API 文档](#-api-文档)

</div>

---

## 📖 项目简介

GoogleMaterialBase 是一个现代化的 Auto.js UI 应用模板，采用 **Material Design 3** 设计规范，提供完整的用户界面框架和常用功能模块。该项目展示了如何在 AutoJsPro 中构建专业的 Android 应用界面，包括主题系统、动画效果、权限管理、悬浮窗口等核心功能。

---

## 📁 项目结构

```
GoogleMaterialBase/
├── main.js                      # 主入口文件
├── modules/                     # 模块目录
│   ├── ui.js                   # UI 界面模块
│   ├── events.js               # 事件处理模块
│   ├── utils.js                # 工具函数模块
│   └── floatyLog.js            # 悬浮日志模块
├── src/                         # 资源目录
│   └── layout/                 # XML 布局文件
│       ├── activity_main.xml   # 主界面布局
│       ├── activity_Dialog_Log.xml  # 日志配置对话框
│       ├── activity_Message.xml     # 消息布局
│       └── BootPage.xml        # 启动页面
├── images/                      # 图片资源
└── README.md                    # 项目说明文档
```

---

## 🎨 自定义开发

### 添加新功能模块

1. **创建模块文件**
   ```javascript
   // modules/myModule.js
   
   /**
    * 我的自定义模块
    */
   
   function myFunction() {
       // 实现逻辑
   }
   
   module.exports = { myFunction };
   ```

2. **在主入口导入**
   ```javascript
   // main.js
   let { myFunction } = require("./modules/myModule.js");
   ```

3. **在 UI 中使用**
   ```javascript
   // modules/events.js
   ui.MyButton.on("click", () => {
       myFunction();
   });
   ```

### 修改主题颜色

编辑 `modules/ui.js` 中的 `showThemePicker()` 函数：

```javascript
function showThemePicker() {
    let colorList = [
        { color: "#你的颜色", name: "颜色名称" },
        // ... 更多颜色
    ];
    // ...
}
```

### 添加新的脚本项

编辑 `modules/events.js` 中的 `bindAllEvents()` 函数：

```javascript
let items = [
    { 
        Account: "新脚本名称", 
        Password: "脚本描述", 
        state: false, 
        scriptFile: "新脚本.js" 
    },
    // ... 更多脚本
];
```

然后在 `js/` 目录下创建对应的脚本文件。

---

<div align="center">

源项目地址: https://github.com/L10870/AutoJsPro-GoogleMaterial

**如果这个项目对你有帮助，请给一个 ⭐ Star 支持！**

Made with ❤️ by Roxyd-d

</div>
