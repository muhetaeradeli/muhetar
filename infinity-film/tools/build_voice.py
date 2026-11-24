#!/usr/bin/env python3
"""Build the narration: one 48 kHz mono wav per script line in out/vo/, plus voice-timing.js.
A recording replaces the synthetic voice. Three ways to record (all may be mixed; the smaller unit wins):
  my-voice/L042.m4a   one sentence (the line id from the reading script, doc/Дикторлық-мәтін.docx)
  my-voice/c07.m4a    one whole chapter, read in order with a short pause after every sentence
  my-voice/all.m4a    the whole text in one take, read in order with a short pause after every sentence
A chapter or whole-text take is cut into its sentences at the pauses that best fit the sentence lengths
(out/vo-split-report.txt lists every cut, so a wrong one is easy to spot). Formats: wav mp3 m4a ogg aac flac."""
import json, os, subprocess, sys, wave, hashlib
import numpy as np, soundfile as sf
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
MODEL = os.environ.get("VO_MODEL", "voices/kk_KZ-issai-high.onnx")
SPEAKER = int(os.environ.get('VO_SPEAKER', '1'))      # 1 = Iseke (male narrator), 3 = Raya (female narrator)
LENGTH = float(os.environ.get('VO_LENGTH', '1.04'))    # > 1 = slower, calmer
NOISE = float(os.environ.get('VO_NOISE', '0.78'))      # more = livelier intonation
NOISE_W = float(os.environ.get('VO_NOISE_W', '0.92'))  # more = freer rhythm
script = json.loads(subprocess.check_output(['node', '-e', "console.log(JSON.stringify(require('./script.js')))"]))
os.makedirs('out/vo', exist_ok=True); os.makedirs('out/.vo-raw', exist_ok=True)
voice = None
def tts(text, path):
    global voice
    from piper import PiperVoice, SynthesisConfig
    if voice is None: voice = PiperVoice.load(MODEL)
    cfg = SynthesisConfig(speaker_id=SPEAKER, length_scale=LENGTH, noise_scale=NOISE, noise_w_scale=NOISE_W)
    with wave.open(path, 'wb') as w: voice.synthesize_wav(text, w, syn_config=cfg)

EXT = ('wav', 'mp3', 'm4a', 'ogg', 'aac', 'flac')
def find(stem): return next((f'my-voice/{stem}.{e}' for e in EXT if os.path.exists(f'my-voice/{stem}.{e}')), None)
def tts_secs(l):
    key = hashlib.md5(f'{MODEL}|{SPEAKER}|{LENGTH}|{NOISE}|{NOISE_W}|{l["say"]}'.encode()).hexdigest()[:12]
    f = f'out/.vo-raw/{l["id"]}-{key}.wav'
    if os.path.exists(f):
        with wave.open(f) as w: return w.getnframes() / w.getframerate()
    return 0.075 * len(l['say']) + 0.4   # about 13 characters a second
def pauses(x, sr):
    """Silent runs (>= 0.18 s) inside the speech, as (start, end) seconds, plus where the speech starts and ends."""
    hop = int(0.02 * sr); n = len(x) // hop
    e = 20 * np.log10(np.sqrt((x[:n * hop].reshape(n, hop) ** 2).mean(1)) + 1e-9)
    th = max(np.percentile(e, 8) + 10, np.percentile(e, 92) - 32)
    voiced = np.flatnonzero(e >= th)
    if len(voiced) == 0: return [], 0, len(x) / sr
    a, b = voiced[0], voiced[-1] + 1
    sil, runs, i = e[a:b] < th, [], 0
    while i < len(sil):
        if sil[i]:
            j = i
            while j < len(sil) and sil[j]: j += 1
            if j - i >= 9: runs.append(((a + i) * hop / sr, (a + j) * hop / sr))
            i = j
        else: i += 1
    return runs, a * hop / sr, b * hop / sr
SPLIT_TOL, SPLIT_RW = 0.25, 3.0   # how far a sentence may stray from its expected length; how much a long pause counts
def split_take(src, lines, report):
    """Cut one take into len(lines) sentences: k-1 cuts at pauses, chosen (dynamic programming) so that long
    pauses are preferred and every sentence's length stays close to its share of the take."""
    os.makedirs('out/.vo-split', exist_ok=True)
    tmp = 'out/.vo-split/_take.wav'
    subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-i', src, '-ac', '1', '-ar', '48000', '-c:a', 'pcm_s16le', tmp])
    x, sr = sf.read(tmp, dtype='float32')
    runs, a, b = pauses(x, sr)
    k = len(lines) - 1
    prior = np.array([tts_secs(l) for l in lines]); exp = (b - a) * prior / prior.sum()
    if k > 0:
        if len(runs) < k: sys.exit(f'{src}: {len(runs)} pauses found but {len(lines)} sentences are needed: please pause briefly after every sentence')
        mid = np.array([(p + q) / 2 for p, q in runs]); rew = SPLIT_RW * np.minimum(np.array([q - p for p, q in runs]), 1.2)
        seg = lambda L, e: ((L - e) / (SPLIT_TOL * e + 0.6)) ** 2
        m, INF = len(mid), 1e18
        f = np.full((k, m), INF); back = np.zeros((k, m), int)
        f[0] = seg(mid - a, exp[0]) - rew
        for j in range(1, k):
            for i in range(j, m):
                c = f[j - 1, :i] + seg(mid[i] - mid[:i], exp[j])
                back[j, i] = int(np.argmin(c)); f[j, i] = c[back[j, i]] - rew[i]
        last = f[k - 1] + seg(b - mid, exp[k]); i = int(np.argmin(last)); cut = [i]
        for j in range(k - 1, 0, -1): i = back[j, i]; cut.append(i)
        cuts = [mid[i] for i in reversed(cut)]
    else: cuts = []
    edges = [max(0, a - 0.05)] + cuts + [min(len(x) / sr, b + 0.1)]
    report.append(f'\n{src}: {len(lines)} sentences, {len(runs)} pauses')
    out = {}
    for l, p, q, e in zip(lines, edges, edges[1:], exp):
        f = f'out/.vo-split/{l["id"]}.wav'; sf.write(f, x[int(p * sr):int(q * sr)], sr, subtype='PCM_16'); out[l['id']] = f
        flag = '   <- check' if not 0.55 < (q - p) / e < 1.8 else ''
        report.append(f'  {l["id"]}  {p:7.2f}–{q:7.2f} s  ({q - p:5.1f} s, expected ~{e:4.1f})  {l["say"][:60]}{flag}')
    return out
timing, mine = {}, 0
cut = json.loads(subprocess.check_output(['node', '-e', "console.log(JSON.stringify(require('./cut.js')))"]))
read = (lambda l: l['id'] in set(cut['keep'])) if cut else (lambda l: True)   # a cut film reads only its sentences
voiced = [l for sc in script for l in sc['lines'] if l.get('kind') != 'figure' and read(l)]
for l in voiced: l.setdefault('say', l['text'])
takes, report = {}, []
if find('all'): takes.update(split_take(find('all'), voiced, report))
for sc in script:
    if find(sc['scene']): takes.update(split_take(find(sc['scene']), [l for l in sc['lines'] if l.get('kind') != 'figure' and read(l)], report))
if report: open('out/vo-split-report.txt', 'w').write('\n'.join(report) + '\n'); print('takes cut into sentences: out/vo-split-report.txt')
for sc in script:
    for l in sc['lines']:
        if l.get('kind') == 'figure': continue
        l.setdefault('say', l['text'])
        src = find(l['id']) or takes.get(l['id'])
        if src: mine += 1
        else:
            key = hashlib.md5(f'{MODEL}|{SPEAKER}|{LENGTH}|{NOISE}|{NOISE_W}|{l["say"]}'.encode()).hexdigest()[:12]
            src = f'out/.vo-raw/{l["id"]}-{key}.wav'
            if not os.path.exists(src): tts(l['say'], src)
        dst = f'out/vo/{l["id"]}.wav'
        # trim leading/trailing silence, 48 kHz mono
        subprocess.check_call(['ffmpeg', '-v', 'error', '-y', '-i', src, '-af',
            'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse',
            '-ac', '1', '-ar', '48000', dst])
        with wave.open(dst) as w: timing[l['id']] = round(w.getnframes() / w.getframerate(), 3)
open('voice-timing.js', 'w').write('// generated by tools/build_voice.py: seconds per narration line\n(function () { const VOT = ' + json.dumps(timing) +
    "; if (typeof module !== 'undefined') module.exports = VOT; else globalThis.VOT = VOT; })();\n")
print(f'{len(timing)} lines, {sum(timing.values()):.1f}s of speech, {mine} from my-voice/')
