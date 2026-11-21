/* ============================================================
   渲染与路由引擎
   数据：COURSE / SECTION_TITLES / MODULES / THINKERS / SCHOOLS /
        CONCEPTS / TIMELINE / COMPARISONS
   ============================================================ */
(function () {
  const app = document.getElementById('app');
  const ALL = window.MODULES || {};
  const PARTS = window.COURSE.parts;
  const SEC_TITLES = window.SECTION_TITLES;

  function esc(s) { return String(s == null ? '' : s); }

  function modOf(id) { return ALL[id]; }
  function partOfModule(id) { return PARTS.find(p => p.modules.includes(Number(id))); }

  /* ---------- 路由 ---------- */
  function parseHash() {
    const h = (location.hash || '#/').replace(/^#\/?/, '');
    const parts = h.split('/').filter(Boolean);
    return { view: parts[0] || 'home', id: parts[1] ? decodeURIComponent(parts[1]) : null };
  }

  function navigate() {
    closeDrawer(); closeSearch();
    const r = parseHash();
    let html = '';
    switch (r.view) {
      case 'home': html = viewHome(); break;
      case 'part': html = viewPart(r.id); break;
      case 'module': html = viewModule(r.id); break;
      case 'thinkers': html = viewIndex('thinkers'); break;
      case 'schools': html = viewIndex('schools'); break;
      case 'concepts': html = viewIndex('concepts'); break;
      case 'timeline': html = viewTimeline(); break;
      case 'comparisons': html = viewComparisons(); break;
      default: html = viewHome();
    }
    app.innerHTML = html;
    window.scrollTo(0, 0);
    document.title = pageTitle(r);
    buildDrawer();
  }

  function pageTitle(r) {
    const base = '法律史与法律思想';
    if (r.view === 'module') { const m = modOf(r.id); return (m ? m.title : '模块') + ' · ' + base; }
    if (r.view === 'part') { const p = PARTS.find(x => String(x.id) === String(r.id)); return (p ? p.title : '部分') + ' · ' + base; }
    const map = { thinkers: '思想家索引', schools: '法律学派索引', concepts: '关键概念索引', timeline: '历史时间线', comparisons: '理论比较表' };
    return (map[r.view] || '首页') + ' · ' + base;
  }

  /* ---------- 首页 ---------- */
  function viewHome() {
    const parts = PARTS.map(p => {
      const chips = p.modules.map(mid => {
        const m = window.COURSE.modules.find(x => x.id === mid);
        return `<a href="#/module/${mid}" class="chip">${m ? m.title : mid}</a>`;
      }).join('');
      return `<div class="part-card" data-href="#/part/${p.id}" role="link" tabindex="0">
        <div class="pc-num">${p.roman} · ${p.modules.length} 个模块</div>
        <h3>${p.title}</h3>
        <p>${p.desc}</p>
        <div class="pc-mods">${chips}</div>
      </div>`;
    }).join('');

    return `<div class="wrap">
      <section class="hero">
        <div class="hero-frame">
          <div class="hero-crest">⚖</div>
          <h1>法律史与法律思想</h1>
          <div class="hero-en">History of Law &amp; Legal Thought</div>
          <p class="hero-desc">一套从零开始、系统修习西方法律思想史、法律制度史与现代正义理论的大学课程。以三部经典为根基，沿思想的内在脉络层层展开。</p>
          <p class="hero-desc">从古希腊的自然法追问，到中世纪的法律传统成形；从近代社会契约的革命，到罗尔斯对正义的严密推导——这不是名人列表，而是一条可以走完的思想道路。</p>
          <div class="hero-meta">六大部分 &nbsp;·&nbsp; 十八模块 &nbsp;·&nbsp; 教材级精读讲义</div>
        </div>
      </section>

      <div class="orn-divider"><span>◆</span></div>
      <div class="section-label">课程结构</div>
      <div class="section-sub">点击任一部分查看模块，或直接进入模块阅读</div>
      <div class="part-grid">${parts}</div>

      <div class="orn-divider"><span>◆</span></div>
      <div class="section-label">研习工具</div>
      <div class="section-sub">辅助你把散落的人物与概念连成体系</div>
      <div class="home-links">
        <a href="#/thinkers" class="home-link"><span class="hl-ico">✥</span><div><div class="hl-t">思想家索引</div><div class="hl-d">20+ 人物及其思想脉络</div></div></a>
        <a href="#/schools" class="home-link"><span class="hl-ico">◈</span><div><div class="hl-t">法律学派索引</div><div class="hl-d">从自然法到现实主义</div></div></a>
        <a href="#/concepts" class="home-link"><span class="hl-ico">❖</span><div><div class="hl-t">关键概念索引</div><div class="hl-d">核心术语的准确释义</div></div></a>
        <a href="#/timeline" class="home-link"><span class="hl-ico">⌛</span><div><div class="hl-t">历史时间线</div><div class="hl-d">思想与制度的年代坐标</div></div></a>
        <a href="#/comparisons" class="home-link"><span class="hl-ico">⚖</span><div><div class="hl-t">理论比较表</div><div class="hl-d">分歧背后的根本原因</div></div></a>
        <a href="#/module/14" class="home-link"><span class="hl-ico">✦</span><div><div class="hl-t">从这里精读</div><div class="hl-d">直接进入《正义论》精读</div></div></a>
      </div>
    </div>`;
  }

  /* ---------- 部分概览 ---------- */
  function viewPart(id) {
    const p = PARTS.find(x => String(x.id) === String(id));
    if (!p) return notFound();
    const mods = p.modules.map(mid => {
      const m = window.COURSE.modules.find(x => x.id === mid);
      return `<a href="#/module/${mid}" class="mod-card">
        <div class="mc-top"><span class="mc-num">模块 ${mid}</span><h3>${m.title}</h3></div>
        <p>${m.brief}</p>
        <div class="mc-count">${(ALL[mid] && ALL[mid].sections ? ALL[mid].sections.length : 0) || 10} 个知识单元</div>
      </a>`;
    }).join('');
    return `<div class="wrap">
      <div class="page-head">
        <div class="ph-kicker">${p.roman} · 共 ${p.modules.length} 模块</div>
        <h2>${p.title}</h2>
        <p>${p.desc}</p>
      </div>
      <div class="mod-list">${mods}</div>
      <div class="chapter-nav">
        ${p.id > 1 ? `<a href="#/part/${p.id-1}"><span>← 上一部分</span>${PARTS[p.id-2].title}</a>` : `<a class="disabled"><span>← 上一部分</span>已是开头</a>`}
        ${p.id < PARTS.length ? `<a class="next" href="#/part/${p.id+1}"><span>下一部分 →</span>${PARTS[p.id].title}</a>` : `<a class="next" href="#/module/18"><span>下一部分 →</span>进入末章</a>`}
      </div>
    </div>`;
  }

  /* ---------- 阅读页 ---------- */
  function viewModule(id) {
    const m = modOf(id);
    if (!m) return `<div class="wrap"><div class="page-head"><h2>模块尚未编写</h2><p>该模块内容正在准备中。</p></div><a href="#/" class="chip">返回首页</a></div>`;
    const p = partOfModule(id);
    const secs = m.sections.map((s, i) => `
      <section class="section-block" id="sec-${i}">
        <span class="sec-num">单元 ${String(i+1).padStart(2,'0')} / ${String(m.sections.length).padStart(2,'0')}</span>
        <h2>${s.title}</h2>
        <div class="prose">${s.html}</div>
      </section>`).join('');
    const toc = m.sections.map((s, i) => `<li><a href="#sec-${i}">${String(i+1).padStart(2,'0')} · ${s.title}</a></li>`).join('');
    const tags = (m.tags || []).map(t => `<span class="tag">${t}</span>`).join('');
    const prev = Number(id) > 1 ? Number(id)-1 : null;
    const next = Number(id) < 18 ? Number(id)+1 : null;
    const prevMod = prev ? window.COURSE.modules.find(x=>x.id===prev) : null;
    const nextMod = next ? window.COURSE.modules.find(x=>x.id===next) : null;

    return `<div class="wrap">
      <div class="read-head">
        <div class="read-bread"><a href="#/">首页</a> › <a href="#/part/${p.id}">${p.title}</a> › 模块 ${id}</div>
        <h1>${m.title}</h1>
        <p class="read-lead">${m.lead || ''}</p>
        <div class="read-tags">${tags}</div>
      </div>
      <details class="inline-toc">
        <summary>本页目录 · ${m.sections.length} 个知识单元</summary>
        <ol>${toc}</ol>
      </details>
      ${secs}
      <div class="chapter-nav">
        ${prevMod ? `<a href="#/module/${prev}"><span>← 上一模块</span>${prevMod.title}</a>` : `<a class="disabled"><span>← 上一模块</span>已是开头</a>`}
        ${nextMod ? `<a class="next" href="#/module/${next}"><span>下一模块 →</span>${nextMod.title}</a>` : `<a class="next disabled"><span>下一模块 →</span>已是结尾</a>`}
      </div>
    </div>`;
  }

  /* ---------- 索引页 ---------- */
  function viewIndex(kind) {
    const conf = {
      thinkers: { title: '思想家索引', sub: '按时代排列，每位人物置于其思想争论之中', data: window.THINKERS || [] },
      schools: { title: '法律学派索引', sub: '从自然法到法律现实主义，理解流派间的根本分歧', data: window.SCHOOLS || [] },
      concepts: { title: '关键概念索引', sub: '全课程核心术语的准确释义与出处模块', data: window.CONCEPTS || [] }
    }[kind];
    if (!conf) return notFound();
    let lastGroup = '';
    const entries = conf.data.map(e => {
      let head = '';
      const g = e.group || '';
      if (g !== lastGroup) { lastGroup = g; head = `<div class="index-letter">${g}</div>`; }
      const refs = (e.refs || []).map(mid => `<a href="#/module/${mid}">模块${mid}</a>`).join('');
      const en = e.en ? `<span class="en">${e.en}</span>` : '';
      return head + `<div class="entry">
        <h3>${e.name}${en}</h3>
        ${e.meta ? `<div class="meta">${e.meta}</div>` : ''}
        <p>${e.brief || ''}</p>
        ${refs ? `<div class="refs">详见：${refs}</div>` : ''}
      </div>`;
    }).join('');
    return `<div class="wrap">
      <div class="page-head"><div class="ph-kicker">研习工具</div><h2>${conf.title}</h2><p>${conf.sub}</p></div>
      ${entries || '<p class="res-empty">内容整理中</p>'}
    </div>`;
  }

  /* ---------- 时间线 ---------- */
  function viewTimeline() {
    const data = window.TIMELINE || [];
    let lastEra = '';
    const items = data.map(t => {
      let head = '';
      if (t.era && t.era !== lastEra) { lastEra = t.era; head = `<div class="tl-era">${t.era}</div>`; }
      const ref = t.ref ? `<div class="refs" style="margin-top:6px"><a href="#/module/${t.ref}" style="font-size:12px;color:var(--olive);border-bottom:1px dotted var(--olive)">详见模块${t.ref} →</a></div>` : '';
      return head + `<div class="tl-item">
        <div class="tl-year">${t.year}</div>
        <div class="tl-title">${t.title}</div>
        <div class="tl-desc">${t.desc || ''}</div>${ref}
      </div>`;
    }).join('');
    return `<div class="wrap">
      <div class="page-head"><div class="ph-kicker">研习工具</div><h2>历史时间线</h2><p>把思想与制度放回它们的年代坐标。年代为约数者以「约」标注。</p></div>
      <div class="timeline">${items}</div>
    </div>`;
  }

  /* ---------- 比较表 ---------- */
  function viewComparisons() {
    const data = window.COMPARISONS || [];
    const blocks = data.map(c => `<div class="compare-caption">${c.title}</div>
      <div class="compare-table-wrap"><div class="compare-wrap"><table class="compare-table">
        <thead><tr><th>比较维度</th>${(c.cols||[]).map(x=>`<th>${x}</th>`).join('')}</tr></thead>
        <tbody>${(c.rows||[]).map(row=>`<tr><th>${row[0]}</th>${row.slice(1).map(cell=>`<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody>
      </table></div></div>
      ${c.note ? `<div class="compare-note">${c.note}</div>` : ''}
      ${(c.refs||[]).length ? `<div class="refs" style="margin:8px 0 0">延伸阅读：${c.refs.map(m=>`<a href="#/module/${m}" style="color:var(--olive);border-bottom:1px dotted var(--olive);margin-right:8px;font-size:12px">模块${m}</a>`).join('')}</div>` : ''}
    `).join('');
    return `<div class="wrap">
      <div class="page-head"><div class="ph-kicker">研习工具</div><h2>理论比较表</h2><p>比较不只是列异同，更要解释分歧背后的根本原因。表格可在手机上横向滑动。</p></div>
      ${blocks}
    </div>`;
  }

  function notFound() { return `<div class="wrap"><div class="page-head"><h2>未找到内容</h2><p><a href="#/">返回首页</a></p></div></div>`; }

  /* ---------- 抽屉目录 ---------- */
  function buildDrawer() {
    const nav = document.getElementById('drawerNav');
    const cur = parseHash();
    nav.innerHTML = PARTS.map(p => {
      const isCur = cur.view === 'part' && String(cur.id) === String(p.id) ||
                    cur.view === 'module' && p.modules.includes(Number(cur.id));
      const links = p.modules.map(mid => {
        const m = window.COURSE.modules.find(x => x.id === mid);
        const active = cur.view === 'module' && String(cur.id) === String(mid);
        return `<a href="#/module/${mid}" class="${active?'active':''}" data-close>${mid}. ${m ? m.title : ''}</a>`;
      }).join('');
      return `<div class="drawer-nav-group">
        <button class="drawer-part ${isCur?'open':''}"><span class="pn">${p.id}</span><span>${p.title}</span><span class="caret">▶</span></button>
        <div class="drawer-mods ${isCur?'open':''}">${links}</div>
      </div>`;
    }).join('');
    nav.querySelectorAll('.drawer-part').forEach(btn => {
      btn.addEventListener('click', () => {
        btn.classList.toggle('open');
        btn.nextElementSibling.classList.toggle('open');
      });
    });
  }
  function openDrawer() { document.getElementById('drawer').classList.add('show'); document.getElementById('overlay').classList.add('show'); }
  function closeDrawer() { document.getElementById('drawer').classList.remove('show'); document.getElementById('overlay').classList.remove('show'); }
  function closeSearch() { document.getElementById('searchPanel').classList.remove('show'); document.getElementById('searchPanel').setAttribute('aria-hidden','true'); }

  /* ---------- 搜索 ---------- */
  let SEARCH_INDEX = null;
  function stripHtml(h) { const d = document.createElement('div'); d.innerHTML = h; return d.textContent || ''; }
  function buildIndex() {
    if (SEARCH_INDEX) return;
    const idx = [];
    // 模块正文
    Object.keys(ALL).forEach(id => {
      const m = ALL[id];
      m.sections.forEach(s => {
        const text = stripHtml(s.html);
        idx.push({ type: '模块 ' + id, title: m.title + ' · ' + s.title, text, href: '#/module/' + id });
      });
    });
    // 索引条目
    [['THINKERS','思想家'],['SCHOOLS','学派'],['CONCEPTS','概念']].forEach(([k,label]) => {
      (window[k]||[]).forEach(e => idx.push({ type: label, title: e.name, text: (e.brief||'')+' '+(e.en||''), href: '#' + ({THINKERS:'/thinkers',SCHOOLS:'/schools',CONCEPTS:'/concepts'}[k]) }));
    });
    (window.TIMELINE||[]).forEach(t => idx.push({ type: '事件', title: t.year + ' · ' + t.title, text: t.desc||'', href: '#/timeline' }));
    SEARCH_INDEX = idx;
  }
  function doSearch(q) {
    const box = document.getElementById('searchResults');
    q = (q||'').trim().toLowerCase();
    if (!q) { box.innerHTML = '<div class="res-empty">请输入关键词</div>'; return; }
    buildIndex();
    const terms = q.split(/\s+/);
    const hits = SEARCH_INDEX.filter(it => {
      const hay = (it.title + ' ' + it.text).toLowerCase();
      return terms.every(t => hay.includes(t));
    }).slice(0, 40);
    if (!hits.length) { box.innerHTML = '<div class="res-empty">没有找到相关内容，换个词试试</div>'; return; }
    box.innerHTML = `<div class="res-empty" style="text-align:left;padding:6px 2px 10px;color:var(--gold)">找到 ${hits.length} 条结果</div>` + hits.map(h => {
      const pos = h.text.toLowerCase().indexOf(terms[0]);
      const snip = pos >= 0 ? '…' + h.text.slice(Math.max(0,pos-20), pos+60) + '…' : h.text.slice(0,80);
      return `<a href="${h.href}" class="res-item" data-close><div class="res-type">${h.type}</div><div class="res-title">${h.title}</div><div class="res-snippet">${snip}</div></a>`;
    }).join('');
  }
  function openSearch() {
    const panel = document.getElementById('searchPanel');
    panel.classList.add('show'); panel.setAttribute('aria-hidden','false');
    setTimeout(()=>document.getElementById('searchInput').focus(), 120);
  }

  /* ---------- 事件绑定 ---------- */
  document.getElementById('menuBtn').addEventListener('click', openDrawer);
  document.getElementById('drawerClose').addEventListener('click', closeDrawer);
  document.getElementById('overlay').addEventListener('click', closeDrawer);
  document.getElementById('searchBtn').addEventListener('click', openSearch);
  document.getElementById('searchClose').addEventListener('click', closeSearch);
  document.getElementById('searchInput').addEventListener('input', e => doSearch(e.target.value));
  document.addEventListener('click', e => {
    if (e.target.closest('[data-close]')) { closeDrawer(); closeSearch(); }
    // 首页部分卡片点击（避开卡片内的模块 chip 链接）
    const card = e.target.closest('.part-card');
    if (card && !e.target.closest('.chip')) {
      location.hash = card.getAttribute('data-href');
    }
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeDrawer(); closeSearch(); } });
  window.addEventListener('hashchange', navigate);

  // 页内锚点滚动补偿
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#sec-"]');
    if (a) {
      const el = document.querySelector(a.getAttribute('href'));
      if (el) { e.preventDefault(); el.scrollIntoView({behavior:'smooth', block:'start'}); }
    }
  });

  navigate();
})();
