"""抓取 GTA6 官方 PC 版相关新闻，合并进 data.json，并生成 site/index.html。只用标准库。"""
import html, json, re, urllib.parse, urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path

ROOT = Path(__file__).parent
DATA = ROOT / "data.json"
SITE = ROOT / "site"
CST = timezone(timedelta(hours=8))

QUERIES = [  # (搜索词, Google 新闻地区参数)
    ('"GTA 6" PC', "hl=en-US&gl=US&ceid=US:en"),
    ('"Grand Theft Auto VI" PC', "hl=en-US&gl=US&ceid=US:en"),
    ("GTA6 PC版", "hl=zh-CN&gl=CN&ceid=CN:zh-Hans"),
]
GAME = re.compile(r"gta\s*(6|vi)\b|grand theft auto vi\b", re.I)
PC = re.compile(r"\bpc\b|windows|steam|epic games|电脑", re.I)
# 只追踪官方 PC 版：排除泄露、民间移植、破解相关内容（官方域名的消息不受此限）
EXCLUDE = re.compile(r"leak|dump|unauthori[sz]ed|unofficial|fan[- ]made|xbox build|emulat|crack|pirat|\bports?\b|dmca|takedown|reverse[- ]engineer|vibe|repos\b|recompil|compatibility layer|boot|\bfps\b|footage|playable build|rendering|project (leonida|victory)|portheon|manifold|malware|fake build|重新编译|实时追踪|泄露|破解|盗版|民间|模拟器|逆向", re.I)

OFFICIAL = {"rockstargames.com", "take2games.com", "steampowered.com", "epicgames.com"}
MEDIA = {"ign.com", "gamespot.com", "eurogamer.net", "pcgamer.com", "polygon.com", "theverge.com",
         "kotaku.com", "videogameschronicle.com", "gamesindustry.biz", "bloomberg.com", "reuters.com",
         "rockpapershotgun.com", "techradar.com", "gamesradar.com", "pcgamesn.com", "theguardian.com",
         "cnbc.com", "cnet.com", "tomshardware.com", "tweaktown.com", "mydrivers.com", "gcores.com", "gamelook.com.cn", "chuapp.com", "ithome.com"}


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (news-tracker)"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()


def tier(domain):
    match = lambda s: any(domain == d or domain.endswith("." + d) for d in s)
    return "官方" if match(OFFICIAL) else "媒体" if match(MEDIA) else "未核实"


def fetch_news():
    items = []
    for q, region in QUERIES:
        url = f"https://news.google.com/rss/search?q={urllib.parse.quote(q)}&{region}"
        try:
            root = ET.fromstring(get(url))
        except Exception as e:
            print("抓取失败", q, e)
            continue
        for it in root.iter("item"):
            title = it.findtext("title", "")
            src = it.find("source")
            source = src.text if src is not None else ""
            domain = urllib.parse.urlparse(src.get("url", "")).netloc.removeprefix("www.") if src is not None else ""
            if source and title.endswith(" - " + source):
                title = title[: -len(source) - 3]
            if not (GAME.search(title) and PC.search(title)) or (EXCLUDE.search(title) and tier(domain) != "官方"):
                continue
            items.append({
                "title": title, "link": it.findtext("link", ""), "source": source or domain,
                "tier": tier(domain),
                "date": parsedate_to_datetime(it.findtext("pubDate")).astimezone(timezone.utc).isoformat(),
            })
    return items


def steam_status():
    try:
        r = json.loads(get("https://store.steampowered.com/api/storesearch/?term=Grand%20Theft%20Auto%20VI&cc=us&l=english"))
    except Exception as e:
        return {"ok": None, "text": f"检测失败：{e}"}
    for it in r.get("items", []):
        if re.fullmatch(r"grand theft auto vi\b.*", it["name"], re.I):
            return {"ok": True, "text": f"已上线：{it['name']}", "url": f"https://store.steampowered.com/app/{it['id']}/"}
    return {"ok": False, "text": "未上线"}


def main():
    old = json.loads(DATA.read_text("utf-8")) if DATA.exists() else {"items": []}
    seen = {(i["title"], i["source"]) for i in old["items"]}
    new = [i for i in fetch_news() if (i["title"], i["source"]) not in seen and not seen.add((i["title"], i["source"]))]
    items = sorted(old["items"] + new, key=lambda i: i["date"], reverse=True)[:300]
    data = {"updated": datetime.now(timezone.utc).isoformat(), "steam": steam_status(), "items": items}
    DATA.write_text(json.dumps(data, ensure_ascii=False, indent=1), "utf-8")
    SITE.mkdir(exist_ok=True)
    (SITE / "index.html").write_text(render(data), "utf-8")
    print(f"新增 {len(new)} 条，共 {len(items)} 条")


def render(d):
    e = html.escape
    t = lambda iso: datetime.fromisoformat(iso).astimezone(CST).strftime("%Y-%m-%d %H:%M")
    official = [i for i in d["items"] if i["tier"] == "官方"]
    latest = f'<a href="{e(official[0]["link"])}">{e(official[0]["title"])}</a>（{t(official[0]["date"])}）' if official else "暂无"
    s = d["steam"]
    steam = f'<a href="{e(s["url"])}">{e(s["text"])}</a>' if s.get("url") else e(s["text"])
    rows = "\n".join(
        f'<li><span class="tag t{ {"官方": 1, "媒体": 2}.get(i["tier"], 3)}">{i["tier"]}</span>'
        f'<a href="{e(i["link"])}" rel="noopener" target="_blank">{e(i["title"])}</a>'
        f'<small>{e(i["source"])} · {t(i["date"])}</small></li>' for i in d["items"])
    return f"""<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>GTA6 PC 版追踪</title>
<style>
:root{{--bg:#fff;--fg:#1a1a1a;--mute:#666;--line:#e5e5e5;--card:#f6f6f6}}
@media (prefers-color-scheme:dark){{:root{{--bg:#111;--fg:#eee;--mute:#999;--line:#2a2a2a;--card:#1b1b1b}}}}
body{{margin:0 auto;max-width:860px;padding:24px 16px;font:15px/1.6 system-ui,sans-serif;background:var(--bg);color:var(--fg)}}
a{{color:inherit}} h1{{margin:0 0 4px}} .mute,small{{color:var(--mute)}}
.cards{{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin:20px 0}}
.card{{background:var(--card);border-radius:10px;padding:14px}} .card b{{display:block;font-size:13px;color:var(--mute)}}
ul{{list-style:none;padding:0}} li{{padding:10px 0;border-bottom:1px solid var(--line)}} li small{{display:block}}
.tag{{font-size:12px;padding:1px 6px;border-radius:4px;margin-right:6px;color:#fff}}
.t1{{background:#1a7f37}} .t2{{background:#0969da}} .t3{{background:#8c8c8c}}
</style></head><body>
<h1>GTA6 PC 版追踪</h1>
<div class="mute">只追踪官方 PC 版消息，已排除泄露和民间移植相关内容。最后更新：{t(d["updated"])}（北京时间）</div>
<div class="cards">
<div class="card"><b>主机版</b>PS5 / Xbox Series X|S 已于 2026-11-19 发售</div>
<div class="card"><b>Steam 商店页</b>{steam}</div>
<div class="card"><b>最新官方消息</b>{latest}</div>
</div>
<div class="mute">标签说明：官方 = Rockstar / Take-Two / 商店平台；媒体 = 主流游戏或财经媒体；未核实 = 其他来源，可能是传闻。</div>
<ul>
{rows or "<li>暂无</li>"}
</ul>
<div class="mute">新闻来源：Google 新闻 RSS。本站与 Rockstar Games 无关。</div>
</body></html>"""


if __name__ == "__main__":
    main()
