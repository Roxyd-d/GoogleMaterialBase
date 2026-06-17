/**
 * GoogleMaterialBase - 主入口文件
 *
 * 这是一个基于 Material Design 3 的 Auto.js UI 应用模板
 * 主要功能：
 * - Material Design 3 主题界面
 * - 悬浮日志窗口
 * - 定时任务管理
 * - 权限管理（无障碍、悬浮窗）
 * - 主题颜色自定义
 */

"ui";

importClass(android.content.res.ColorStateList);
importClass(android.view.View);
importClass(android.view.ViewGroup);
importClass(android.graphics.Color);
importClass(android.animation.ObjectAnimator);
importClass(android.animation.ValueAnimator);
importClass(android.animation.AnimatorSet);
importClass(android.animation.AnimatorListenerAdapter);
importClass(android.view.animation.AlphaAnimation);
importClass(android.view.animation.TranslateAnimation);
importClass(android.view.animation.Animation);
importClass(android.view.animation.AnimationSet);
importClass(android.view.animation.LayoutAnimationController);
importClass(com.google.android.material.snackbar.Snackbar);
importClass(com.google.android.material.dialog.MaterialAlertDialogBuilder);
importClass(com.google.android.material.slider.Slider);
importClass(java.text.SimpleDateFormat);

// ==================== 导入模块 ====================
let { initUI } = require("./modules/ui.js"); // UI 初始化模块
let Storage = storages.create("App"); // 创建应用存储空间

// ==================== 全局变量定义 ====================
let ThemeColors = Storage.get("ThemeColors") || "#0061A6"; // 主题颜色
let androidx = Packages.androidx;

// ==================== 创建自定义事件发射器 ====================
// 用于监听配置变更事件
let configEvents = events.emitter();

// ==================== 加载用户配置 ====================
// 从存储中读取用户的个性化配置，如果存在则应用到悬浮日志实例
let msgAnim = Storage.get("MessageStartAnimation");
if (msgAnim !== undefined) global.floatyLogInstance.setMessageStartAnimation(msgAnim);

let maxMsg = Storage.get("MaxMessage");
if (maxMsg !== undefined) global.floatyLogInstance.setMaxMessage(maxMsg);

let alpha = Storage.get("LayoutAlpha");
if (alpha !== undefined) global.floatyLogInstance.setMessageAlpha(alpha);

let bgColors = Storage.get("BackgroundColors");
if (bgColors !== undefined) global.floatyLogInstance.setBackgroundColor(bgColors);

let showTime = Storage.get("isMessageTime");
if (showTime !== undefined) global.floatyLogInstance.setisMessageTime(showTime);

/**
 * 创建主题颜色监听器
 *
 * 使用自定义事件机制监听主题颜色变更
 * 当接收到 'themeColorChange' 事件时，重新初始化整个 UI 以应用新主题
 */
function createThemeColorListener() {
    // 监听主题颜色变更事件
    configEvents.on("themeColorChange", (newColor) => {
        if (newColor && newColor !== ThemeColors) {
            console.log("主题颜色已变更: " + newColor);
            ThemeColors = newColor;
            initUI();
        }
    });
}

// ==================== 启动主题颜色监听 ====================
createThemeColorListener();

// ==================== 启动应用 ====================
initUI();


