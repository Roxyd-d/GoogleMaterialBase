/**
 * 工具函数模块 - 通用辅助功能
 * 
 * 提供：
 * - 权限检查（无障碍、悬浮窗）
 * - 视图测量和动画辅助
 * - 主题样式应用
 * - 脚本运行控制
 * - 日期格式化
 */

// ==================== 权限相关 ====================

/**
 * 检查无障碍权限状态
 * 
 * @param {android.widget.Switch} switchView - 可选的开关视图，用于同步显示状态
 * @returns {boolean} 是否已授予无障碍权限
 */
function checkAccessibility(switchView) {
    // 检查无障碍服务是否激活
    let ok = auto.rootInActiveWindow;
    
    // 同步开关状态
    if (switchView) switchView.setChecked(ok);
    
    // 如果未授权且提供了开关，尝试打开设置页面
    if (!ok && switchView) {
        try { 
            app.startActivity({ action: "android.settings.ACCESSIBILITY_SETTINGS" }); 
        } catch(e) { 
            Snackbar.make(ui.CoordinatorLayout, "请手动开启无障碍权限", Snackbar.LENGTH_SHORT).show(); 
        }
    }
    return ok;
}

/**
 * 检查悬浮窗权限状态
 * 
 * @param {android.widget.Switch} switchView - 可选的开关视图，用于同步显示状态
 * @returns {boolean} 是否已授予悬浮窗权限
 */
function checkOverlay(switchView) {
    // 检查是否可以绘制悬浮窗
    let ok = new android.provider.Settings().canDrawOverlays(context);
    
    // 同步开关状态
    if (switchView) switchView.setChecked(ok);
    
    // 如果未授权且提供了开关，尝试打开设置页面
    if (!ok && switchView) {
        try { 
            app.startActivity({ action: "android.settings.action.MANAGE_OVERLAY_PERMISSION" }); 
        } catch(e) { 
            Snackbar.make(ui.CoordinatorLayout, "请手动开启悬浮窗权限", Snackbar.LENGTH_SHORT).show(); 
        }
    }
    return ok;
}

// ==================== 动画辅助 ====================

/**
 * 测量视图的高度或宽度
 * 
 * @param {android.view.View} view - 要测量的视图
 * @param {boolean} isHeight - true 返回高度，false 返回宽度
 * @returns {number} 测量得到的尺寸（像素）
 */
function getViewHeight(view, isHeight) {
    if (!view) return 0;
    
    // 创建未指定的测量规范
    let w = View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED);
    let h = View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED);
    
    // 执行测量
    view.measure(w, h);
    
    // 返回请求的尺寸
    return isHeight ? view.getMeasuredHeight() : view.getMeasuredWidth();
}

/**
 * 执行视图高度变化动画
 * 
 * @param {android.view.View} view - 目标视图
 * @param {number} from - 起始高度
 * @param {number} to - 结束高度
 * @param {number} duration - 动画持续时间（毫秒）
 * @param {function} onEnd - 可选的动画结束回调
 */
function animateHeightChange(view, from, to, duration, onEnd) {
    // 使用 alpha 属性作为动画载体（实际修改的是 height）
    let anim = ObjectAnimator.ofFloat(view, "alpha", from, to);
    
    // 监听动画更新，实时修改高度
    anim.addUpdateListener(animation => {
        let params = view.getLayoutParams();
        params.height = animation.getAnimatedValue();
        view.setLayoutParams(params);
    });
    
    // 添加结束监听器
    if (onEnd) anim.addListener(new AnimatorListenerAdapter({ onAnimationEnd: onEnd }));
    
    anim.setDuration(duration);
    anim.start();
}

/**
 * 执行淡入淡出动画
 * 
 * @param {android.view.View} view - 目标视图
 * @param {number} fromAlpha - 起始透明度（0-1）
 * @param {number} toAlpha - 结束透明度（0-1）
 * @param {number} duration - 动画持续时间（毫秒）
 * @param {function} onEnd - 可选的动画结束回调
 */
function fadeAnimation(view, fromAlpha, toAlpha, duration, onEnd) {
    let anim = ObjectAnimator.ofFloat(view, "alpha", fromAlpha, toAlpha);
    if (onEnd) anim.addListener(new AnimatorListenerAdapter({ onAnimationEnd: onEnd }));
    anim.setDuration(duration);
    anim.start();
}

/**
 * 打赏面板展开/收起动画
 * 
 * 实现效果：
 * - 展开：高度增加 + 淡入 + 从右向左平移
 * - 收起：高度减少 + 淡出 + 从左向右平移
 * 
 * @param {android.view.View} container - 容器视图（CardView）
 * @param {android.view.View} childLayout - 子布局（包含微信和支付宝按钮）
 */
function animateDonation(container, childLayout) {
    let isVisible = (childLayout.getVisibility() === View.VISIBLE);
    let startH = getViewHeight(container, true);
    
    if (!isVisible) {
        // ===== 展开动画 =====
        childLayout.setVisibility(View.VISIBLE);
        let endH = getViewHeight(container, true);
        childLayout.setVisibility(View.GONE);
        
        // 高度变化动画
        let animH = ObjectAnimator.ofFloat(childLayout, "alpha", startH, endH);
        animH.addUpdateListener(animation => {
            let params = container.getLayoutParams();
            params.height = animation.getAnimatedValue();
            container.setLayoutParams(params);
        });
        
        // 淡入动画
        let animFade = ObjectAnimator.ofFloat(childLayout, "alpha", 0, 1);
        
        // 从右向左平移动画
        let animTrans = ObjectAnimator.ofFloat(childLayout, "translationX", 200, 0);
        
        // 组合动画同时播放
        let set = new AnimatorSet();
        set.playTogether(animH, animFade, animTrans);
        set.setDuration(300);
        set.start();
        
        childLayout.setVisibility(View.VISIBLE);
    } else {
        // ===== 收起动画 =====
        childLayout.setVisibility(View.GONE);
        let endH = getViewHeight(container, true);
        childLayout.setVisibility(View.VISIBLE);
        
        // 高度变化动画
        let animH = ObjectAnimator.ofFloat(childLayout, "alpha", startH, endH);
        animH.addUpdateListener(animation => {
            let params = container.getLayoutParams();
            params.height = animation.getAnimatedValue();
            container.setLayoutParams(params);
        });
        
        // 动画结束后隐藏子布局
        animH.addListener(new AnimatorListenerAdapter({
            onAnimationEnd: () => childLayout.setVisibility(View.GONE)
        }));
        
        // 淡出动画
        let animFade = ObjectAnimator.ofFloat(childLayout, "alpha", 1, 0);
        
        // 从左向右平移动画
        let animTrans = ObjectAnimator.ofFloat(childLayout, "translationX", 0, 200);
        
        // 组合动画同时播放
        let set = new AnimatorSet();
        set.playTogether(animH, animFade, animTrans);
        set.setDuration(300);
        set.start();
    }
}

// ==================== 主题样式 ====================

/**
 * 将主题颜色应用到所有 Material Switch 控件
 * 
 * 修改开关轨道在选中状态下的颜色
 * 
 * @param {string} color - 主题颜色值（十六进制格式）
 */
function applyThemeToSwitches(color) {
    let switches = [
        ui.stable_mode, 
        ui.stop_all_on_volume_up, 
        ui.not_show_console, 
        ui.foreground_service, 
        ui.AccessibilityPermissions, 
        ui.FloatingWindowPWPermissions
    ];
    
    // 为每个开关设置轨道颜色
    for (let sw of switches) {
        if (sw) {
            sw.setTrackTintList(
                new ColorStateList(
                    [[android.R.attr.state_checked]], 
                    [colors.parseColor(color)]
                )
            );
        }
    }
    
    // 设置底部导航栏图标和文字颜色
    ui.navigation.setItemIconTintList(buildColorStateList(color));
    ui.navigation.setItemTextColor(buildColorStateList(color));
}

/**
 * 构建颜色状态列表
 * 
 * 为不同状态定义不同的颜色：
 * - 按下状态：黑色
 * - 聚焦状态：白色
 * - 选中状态：主题色
 * - 默认状态：灰色
 * 
 * @param {string} themeColor - 主题颜色值
 * @returns {android.content.res.ColorStateList} 颜色状态列表对象
 */
function buildColorStateList(themeColor) {
    let parsed = colors.parseColor(themeColor);
    
    // 定义四种状态
    let states = [
        [android.R.attr.state_pressed],   // 按下
        [android.R.attr.state_focused],   // 聚焦
        [android.R.attr.state_checked],   // 选中
        []                                 // 默认
    ];
    
    // 对应的颜色值
    let colorsList = [
        colors.parseColor("#000000"),  // 黑色
        colors.parseColor("#fafafa"),  // 白色
        parsed,                        // 主题色
        colors.parseColor("#49454F")   // 灰色
    ];
    
    return new ColorStateList(states, colorsList);
}

// ==================== 脚本运行 ====================

/**
 * 从列表中启动脚本
 * 
 * @param {Object} item - 脚本项对象，包含 scriptFile 和 Account 属性
 * @param {function} showMsg - 消息显示回调函数
 */
function startScriptFromList(item, showMsg) {
    try {
        // 动态加载脚本模块
        let scriptModule = require(`./js/${item.scriptFile}`);
        
        // 在新线程中运行脚本
        threads.start(() => scriptModule.run());
        
        showMsg("已启动：" + item.Account);
    } catch(e) {
        showMsg("启动失败：" + e.message);
    }
}

/**
 * 停止所有正在运行的脚本
 * 
 * 包括：
 * - 关闭所有线程
 * - 停止悬浮日志窗口
 */
function stopAllScripts() {
    threads.shutDownAll();
    try { 
        if (global.floatyLogInstance) global.floatyLogInstance.Stop(); 
    } catch(e) {}
}

// ==================== 日期格式化 ====================

/**
 * 格式化日期对象为字符串
 * 
 * @param {Date} date - 日期对象，默认为当前时间
 * @param {string} fmt - 格式化模式，如 "yyyy-MM-dd HH:mm:ss"
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date, fmt) {
    return new java.text.SimpleDateFormat(fmt).format(date || new Date());
}

module.exports = {
    checkAccessibility, 
    checkOverlay,
    getViewHeight, 
    animateHeightChange, 
    fadeAnimation, 
    animateDonation,
    applyThemeToSwitches, 
    buildColorStateList,
    startScriptFromList, 
    stopAllScripts,
    formatDate
};