// THE SCRIPT (1-minute draft): every narration line, in order. `text` is what the subtitle shows; `say`
// (optional) is how the text-to-speech must read it.
// Source: «Қазақтың дәстүрлі қолөнеріндегі шексіздік пен мәңгілік идеясы» (section 2.1).
// To use YOUR OWN VOICE: record each line and save it as my-voice/<id>.wav (or .mp3 / .m4a), then run
//   python3 tools/build_voice.py && node song.js
(function () {
  const L = (id, text, say) => ({ id, text, say: say || text });
  const SCRIPT = [
    { scene: 'open', lines: [
      L('o1', 'Шексіздік пен мәңгілік — адамзаттың іргелі философиялық ұғымдары.'),
    ] },
    // «Қазақтың даласы»: the steppe, shown in photographs
    { scene: 'steppe', lines: [
      L('d1', 'Көшпелі қазақ халқы үшін кеңістік ерекше маңызға ие болды.'),
      L('d2', 'Ұлан-ғайыр дала, ашық аспан және алыс көкжиек адамның әлем туралы түсінігін қалыптастырды.'),
      L('d3', 'Кең даланың көз жетпес шетсіздігі әлемнің шекарасыз бейнесін орнықтырды.'),
    ] },
    { scene: 'sky', lines: [
      L('a1', 'Күн мен Айдың қозғалысы, маусымдардың алмасуы уақыттың тоқтаусыз өтетінін танытты.'),
    ] },
    { scene: 'yurt', lines: [
      L('y1', 'Киіз үйдің дөңгелек пішіні — әлемнің тұтастығының бейнесі.'),
      L('y2', 'Ал шаңырақ кеңістікті аспанмен байланыстырады.'),
    ] },
    { scene: 'ornament', lines: [
      L('r1', 'Ою-өрнекте шексіздік қайталанатын ырғақ пен үзілмейтін сызық арқылы беріледі.'),
    ] },
    { scene: 'end', lines: [
      L('e1', 'Дала мен аспаннан туған бұл идея ұрпақтан ұрпаққа мәңгі жалғасады.'),
    ] },
  ];
  if (typeof module !== 'undefined') module.exports = SCRIPT; else globalThis.SCRIPT = SCRIPT;
})();
