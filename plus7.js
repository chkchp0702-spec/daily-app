/* CH Investing — 💬 의견함: 이름 · 건의 내용 · 사진/파일 첨부 → ntfy 비밀 주제로 전송 → 서버가 매시간 모아 저장 */
(function(){
  var e = V.e;
  var TOPIC = "chkchp-ch-idea-x7m2q", NT = "https://ntfy.sh/";
  var MAXF = 5, MAXB = 14 * 1024 * 1024;
  var picked = [];
  function kb(n){ return n > 1048576 ? (n / 1048576).toFixed(1) + "MB" : Math.max(1, Math.round(n / 1024)) + "KB"; }
  function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  // 사진은 긴 변 1600px JPEG 로 줄여서 보냄 (빠르고 용량 적게)
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
    store.idname = name; save();
    var id = uid(), btn = $("idsend"); btn.disabled = true;
    status("보내는 중…");
    var head = {topic: TOPIC, title: "💬 의견 " + (name || "이름 없음"), tags: ["speech_balloon"], priority: 3,
                message: JSON.stringify({kind: "idea", id: id, name: name, text: text, n: picked.length})};
    var chain = fetch(NT, {method: "POST", body: JSON.stringify(head)}).then(function(r){ if (!r.ok) throw new Error("글 " + r.status); });
    var done = 0;
    picked.forEach(function(f){
      chain = chain.then(function(){ return shrink(f); }).then(function(g){
        if (g.size > MAXB) throw new Error(g.name + " 이(가) 너무 커요 (14MB 까지)");
        var q = "?filename=" + encodeURIComponent(g.name) + "&message=" + encodeURIComponent(JSON.stringify({kind: "idea-file", id: id, fname: g.name}));
        return fetch(NT + TOPIC + q, {method: "PUT", body: g}).then(function(r){ if (!r.ok) throw new Error("첨부 " + r.status); done++; status("첨부 보내는 중… " + done + "/" + picked.length); });
      });
    });
    chain.then(function(){
      var mine = store.ideas || []; mine.unshift({id: id, t: (function(d){ var p = function(n){ return (n < 10 ? "0" : "") + n; }; return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes()); })(new Date()), text: text.slice(0, 200), n: picked.length}); store.ideas = mine.slice(0, 30); save();
      picked = []; drawPicked(); $("idtext").value = "";
      status("✅ 보냈어요! 앱 목록에는 1시간 안에 올라와요. 고마워요 🙏", "ok");
      btn.disabled = false; list();
    }).catch(function(err){ status("❌ 못 보냈어요: " + e(err.message || err) + " — 잠시 뒤 다시 눌러 주세요.", "bad"); btn.disabled = false; });
  }
  function list(){
    var box = $("idlist"); if (!box) return;
    getJSON("archive/x/ideas.json?" + Date.now()).catch(function(){ return {items: []}; }).then(function(db){
      var items = db.items || [], have = {}; items.forEach(function(x){ have[x.id] = 1; });
      var pend = (store.ideas || []).filter(function(x){ return !have[x.id]; });
      var h = pend.map(function(x){ return '<div class="id-it pend"><div class="id-h"><b>내가 보낸 의견</b><span class="chip2">전송됨 · 올라오는 중</span></div><p>' + e(x.text) + '</p><small class="mut">' + e(x.t) + (x.n ? ' · 첨부 ' + x.n + '개' : '') + '</small></div>'; }).join("");
      h += items.map(function(x){
        var st = x.status || "접수", cls = st === "반영함" ? "hot" : st === "진행 중" ? "c" : st === "보류" ? "cool" : "";
        var files = (x.files || []).map(function(f){
          return /^image\//.test(f.type) ? '<a href="' + e(encodeURI(f.path)) + '" target="_blank"><img src="' + e(encodeURI(f.path)) + '" loading="lazy"></a>' : '<a class="id-fl" href="' + e(encodeURI(f.path)) + '" target="_blank">📄 ' + e(f.name) + '</a>'; }).join("");
        return '<div class="id-it"><div class="id-h"><b>' + e(x.name || "이름 없음") + '</b><span class="chip2 ' + cls + '">' + e(st) + '</span></div><p>' + e(x.text).replace(/\n/g, "<br>") + '</p>' +
          (files ? '<div class="id-att">' + files + '</div>' : '') + (x.note ? '<div class="id-note">🛠 ' + e(x.note) + '</div>' : '') + '<small class="mut">' + e(x.t) + '</small></div>';
      }).join("");
      box.innerHTML = h || '<div class="empty">아직 들어온 의견이 없어요. 첫 의견을 남겨 주세요!</div>';
    });
  }
  window.ideaView = function(){
    return '<section class="card id-form"><h3>✍️ 의견 남기기</h3>' +
      '<label>이름<input id="idname" maxlength="40" placeholder="이름 또는 닉네임 (비워도 돼요)" value="' + e(store.idname || "") + '"></label>' +
      '<label>건의 내용<textarea id="idtext" rows="6" maxlength="4000" placeholder="앱에서 바뀌었으면 하는 점, 추가했으면 하는 기능, 오류 등 자유롭게"></textarea></label>' +
      '<div class="id-pick"><label class="btn" for="idfile">📎 사진·파일 첨부</label><input id="idfile" type="file" multiple accept="image/*,application/pdf,.pdf,.xlsx,.xls,.csv,.txt,.docx,.pptx,.zip"><small class="mut">최대 ' + MAXF + '개 · 사진은 자동으로 줄여서 보내요</small></div>' +
      '<div id="idfiles" class="id-files"></div>' +
      '<button class="btn id-send" id="idsend">보내기</button><div id="idst" class="id-st"></div>' +
      '<p class="note">보낸 의견과 첨부는 아래 목록에 올라가 앱을 쓰는 사람 누구나 볼 수 있어요. 개인정보·계좌 화면은 가리고 올려 주세요.</p></section>' +
      '<div class="sec">들어온 의견</div><div id="idlist"><div class="loading">불러오는 중…</div></div>';
  };
  window.ideaInit = function(){
    picked = [];
    $("idfile").onchange = function(ev){
      [].forEach.call(ev.target.files || [], function(f){ if (picked.length < MAXF) picked.push(f); });
      ev.target.value = ""; drawPicked();
    };
    $("idsend").onclick = send;
    list();
  };
})();
