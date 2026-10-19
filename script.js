(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isProducts = document.body.classList.contains('page-products');

  // ---- loader: line-drawn box fills with walnut cookies, then lifts away ----
  var loader = document.getElementById('loader');
  function removeLoader() { if (loader && loader.parentNode) loader.parentNode.removeChild(loader); document.body.classList.remove('loading'); }
  if (loader) {
    if (root.classList.contains('no-loader') || reduce) {
      removeLoader();
    } else {
      document.body.classList.add('loading');
      var start = Date.now(), finished = false;
      var finish = function () {
        if (finished) return; finished = true;
        loader.classList.add('done');
        try { sessionStorage.setItem('seen', '1'); } catch (e) {}
        setTimeout(removeLoader, 800);
      };
      var ready = function () { setTimeout(finish, Math.max(0, 1000 - (Date.now() - start))); };
      if (document.readyState === 'complete') ready(); else window.addEventListener('load', ready);
      setTimeout(finish, 5000);
    }
  }

  // ---- page transition: wipe + box-and-pin GIF between pages ----
  var pt = document.getElementById('pt');
  if (pt) {
    var ptImg = pt.querySelector('.pt-art'), ptLabel = pt.querySelector('.pt-label');
    var norm2 = function (p) { return p.replace(/index\.html$/, '').replace(/\/$/, '') || '/'; };
    // arriving from another page: the overlay is already covering, lift it
    if (root.classList.contains('pt-in')) {
      var lbl = ''; try { lbl = sessionStorage.getItem('ptLabel') || ''; sessionStorage.removeItem('pt'); sessionStorage.removeItem('ptLabel'); } catch (e) {}
      ptLabel.textContent = lbl;
      var lifted = false, t0 = Date.now();
      var lift = function () {
        if (lifted) return; lifted = true;
        pt.classList.add('leave'); root.classList.remove('pt-in');
        setTimeout(function () { pt.classList.remove('leave'); pt.classList.add('gone'); }, 700);
      };
      var go = function () { setTimeout(lift, Math.max(0, 450 - (Date.now() - t0))); };
      if (document.readyState === 'complete') go(); else window.addEventListener('load', go);
      setTimeout(lift, 3000);
    }
    var leaving = false;
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      var u; try { u = new URL(a.href, location.href); } catch (x) { return; }
      if (u.origin !== location.origin || norm2(u.pathname) === norm2(location.pathname)) return;
      if (reduce || leaving || window.innerWidth <= 860) return;   // no delayed transition on phones
      e.preventDefault(); leaving = true;
      var label = (a.querySelector('.brand-name') ? a.querySelector('.brand-name').textContent : a.textContent).replace(/\s+/g, ' ').trim();
      ptLabel.textContent = label.length < 40 ? label : '';
      pt.classList.remove('gone', 'leave');
      ptImg.src = '/img/transition.gif?t=' + Date.now();   // restart the animation
      void pt.offsetWidth;
      pt.classList.add('show');
      nav.classList.remove('open');
      setTimeout(function () {
        try { sessionStorage.setItem('pt', '1'); sessionStorage.setItem('ptLabel', ptLabel.textContent); } catch (x) {}
        location.href = a.href;
      }, 1250);
    });
    window.addEventListener('pageshow', function (e) {   // back button from bfcache
      if (e.persisted) { leaving = false; pt.classList.remove('show'); pt.classList.add('gone'); }
    });
  }

  // ---- mobile nav ----
  var nav = document.getElementById('nav');
  var btn = document.querySelector('.menu-btn');
  btn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') { nav.classList.remove('open'); btn.setAttribute('aria-expanded', false); }
  });

  // ---- language: each language has its own page (/ and /en/); the button switches between them ----
  var lang = root.getAttribute('data-lang') === 'en' ? 'en' : 'ar';
  var COPY = {
    ar: function (y) { return '© ' + y + ' دار الحلويات القوقازية · عمّان، الأردن'; },
    en: function (y) { return '© ' + y + ' Caucasus Sweets Home · Amman, Jordan'; }
  };
  var langBtn = document.getElementById('lang');
  var lbPrev = document.querySelector('.lb-p'), lbNext = document.querySelector('.lb-n');
  function applyLang() {
    langBtn.textContent = lang === 'en' ? 'العربية' : 'English';
    langBtn.lang = lang === 'en' ? 'ar' : 'en';
    var cp = document.getElementById('copy'); if (cp) cp.textContent = COPY[lang](new Date().getFullYear());
    if (lbPrev) { lbPrev.textContent = lang === 'en' ? '‹' : '›'; lbNext.textContent = lang === 'en' ? '›' : '‹'; }
    document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
  }
  langBtn.addEventListener('click', function () {
    var inEn = /^\/en(\/|$)/.test(location.pathname);
    var page = location.pathname.split('/').pop() || 'index.html';
    location.href = (inEn ? '/' : '/en/') + page + location.hash;
  });

  // ---- menu page: filters + product cards ----
  var grid = document.getElementById('grid'), filtersEl = document.getElementById('filters');
  var activeCat = 'all';
  var ORDER_URL = 'https://www.talabat.com/jordan/restaurant/798940/caucasus-sweets-home?aid=4922';
  function money(p, l) {
    return l === 'en' ? 'JD ' + p.toFixed(p % 1 ? 2 : 0)
      : new Intl.NumberFormat('ar-JO', { minimumFractionDigits: p % 1 ? 2 : 0, maximumFractionDigits: 2 }).format(p) + ' د.أ';
  }
  function media(p, l) {
    var imgs = p.imgs || [p.img];
    var tags = imgs.map(function (src) { return '<img src="' + src + '" alt="' + p.name[l] + '" loading="lazy">'; }).join('');
    if (imgs.length < 2) return tags;
    return '<div class="track">' + tags + '</div><div class="dots">' + imgs.map(function (_, i) {
      return '<button type="button" class="dot' + (i ? '' : ' on') + '" data-i="' + i + '" aria-label="' + (i + 1) + '/' + imgs.length + '"></button>';
    }).join('') + '</div>';
  }
  function renderMenu() {
    if (!grid) return;
    var l = lang, cats = window.CATEGORIES, tr = function (a, e) { return l === 'en' ? e : a; };
    filtersEl.innerHTML = cats.map(function (c) {
      return '<button type="button" role="tab" class="chip' + (c.id === activeCat ? ' on' : '') + '" data-c="' + c.id + '" aria-selected="' + (c.id === activeCat) + '">' + c[l] + '</button>';
    }).join('');
    var catName = {}; cats.forEach(function (c) { catName[c.id] = c[l]; });
    var card = function (p) {
      var tags = p.sizes && p.sizes.length
        ? '<ul class="tags">' + p.sizes.map(function (z) {
            return '<li class="tagchip"><span class="t-size">' + z[l] + '</span><b class="t-price">' + money(z.price, l) + '</b>' +
              (z.note ? '<em class="t-note">' + z.note[l] + '</em>' : '') + '</li>';
          }).join('') + '</ul>'
        : '<p class="ask">' + tr('السعر حسب الطلب', 'Price on request') + '</p>';
      return '<article class="mcard"><figure class="frame"><div class="pimg">' + media(p, l) + '</div></figure>' +
        '<div class="mbody"><h3>' + p.name[l] + '</h3><p class="mdesc">' + p.desc[l] + '</p>' +
        '<p class="pair">' + p.pair[l] + '</p>' + tags + '</div></article>';
    };
    grid.innerHTML = cats.filter(function (c) { return c.id !== 'all' && (activeCat === 'all' || c.id === activeCat); }).map(function (c) {
      var list = window.PRODUCTS.filter(function (p) { return p.cat === c.id; });
      return list.length ? '<section class="cat"><header class="cat-head"><h2 class="cat-title">' + c.title[l] + '</h2><p>' + c.sub[l] + '</p></header>' +
        '<div class="menu-list">' + list.map(card).join('') + '</div></section>' : '';
    }).join('');
  }
  if (grid) {
    filtersEl.addEventListener('click', function (e) {
      var b = e.target.closest('.chip'); if (!b) return;
      activeCat = b.getAttribute('data-c'); renderMenu();
    });
    document.addEventListener('langchange', renderMenu);
    grid.addEventListener('scroll', function (e) {
      var t = e.target; if (!t.classList || !t.classList.contains('track')) return;
      var i = Math.round(Math.abs(t.scrollLeft) / t.clientWidth);
      var dots = t.parentNode.querySelectorAll('.dot');
      dots.forEach(function (d, k) { d.classList.toggle('on', k === i); });
    }, true);
    grid.addEventListener('click', function (e) {
      var d = e.target.closest('.dot'); if (!d) return;
      var t = d.parentNode.parentNode.querySelector('.track');
      var i = parseInt(d.getAttribute('data-i'), 10), dir = getComputedStyle(t).direction === 'rtl' ? -1 : 1;
      t.scrollTo({ left: dir * i * t.clientWidth, behavior: 'smooth' });
    });
  }

  applyLang();

  // ---- scroll reveal ----
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .15 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // ---- hero background video: pause when off-screen or reduced motion ----
  var hv = document.querySelector('.hero-bg');
  if (hv) {
    if (reduce) { hv.removeAttribute('autoplay'); hv.pause(); }
    else if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) hv.play().catch(function () {}); else hv.pause(); });
      }, { threshold: .1 }).observe(hv);
    }
  }

  // ---- curved cream ribbons between burgundy and cream sections ----
  var ribbons = document.querySelectorAll('.ribbon');
  if (ribbons.length) {
    var NS = 'http://www.w3.org/2000/svg', BURG = '#6e1f2b';
    var mobile = function () { return window.innerWidth <= 860; };
    var depth = function (size) { var m = mobile(); return size === 'hero' ? (m ? 60 : 90) : size === 'slim' ? (m ? 30 : 42) : (m ? 56 : 84); };
    var buildRibbon = function (el) {
      var up = el.getAttribute('data-dir') === 'up', size = el.getAttribute('data-size');
      var W = document.documentElement.clientWidth, D = depth(size), g = mobile() ? 7 : 9;
      var Hh = D + g + 3;                                          // svg height
      // one broad asymmetric sweep: shallow on the left, deepest at ~64% of the width, easing out on the right
      var P = [[0, .28], [.20, .30], [.40, 1], [.64, 1], [.88, 1], [.90, .52], [1, .46]];
      var pt = function (k, dy) { var y = P[k][1] * D; return (P[k][0] * W).toFixed(1) + ' ' + ((up ? g + 2 + (D - y) : y) + dy).toFixed(1); };
      var edge = function (dy) {
        return 'M' + pt(0, dy) + ' C' + pt(1, dy) + ',' + pt(2, dy) + ',' + pt(3, dy) + ' C' + pt(4, dy) + ',' + pt(5, dy) + ',' + pt(6, dy);
      };
      var fill;
      if (!up) {   // burgundy above the curve, cream (the page honeycomb) below
        fill = 'M0 -2 H' + W + ' V' + pt(6, 0).split(' ')[1] + ' C' + pt(5, 0) + ',' + pt(4, 0) + ',' + pt(3, 0) + ' C' + pt(2, 0) + ',' + pt(1, 0) + ',' + pt(0, 0) + ' Z';
      } else {     // burgundy below the curve, cream (the page honeycomb) above
        fill = edge(0) + ' V' + (Hh + 2) + ' H0 Z';
      }
      var svg = document.createElementNS(NS, 'svg');
      svg.setAttribute('width', W); svg.setAttribute('height', Hh); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + Hh); svg.setAttribute('aria-hidden', 'true');
      svg.style.top = up ? 'auto' : '-1px'; svg.style.bottom = up ? '-3px' : 'auto';
      var f = document.createElementNS(NS, 'path'); f.setAttribute('d', fill); f.setAttribute('fill', BURG);
      var gold = document.createElementNS(NS, 'path'); gold.setAttribute('d', edge(up ? -g : g)); gold.setAttribute('class', 'gold');
      svg.appendChild(f); svg.appendChild(gold);
      el.innerHTML = ''; el.appendChild(svg);
      var L = gold.getTotalLength();
      gold.style.strokeDasharray = L;
      if (el.classList.contains('drawn') || reduce) { gold.style.strokeDashoffset = 0; }
      else { gold.style.strokeDashoffset = L; el._gold = gold; }
    };
    var io2 = ('IntersectionObserver' in window && !reduce) ? new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target; io2.unobserve(el); el.classList.add('drawn');
        var gd = el.querySelector('.gold'); if (gd) { gd.classList.add('go'); void gd.getBoundingClientRect(); gd.style.strokeDashoffset = 0; }
      });
    }, { threshold: 0.05 }) : null;
    var buildAllRibbons = function () { ribbons.forEach(buildRibbon); };
    ribbons.forEach(function (el) { if (io2) io2.observe(el); });
    var rt; var againR = function () { clearTimeout(rt); rt = setTimeout(buildAllRibbons, 120); };
    window.addEventListener('resize', againR);
    window.addEventListener('load', function () { buildAllRibbons(); });
    document.addEventListener('langchange', againR);
    buildAllRibbons();
  }

  // ---- quick order dock: WhatsApp / Call with a branch chooser ----
  var dock = document.getElementById('dock'), cs = document.getElementById('cs');
  if (dock && cs) {
    var BR = [
      { ar: 'المدينة الرياضية', en: 'Sports City', n: '962797181860', d: '07 9718 1860' },
      { ar: 'شارع مكة', en: 'Mecca Street', n: '962796140001', d: '07 9614 0001' }
    ];
    var csT = cs.querySelector('.cs-t'), csL = cs.querySelector('.cs-list');
    var closeCs = function () { cs.classList.remove('open'); setTimeout(function () { cs.hidden = true; }, 220); };
    var openCs = function (act) {
      var l = lang, wa = act === 'wa';
      csT.textContent = wa ? (l === 'en' ? 'Choose a branch to message on WhatsApp' : 'اختر الفرع للمراسلة عبر واتساب')
                           : (l === 'en' ? 'Choose a branch to call' : 'اختر الفرع للاتصال');
      var msg = l === 'en' ? 'Hello, I would like to order from Caucasus Sweets Home' : 'مرحباً، بدّي أطلب من دار الحلويات القوقازية';
      csL.innerHTML = BR.map(function (b) {
        var href = wa ? 'https://wa.me/' + b.n + '?text=' + encodeURIComponent(msg) : 'tel:+' + b.n;
        return '<a class="cs-row" href="' + href + '"' + (wa ? ' target="_blank" rel="noopener"' : '') + '><span class="cs-b">' + b[l] + '</span><span class="cs-n" dir="ltr">' + b.d + '</span></a>';
      }).join('');
      cs.hidden = false; setTimeout(function () { cs.classList.add('open'); }, 20);
    };
    dock.addEventListener('click', function (e) { var b = e.target.closest('[data-act]'); if (b) openCs(b.getAttribute('data-act')); });
    cs.addEventListener('click', function (e) { if (e.target === cs || e.target.classList.contains('cs-x') || e.target.closest('.cs-row')) closeCs(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !cs.hidden) closeCs(); });
  }

  // ---- reels: play on hover (mouse), tap/click or when scrolled into view (touch) ----
  var reels = document.querySelectorAll('.reel');
  var coarse = window.matchMedia && matchMedia('(hover: none)').matches;
  function load(v) { if (!v.getAttribute('src') && v.dataset.src) v.src = v.dataset.src; }
  function play(r) { var v = r.querySelector('video'); load(v); var p = v.play(); if (p) p.catch(function () {}); r.classList.add('playing'); }
  function stop(r) { var v = r.querySelector('video'); v.pause(); r.classList.remove('playing'); }
  reels.forEach(function (r) {
    r.tabIndex = 0;
    r.setAttribute('role', 'button');
    if (!coarse) {
      r.addEventListener('mouseenter', function () { play(r); });
      r.addEventListener('mouseleave', function () { stop(r); });
    }
    r.addEventListener('click', function () { r.classList.contains('playing') ? stop(r) : play(r); });
    r.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); r.classList.contains('playing') ? stop(r) : play(r); }
    });
  });
  if (coarse && !reduce && 'IntersectionObserver' in window) {
    var rio = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) play(e.target); else stop(e.target); });
    }, { threshold: .6 });
    reels.forEach(function (r) { rio.observe(r); });
  }

  // ---- lightbox with smooth slide/fade between photos ----
  var lb = document.getElementById('lb');
  var thumbs = Array.prototype.slice.call(document.querySelectorAll('.g img'));
  if (thumbs.length) {
    var lbImg = lb.querySelector('img'), cur = 0, busy = false;
    var setImg = function (n) { cur = n; lbImg.src = thumbs[n].src; lbImg.alt = thumbs[n].alt; };
    // step: +1 next, -1 previous, 0 = no animation (opening)
    var show = function (i, step) {
      var n = (i + thumbs.length) % thumbs.length;
      if (!step || reduce) { setImg(n); return; }
      if (busy || n === cur) return;
      busy = true;
      var shift = (lang === 'ar' ? 1 : -1) * step * 70;
      var pre = new Image(), ready = false, tries = 0;
      pre.onload = pre.onerror = function () { ready = true; };
      pre.src = thumbs[n].src;
      if (pre.complete) ready = true;
      lbImg.style.transition = 'transform .26s ease-in, opacity .26s ease-in';
      lbImg.style.transform = 'translateX(' + shift + 'px) scale(.96)';
      lbImg.style.opacity = '0';
      var swap = function () {
        if (!ready && tries++ < 40) { setTimeout(swap, 30); return; }
        setImg(n);
        lbImg.style.transition = 'none';
        lbImg.style.transform = 'translateX(' + (-shift) + 'px) scale(.96)';
        void lbImg.offsetWidth;
        lbImg.style.transition = 'transform .4s cubic-bezier(.2,.8,.2,1), opacity .4s ease-out';
        lbImg.style.transform = '';
        lbImg.style.opacity = '1';
        setTimeout(function () { busy = false; }, 400);
      };
      setTimeout(swap, 260);
    };
    var open = function (i) {
      busy = false; lbImg.style.cssText = ''; setImg(i);
      lb.hidden = false; document.body.style.overflow = 'hidden';
      setTimeout(function () { lb.classList.add('open'); }, 30);
    };
    var close = function () {
      lb.classList.remove('open'); document.body.style.overflow = '';
      setTimeout(function () { lb.hidden = true; }, reduce ? 0 : 300);
    };
    document.querySelectorAll('.g').forEach(function (b, i) { b.addEventListener('click', function () { open(i); }); });
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.classList.contains('lb-x')) close();
      var d = e.target.getAttribute && e.target.getAttribute('data-d');
      if (d) { d = parseInt(d, 10); show(cur + d, d); }
    });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      var rtl = lang === 'ar', d = 0;
      if (e.key === 'ArrowLeft') d = rtl ? 1 : -1;
      if (e.key === 'ArrowRight') d = rtl ? -1 : 1;
      if (d) show(cur + d, d);
    });
    // swipe on touch screens
    var tx = null;
    lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (tx === null) return;
      var dx = e.changedTouches[0].clientX - tx; tx = null;
      if (Math.abs(dx) < 50) return;
      var d = (dx < 0 ? 1 : -1) * (lang === 'ar' ? -1 : 1);   // swipe left = next in LTR, previous... mirrored in RTL
      show(cur + d, d);
    }, { passive: true });
  }

  // ---- installable app: offline cache ----
  if ('serviceWorker' in navigator) window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () {}); });
})();
