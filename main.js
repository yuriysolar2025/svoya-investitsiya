(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rub = n => Math.round(n).toLocaleString('ru-RU').replace(/ /g, ' ') + ' ₽';

  // Расчёт на сумму инвестора
  const sum = $('#c-sum'), profit = $('#c-profit'), share = $('#c-share'), stress = $('#c-stress');
  function calc() {
    const s = +sum.value, p = +profit.value * (stress.checked ? 0.7 : 1), k = +share.value / 100;
    const month = p * k, back = s / month, year = month * 12 / s * 100;
    $('#o-sum').textContent = rub(s);
    $('#o-profit').textContent = rub(+profit.value);
    $('#o-share').textContent = share.value + '%';
    $('#r-month').textContent = rub(month);
    $('#r-back').textContent = Math.ceil(back) + ' мес';
    $('#r-year').textContent = year.toLocaleString('ru-RU', { maximumFractionDigits: 1 }) + '%';
    $('#r-broker').textContent = 'до ' + rub(s * 0.1);
    const text = `Хочу обсудить расчёт: нужно ${rub(s)}, прибыль ${rub(+profit.value)} в месяц, инвестору ${share.value}%.`;
    $('#calc-send').href = 'https://t.me/yuriy_solar?text=' + encodeURIComponent(text);
  }
  [sum, profit, share, stress].forEach(el => el.addEventListener('input', calc));
  calc();

  // Список возражений
  const items = $$('#cmd-list li');
  const select = li => items.forEach(x => {
    const on = x === li;
    x.classList.toggle('on', on);
    $('button', x).setAttribute('aria-expanded', on);
  });
  const visible = () => items.filter(x => !x.hidden);
  items.forEach(li => {
    const b = $('button', li);
    b.addEventListener('click', () => select(li));
    if (matchMedia('(hover: hover)').matches) li.addEventListener('mouseenter', () => select(li));
    b.addEventListener('keydown', e => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      const v = visible(), i = v.indexOf(li) + (e.key === 'ArrowDown' ? 1 : -1);
      const next = v[(i + v.length) % v.length];
      select(next);
      $('button', next).focus();
    });
  });
  const q = $('#cmd-q');
  q.addEventListener('input', () => {
    const t = q.value.trim().toLowerCase();
    items.forEach(li => { li.hidden = !li.textContent.toLowerCase().includes(t); });
    const v = visible();
    $('#cmd-empty').hidden = v.length > 0;
    if (v.length && !v.some(x => x.classList.contains('on'))) select(v[0]);
  });
  q.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown' && visible().length) { e.preventDefault(); $('button', visible()[0]).focus(); }
  });

  // Четыре недели
  const week = $('#week'), panels = $$('.panel'), names = $$('.scrub-names li');
  function showWeek() {
    panels.forEach((p, i) => p.classList.toggle('on', i === +week.value));
    names.forEach((n, i) => n.classList.toggle('on', i === +week.value));
    week.setAttribute('aria-valuetext', 'Неделя ' + (+week.value + 1));
  }
  week.addEventListener('input', showWeek);
  showWeek();

  // Вопросы
  const fItems = $$('#faq-list li'), pane = $('#faq-pane');
  function selectFaq(li) {
    fItems.forEach(x => {
      const on = x === li;
      x.classList.toggle('on', on);
      $('button', x).setAttribute('aria-expanded', on);
    });
    pane.textContent = $('.ans', li).textContent;
    pane.classList.remove('swap');
    void pane.offsetWidth;
    pane.classList.add('swap');
  }
  fItems.forEach(li => {
    const b = $('button', li);
    b.addEventListener('click', () => selectFaq(li));
    b.addEventListener('focus', () => { if (innerWidth > 900) selectFaq(li); });
    if (matchMedia('(hover: hover)').matches) li.addEventListener('mouseenter', () => selectFaq(li));
  });
  pane.textContent = $('.ans', fItems[0]).textContent;

  // Смена картинок
  const caps = [
    'Рембрандт, 1662. Синдики проверяют счётную книгу. Вопрос «покажите цифры» старше банков.',
    'Расписка Ост-Индской компании, 1606, и записи выплат. Инвестор и тогда хотел видеть, что он получил.',
    'Рисовые террасы, Восточный Бали. На этом острове я привлекал частные деньги в свои виллы.'
  ];
  const pics = $$('#fade img'), cap = $('#fade-cap');
  let cur = 0, timer;
  const tick = () => {
    pics[cur].classList.remove('on');
    cur = (cur + 1) % pics.length;
    pics[cur].classList.add('on');
    cap.textContent = caps[cur];
  };
  const run = () => { if (!reduced) timer = setInterval(tick, 7000); };
  document.addEventListener('visibilitychange', () => { clearInterval(timer); if (!document.hidden) run(); });
  pics.forEach(p => { p.loading = 'eager'; });
  run();

  // Появление разделов
  const rev = $$('.reveal');
  const groups = new Map();
  rev.forEach(el => {
    const key = el.closest('section') || document.body;
    const n = groups.get(key) || 0;
    el.style.setProperty('--d', Math.min(n * 80, 320) + 'ms');
    groups.set(key, n + 1);
  });
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -8% 0px' });
    rev.forEach(el => io.observe(el));
  } else rev.forEach(el => el.classList.add('in'));
})();
