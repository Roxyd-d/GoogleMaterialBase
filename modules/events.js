/**
 * 事件处理模块 - UI 交互事件绑定
 *
 * 负责：
 * - 所有按钮点击事件
 * - 开关状态变化监听
 * - 脚本列表项点击处理
 * - 主题颜色选择器
 * - 启动/停止脚本控制
 */

let {
    checkAccessibility,
    checkOverlay,
    startScriptFromList,
    stopAllScripts,
    animateDonation,
    applyThemeToSwitches,
} = require("./utils.js");
let { getThemeColors, setThemeColors } = require("./ui.js");
let FloatyLog = require("./floatyLog.js");
let Storage = storages.create("App"); // 创建应用存储空间

// 创建全局日志悬浮窗实例
global.floatyLogInstance = new FloatyLog();

/**
 * 绑定所有 UI 事件监听器
 *
 * 包括：
 * - 主要功能按钮（Home、主题颜色、启动按钮）
 * - 侧拉菜单项（调试日志、捐赠、关于等）
 * - 权限开关（无障碍、悬浮窗）
 * - 功能开关（稳定模式、音量键停止等）
 * - 脚本列表项
 *
 * @param {string} ThemeColors - 主题颜色值
 */
function bindAllEvents(ThemeColors) {
    // ==================== 主要功能按钮 ====================
    ui.HomeButton.on("click", () => toast("HomeButton"));
    ui.ThemeColors.on("click", showThemePicker);
    ui.StartButton.on("click", onStartClick);

    // ==================== 侧拉菜单项 ====================
    ui.DebugLog.on("click", () => {
        if (global.floatyLogInstance) global.floatyLogInstance.show();
    });
    ui.Donation.on("click", () => animateDonation(ui.Donation, ui.DonationChildLayout));
    ui.About.on("click", () => engines.execScriptFile("AboutActivity.js"));
    ui.LogTheme.on("click", createLogCustomDialog);
    ui.WeChat.on("click", () => toast("微信"));
    ui.Alipay.on("click", () => toast("支付宝"));

    // ==================== 功能开关监听器 ====================
    ui.stable_mode.setOnCheckedChangeListener(createSwitchListener("stable_mode"));
    ui.stop_all_on_volume_up.setOnCheckedChangeListener(createSwitchListener("stop_all_on_volume_up"));
    ui.not_show_console.setOnCheckedChangeListener(createSwitchListener("not_show_console"));
    ui.foreground_service.setOnCheckedChangeListener(createSwitchListener("foreground_service"));

    // 权限开关（需要特殊处理，包含权限检查逻辑）
    ui.AccessibilityPermissions.setOnCheckedChangeListener((view, checked) => checkAccessibility(view));
    ui.FloatingWindowPWPermissions.setOnCheckedChangeListener((view, checked) => checkOverlay(view));

    // ==================== 脚本列表配置 ====================
    let items = [
        { Account: "玩家视界签到", Password: "每日签到领会员时长，自动看广告完成任务", state: false, scriptFile: "玩家视界.js" },
        { Account: "小米音乐签到", Password: "每日签到领绿钻，自动处理广告完成任务", state: false, scriptFile: "小米音乐.js" },
    ];
    ui.ListView.setDataSource(items);

    // 列表项绑定事件
    ui.ListView.on("item_bind", (itemView, itemHolder) => {
        itemView.ListButton.on("click", () => {
            startScriptFromList(itemHolder.item, (msg) => {
                Snackbar.make(ui.CoordinatorLayout, msg, Snackbar.LENGTH_SHORT).show();
            });
        });
    });
}

/**
 * 启动/停止按钮点击处理
 *
 * 根据当前页面执行不同操作：
 * - 日志页面：清空控制台和日志视图
 * - Home 页面：启动/停止测试脚本
 *
 * 启动前会检查无障碍和悬浮窗权限
 */
function onStartClick() {
    let page = ui.viewpager_tab.currentItem;

    // 如果在日志页面，清空日志
    if (page === 3) {
        console.clear();
        ui.console.clear();
        Snackbar.make(ui.CoordinatorLayout, "日志已清空", Snackbar.LENGTH_SHORT).show();
        return;
    }

    // 检查必要权限
    // if (!checkAccessibility()) {
    //     Snackbar.make(ui.CoordinatorLayout, "需要给予无障碍权限", Snackbar.LENGTH_SHORT).show();
    //     return;
    // }
    if (!checkOverlay()) {
        Snackbar.make(ui.CoordinatorLayout, "需要给予悬浮窗权限", Snackbar.LENGTH_SHORT).show();
        return;
    }

    // 判断当前是播放还是停止状态
    let isPlaying = ui.StartButton.attr("src") === "@drawable/ic_play_arrow_black_48dp";

    if (isPlaying) {
        threads.start(function () {
            sleep(1000);
            global.floatyLogInstance.show();
            for (let i = 0; i < 10; i++) {
                global.floatyLog("这是一条日志消息");
                sleep(1000);
            }
        });

        // 更新按钮为停止图标
        ui.StartButton.attr("src", "@drawable/ic_stop_black_48dp");
        ui.StartButton.attr("backgroundTint", "#ff5722");
    } else {
        global.floatyLogInstance.stop();

        // 恢复按钮为播放图标
        ui.StartButton.attr("src", "@drawable/ic_play_arrow_black_48dp");
        ui.StartButton.attr("backgroundTint", getThemeColors());
    }
}

/**
 * 创建日志个性化配置对话框
 *
 */
function createLogCustomDialog() {
    // 创建日志个性化对话框布局
    let DiaLogLayout = ui.inflate(files.read("./src/layout/activity_Dialog_Log.xml"));

    // 创建并显示 Material 风格对话框
    let Dialog = new com.google.android.material.dialog.MaterialAlertDialogBuilder(activity)
        .setTitle("日志个性化")
        .setView(DiaLogLayout)
        .create();
    Dialog.show();

    // 滑块监听
    DiaLogLayout.transparency.addOnChangeListener(DialogOnChangeListener(DiaLogLayout));
    DiaLogLayout.messageMax.addOnChangeListener(DialogOnChangeListener(DiaLogLayout));
    DiaLogLayout.messageAnimation.addOnChangeListener(DialogOnChangeListener(DiaLogLayout));

    //按钮
    DiaLogLayout.addColor.setOnClickListener(DialogOnClickListener(DiaLogLayout, Dialog));
    DiaLogLayout.cancel.setOnClickListener(DialogOnClickListener(DiaLogLayout, Dialog));
    DiaLogLayout.affirm.setOnClickListener(DialogOnClickListener(DiaLogLayout, Dialog));
}

/**
 * 显示主题颜色选择器
 *
 * 创建弹出菜单，展示预设的 10 种中国传统颜色
 * 用户选择后应用新颜色并重启界面
 */
function showThemePicker() {
    let colorList = [
        { color: "#F8C3CD", name: "褪红" },
        { color: "#FFC408", name: "籐黄" },
        { color: "#58B2DC", name: "天蓝" },
        { color: "#7DB9DE", name: "勿忘草" },
        { color: "#005CAF", name: "琉璃" },
        { color: "#7B90D2", name: "红碧" },
        { color: "#080808", name: "黑" },
        { color: "#562E37", name: "似紫" },
        { color: "#9B6E23", name: "狐" },
        { color: "#F05E1C", name: "黄丹" },
    ];

    // 创建弹出菜单
    let popup = new androidx.appcompat.widget.PopupMenu(activity, ui.ThemeColorsText);
    for (let i = 0; i < colorList.length; i++) {
        popup.getMenu().add(colorList[i].name);
    }

    // 菜单项点击处理
    popup.setOnMenuItemClickListener((item) => {
        let selected = colorList.find((c) => c.name === item.getTitle());
        if (selected) {
            setThemeColors(selected.color);
            Snackbar.make(ui.CoordinatorLayout, "已切换主题颜色：" + selected.name, Snackbar.LENGTH_SHORT).show();
        }
        return true;
    });
    popup.show();
}

/**
 * 创建开关状态变化监听器
 *
 * 将开关状态保存到 $settings 中
 *
 * @param {string} key - 设置项的键名
 * @returns {function} 返回监听器函数
 */
function createSwitchListener(key) {
    return (view, checked) => {
        // 只在用户主动点击时保存状态，避免程序设置时触发
        if (!view.isPressed()) return;
        $settings.setEnabled(key, checked);
    };
}

/**
 * 创建滑动条状态变化监听器
 *
 * @returns {function} 监听器函数
 */
function DialogOnChangeListener(DiaLogLayout) {
    return new Slider.OnChangeListener({
        //状态变化后监听
        onValueChange: function (slider, value, fromUser) {
            //控件变化
            switch (slider.id) {
                //透明度
                case DiaLogLayout.transparency.id:
                    DiaLogLayout.MessageLayout.setAlpha(slider.getValue());
                    LayoutAlpha = slider.getValue();
                    break;
                //消息最大数量
                case DiaLogLayout.messageMax.id:
                    MaxMessage = slider.getValue();
                    break;
                //动画时间
                case DiaLogLayout.messageAnimation.id:
                    MessageStartAnimation = slider.getValue();
                    break;
            }
            // console.log(slider.getValue());
        },
    });
}

/**
 * 创建对话框点击监听器
 *
 * @returns {function} 监听器函数
 */
function DialogOnClickListener(DiaLogLayout, Dialog) {
    return new View.OnClickListener({
        onClick: function (View) {
            switch (View.id) {
                //确认
                case DiaLogLayout.affirm.id:
                    let MessageStartAnimation = DiaLogLayout.messageAnimation.getValue();
                    let MaxMessage = DiaLogLayout.messageMax.getValue();
                    let LayoutAlpha = DiaLogLayout.transparency.getValue();

                    Storage.put("MessageStartAnimation", MessageStartAnimation || 100);
                    Storage.put("MaxMessage", MaxMessage || 5);
                    Storage.put("LayoutAlpha", LayoutAlpha !== null ? LayoutAlpha : 1);
                    global.floatyLogInstance.setMessageStartAnimation(MessageStartAnimation);
                    global.floatyLogInstance.setMaxMessage(MaxMessage);
                    global.floatyLogInstance.setMessageAlpha(LayoutAlpha);

                    console.log(`日志个性化保存成功\n消息出现动画时长：${MessageStartAnimation} ms \n最大显示消息数：${MaxMessage} \n布局透明度：${LayoutAlpha}`);
                    setTimeout(function () {
                        Dialog.dismiss();
                    }, 200);
                    break;
                //取消
                case DiaLogLayout.cancel.id:
                    setTimeout(function () {
                        Dialog.dismiss();
                    }, 200);
                    break;
                //添加颜色
                case DiaLogLayout.addColor.id:
                    var ColorList = BackgroundColors;
                    var ColorText = DiaLogLayout.colorEdit.text;
                    if (ModuleClass.AttrJudgment(ColorList, ColorText)) {
                        DiaLogLayout.ErrorEditLayout.setError("已经存在相同颜色！");
                        return 0;
                    }
                    try {
                        colors.parseColor(ColorText);
                        BackgroundColors[BackgroundColors.length] = ColorText + "";
                        MessageLayoutinit(DiaLogLayout, BackgroundColors);
                    } catch (e) {
                        DiaLogLayout.ErrorEditLayout.setError("颜色识别失败！");
                        return 0;
                    }
                    break;
            }
        },
    });
}

module.exports = { bindAllEvents };
