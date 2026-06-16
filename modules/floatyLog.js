/**
 * 悬浮日志窗口模块 - FloatyLog
 *
 * 提供一个可自定义的悬浮日志显示窗口，支持：
 * - 消息队列管理（自动移除旧消息）
 * - 多种动画效果（淡入、位移、布局动画）
 * - 自定义样式（颜色、透明度、最大消息数）
 * - 计时器显示
 * - 时间戳显示
 *
 * 使用示例：
 * ```javascript
 * let log = new FloatyLog();
 * log.setMaxMessage(10)
 *    .setMessageAlpha(0.8)
 *    .setBackgroundColor(["#FF0000", "#00FF00"])
 *    .show();
 *
 * global.floatyLog("这是一条日志消息");
 * ```
 */

let { formatDate } = require("./utils.js");
let Storage = storages.create("App"); // 创建应用存储空间

function GeneralFloatyLog() {
    importClass(android.view.View);
    importClass(android.view.animation.BounceInterpolator);
    importClass(android.animation.ValueAnimator);
    importClass(android.view.animation.AlphaAnimation);
    importClass(android.view.animation.TranslateAnimation);
    importClass(android.animation.ObjectAnimator);
    importClass(android.animation.AnimatorListenerAdapter);
    importClass(android.animation.AnimatorSet);
    importClass(android.view.animation.LayoutAnimationController);
    importClass(android.view.animation.AnimationSet);

    let FloatWindow = null; // 悬浮窗口实例
    let isAnimation = true; // 是否启用动画
    let BackgroundColor = ["#F4A7B9"]; // 背景颜色数组（随机选择）
    let isMessageTime = true; // 是否显示消息时间
    let MessageStartAnimation = Storage.get("MessageStartAnimation") || 100; // 消息出现动画时长（毫秒）
    let MaxMessage = parseInt(Storage.get("MaxMessage")) || 5; // 最大显示消息数
    let LayoutAlpha = parseFloat(Storage.get("LayoutAlpha")) || 1; // 布局透明度（0-1）

    /**
     * 获取悬浮窗口实例
     * @returns {Object} 悬浮窗口对象
     */
    this.GetFloatWindow = function () {
        return FloatWindow;
    };

    /**
     * 设置消息出现动画时长
     * @param {number} p - 动画时长（毫秒）
     * @returns {GeneralFloatyLog} 返回自身以支持链式调用
     */
    this.setMessageStartAnimation = function (p) {
        MessageStartAnimation = p;
        return this;
    };

    /**
     * 设置是否启用动画
     * @param {boolean} p - 是否启用
     * @returns {GeneralFloatyLog} 返回自身以支持链式调用
     */
    this.setIsAnimation = function (p) {
        isAnimation = p;
        return this;
    };

    /**
     * 设置最大消息数量
     * @param {number} p - 最大消息数
     * @returns {GeneralFloatyLog} 返回自身以支持链式调用
     */
    this.setMaxMessage = function (p) {
        MaxMessage = p;
        return this;
    };

    /**
     * 设置消息布局透明度
     * @param {number} p - 透明度值（0-1）
     * @returns {GeneralFloatyLog} 返回自身以支持链式调用
     */
    this.setMessageAlpha = function (p) {
        LayoutAlpha = p;
        return this;
    };

    /**
     * 设置背景颜色列表
     * @param {Array<string>} list - 颜色数组（十六进制格式）
     * @returns {GeneralFloatyLog} 返回自身以支持链式调用
     */
    this.setBackgroundColor = function (list) {
        BackgroundColor = list;
        return this;
    };

    /**
     * 设置是否显示消息时间
     * @param {boolean} flag - 是否显示时间
     * @returns {GeneralFloatyLog} 返回自身以支持链式调用
     */
    this.setisMessageTime = function (flag) {
        isMessageTime = flag;
        return this;
    };

    // ==================== 核心方法 ====================

    /**
     * 停止悬浮日志窗口
     *
     * 执行操作：
     * 1. 停止计时器
     * 2. 播放退出动画
     * 3. 关闭窗口
     *
     * @returns {boolean} 是否成功停止
     */
    this.stop = function () {
        if (!FloatWindow) return false;

        ui.run(() => {
            FloatWindow.chronometer.stop();
            SetExitAnimation(FloatWindow.Layout);
        });
        return true;
    };

    /**
     * 显示悬浮日志窗口
     *
     * 创建并配置悬浮窗口，包括：
     * - 顶部计时器
     * - 消息列表容器
     * - 全局日志函数注册
     *
     * @returns {GeneralFloatyLog} 返回自身以支持链式调用
     */
    this.show = function () {
        // 创建悬浮窗口布局
        FloatWindow = floaty.rawWindow(
            <LinearLayout
                margin="20 10 0 10"
                layout_width="match_parent"
                layout_height="match_parent"
                id="Layout"
                orientation="vertical"
            >
                {/* 占位视图，用于定位 */}
                <LinearLayout layout_height="1" layout_width="{{device.width}}" />

                <LinearLayout orientation="vertical">
                    {/* 计时器卡片 */}
                    <androidx.cardview.widget.CardView
                        cardBackgroundColor="#CA7A2C"
                        cardElevation="0"
                        cardCornerRadius="25"
                        contentPadding="5"
                        foreground="?attr/selectableItemBackground"
                        layout_width="wrap_content"
                    >
                        <Chronometer
                            id="chronometer"
                            margin="5 0 5 0"
                            textSize="15dp"
                            textColor="#fafafa"
                            style="Widget/AppCompat.Button.Borderless"
                            textStyle="bold"
                        />
                    </androidx.cardview.widget.CardView>
                </LinearLayout>

                {/* 消息列表容器 */}
                <LinearLayout id="MessageLayout" orientation="vertical"></LinearLayout>
            </LinearLayout>,
        );

        // 设置消息布局透明度
        FloatWindow.MessageLayout.setAlpha(LayoutAlpha);

        // 设置为不可触摸（穿透点击）
        FloatWindow.setTouchable(false);

        // 启动计时器
        FloatWindow.chronometer.start();

        // 应用布局动画
        FloatWindow.Layout.setLayoutAnimation(BuildAnimation());

        // ==================== 注册全局日志函数 ====================

        /**
         * 添加一条日志消息
         *
         * @param {string} msg - 要显示的日志内容
         * @param {number} [displayTime] - 消息显示时长（毫秒），默认为 2000ms
         * @param {string} [backgroundColor] - 消息背景颜色，默认为随机颜色
         */
        global.floatyLog = (msg, displayTime, backgroundColor) => {
            let time = formatDate(new Date(), "HH:mm:ss");

            ui.run(() => {
                let EndView = null;
                let displayTime = displayTime || 2000;

                // 创建新的消息视图
                let MessageView = BuildMessageView(FloatWindow.Layout);
                MessageView.Text.setText(msg + "");
                MessageView.Time.setText(time);

                // 根据配置隐藏时间
                if (!isMessageTime) MessageView.Time.attr("visibility", "gone");

                // 背景颜色
                MessageView.setCardBackgroundColor(
                    colors.parseColor(backgroundColor || BackgroundColor[random(0, BackgroundColor.length - 1)]),
                );

                // 如果消息数量超过限制，找到最旧的消息准备移除
                if (FloatWindow.MessageLayout.getChildCount() >= MaxMessage) {
                    for (let i = 0; i < FloatWindow.MessageLayout.getChildCount(); i++) {
                        let v = FloatWindow.MessageLayout.getChildAt(i);
                        if (v.clickable == false) {
                            EndView = v;
                            break;
                        }
                    }
                }

                // 添加新消息到布局
                FloatWindow.MessageLayout.addView(MessageView.TextLayout);

                // 执行进入动画，如果有旧消息则同时执行退出动画
                SetAnimationStart(MessageView.TextLayout, EndView, FloatWindow.MessageLayout.getChildCount() || 1);

                // 消息移除的计时器
                threads.start(function () {
                    sleep(displayTime);
                    ui.run(() => {
                        MessageView.TextLayout.attr("visibility", "gone");
                    });
                });
            });
        };

        /**
         * 更新顶部计时器格式
         *
         * @param {string} msg - 计时器前缀文本
         */
        global.floastTopLog = (msg) => {
            ui.run(() => FloatWindow.chronometer.setFormat(msg + "\tTime: %s"));
        };

        return this;
    };

    // ==================== 内部辅助函数 ====================

    /**
     * 设置消息进入和退出动画
     *
     * @param {android.view.View} StartView - 新消息视图
     * @param {android.view.View} EndView - 要移除的旧消息视图（可选）
     * @param {number} mult - 位移倍数（基于消息高度）
     */
    function SetAnimationStart(StartView, EndView, mult) {
        if (EndView) {
            // 标记旧消息为可点击（防止重复处理）
            EndView.setClickable(true);

            // 计算位移距离
            let h = getViewHeight(EndView, true);

            // 向上位移动画
            let animC = ObjectAnimator.ofFloat(EndView, "translationY", 0, -h * mult);
            animC.addListener(
                new AnimatorListenerAdapter({
                    onAnimationEnd: function () {
                        // 动画结束后在后台线程中移除视图
                        threads.start(() => ui.run(() => FloatWindow.MessageLayout.removeView(0)));
                    },
                }),
            );

            // 淡出动画
            ObjectAnimator.ofFloat(EndView, "alpha", 1, 0).start();
        }

        // 新消息淡入动画
        let animA = ObjectAnimator.ofFloat(StartView, "alpha", 0, 1);

        // 从右向左位移动画
        let animB = ObjectAnimator.ofFloat(StartView, "translationX", device.width / 2, 0);

        // 组合动画同时播放
        let set = new AnimatorSet();
        set.playTogether(animA, animB);
        set.setDuration(MessageStartAnimation);
        set.start();
    }

    /**
     * 设置窗口退出动画
     *
     * @param {android.view.View} exitView - 要退出的视图
     */
    function SetExitAnimation(exitView) {
        // 淡出动画
        let animA = ObjectAnimator.ofFloat(exitView, "alpha", 1, 0);

        // 从左向右位移动画
        let animB = ObjectAnimator.ofFloat(exitView, "translationX", 0, device.width / 2);

        // 动画结束后关闭窗口
        animB.addListener(
            new AnimatorListenerAdapter({
                onAnimationEnd: function () {
                    threads.start(() => ui.run(() => FloatWindow.close()));
                },
            }),
        );

        // 组合动画同时播放
        let set = new AnimatorSet();
        set.playTogether(animA, animB);
        set.setDuration(MessageStartAnimation);
        set.start();
    }

    /**
     * 构建单个消息视图
     *
     * @param {android.view.ViewGroup} parent - 父布局
     * @returns {Object} 包含 TextLayout、Text、Time 的对象
     */
    function BuildMessageView(parent) {
        return ui.inflate(files.read("./src/layout/activity_Message.xml"), parent);
    }

    /**
     * 构建布局动画控制器
     *
     * 创建淡入 + 从右向左平移的组合动画
     *
     * @returns {android.view.animation.LayoutAnimationController} 布局动画控制器
     */
    function BuildAnimation() {
        let set = new AnimationSet(true);

        // 淡入动画
        let alpha = new AlphaAnimation(0, 1);
        alpha.setDuration(250);
        set.addAnimation(alpha);

        // 从右向左位移动画
        let trans = new TranslateAnimation(
            Animation.RELATIVE_TO_SELF,
            1,
            Animation.RELATIVE_TO_SELF,
            0,
            Animation.RELATIVE_TO_SELF,
            0,
            Animation.RELATIVE_TO_SELF,
            0,
        );
        trans.setDuration(250);
        set.addAnimation(trans);

        // 创建布局动画控制器，延迟系数 0.25
        return new LayoutAnimationController(set, 0.25);
    }

    /**
     * 获取视图的高度或宽度
     *
     * @param {android.view.View} view - 要测量的视图
     * @param {boolean} isHeight - true 返回高度，false 返回宽度
     * @returns {number} 测量得到的尺寸（像素）
     */
    function getViewHeight(view, isHeight) {
        if (!view) return 0;

        let w = View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED);
        let h = View.MeasureSpec.makeMeasureSpec(0, View.MeasureSpec.UNSPECIFIED);
        view.measure(w, h);

        return isHeight ? view.getMeasuredHeight() : view.getMeasuredWidth();
    }

    return this;
}

module.exports = GeneralFloatyLog;
