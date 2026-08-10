---
title: 基于awww的动态壁纸魔改方案
date: 2026-08-11
cover: /images/275.gif
---
第一篇博文.

然后进入正题：

## 为什么是awww
首先它好用。其次，它好用。

## 动态壁纸实现

之前试过mvpaper，linux自己的wallpaperengine包以及各种开源项目，但都因为太重了（动不动占用几百M到几G不等）所以放弃，最终选择awww作为引擎。起先本来还想苟且用waypaper作为ui管理器，但随即想到缺乏轮换以及主题适配等灵活性较大的功能，所以连皮都不要了，果断投靠终端。

### 开始
首先，壁纸目录里要有壁纸

~~然后你需要一个懂事的ai~~

然后在桌面管理器的配置中启用awww并设置自启


``` config.kdl
// 动态壁纸
spawn-at-startup "awww-daemon"

// 自动启动
spawn-at-startup "dms" "run"
```

我用的是arch+ niri + dms，其他环境没试过

---
### awww 配置

写几个脚本控制轮换

``` rotate.sh
#!/bin/bash

WP_DIR="$HOME/Pictures/Wallpapers"
LAST_WALLPAPER="$HOME/.config/.wallpaper_last"
ROTATE_INTERVAL=1800  # 同段内轮换间隔（秒），30分钟

get_time_dir() {
    local hour=$(date +%H)
    if   [ "$hour" -ge 0  ] && [ "$hour" -lt 4  ]; then echo "$WP_DIR/00"
    elif [ "$hour" -ge 4  ] && [ "$hour" -lt 8  ]; then echo "$WP_DIR/04"
    elif [ "$hour" -ge 8  ] && [ "$hour" -lt 12 ]; then echo "$WP_DIR/08"
    elif [ "$hour" -ge 12 ] && [ "$hour" -lt 16 ]; then echo "$WP_DIR/12"
    elif [ "$hour" -ge 16 ] && [ "$hour" -lt 20 ]; then echo "$WP_DIR/16"
    else echo "$WP_DIR/20"
    fi
}

pick_random() {
    local dir="$1"
    local exclude="$2"
    local files=()
    while IFS= read -r f; do files+=("$f"); done < <(find "$dir" -maxdepth 1 -type f \( -name '*.gif' -o -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' -o -name '*.webp' -o -name '*.mp4' -o -name '*.mkv' -o -name '*.webm' \) 2>/dev/null)
    if [ ${#files[@]} -gt 0 ]; then
        # 排除当前壁纸，避免连续选同一张；只有一张时就不排除
        if [ ${#files[@]} -gt 1 ] && [ -n "$exclude" ]; then
            local candidates=()
            local f
            for f in "${files[@]}"; do
                [ "$f" != "$exclude" ] && candidates+=("$f")
            done
            [ ${#candidates[@]} -gt 0 ] && files=("${candidates[@]}")
        fi
        echo "${files[RANDOM % ${#files[@]}]}"
    else
        return 1
    fi
}

ensure_daemon() {
    if ! pgrep -x awww-daemon > /dev/null 2>&1; then
        nohup awww-daemon > /dev/null 2>&1 &
        sleep 1
    fi
}

set_wallpaper() {
    ensure_daemon
    awww img "$1" &
    echo "$1" > "$LAST_WALLPAPER"
}

# 初始化：设置当前时段壁纸
TIME_DIR=$(get_time_dir)
if WP=$(pick_random "$TIME_DIR" ""); then
    set_wallpaper "$WP"
    echo "[$(date '+%H:%M:%S')] 初始壁纸: $(basename "$WP")"
else
    echo "[$(date '+%H:%M:%S')] $TIME_DIR 为空"
fi

# 记录当前壁纸和最近切换时间
CURRENT_WP=$(cat "$LAST_WALLPAPER" 2>/dev/null)
LAST_SWITCH=$(date +%s)
LAST_DIR="$TIME_DIR"

# 主循环：每30秒检查一次时段和轮换间隔
while true; do
    sleep 30

    NEW_DIR=$(get_time_dir)
    NOW=$(date +%s)

    # 时段变化：立即切换
    if [ "$NEW_DIR" != "$LAST_DIR" ]; then
        if WP=$(pick_random "$NEW_DIR" "$CURRENT_WP"); then
            set_wallpaper "$WP"
            CURRENT_WP="$WP"
            LAST_SWITCH=$NOW
            echo "[$(date '+%H:%M:%S')] 时段切换: $(basename "$WP")"
        else
            echo "[$(date '+%H:%M:%S')] $NEW_DIR 为空，保持当前壁纸"
        fi
        LAST_DIR="$NEW_DIR"
        continue
    fi

    # 同段内轮换：到间隔时间就换
    ELAPSED=$((NOW - LAST_SWITCH))
    if [ "$ELAPSED" -ge "$ROTATE_INTERVAL" ]; then
        if WP=$(pick_random "$NEW_DIR" "$CURRENT_WP"); then
            set_wallpaper "$WP"
            CURRENT_WP="$WP"
            LAST_SWITCH=$NOW
            echo "[$(date '+%H:%M:%S')] 随机轮换: $(basename "$WP")"
        fi
    fi
done
```

我对壁纸进行一天六段分类，并在每个时间段内进行随机轮换

---
### 收尾工作

最后加上终端控制命令

``` wallpaper.sh
#!/bin/bash

WP_DIR="$HOME/Pictures/Wallpapers"

get_time_dir() {
    local hour=$(date +%H)
    if   [ "$hour" -ge 0  ] && [ "$hour" -lt 4  ]; then echo "$WP_DIR/00"
    elif [ "$hour" -ge 4  ] && [ "$hour" -lt 8  ]; then echo "$WP_DIR/04"
    elif [ "$hour" -ge 8  ] && [ "$hour" -lt 12 ]; then echo "$WP_DIR/08"
    elif [ "$hour" -ge 12 ] && [ "$hour" -lt 16 ]; then echo "$WP_DIR/12"
    elif [ "$hour" -ge 16 ] && [ "$hour" -lt 20 ]; then echo "$WP_DIR/16"
    else echo "$WP_DIR/20"
    fi
}

case "${1:-list}" in
    list)
        CURRENT=$(get_time_dir)
        echo "当前时段: $(basename "$CURRENT")"
        echo ""
        for d in 00 04 08 12 16 20; do
            count=$(find "$WP_DIR/$d" -maxdepth 1 -type f \( -name '*.gif' -o -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' -o -name '*.webp' \) 2>/dev/null | wc -l)
            marker=""
            [ "$WP_DIR/$d" = "$CURRENT" ] && marker=" <-- 当前"
            echo "  $d/ ($count 张)$marker"
        done
        ;;
    random)
        DIR=$(get_time_dir)
        FILES=()
        while IFS= read -r f; do FILES+=("$f"); done < <(find "$DIR" -maxdepth 1 -type f \( -name '*.gif' -o -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' -o -name '*.webp' \) 3>/dev/null)
        if [ ${#FILES[@]} -eq 0 ]; then
            echo "$DIR 为空"
            exit 1
        fi
        PICK="${FILES[RANDOM % ${#FILES[@]}]}"
        pkill awww; sleep 0.3
        awww img "$PICK" &
        echo "Switched to: $(basename "$PICK")"
        ;;
    set)
        [ -z "$2" ] && echo "用法: wp set <文件名>" && exit 1
        FOUND=$(find "$WP_DIR" -maxdepth 2 -name "$2" 2>/dev/null | head -1)
        [ -z "$FOUND" ] && echo "找不到 $2" && exit 1
        pkill awww; sleep 0.3
        awww img "$FOUND" &
        echo "Switched to: $(basename "$FOUND")"
        ;;
    stop)
        pkill awww
        pkill -f wallpaper-rotate
        echo "Stopped"
        ;;
    *)
        echo "用法: wp [list|random|set <文件名>|stop]"
        ;;
esac
```

## 心得
无
