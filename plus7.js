/* CH Investing — 💬 의견함
   이름 · 건의 · 사진/파일 → 휴대폰에서 바로 암호화(AES-GCM, 열쇠는 RSA 공개키로 잠금) → ntfy 비밀 주제 → 서버가 매시간 모아 저장.
   저장소에는 암호문만 남고, 운영자 비밀번호(개인키 잠금 해제)를 넣은 휴대폰에서만 내용을 볼 수 있다. */
(function(){
  var e = V.e;
  var TOPIC = "chkchp-ch-idea-x7m2q", NT = "https://ntfy.sh/";
  var PUB = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAjgbxbM4W4aVEYiKkghweZsDsfWvpXZPhwoW6hDgMYIzA6ZVfd0Fyw5Tyrfw9meAcvJ000JYMTF14eepeCx2nWf2ofjgYFtBiCr/KW/vWfv4t7QkF7U0h4bJSMdUgtOQuAjE18Q+pgs3yjsNbTCVTuHXp8rlw20JNd1UQmJJoyaCKQxicMaSTvf6MXAQAw7wDPTFuYzSEJDUV4a6rHSSkTHZQiAKRS0aVWervR1KolRFfpit/fuwyDv8JbeeGITucWTNqEltBYY1IDVWOvkYg7kg4ZqkQyrIGhAG3bDvsQPNh43MPb73CFlmZXupcMaTq3Et2+Or9yMyEcvKtlPAK/QIDAQAB";
  var MAXF = 5, MAXB = 14 * 1024 * 1024;
  var picked = [], C = window.crypto && window.crypto.subtle;
  function b64(buf){ var s = "", a = new Uint8Array(buf); for (var i = 0; i < a.length; i += 0x8000) s += String.fromCharCode.apply(null, a.subarray(i, i + 0x8000)); return btoa(s); }
  function ub64(s){ var b = atob(s), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; }
  var TE = new TextEncoder(), TD = new TextDecoder();
  function kb(n){ return n > 1048576 ? (n / 1048576).toFixed(1) + "MB" : Math.max(1, Math.round(n / 1024)) + "KB"; }
  function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function now(){ var d = new Date(), p = function(n){ return (n < 10 ? "0" : "") + n; }; return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes()); }
  // 사진은 긴 변 1600px JPEG 로 줄여서 보냄
  function shrink(f){
    return new Promise(function(res){
      if (!/^image\/(jpeg|png|webp|heic|heif)/i.test(f.type) || f.size < 400 * 1024) return res(f);
      var img = new Image(), url = URL.createObjectURL(f);
      img.onload = function(){
        var s = Math.min(1, 1600 / Math.max(img.width, img.height)), c = document.createElement("canvas");
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        c.toBlob(function(b){ URL.revokeObjectURL(url); res(b && b.size < f.size ? new File([b], f.name.replace(/\.\w+$/, "") + ".jpg", {type: "image/jpeg"}) : f); }, "image/jpeg", 0.82);
      };
      img.onerror = function(){ URL.revokeObjectURL(url); res(f); };
      img.src = url;
    });
  }
  // ---------- 암호화 ----------
  function newKey(){ return C.generateKey({name: "AES-GCM", length: 256}, true, ["encrypt", "decrypt"]); }
  function enc(key, bytes){ var iv = crypto.getRandomValues(new Uint8Array(12)); return C.encrypt({name: "AES-GCM", iv: iv}, key, bytes).then(function(ct){ return {iv: b64(iv), ct: ct}; }); }
  function wrap(key){
    return C.importKey("spki", ub64(PUB), {name: "RSA-OAEP", hash: "SHA-256"}, false, ["encrypt"]).then(function(pk){
      return C.exportKey("raw", key).then(function(raw){ return C.encrypt({name: "RSA-OAEP"}, pk, raw); });
    }).then(b64);
  }
  // ---------- 보내기 ----------
  function drawPicked(){
    var box = $("idfiles"); if (!box) return;
    box.innerHTML = picked.map(function(f, i){
      var th = /^image\//.test(f.type) ? '<img src="' + URL.createObjectURL(f) + '">' : '<span class="id-fi">📄</span>';
      return '<div class="id-f">' + th + '<small>' + e(f.name) + '<br>' + kb(f.size) + '</small><button data-i="' + i + '" aria-label="빼기">✕</button></div>';
    }).join("");
    [].forEach.call(box.querySelectorAll("button"), function(b){ b.onclick = function(){ picked.splice(+b.dataset.i, 1); drawPicked(); }; });
  }
  function status(t, cls){ var s = $("idst"); if (s){ s.className = "id-st " + (cls || ""); s.innerHTML = t; } }
  function send(){
    var name = ($("idname").value || "").trim(), text = ($("idtext").value || "").trim();
    if (!text){ status("건의 내용을 적어 주세요.", "bad"); $("idtext").focus(); return; }
    if (!C){ status("이 브라우저는 암호화를 지원하지 않아요. 사파리·크롬 최신 버전에서 열어 주세요.", "bad"); return; }
    store.idname = name; save();
    var id = uid(), btn = $("idsend"), K, files = picked.slice(); btn.disabled = true;
    status("🔒 암호화해서 보내는 중…");
    var chain = newKey().then(function(k){ K = k; return Promise.all([wrap(K), enc(K, TE.encode(JSON.stringify({name: name, text: text, t: now()})))]); }).then(function(r){
      var msg = JSON.stringify({kind: "idea", id: id, n: files.length, k: r[0], iv: r[1].iv, ct: b64(r[1].ct)});
      return fetch(NT, {method: "POST", body: JSON.stringify({topic: TOPIC, title: "💬 새 의견", tags: ["lock"], message: msg})}).then(function(x){ if (!x.ok) throw new Error("글 " + x.status); });
    });
    var done = 0;
    files.forEach(function(f, i){
      chain = chain.then(function(){ return shrink(f); }).then(function(g){
        if (g.size > MAXB) throw new Error(g.name + " 이(가) 너무 커요 (14MB 까지)");
        return g.arrayBuffer().then(function(buf){ return Promise.all([enc(K, buf), enc(K, TE.encode(JSON.stringify({name: g.name, type: g.type})))]); }).then(function(r){
          var q = "?filename=" + (i + 1) + ".bin&message=" + encodeURIComponent(JSON.stringify({kind: "idea-file", id: id, i: i + 1, iv: r[0].iv, miv: r[1].iv, meta: b64(r[1].ct)}));
          return fetch(NT + TOPIC + q, {method: "PUT", body: new Blob([r[0].ct], {type: "application/octet-stream"})}).then(function(x){ if (!x.ok) throw new Error("첨부 " + x.status); done++; status("🔒 첨부 보내는 중… " + done + "/" + files.length); });
        });
      });
    });
    chain.then(function(){
      var mine = store.ideas || []; mine.unshift({id: id, t: now(), text: text.slice(0, 200), n: files.length}); store.ideas = mine.slice(0, 30); save();
      picked = []; drawPicked(); $("idtext").value = "";
      status("✅ 보냈어요! 고마워요 🙏 (내용은 암호화돼서 운영자만 볼 수 있어요)", "ok");
      btn.disabled = false; mineList();
    }).catch(function(err){ status("❌ 못 보냈어요: " + e(err.message || err) + " — 잠시 뒤 다시 눌러 주세요.", "bad"); btn.disabled = false; });
  }
  function mineList(){
    var box = $("idmine"); if (!box) return;
    var mine = store.ideas || [];
    box.innerHTML = mine.length ? '<div class="sec">내가 보낸 의견 <span class="mut">이 휴대폰에만 보여요</span></div>' + mine.slice(0, 10).map(function(x){
      return '<div class="id-it pend"><p>' + e(x.text) + '</p><small class="mut">' + e(x.t) + (x.n ? ' · 첨부 ' + x.n + '개' : '') + '</small></div>'; }).join("") : "";
  }
  // ---------- 운영자 보기 ----------
  var PRIV = null;
  function unlock(pw){
    return getJSON("archive/x/fb_key.json?" + Date.now()).then(function(kf){
      return C.importKey("raw", TE.encode(pw), "PBKDF2", false, ["deriveKey"]).then(function(base){
        return C.deriveKey({name: "PBKDF2", salt: ub64(kf.salt), iterations: kf.iter, hash: "SHA-256"}, base, {name: "AES-GCM", length: 256}, false, ["decrypt"]);
      }).then(function(dk){ return C.decrypt({name: "AES-GCM", iv: ub64(kf.iv)}, dk, ub64(kf.ct)); })
        .then(function(pk){ return C.importKey("pkcs8", pk, {name: "RSA-OAEP", hash: "SHA-256"}, false, ["decrypt"]); });
    });
  }
  function openItem(x){
    return C.decrypt({name: "RSA-OAEP"}, PRIV, ub64(x.k)).then(function(raw){ return C.importKey("raw", raw, {name: "AES-GCM"}, false, ["decrypt"]); }).then(function(K){
      return C.decrypt({name: "AES-GCM", iv: ub64(x.iv)}, K, ub64(x.ct)).then(function(b){
        var body = JSON.parse(TD.decode(b));
        var noteP = x.nct ? C.decrypt({name: "AES-GCM", iv: ub64(x.niv)}, K, ub64(x.nct)).then(function(n){ body.note = TD.decode(n); }).catch(function(){}) : Promise.resolve();
        return Promise.all((x.files || []).map(function(f){
          return C.decrypt({name: "AES-GCM", iv: ub64(f.miv)}, K, ub64(f.meta)).then(function(m){ var meta = JSON.parse(TD.decode(m));
            return fetch(f.path).then(function(r){ return r.arrayBuffer(); }).then(function(buf){ return C.decrypt({name: "AES-GCM", iv: ub64(f.iv)}, K, buf); })
              .then(function(pl){ return {name: meta.name, type: meta.type, url: URL.createObjectURL(new Blob([pl], {type: meta.type || "application/octet-stream"}))}; });
          }).catch(function(){ return {name: "첨부 열기 실패", type: "", url: ""}; });
        })).then(function(fs){ body.files = fs; return noteP; }).then(function(){ return body; });
      });
    });
  }
  function adminList(){
    var box = $("idadmin"); if (!box) return;
    box.innerHTML = '<div class="loading">🔓 여는 중…</div>';
    getJSON("archive/x/ideas.json?" + Date.now()).catch(function(){ return {items: []}; }).then(function(db){
      var items = db.items || [];
      if (!items.length){ box.innerHTML = '<div class="sec">들어온 의견 <span class="mut">운영자 보기</span></div><div class="empty">아직 들어온 의견이 없어요.</div>'; return; }
      return Promise.all(items.map(function(x){ return openItem(x).catch(function(){ return null; }); })).then(function(bodies){
        box.innerHTML = '<div class="sec">들어온 의견 ' + items.length + '건 <span class="mut">🔓 운영자 보기 · <a href="javascript:void 0" id="idlock">잠그기</a></span></div>' + items.map(function(x, i){
          var b = bodies[i], st = x.status || "접수", cls = st === "반영함" ? "hot" : st === "진행 중" ? "c" : st === "보류" ? "cool" : "";
          if (!b) return '<div class="id-it"><p class="mut">열지 못한 의견 (' + e(x.t) + ')</p></div>';
          var files = (b.files || []).map(function(f){
            return /^image\//.test(f.type) ? '<a href="' + f.url + '" target="_blank"><img src="' + f.url + '"></a>' : '<a class="id-fl" href="' + f.url + '" download="' + e(f.name) + '">📄 ' + e(f.name) + '</a>'; }).join("");
          return '<div class="id-it"><div class="id-h"><b>' + e(b.name || "이름 없음") + '</b><span class="chip2 ' + cls + '">' + e(st) + '</span></div><p>' + e(b.text).replace(/\n/g, "<br>") + '</p>' +
            (files ? '<div class="id-att">' + files + '</div>' : '') + (x.lost ? '<small class="dn">첨부 ' + x.lost + '개는 서버가 늦게 받아 사라졌어요</small>' : '') + (b.note ? '<div class="id-note">🛠 ' + e(b.note) + '</div>' : '') + '<small class="mut">' + e(b.t || x.t) + '</small></div>';
        }).join("");
        var l = $("idlock"); if (l) l.onclick = function(){ delete store.fbpass; save(); PRIV = null; go("idea"); };
      });
    });
  }
  function adminBox(){
    var box = $("idadmin"); if (!box) return;
    if (store.fbpass && C){
      unlock(store.fbpass).then(function(k){ PRIV = k; adminList(); }).catch(function(){ delete store.fbpass; save(); adminBox(); });
      return;
    }
    if (!adminBox.shown){ box.innerHTML = ""; return; }
    box.innerHTML = '<details class="id-adm" open><summary>🔐 운영자</summary><div class="id-adm-b"><input id="idpw" type="password" placeholder="운영자 비밀번호" autocomplete="current-password"><button class="btn" id="idpwb">열기</button></div><small id="idpwst" class="mut"></small></details>';
    $("idpwb").onclick = function(){
      var pw = ($("idpw").value || "").trim(); if (!pw) return;
      $("idpwst").textContent = "확인 중…";
      unlock(pw).then(function(k){ PRIV = k; store.fbpass = pw; save(); adminList(); }).catch(function(){ $("idpwst").textContent = "비밀번호가 맞지 않아요."; });
    };
  }
  window.ideaView = function(){
    return '<section class="card id-form"><h3>✍️ 의견 남기기</h3>' +
      '<label>이름<input id="idname" maxlength="40" placeholder="이름 또는 닉네임 (비워도 돼요)" value="' + e(store.idname || "") + '"></label>' +
      '<label>건의 내용<textarea id="idtext" rows="6" maxlength="4000" placeholder="앱에서 바뀌었으면 하는 점, 추가했으면 하는 기능, 오류 등 자유롭게"></textarea></label>' +
      '<div class="id-pick"><label class="btn" for="idfile">📎 사진·파일 첨부</label><input id="idfile" type="file" multiple accept="image/*,application/pdf,.pdf,.xlsx,.xls,.csv,.txt,.docx,.pptx,.zip"><small class="mut">최대 ' + MAXF + '개 · 사진은 자동으로 줄여서 보내요</small></div>' +
      '<div id="idfiles" class="id-files"></div>' +
      '<button class="btn id-send" id="idsend">보내기</button><div id="idst" class="id-st"></div>' +
      '<p class="note">🔒 보낸 내용과 첨부는 이 휴대폰에서 바로 암호화돼서 전송·저장돼요. 다른 사용자는 누가 무슨 의견을 보냈는지 전혀 볼 수 없고, 운영자만 열어볼 수 있어요.</p></section>' +
      '<div id="idmine"></div><div id="idadmin"></div>';
  };
  window.ideaInit = function(){
    picked = [];
    $("idfile").onchange = function(ev){
      [].forEach.call(ev.target.files || [], function(f){ if (picked.length < MAXF) picked.push(f); });
      ev.target.value = ""; drawPicked();
    };
    $("idsend").onclick = send;
    mineList(); adminBox.shown = false; adminBox();
    // 운영자 입구는 숨김: 위쪽 「💬 의견함」 제목을 3초 안에 5번 누르면 나타남
    var h1 = document.querySelector("#main .hero h1"), taps = [];
    if (h1) h1.addEventListener("click", function(){
      var t = Date.now(); taps = taps.filter(function(x){ return t - x < 3000; }); taps.push(t);
      if (taps.length >= 5 && !adminBox.shown){ adminBox.shown = true; adminBox(); var b = $("idadmin"); if (b) b.scrollIntoView({behavior: "smooth"}); }
    });
  };
})();
