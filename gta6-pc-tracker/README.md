# GTA6 PC 版追踪

每 6 小时自动抓取 GTA6 **官方 PC 版**相关新闻，生成静态网页部署到 GitHub Pages。泄露、民间移植、破解相关内容会被排除。

- `fetch.py`：抓取 Google 新闻 RSS 和 Steam 商店搜索，结果合并进 `data.json`，并生成 `site/index.html`。只用 Python 标准库。
- `.github/workflows/gta6-pc-tracker.yml`：定时运行，提交 `data.json`，部署到 Pages。

## 启用

1. 把这个分支合并到 `main`（定时任务只在默认分支上运行）。
2. 仓库 Settings → Pages → Source 选 **GitHub Actions**。
3. Actions → "GTA6 PC 版追踪" → Run workflow，手动跑一次。

## 本地运行

    python3 fetch.py   # 然后打开 site/index.html

## 可信度标签

- **官方**：rockstargames.com、take2games.com、Steam、Epic
- **媒体**：`fetch.py` 里 `MEDIA` 列表中的主流媒体
- **未核实**：其他所有来源

要调整关注范围，改 `fetch.py` 顶部的 `QUERIES`、`EXCLUDE`、`MEDIA` 即可。
