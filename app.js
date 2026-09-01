/* =========================================================
   app.js : rendu commun. Normalement rien à modifier ici.
   ========================================================= */
(function () {
  var C = window.CONFIG;

  /* --- couleurs depuis config --- */
  var r = document.documentElement.style;
  r.setProperty('--primary', C.theme.primary);
  r.setProperty('--primary-deep', C.theme.primaryDeep);
  r.setProperty('--gold', C.theme.gold);
  r.setProperty('--paper', C.theme.paper);

  /* --- titre / meta --- */
  document.title = C.org.fullName;
  var md = document.querySelector('meta[name="description"]');
  if (md) md.setAttribute('content', C.org.metaDescription || C.org.fullName);
  var tc = document.querySelector('meta[name="theme-color"]');
  if (tc) tc.setAttribute('content', C.theme.primary);

  var ICONS = {
    home: '<svg viewBox="0 0 24 24"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.6V21h14V9.6"/></svg>',
    activities: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 11h18"/></svg>',
    supporters: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.3-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.7-7 9-7 9z"/></svg>',
    donate: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v10M9.5 9.8c0-1.2 1.1-1.9 2.5-1.9s2.5.7 2.5 1.9-1.1 1.7-2.5 2.1-2.5.9-2.5 2.1 1.1 1.9 2.5 1.9 2.5-.7 2.5-1.9"/></svg>',
    ages: '<svg viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-8M22 20H2"/></svg>'
  };

  var PAGES = [
    { key: 'home',       href: 'index.html' },
    { key: 'activities', href: 'activities.html' },
    { key: 'supporters', href: 'supporters.html' },
    { key: 'donate',     href: 'donate.html' },
    { key: 'ages',       href: 'ages.html' }
  ];

  /* --- en-tête + navigation --- */
  window.renderChrome = function (active, opts) {
    opts = opts || {};
    if (!opts.hideTopbar) {
      var bar = document.createElement('header');
      bar.className = 'topbar';
      bar.innerHTML =
        '<a href="index.html" style="display:flex;align-items:center;gap:12px">' +
        '<img src="logo.svg" alt="' + C.org.fullName + '">' +
        '<span class="name">' + C.org.shortName + '</span></a>';
      document.body.insertBefore(bar, document.body.firstChild);
    }

    var nav = document.createElement('nav');
    nav.className = 'bottomnav';
    nav.innerHTML = '<ul>' + PAGES.map(function (p) {
      return '<li><a href="' + p.href + '"' +
        (p.key === active ? ' aria-current="page"' : '') + '>' +
        ICONS[p.key] + '<span>' + C.nav[p.key] + '</span></a></li>';
    }).join('') + '</ul>';
    document.body.appendChild(nav);
  };

  /* --- utilitaires --- */
  function num(n) { return (n || 0).toLocaleString('en-US'); }
  function pct(a, b) { return b > 0 ? Math.round((a / b) * 100) : 0; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function empty(title, hint) {
    return '<div class="empty"><h3>' + title + '</h3>' +
      (hint ? '<p>' + hint + '</p>' : '') + '</div>';
  }
  window.T = { num: num, pct: pct, esc: esc, empty: empty };


  /* ================= chargement des données ================= */
  var loaded = null;

  window.loadData = function (done) {
    var url = (C.api && C.api.url) || '';
    if (!url) { done(false); return; }
    if (loaded) { done(true); return; }
    fetch(url + (url.indexOf('?') > -1 ? '&' : '?') + 'action=stats', { method: 'GET' })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || !d.ok) throw new Error('bad payload');
        if (typeof d.total === 'number') C.total = d.total;
        if (d.ages) C.ages = d.ages;
        if (d.activities) C.activities = d.activities;
        if (d.supporters) C.supporters = d.supporters;
        loaded = true;
        done(true);
      })
      .catch(function () { done(false, true); });
  };

  window.boot = function (render, active, opts) {
    renderChrome(active, opts);
    var mount = document.getElementById('app');
    if (!mount) return;
    if (!(C.api && C.api.url)) { render(mount); return; }
    mount.innerHTML = '<div class="empty"><h3>جارٍ التحميل…</h3></div>';
    loadData(function (ok, failed) {
      render(mount);
      if (failed) {
        var w = document.createElement('p');
        w.className = 'form-note';
        w.textContent = 'تعذر تحميل البيانات من الخادم. تحقق من الاتصال أو من رابط api.url.';
        mount.appendChild(w);
      }
    });
  };

  /* ================= الأعصار ================= */
  window.renderAges = function (mount) {
    var ages = C.ages || [];
    var sorts = [
      { key: 'ratio',    label: 'نسبة المنتسبين' },
      { key: 'members',  label: 'عدد المنتسبين' },
      { key: 'accRatio', label: 'نسبة الحسابات' },
      { key: 'accounts', label: 'عدد الحسابات' },
      { key: 'target',   label: 'العدد الإجمالي' }
    ];
    var current = 'ratio';

    var totalMembers = (typeof C.total === 'number')
      ? C.total
      : ages.reduce(function (s, a) { return s + (a.members || 0); }, 0);

    var head =
      '<div class="stat"><div class="big">' + num(totalMembers) + '</div>' +
      '<div class="label">' + (ages.length ? 'منتسباً في ' + num(ages.length) + ' عصراً' : 'منتسباً') + '</div></div>';

    var chips = '<div class="chips-label">الترتيب حسب</div><div class="chips" id="sorts">' +
      sorts.map(function (s) {
        return '<button class="chip" data-k="' + s.key + '" aria-pressed="' +
          (s.key === current) + '">' + s.label + '</button>';
      }).join('') + '</div>';

    mount.innerHTML =
      '<h1 class="page-title">' + C.nav.ages + '</h1>' +
      '<p class="page-sub">' + C.org.shortName + '</p>' +
      head + (ages.length ? chips : '') + '<div id="list"></div>';

    function draw() {
      var list = document.getElementById('list');
      if (!ages.length) {
        list.innerHTML = empty('لا توجد أعصار بعد');
        return;
      }
      var rows = ages.slice().sort(function (a, b) {
        if (current === 'ratio') return pct(b.members, b.target) - pct(a.members, a.target);
        if (current === 'accRatio') return pct(b.accounts, b.target) - pct(a.accounts, a.target);
        return (b[current] || 0) - (a[current] || 0);
      });

      list.innerHTML = rows.map(function (a, i) {
        var p = pct(a.members, a.target);
        return '<div class="rank' + (i < 3 ? ' top' : '') + '">' +
          '<div class="pos">' + (i + 1) + '</div>' +
          '<div><div class="title">' + esc(a.name) + '</div>' +
          '<div class="bar"><span style="width:' + p + '%"></span></div>' +
          '<div class="meta">نسبة الانتساب ' + p + '٪' +
          (a.accounts ? ' · ' + num(a.accounts) + ' حساباً على التطبيق' : '') + '</div></div>' +
          '<div class="count">' + num(a.members) + ' / ' + num(a.target) + '</div>' +
          '</div>';
      }).join('');
    }

    var sortBox = document.getElementById('sorts');
    if (sortBox) {
      sortBox.addEventListener('click', function (e) {
        var b = e.target.closest('.chip'); if (!b) return;
        current = b.dataset.k;
        [].forEach.call(sortBox.children, function (c) {
          c.setAttribute('aria-pressed', c === b);
        });
        draw();
      });
    }
    draw();
  };

  /* ================= الأنشطة ================= */
  window.renderActivities = function (mount) {
    var acts = C.activities || [];
    var labels = { upcoming: 'قادم', running: 'جارٍ الآن', ended: 'انتهى' };
    mount.innerHTML =
      '<h1 class="page-title">' + C.nav.activities + '</h1>' +
      '<p class="page-sub">' + C.org.shortName + '</p>' +
      (acts.length ? acts.map(function (a) {
        var tag = labels[a.status] ? '<span class="tag ' + a.status + '">' + labels[a.status] + '</span>' : '';
        var thumb = a.image
          ? '<div class="thumb"><img src="' + esc(a.image) + '" alt="' + esc(a.title) + '"></div>'
          : '<div class="thumb"><img class="ph" src="logo.svg" alt=""></div>';
        var open = a.link ? '<a class="activity" href="' + esc(a.link) + '">' : '<div class="activity">';
        var close = a.link ? '</a>' : '</div>';
        return open + thumb + '<div class="body"><h3>' + esc(a.title) + '</h3>' +
          (a.date ? '<p>' + esc(a.date) + '</p>' : '') +
          (a.description ? '<p>' + esc(a.description) + '</p>' : '') +
          tag + '</div>' + close;
      }).join('')
        : empty('لا توجد أنشطة بعد'));
  };

  /* ================= الداعمون ================= */
  window.renderSupporters = function (mount) {
    var sup = (C.supporters || []).slice().sort(function (a, b) {
      return (b.amount || 0) - (a.amount || 0);
    });
    mount.innerHTML =
      '<h1 class="page-title">' + C.nav.supporters + '</h1>' +
      '<p class="page-sub">' + C.org.shortName + '</p>' +
      (sup.length ? sup.map(function (s, i) {
        return '<div class="rank' + (i < 3 ? ' top' : '') + '">' +
          '<div class="pos">' + (i + 1) + '</div>' +
          '<div><div class="title">' + esc(s.name) + '</div>' +
          (s.note ? '<div class="meta">' + esc(s.note) + '</div>' : '') + '</div>' +
          '<div class="count">' + (s.amount ? num(s.amount) + ' ' + C.donation.currency : '') + '</div>' +
          '</div>';
      }).join('')
        : empty('لا يوجد داعمون بعد'));
  };

  /* ================= ادعم ================= */
  window.renderDonate = function (mount) {
    var d = C.donation || {};
    if (!d.enabled) {
      mount.innerHTML = '<h1 class="page-title">' + C.nav.donate + '</h1>' +
        empty('باب الدعم مغلق حالياً');
      return;
    }
    var goal = '';
    if (d.goal > 0) {
      var p = pct(d.raised, d.goal);
      goal = '<div class="card"><div style="display:flex;justify-content:space-between;font-size:14px">' +
        '<span>' + num(d.raised) + ' ' + d.currency + '</span>' +
        '<span style="color:var(--muted)">الهدف ' + num(d.goal) + ' ' + d.currency + '</span></div>' +
        '<div class="bar"><span style="width:' + p + '%"></span></div></div>';
    }
    var methods = (d.methods || []).length
      ? '<div class="card">' + d.methods.map(function (m) {
          return '<div class="method"><span>' + esc(m.label) + '</span>' +
            '<span class="val">' + esc(m.value) + '</span>' +
            '<button class="copy" data-v="' + esc(m.value) + '">نسخ</button></div>';
        }).join('') + '</div>'
      : empty('لا توجد وسائل دعم بعد');

    mount.innerHTML =
      '<h1 class="page-title">' + C.nav.donate + '</h1>' +
      '<p class="page-sub">' + C.org.shortName + '</p>' +
      goal + methods +
      (d.note ? '<p class="form-note">' + esc(d.note) + '</p>' : '');

    mount.addEventListener('click', function (e) {
      var b = e.target.closest('.copy'); if (!b) return;
      navigator.clipboard.writeText(b.dataset.v).then(function () {
        var t = b.textContent; b.textContent = 'تم النسخ';
        setTimeout(function () { b.textContent = t; }, 1500);
      });
    });
  };

  /* ================= الاستمارة ================= */
  window.renderForm = function (mount) {
    var reg = C.registration || {};
    if (reg.mode === 'closed') {
      mount.innerHTML = '<h1 class="page-title">استمارة الانضمام</h1>' +
        empty('التسجيل مغلق حالياً');
      return;
    }
    var opts = (C.ages || []).map(function (a) {
      return '<option>' + esc(a.name) + '</option>';
    }).join('');

    mount.innerHTML =
      '<h1 class="page-title">استمارة الانضمام</h1>' +
      '<p class="page-sub">املأ البيانات ثم أرسلها</p>' +
      '<div class="card">' +
      '<div class="field"><label for="f1">الاسم الكامل</label><input id="f1" required></div>' +
      '<div class="field"><label for="f2">رقم الهاتف</label><input id="f2" type="tel" inputmode="tel" required></div>' +
      (opts ? '<div class="field"><label for="f3">العصر</label><select id="f3"><option value="">اختر</option>' + opts + '</select></div>' : '') +
      '<div class="field"><label for="f4">سنة الميلاد</label><input id="f4" inputmode="numeric"></div>' +
      '<div class="field"><label for="f5">المهنة أو الدراسة</label><input id="f5"></div>' +
      '<div class="field"><label for="f6">ملاحظات</label><textarea id="f6" rows="3"></textarea></div>' +
      '<button class="btn btn-primary" id="send">إرسال</button>' +
      '<p class="form-note" id="msg"></p>' +
      '</div>';

    document.getElementById('send').addEventListener('click', function () {
      var v = function (id) { var e = document.getElementById(id); return e ? e.value.trim() : ''; };
      var msg = document.getElementById('msg');
      if (!v('f1') || !v('f2')) { msg.textContent = 'الاسم ورقم الهاتف مطلوبان.'; return; }

      var payload = {
        'الاسم': v('f1'), 'الهاتف': v('f2'), 'العصر': v('f3'),
        'سنة الميلاد': v('f4'), 'المهنة': v('f5'), 'ملاحظات': v('f6')
      };

      if (reg.mode === 'sheets' && C.api && C.api.url) {
        msg.textContent = 'جارٍ الإرسال…';
        document.getElementById('send').disabled = true;
        fetch(C.api.url, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'join', data: payload })
        }).then(function (r) { return r.json(); })
          .then(function (d) {
            document.getElementById('send').disabled = false;
            if (d && d.ok) {
              msg.textContent = d.approved
                ? 'تم تسجيلك. سيظهر اسمك في العدّاد خلال لحظات.'
                : 'تم استلام طلبك، في انتظار المصادقة.';
              ['f1','f2','f4','f5','f6'].forEach(function (id) {
                var el = document.getElementById(id); if (el) el.value = '';
              });
            } else {
              msg.textContent = (d && d.error) || 'تعذر الإرسال. حاول مرة أخرى.';
            }
          }).catch(function () {
            document.getElementById('send').disabled = false;
            msg.textContent = 'تعذر الإرسال. تحقق من الاتصال.';
          });
        return;
      }

      if (reg.mode === 'formspree' && reg.formspreeEndpoint) {
        msg.textContent = 'جارٍ الإرسال…';
        fetch(reg.formspreeEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        }).then(function (res) {
          msg.textContent = res.ok ? 'تم استلام طلبك.' : 'تعذر الإرسال. حاول مرة أخرى.';
        }).catch(function () { msg.textContent = 'تعذر الإرسال. تحقق من الاتصال.'; });
        return;
      }

      if (reg.mode === 'whatsapp' && C.contact.whatsapp) {
        var text = 'طلب انضمام : ' + C.org.fullName + '\n' +
          Object.keys(payload).filter(function (k) { return payload[k]; })
            .map(function (k) { return k + ': ' + payload[k]; }).join('\n');
        window.open('https://wa.me/' + C.contact.whatsapp + '?text=' + encodeURIComponent(text), '_blank');
        return;
      }

      msg.textContent = 'لم يتم ضبط وسيلة الاستقبال بعد (api.url أو whatsapp في config.js).';
    });
  };
})();
