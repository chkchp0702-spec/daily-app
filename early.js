/* CH Investing — 🔍 11/05 뒤에서 (먼저 읽힘 · defer 아님)
   D14 화면 감시 묶기: 보정 스크립트 20개 남짓이 각자 MutationObserver 로 화면 전체를 지켜봄 → 콜백을 한 프레임(requestAnimationFrame)에 한 번씩 몰아서 부름.
       · 같은 프레임에 생긴 변화는 한꺼번에 · 앱이 뒤로 가 있으면(rAF 멈춤) 아무것도 안 돎 → 버벅임·배터리 줄임 · 다음 그림(paint) 전에 돌아서 깜빡임 없음
   D15 자료 한 곳으로: raw.githubusercontent.com(시황 저장소) 가 막히면(회사망 등) 같은 주소 github.io 의 archive/m/ 사본에서 받음 (tools/mirror.py · mirror.yml 30분마다) */
(function(){
  /* ── D14 ── */
  var MO = window.MutationObserver, RAF = window.requestAnimationFrame;
  if (MO && RAF && !MO.__hub){
    var pend = [], raf = 0, stat = window.__moStat = {obs: 0, calls: 0, frames: 0};
    var flush = function(){
      raf = 0; stat.frames++;
      var p = pend; pend = [];
      for (var i = 0; i < p.length; i++){ var w = p[i], q = w._q; w._q = []; w._in = 0;
        if (q.length){ stat.calls++; try { w._cb.call(w, q, w); } catch(e){ try { console.warn("MO", e); } catch(z) {} } } }
    };
    var Hub = function(cb){
      var self = this; this._cb = cb; this._q = []; this._in = 0; stat.obs++;
      this._o = new MO(function(rs){ for (var i = 0; i < rs.length; i++) self._q.push(rs[i]); if (!self._in){ self._in = 1; pend.push(self); } if (!raf) raf = RAF.call(window, flush); });
    };
    Hub.prototype.observe = function(t, o){ return this._o.observe(t, o); };
    Hub.prototype.disconnect = function(){ this._q = []; return this._o.disconnect(); };
    Hub.prototype.takeRecords = function(){ var r = this._q.concat(this._o.takeRecords()); this._q = []; return r; };
    Hub.__hub = 1; Hub.native = MO;
    window.MutationObserver = Hub;
  }

  /* ── D15 ── */
  var F = window.fetch;
  if (F && !F.__mir){
    var RX = /^https:\/\/raw\.githubusercontent\.com\/chkchp0702-spec\/market-strategy-report\/main\/((?:market|brain|feeds|ledger)\/[^?#]+\.json)/;
    var BAD = 0;   // 한 번 막히면 이번 방문 동안은 바로 사본으로
    var mf = function(input, init){
      var u = typeof input === "string" ? input : (input && input.url) || "", m = RX.exec(u);
      if (!m) return F.apply(this, arguments);
      var alt = "archive/m/" + m[1] + "?" + Math.floor(Date.now() / 300000);
      var viaAlt = function(){ return F.call(window, alt, init).then(function(r){ if (!r.ok) throw new TypeError("mirror " + r.status); return r; }); };
      if (BAD > 1) return viaAlt();
      var self = this, args = arguments;
      return F.apply(self, args).then(function(r){ if (r.ok) return r; return viaAlt().catch(function(){ return r; }); },
        function(err){ BAD++; return viaAlt().catch(function(){ throw err; }); });
    };
    mf.__mir = 1; window.fetch = mf;
  }
})();
