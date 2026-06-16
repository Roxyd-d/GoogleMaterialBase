/**
 * UI 模块 - 用户界面初始化和事件管理
 *
 * 负责：
 * - Material Design 3 主题设置
 * - 主界面布局加载
 * - 底部导航栏和 ViewPager 配置
 * - 侧拉菜单联动
 * - 动画效果（每日一言、工具栏标题）
 * - 主题颜色管理
 */

let { applyThemeToSwitches, buildColorStateList, getViewHeight, animateHeightChange, fadeAnimation } = require("./utils.js");
let { bindAllEvents } = require("./events.js");

/**
 * 初始化用户界面
 *
 * 执行流程：
 * 1. 设置 Material Design 3 主题
 * 2. 配置状态栏和导航栏颜色
 * 3. 加载主布局 XML
 * 4. 设置侧拉菜单与 ToolBar 联动
 * 5. 初始化底部导航栏
 * 6. 配置 ViewPager Tab
 * 7. 应用主题颜色到开关控件
 * 8. 启动每日一言动画
 * 9. 绑定所有事件监听器
 */
function initUI() {
    // 设置 Material Design 3 Light 主题
    activity.setTheme(com.google.android.material.R$style.Theme_Material3_Light);
    // activity.setTheme(com.google.android.material.R$style.Theme_Material3_Dark);

    // 设置导航栏颜色为浅灰色
    activity.getWindow().setNavigationBarColor(android.graphics.Color.parseColor("#E8EFF7"));

    // 设置状态栏颜色为白色
    ui.statusBarColor("#fafafa");

    // 加载主界面布局
    ui.layout(files.read("src/layout/activity_main.xml"));

    // ==================== 侧拉菜单与 ToolBar 联动 ====================
    let toggle = new androidx.appcompat.app.ActionBarDrawerToggle(
        activity,
        ui.drawer,
        ui.toolbar,
        ui.R.string.openDrawerContentDesc,
        0,
    );
    toggle.syncState(); // 同步状态，显示汉堡菜单图标
    ui.drawer.addDrawerListener(toggle); // 添加抽屉监听器，实现图标旋转动画

    // 初始化底部导航栏 + ViewPager
    initBottomNav();

    // ==================== ViewPager Tab 配置 ====================
    // 注意：这里的标题数量应与 ViewPager 的页面数量一致
    ui.viewpager_tab.setTitles(["定时任务", "各种控件", "下拉刷新", "日志"]);
    ui.TabLayout.setupWithViewPager(ui.viewpager_tab);
    ui.viewpager_tab.addOnPageChangeListener(createPageChangeListener());

    // 应用主题颜色到所有开关控件
    applyThemeToSwitches(ThemeColors);

    // 启动每日一言动画
    startDayWordAnimation();

    // 绑定所有事件监听器
    bindAllEvents(ThemeColors);
}

/**
 * 初始化底部导航栏
 *
 * 创建三个导航项：Home、选项、设置
 * 并与 ViewPager 联动，实现页面切换
 */
function initBottomNav() {
    let menu = ui.navigation.menu;
    let menuItems = [
        menu.add("Home").setIcon(ui.R.drawable.ic_home_black_48dp),
        menu.add("选项").setIcon(ui.R.drawable.ic_dashboard_black_48dp),
        menu.add("设置").setIcon(ui.R.drawable.ic_settings_applications_black_48dp),
    ];

    // 设置底部导航栏点击事件
    ui.navigation.setOnNavigationItemSelectedListener((item) => {
        ui.viewpager.currentItem = menuItems.indexOf(item);
        return true;
    });

    // ViewPager 页面切换监听
    ui.viewpager.addOnPageChangeListener(
        new androidx.viewpager.widget.ViewPager.OnPageChangeListener({
            onPageSelected: function (position) {
                animateToolbarTitle(menuItems[position].getTitle()); // 动画切换标题
                menuItems[position].setChecked(true); // 高亮当前选中项
            },
        }),
    );
}

/**
 * 工具栏标题淡入淡出动画
 *
 * @param {string} title - 要显示的新标题
 */
function animateToolbarTitle(title) {
    // 淡出动画
    let fadeOut = ObjectAnimator.ofFloat(ui.toolbar, "alpha", 1, 0);
    fadeOut.setDuration(200);
    fadeOut.start();

    // 设置新标题
    ui.toolbar.setTitle(title);

    // 淡入动画
    let fadeIn = ObjectAnimator.ofFloat(ui.toolbar, "alpha", 0, 1);
    fadeIn.setDuration(200);
    fadeIn.start();
}

/**
 * 创建 ViewPager 页面切换监听器
 *
 * 根据当前页面位置动态改变浮动按钮的图标和颜色：
 * - 第 0 页（Home/定时任务）：播放图标，主题色
 * - 第 3 页（日志）：删除图标，主题色
 *
 * @returns {androidx.viewpager.widget.ViewPager.OnPageChangeListener} 页面监听器
 */
function createPageChangeListener() {
    return new androidx.viewpager.widget.ViewPager.OnPageChangeListener({
        onPageSelected: function (position) {
            // 根据页面位置切换图标
            let icon = position === 3 ? "@drawable/ic_delete_black_48dp" : "@drawable/ic_play_arrow_black_48dp";
            let btColors = position === 3 ? "#000000" : ThemeColors;
            ui.StartButton.attr("src", icon);
            ui.StartButton.attr("backgroundTint", btColors);
            ui.StartButton.attr("tint", "#FFFFFFFF");
        },
    });
}

/**
 * 启动每日一言动画
 *
 * 在后台线程中执行，避免阻塞 UI：
 * 1. 测量 HomeButton 的初始高度
 * 2. 显示 DayWord 文本并测量新高度
 * 3. 隐藏 DayWord
 * 4. 同时执行高度变化和淡入动画
 */
function startDayWordAnimation() {
    new java.lang.Thread(
        new java.lang.Runnable({
            run: function () {
                ui.run(function () {
                    // 获取 HomeButton 初始高度
                    let startHeight = getViewHeight(ui.HomeButton, true);

                    // 临时显示 DayWord 以测量高度
                    ui.DayWord.attr("visibility", "visible");
                    let endHeight = getViewHeight(ui.HomeButton, true);
                    ui.DayWord.attr("visibility", "gone");

                    // 高度变化动画
                    // 注意：这里原代码使用 alpha 属性来动画化高度值，虽然属性名是 alpha，但实际更新的是 layoutParams.height
                    let animHeight = ObjectAnimator.ofFloat(ui.HomeButton, "alpha", startHeight, endHeight);
                    animHeight.addUpdateListener((animation) => {
                        let params = ui.HomeButton.getLayoutParams();
                        params.height = animation.getAnimatedValue();
                        ui.HomeButton.setLayoutParams(params);
                    });

                    // 淡入动画
                    let animFade = ObjectAnimator.ofFloat(ui.DayWord, "alpha", 0, 1);

                    // 组合动画同时播放
                    let set = new AnimatorSet();
                    set.playTogether(animHeight, animFade);
                    set.setDuration(400);
                    set.start();

                    // 动画结束后显示 DayWord
                    ui.DayWord.attr("visibility", "visible");
                });
            },
        }),
    ).start();
}

/**
 * 获取当前主题颜色
 *
 * @returns {string} 主题颜色值（十六进制格式）
 */
function getThemeColors() {
    return ThemeColors;
}

/**
 * 设置主题颜色并保存到存储
 *
 * 当主题颜色改变时，会触发 'themeColorChange' 事件
 * 监听器接收到事件后会重新初始化 UI 以应用新主题
 *
 * @param {string} color - 新的主题颜色值（十六进制格式）
 */
function setThemeColors(color) {
    ThemeColors = color;
    Storage.put("ThemeColors", color);

    // 触发自定义事件，通知所有监听器主题颜色已变更
    if (typeof configEvents !== "undefined") {
        configEvents.emit("themeColorChange", color);
    }
}

module.exports = { initUI, getThemeColors, setThemeColors };
