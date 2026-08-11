---
title: 基于mpvpaper的动态壁纸魔改方案
date: 2026-08-12
cover: /images/kauza.gif
---

## 基于awww的动态壁纸魔改方案（二）

书接上回，用了一段时间，实在接受不了低素壁纸，gif会吞分辨率，啊呜呜呜又不支持mp4。综合来看，还得是mpvpaper（之前占用高是因为壁纸全用了gif，不说运行占用高，光一帧帧的缓存都占了20多G），相比啊呜呜呜，其占用稳定50M左右
![截图](/images/123.png)

所以接下去就好办了，只需把awww的配置迁移到mpvpaper上即可

---
## 配置mpvpaper

依旧先设开机自启

然后写脚本

```sh
#!/bin/bash

# systemd 环境下没有 WAYLAND_DISPLAY，从 niri 的 socket 动态推导
if [ -z "$WAYLAND_DISPLAY" ]; then
    export WAYLAND_DISPLAY="$(ls /run/user/$(id -u)/niri.wayland-*.sock 2>/dev/null | head -1 | sed 's/.*niri\.//; s/\.[0-9]*\.sock//')"
fi
if [ -z "$WAYLAND_DISPLAY" ]; then
    export WAYLAND_DISPLAY="wayland-1"
fi

WP_DIR="$HOME/Pictures/Wallpapers/GIFs"
TONES_FILE="$HOME/.config/wallpaper-tones.txt"
LAST_WALLPAPER="$HOME/.config/.wallpaper_last"
ROTATE_INTERVAL=1800  # 时段内轮换间隔（秒），30分钟
MONITOR='*'           # 所有显示器；指定单屏可改成 eDP-1

# 根据当前小时返回目标色调优先级列表（从高到低）
get_target_tones() {
    local hour=$(date +%H)
    if   [ "$hour" -ge 0  ] && [ "$hour" -lt 6  ]; then echo "dark cool neutral"
    elif [ "$hour" -ge 6  ] && [ "$hour" -lt 9  ]; then echo "cool neutral dark"
    elif [ "$hour" -ge 9  ] && [ "$hour" -lt 17 ]; then echo "cool neutral bright"
    elif [ "$hour" -ge 17 ] && [ "$hour" -lt 20 ]; then echo "warm neutral cool"
    else echo "dark cool neutral"
    fi
}

# 从色调池里收集壁纸文件列表
get_pool() {
    local tones="$1"
    local tone
    local files=()
    for tone in $tones; do
        while IFS= read -r line; do
            local name="${line%%$'\t'*}"
            local t="${line#*$'\t'}"
            [ "$t" = "$tone" ] && [ -f "$WP_DIR/$name" ] && files+=("$WP_DIR/$name")
        done < "$TONES_FILE"
        # 找到第一个非空色调池就返回
        if [ ${#files[@]} -gt 0 ]; then
            printf '%s\n' "${files[@]}"
            return 0
        fi
    done
    return 1
}

# 随机选一个，排除上次
pick_random() {
    local exclude="$1"
    shift
    local files=("$@")
    if [ ${#files[@]} -eq 0 ]; then
        return 1
    fi
    if [ ${#files[@]} -gt 1 ] && [ -n "$exclude" ]; then
        local candidates=()
        local f
        for f in "${files[@]}"; do
            [ "$f" != "$exclude" ] && candidates+=("$f")
        done
        [ ${#candidates[@]} -gt 0 ] && files=("${candidates[@]}")
    fi
    echo "${files[RANDOM % ${#files[@]}]}"
}

set_wallpaper() {
    pkill mpvpaper 2>/dev/null
    sleep 0.3
    mpvpaper -o "no-audio loop hwdec=auto panscan=1.0" "$MONITOR" "$1" > /dev/null 2>&1 &
    echo "$1" > "$LAST_WALLPAPER"
}

# 初始：按时段色调设置
LAST_SET=""
if [ -f "$LAST_WALLPAPER" ] && [ -s "$LAST_WALLPAPER" ]; then
    LAST_SET="$(cat "$LAST_WALLPAPER")"
fi

TARGET_TONES=$(get_target_tones)
POOL=()
while IFS= read -r f; do POOL+=("$f"); done < <(get_pool "$TARGET_TONES")
if [ ${#POOL[@]} -gt 0 ]; then
    if WP=$(pick_random "$LAST_SET" "${POOL[@]}"); then
        set_wallpaper "$WP"
        echo "[$(date '+%H:%M:%S')] 初始设置($TARGET_TONES): $(basename "$WP")"
    fi
else
    # 色调池全空：全库随机兜底
    while IFS= read -r f; do POOL+=("$f"); done < <(find "$WP_DIR" -maxdepth 1 -type f \( -name '*.mp4' -o -name '*.webm' -o -name '*.mkv' -o -name '*.gif' \) 2>/dev/null | sort)
    if WP=$(pick_random "$LAST_SET" "${POOL[@]}"); then
        set_wallpaper "$WP"
        echo "[$(date '+%H:%M:%S')] 初始设置(全库兜底): $(basename "$WP")"
    fi
fi

LAST_SWITCH=$(date +%s)
LAST_HOUR=$(date +%H)

while true; do
    sleep 30

    NOW=$(date +%s)
    ELAPSED=$((NOW - LAST_SWITCH))
    CURRENT_HOUR=$(date +%H)

    # 时段变化：立即按新色调切换
    if [ "$CURRENT_HOUR" != "$LAST_HOUR" ]; then
        TARGET_TONES=$(get_target_tones)
        POOL=()
        while IFS= read -r f; do POOL+=("$f"); done < <(get_pool "$TARGET_TONES")
        if [ ${#POOL[@]} -gt 0 ]; then
            if WP=$(pick_random "$(cat "$LAST_WALLPAPER" 2>/dev/null)" "${POOL[@]}"); then
                set_wallpaper "$WP"
                echo "[$(date '+%H:%M:%S')] 时段切换($TARGET_TONES): $(basename "$WP")"
            fi
        else
            while IFS= read -r f; do POOL+=("$f"); done < <(find "$WP_DIR" -maxdepth 1 -type f \( -name '*.mp4' -o -name '*.webm' -o -name '*.mkv' -o -name '*.gif' \) 2>/dev/null | sort)
            if WP=$(pick_random "$(cat "$LAST_WALLPAPER" 2>/dev/null)" "${POOL[@]}"); then
                set_wallpaper "$WP"
                echo "[$(date '+%H:%M:%S')] 时段切换(全库兜底): $(basename "$WP")"
            fi
        fi
        LAST_SWITCH=$NOW
        LAST_HOUR="$CURRENT_HOUR"
        continue
    fi

    # 时段内轮换
    if [ "$ELAPSED" -ge "$ROTATE_INTERVAL" ]; then
        TARGET_TONES=$(get_target_tones)
        POOL=()
        while IFS= read -r f; do POOL+=("$f"); done < <(get_pool "$TARGET_TONES")
        if [ ${#POOL[@]} -gt 0 ]; then
            if WP=$(pick_random "$(cat "$LAST_WALLPAPER" 2>/dev/null)" "${POOL[@]}"); then
                set_wallpaper "$WP"
                echo "[$(date '+%H:%M:%S')] 轮换($TARGET_TONES): $(basename "$WP")"
            fi
        else
            while IFS= read -r f; do POOL+=("$f"); done < <(find "$WP_DIR" -maxdepth 1 -type f \( -name '*.mp4' -o -name '*.webm' -o -name '*.mkv' -o -name '*.gif' \) 2>/dev/null | sort)
            if WP=$(pick_random "$(cat "$LAST_WALLPAPER" 2>/dev/null)" "${POOL[@]}"); then
                set_wallpaper "$WP"
                echo "[$(date '+%H:%M:%S')] 轮换(全库兜底): $(basename "$WP")"
            fi
        fi
        LAST_SWITCH=$NOW
    fi
done
```

这边把初始化操作改成了将每个壁纸打上色调标签，然后根据时间段调取色调数据并随机加载壁纸，顺带解决了填充黑边的问题。色调分析的思路如下：

```py
#!/usr/bin/env python3
"""k-means 聚类提取壁纸主色并分类色调
用法: scan-tones.py [壁纸目录] [输出文件]
输出格式: 文件名<TAB>分类 (dark/cool/warm/neutral/bright)
"""
import os
import sys
from collections import Counter

import numpy as np
from PIL import Image

DEFAULT_DIR = os.path.expanduser("~/Pictures/Wallpapers/GIFs")
DEFAULT_OUT = os.path.expanduser("~/.config/wallpaper-tones.txt")

EXTENSIONS = {".gif", ".png", ".jpg", ".jpeg", ".webp", ".bmp", ".mp4", ".webm", ".mkv"}
VIDEO_EXTS = {".mp4", ".webm", ".mkv"}


def load_image(path):
    """打开图片；视频则用 ffmpeg 提取中间帧转成临时 PNG 再分析"""
    import subprocess
    import tempfile

    ext = os.path.splitext(path)[1].lower()
    if ext in VIDEO_EXTS:
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
            tmp_path = tmp.name
        try:
            subprocess.run(
                ["ffmpeg", "-y", "-ss", "1", "-i", path, "-frames:v", "1", tmp_path],
                capture_output=True,
                check=True,
            )
            return Image.open(tmp_path)
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
    return Image.open(path)


def kmeans(pixels, k=3, iters=12, seed=42):
    """简单 k-means，返回 (centers, counts)"""
    rng = np.random.default_rng(seed)
    idx = rng.choice(len(pixels), size=k, replace=False)
    centers = pixels[idx].astype(np.float64)

    for _ in range(iters):
        diff = pixels[:, None, :] - centers[None, :, :]
        dist = np.sum(diff * diff, axis=2)
        labels = np.argmin(dist, axis=1)
        new_centers = []
        for i in range(k):
            mask = labels == i
            if np.any(mask):
                new_centers.append(pixels[mask].mean(axis=0))
            else:
                new_centers.append(centers[i])
        centers = np.array(new_centers)

    counts = np.bincount(labels, minlength=k)
    return centers, counts


def classify(centers, counts):
    """根据主色聚类结果判断色调"""
    total = counts.sum()
    if total == 0:
        return "neutral"
    weights = counts / total

    rgb = np.clip(centers / 255.0, 0, 1)
    maxc = rgb.max(axis=1)
    minc = rgb.min(axis=1)
    delta = maxc - minc
    v = maxc
    s = np.where(maxc > 0, delta / np.maximum(maxc, 1e-9), 0)

    h = np.zeros(len(rgb))
    for i in range(len(rgb)):
        if delta[i] == 0:
            h[i] = 0
        elif maxc[i] == rgb[i][0]:
            h[i] = 60 * (((rgb[i][1] - rgb[i][2]) / delta[i]) % 6)
        elif maxc[i] == rgb[i][1]:
            h[i] = 60 * (((rgb[i][2] - rgb[i][0]) / delta[i]) + 2)
        else:
            h[i] = 60 * (((rgb[i][0] - rgb[i][1]) / delta[i]) + 4)
    h = (h + 360) % 360

    wv = float(np.sum(weights * v))
    ws = float(np.sum(weights * s))

    # 暗色：整体亮度低
    if wv < 0.22:
        return "dark"
    # 灰色：饱和度低
    if ws < 0.12:
        return "neutral"

    # 暖色区间 0-60 / 330-360，冷色区间 150-260
    warm_mass = 0.0
    cool_mass = 0.0
    for i in range(len(h)):
        w = weights[i]
        if w < 0.05:
            continue
        hi = h[i]
        if hi < 60 or hi > 330:
            warm_mass += w
        elif 150 <= hi <= 260:
            cool_mass += w

    if warm_mass > cool_mass + 0.15:
        return "warm"
    if cool_mass > warm_mass + 0.15:
        return "cool"
    # 亮色：整体很亮
    if wv > 0.8:
        return "bright"
    return "neutral"


def main():
    wp_dir = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_DIR
    out_file = sys.argv[2] if len(sys.argv) > 2 else DEFAULT_OUT
    tmp_out = out_file + ".tmp"

    files = []
    for root, _, fnames in os.walk(wp_dir):
        for name in sorted(fnames):
            ext = os.path.splitext(name)[1].lower()
            if ext in EXTENSIONS:
                files.append(os.path.join(root, name))
    files.sort()

    stats = Counter()
    with open(tmp_out, "w", encoding="utf-8") as out:
        for path in files:
            name = os.path.basename(path)
            tone = "neutral"
            try:
                with load_image(path) as img:
                    img.seek(0)  # GIF/多帧文件第一帧
                    img = img.convert("RGB").resize((64, 64), Image.BILINEAR)
                    pixels = np.asarray(img).reshape(-1, 3).astype(np.float64)
                    # 像素太多时随机抽样加速
                    if len(pixels) > 3000:
                        rng = np.random.default_rng(hash(name) % 2**32)
                        idx = rng.choice(len(pixels), size=3000, replace=False)
                        pixels = pixels[idx]
                    centers, counts = kmeans(pixels)
                    tone = classify(centers, counts)
            except Exception:
                tone = "neutral"
            out.write(f"{name}\t{tone}\n")
            stats[tone] += 1

    os.replace(tmp_out, out_file)
    print(f"完成，共 {len(files)} 个文件")
    for tone in ["dark", "cool", "warm", "neutral", "bright"]:
        if stats[tone]:
            print(f"{tone}: {stats[tone]}")


if __name__ == "__main__":
    main()
```

具体思路是设定ffmpeg提取视频中间帧作为壁纸预览，然后用k-means聚类分析壁纸色调（不是平均色调，是主色调）。

然后写个调用指令脚本：
```sh
exec python3 "$HOME/.config/niri/scripts/scan-tones.py" "$@"
```

最后依旧外包个终端指令：

```bash
#!/bin/bash

WP_DIR="$HOME/Pictures/Wallpapers/GIFs"
TONES_FILE="$HOME/.config/wallpaper-tones.txt"
LAST_WALLPAPER="$HOME/.config/.wallpaper_last"
MONITOR='*'

# 根据当前小时返回目标色调优先级列表（从高到低）
get_target_tones() {
    local hour=$(date +%H)
    if   [ "$hour" -ge 0  ] && [ "$hour" -lt 6  ]; then echo "dark cool neutral"
    elif [ "$hour" -ge 6  ] && [ "$hour" -lt 9  ]; then echo "cool neutral dark"
    elif [ "$hour" -ge 9  ] && [ "$hour" -lt 17 ]; then echo "cool neutral bright"
    elif [ "$hour" -ge 17 ] && [ "$hour" -lt 20 ]; then echo "warm neutral cool"
    else echo "dark cool neutral"
    fi
}

# 从色调池里收集壁纸文件列表
get_pool() {
    local tones="$1"
    local tone
    local files=()
    for tone in $tones; do
        while IFS= read -r line; do
            local name="${line%%$'\t'*}"
            local t="${line#*$'\t'}"
            [ "$t" = "$tone" ] && [ -f "$WP_DIR/$name" ] && files+=("$WP_DIR/$name")
        done < "$TONES_FILE"
        if [ ${#files[@]} -gt 0 ]; then
            printf '%s\n' "${files[@]}"
            return 0
        fi
    done
    return 1
}

count_tones() {
    local tone="$1"
    awk -F'\t' -v t="$tone" '$2==t{n++} END{print n+0}' "$TONES_FILE" 2>/dev/null
}

set_wallpaper() {
    pkill mpvpaper 2>/dev/null
    sleep 0.3
    mpvpaper -o "no-audio loop hwdec=auto panscan=1.0" "$MONITOR" "$1" > /dev/null 2>&1 &
    echo "$1" > "$LAST_WALLPAPER"
}

case "${1:-list}" in
    list)
        TOTAL=$(ls "$WP_DIR" 2>/dev/null | wc -l)
        echo "壁纸库: $TOTAL 张 ($WP_DIR)"
        echo ""
        echo "色调分布:"
        echo "  dark:    $(count_tones dark)"
        echo "  cool:    $(count_tones cool)"
        echo "  warm:    $(count_tones warm)"
        echo "  neutral: $(count_tones neutral)"
        echo "  bright:  $(count_tones bright)"
        echo ""
        TONES=$(get_target_tones)
        echo "当前时段目标色调: $TONES"
        if [ -f "$LAST_WALLPAPER" ] && [ -s "$LAST_WALLPAPER" ]; then
            echo "当前壁纸: $(basename "$(cat "$LAST_WALLPAPER")")"
        fi
        ;;
    random)
        TONES=$(get_target_tones)
        POOL=()
        while IFS= read -r f; do POOL+=("$f"); done < <(get_pool "$TONES")
        if [ ${#POOL[@]} -eq 0 ]; then
            while IFS= read -r f; do POOL+=("$f"); done < <(find "$WP_DIR" -maxdepth 1 -type f \( -name '*.mp4' -o -name '*.webm' -o -name '*.mkv' -o -name '*.gif' \) 2>/dev/null | sort)
        fi
        [ ${#POOL[@]} -eq 0 ] && echo "壁纸库为空" && exit 1
        PICK="${POOL[RANDOM % ${#POOL[@]}]}"
        set_wallpaper "$PICK"
        echo "已切换($TONES): $(basename "$PICK")"
        ;;
    set)
        [ -z "$2" ] && echo "用法: wp set <文件名>" && exit 1
        FOUND=$(find "$WP_DIR" -maxdepth 1 -name "$2" 2>/dev/null | head -1)
        [ -z "$FOUND" ] && echo "找不到 $2" && exit 1
        set_wallpaper "$FOUND"
        echo "已切换: $(basename "$FOUND")"
        ;;
    stop)
        systemctl --user stop wallpaper-rotate
        pkill mpvpaper
        echo "已停止"
        ;;
    restart)
        systemctl --user restart wallpaper-rotate
        echo "已重启"
        ;;
    *)
        echo "用法: wp [list|random|set <文件名>|stop|restart]"
        ;;
esac
```

接下来大功告成啦！

---

## 后记

说一下，是真喜欢pixel art，特别感谢这几位老师的作品：

- [かうざー@kauza_a](https://x.com/kauza_a)
- [空中楼閣@7UF7UNrEkjOh8hE](https://x.com/7UF7UNrEkjOh8hE)
- [モトクロス斉藤@moot_sai](https://x.com/moot_sai)
- [APO+@APO_PLUS_](https://x.com/APO_PLUS_)
- [Lamily(ラミリー)@Landmily1](https://x.com/Landmily1)
- [Myku](https://space.bilibili.com/1788519082)
- [佩格门凯特PFRtodd](https://space.bilibili.com/11100419)
