# GoogleMaterialBase

<div align="center">

![Auto.js](https://img.shields.io/badge/Auto.js-4.x+-green.svg)
![Material Design](https://img.shields.io/badge/Material%20Design-3-blue.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)
![Platform](https://img.shields.io/badge/Platform-Android-orange.svg)

**基于 Material Design 3 的 Auto.js UI 应用模板**

[项目结构](#-项目结构) • [使用说明](#-使用说明) • [API 文档](#-api-文档)

</div>

---

## 📖 项目简介

GoogleMaterialBase 是一个现代化的 Auto.js UI 应用模板，采用 **Material Design 3** 设计规范，提供完整的用户界面框架和常用功能模块。该项目展示了如何在 Auto.js 中构建专业的 Android 应用界面，包括主题系统、动画效果、权限管理、悬浮窗口等核心功能。

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

## 💡 使用说明

### 基本用法

```javascript
// 1. 导入模块
let { initUI } = require("./modules/ui.js");
let FloatyLog = require("./modules/floatyLog.js");

// 2. 创建悬浮日志实例
let log = new FloatyLog();

// 3. 自定义配置
log.setMaxMessage(10)              // 最大显示 10 条消息
   .setMessageAlpha(0.8)           // 透明度 80%
   .setMessageStartAnimation(150)  // 动画时长 150ms
   .setBackgroundColor(["#FF0000", "#00FF00", "#0000FF"])  // 背景颜色
   .setisMessageTime(true);        // 显示时间戳

// 4. 显示悬浮窗口
log.show();

// 5. 记录日志
global.floatyLog("这是一条日志消息");
global.floatyLog("第二条消息");

// 6. 更新顶部计时器
global.floastTopLog("当前状态：运行中");

// 7. 停止悬浮窗口
log.Stop();
```

### 主题颜色切换

```javascript
let { getThemeColors, setThemeColors } = require("./modules/ui.js");

// 获取当前主题色
let currentColor = getThemeColors();
console.log("当前主题色：" + currentColor);

// 设置新主题色（会自动保存到存储）
setThemeColors("#FF5722");

// 重启界面以应用新主题
activity.recreate();
```

### 权限检查

```javascript
let { checkAccessibility, checkOverlay } = require("./modules/utils.js");

// 检查无障碍权限
if (checkAccessibility()) {
    console.log("无障碍权限已授予");
} else {
    console.log("需要授予无障碍权限");
}

// 检查悬浮窗权限
if (checkOverlay()) {
    console.log("悬浮窗权限已授予");
} else {
    console.log("需要授予悬浮窗权限");
}
```

### 动画辅助函数

```javascript
let { 
    getViewHeight, 
    animateHeightChange, 
    fadeAnimation, 
    animateDonation 
} = require("./modules/utils.js");

// 测量视图高度
let height = getViewHeight(ui.SomeView, true);

// 执行高度变化动画
animateHeightChange(ui.SomeView, 100, 200, 300, () => {
    console.log("动画结束");
});

// 执行淡入淡出动画
fadeAnimation(ui.SomeView, 0, 1, 500);

// 打赏面板展开/收起动画
animateDonation(ui.Donation, ui.DonationChildLayout);
```

---

## 📚 API 文档

### FloatyLog 类

#### 构造函数

```javascript
let log = new FloatyLog();
```

#### 配置方法（支持链式调用）

| 方法 | 参数 | 说明 | 返回值 |
|------|------|------|--------|
| `setMessageStartAnimation(ms)` | `number` - 动画时长（毫秒） | 设置消息出现动画时长 | `this` |
| `setIsAnimation(enabled)` | `boolean` - 是否启用 | 设置是否启用动画 | `this` |
| `setMaxMessage(count)` | `number` - 最大消息数 | 设置最大显示消息数量 | `this` |
| `setMessageAlpha(alpha)` | `number` - 透明度（0-1） | 设置消息布局透明度 | `this` |
| `setBackgroundColor(colors)` | `Array<string>` - 颜色数组 | 设置背景颜色列表 | `this` |
| `setisMessageTime(show)` | `boolean` - 是否显示 | 设置是否显示时间戳 | `this` |

#### 核心方法

| 方法 | 说明 | 返回值 |
|------|------|--------|
| `show()` | 显示悬浮日志窗口 | `this` |
| `Stop()` | 停止并关闭悬浮窗口 | `boolean` |
| `GetFloatWindow()` | 获取悬浮窗口实例 | `Object` |

#### 全局函数

注册后可在任何地方使用：

```javascript
// 添加日志消息
global.floatyLog("消息内容");

// 更新顶部计时器格式
global.floastTopLog("前缀文本");
```

### Utils 模块

#### 权限检查

```javascript
let { checkAccessibility, checkOverlay } = require("./modules/utils.js");

checkAccessibility(switchView?: View): boolean;
checkOverlay(switchView?: View): boolean;
```

#### 视图测量

```javascript
getViewHeight(view: View, isHeight: boolean): number;
```

#### 动画函数

```javascript
animateHeightChange(
    view: View, 
    from: number, 
    to: number, 
    duration: number, 
    onEnd?: Function
): void;

fadeAnimation(
    view: View, 
    fromAlpha: number, 
    toAlpha: number, 
    duration: number, 
    onEnd?: Function
): void;

animateDonation(container: View, childLayout: View): void;
```

#### 主题样式

```javascript
applyThemeToSwitches(color: string): void;
buildColorStateList(themeColor: string): ColorStateList;
```

#### 脚本控制

```javascript
startScriptFromList(item: Object, showMsg: Function): void;
stopAllScripts(): void;
```

#### 其他工具

```javascript
showLogCustomDialog(): void;
formatDate(date?: Date, fmt: string): string;
```

### UI 模块

```javascript
let { initUI, getThemeColors, setThemeColors } = require("./modules/ui.js");

initUI(): void;
getThemeColors(): string;
setThemeColors(color: string): void;
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
