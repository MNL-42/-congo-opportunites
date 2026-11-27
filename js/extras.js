/* Tutoriel, barre du bas, connexion obligatoire (cours / idées), photo de profil, idées. */
(() => {
  "use strict";
  const $ = s => document.querySelector(s);
  const el = (tag, props = {}) => Object.assign(document.createElement(tag), props);
  const client = window.CongoAuth?.getClient();
  let user = null;

  document.head.appendChild(el("style", { textContent: `
  .bottom-bar{position:fixed;left:0;right:0;bottom:0;z-index:40;display:none;justify-content:space-around;background:#0b1724;border-top:1px solid #ffffff22;padding:6px 0 calc(6px + env(safe-area-inset-bottom))}
  .bottom-bar button{background:none;border:0;color:#cfe0ec;font:600 11px system-ui;display:grid;gap:2px;justify-items:center;min-width:60px}
  .bottom-bar svg{width:22px;height:22px}.bottom-bar button.active{color:#ffd31a}
  @media(max-width:760px){.bottom-bar{display:flex}body{padding-bottom:70px}}
  .tuto{position:fixed;inset:0;z-index:1000}
  .tuto-ring{position:fixed;border:3px solid #ffd31a;border-radius:14px;box-shadow:0 0 0 9999px #000b}
  .tuto-finger{position:fixed;font-size:52px;animation:tap .8s infinite alternate}
  @keyframes tap{to{transform:translateY(14px)}}
  .tuto-card{position:fixed;left:16px;right:16px;bottom:90px;max-width:420px;margin:auto;background:#12283b;color:#fff;border-radius:18px;padding:18px;text-align:center}
  .tuto-card button{margin:10px 6px 0;padding:10px 18px;border-radius:30px;border:0;font-weight:700;background:#ffd31a;color:#0b1724}
  .box{display:grid;gap:10px;margin:16px 0}
  .box input,.box textarea{width:100%;padding:12px;border-radius:12px;border:1px solid #8886;background:#8881;color:inherit;font:inherit}
  #profileAvatar.has-photo,#avatarInitials.has-photo{background-size:cover!important;background-position:center!important;color:transparent!important}
  .idea{border:1px solid #8884;background:#8881;border-radius:16px;padding:14px;overflow-wrap:anywhere}
  .idea h3{margin:0}.idea p{white-space:pre-wrap}.idea small{opacity:.7}
  .idea-actions{display:flex;gap:8px;flex-wrap:wrap}
  .idea-actions button{border:1px solid #8886;background:none;color:inherit;border-radius:30px;padding:8px 14px;font:inherit;font-size:14px}
  .idea-actions button.on{color:#ffd31a;border-color:#ffd31a}
  ` }));

  // Barre de navigation (app.js gère déjà les clics [data-view])
  const bar = el("nav", { className: "bottom-bar" });
  bar.innerHTML = [["accueil","Accueil"],["decouvrir","Offres"],["academie","Cours"],["projets","Idées"],["profil","Profil"]]
    .map(([v,t]) => `<button type="button" data-view="${v}">${$(`.nav-link[data-view="${v}"] svg`)?.outerHTML || ""}${t}</button>`).join("");
  document.body.appendChild(bar);
  const mark = () => bar.querySelectorAll("button").forEach(b => b.classList.toggle("active", !!$(`#view-${b.dataset.view}.active`)));
  document.querySelectorAll(".view").forEach(v => new MutationObserver(mark).observe(v, { attributeFilter: ["class"] }));
  mark();

  // Tutoriel à la première ouverture
  function tutorial() {
    try { if (localStorage.getItem("co-tuto")) return; } catch {}
    const steps = [["#menuToggle","Touche ☰ pour ouvrir le menu."],[".bottom-bar","En bas : Offres, Cours, Idées et ton Profil. Touche une icône pour y aller."]];
    const box = el("div", { className: "tuto" });
    document.body.appendChild(box);
    const end = () => { box.remove(); try { localStorage.setItem("co-tuto", "1"); } catch {} };
    let i = 0;
    const show = () => {
      let t = $(steps[i]?.[0]);
      while (steps[i] && (!t || !t.getClientRects().length)) t = $(steps[++i]?.[0]);
      if (!steps[i]) return end();
      const r = t.getBoundingClientRect(), low = r.top > innerHeight / 2;
      box.innerHTML = `<div class="tuto-ring" style="left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px"></div>
        <div class="tuto-finger" style="left:${r.left + Math.min(r.width/2, 160) - 20}px;top:${low ? r.top - 70 : r.bottom + 4}px">${low ? "👇" : "👆"}</div>
        <div class="tuto-card" style="${low ? "bottom:160px" : ""}"><p>${steps[i][1]}</p><button data-n>Suivant</button><button data-x>Passer</button></div>`;
    };
    box.addEventListener("click", e => {
      e.stopPropagation();
      if (e.target.closest("[data-x]")) return end();
      i++; show();
    });
    show();
  }
  setTimeout(tutorial, 600);

  // Connexion demandée pour suivre un cours
  document.addEventListener("click", e => {
    if (user || !client) return;
    if (e.target.closest?.("[data-open-course],[data-open-lab]")) {
      e.preventDefault(); e.stopImmediatePropagation();
      window.CongoAuth.open();
      const m = $("#authMessage"); if (m) m.textContent = "Connecte-toi pour suivre ce cours.";
    }
  }, true);

  // Idées publiques, « J'aime » et partage
  const ideas = el("div");
  ideas.innerHTML = `<form class="box"><input name="title" required maxlength="100" placeholder="Titre de ton idée ou projet">
    <textarea name="details" required maxlength="1000" rows="4" placeholder="Explique ton idée"></textarea>
    <small>Ton idée et ton nom seront visibles par tout le monde.</small>
    <button class="primary-button" type="submit">Publier mon idée</button><p role="status"></p></form><div class="box" data-list></div>`;
  $("#view-projets .page-intro")?.after(ideas);
  const form = ideas.querySelector("form"), status = form.querySelector("p"), list = ideas.querySelector("[data-list]");
  const needLogin = text => { window.CongoAuth?.open(); const m = $("#authMessage"); if (m) m.textContent = text; };

  async function loadIdeas() {
    if (!client) return;
    const { data, error } = await client.from("ideas")
      .select("id,user_id,author_name,title,details,created_at,idea_likes(user_id)")
      .order("created_at", { ascending: false }).limit(50);
    if (error) { list.textContent = "Impossible de charger les idées."; return; }
    list.replaceChildren(...data.map(card));
    if (!data.length) list.textContent = "Sois le premier à publier une idée.";
  }

  function card(d) {
    const likes = d.idea_likes || [], liked = !!user && likes.some(l => l.user_id === user.id);
    const box = el("article", { className: "idea" });
    box.append(el("h3", { textContent: d.title }),
      el("small", { textContent: d.author_name + " · " + new Date(d.created_at).toLocaleDateString("fr-FR") }),
      el("p", { textContent: d.details }));
    const actions = el("div", { className: "idea-actions" });
    const button = (text, action, on) => {
      const b = el("button", { type: "button", textContent: text, className: on ? "on" : "" });
      b.addEventListener("click", () => action(b));
      actions.append(b);
    };
    button((liked ? "♥ " : "♡ ") + "J’aime " + likes.length, async b => {
      if (!user) return needLogin("Connecte-toi pour aimer une idée.");
      b.disabled = true;
      const table = client.from("idea_likes");
      await (liked ? table.delete().match({ idea_id: d.id, user_id: user.id }) : table.insert({ idea_id: d.id }));
      loadIdeas();
    }, liked);
    button("Partager", () => {
      const url = location.origin + location.pathname + "#projets";
      const text = "Idée sur Congo Opportunités : " + d.title;
      if (navigator.share) navigator.share({ text, url }).catch(() => {});
      else window.open("https://wa.me/?text=" + encodeURIComponent(text + " " + url), "_blank", "noopener");
    });
    if (user && user.id === d.user_id) button("Supprimer", async () => {
      if (!confirm("Supprimer cette idée ?")) return;
      await client.from("ideas").delete().eq("id", d.id);
      loadIdeas();
    });
    box.append(actions);
    return box;
  }

  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (!user) return needLogin("Connecte-toi pour publier ton idée.");
    const f = new FormData(form), send = form.querySelector("button");
    send.disabled = true;
    const { error } = await client.from("ideas").insert({ title: f.get("title").trim(), details: f.get("details").trim() });
    send.disabled = false;
    status.textContent = error ? "Publication impossible. Réessaie." : "Idée publiée.";
    if (!error) { form.reset(); loadIdeas(); }
  });
  $(".bottom-bar [data-view=projets]")?.addEventListener("click", loadIdeas);

  // Photo de profil
  const photo = el("label", { className: "box", hidden: true });
  photo.innerHTML = `<span class="secondary-button">📷 Ajouter / changer ma photo</span><input type="file" accept="image/*" hidden><span role="status"></span>`;
  $(".profile-panel")?.after(photo);
  const paint = url => ["#profileAvatar","#avatarInitials"].forEach(s => {
    const n = $(s); if (!n) return;
    n.classList.toggle("has-photo", !!url);
    n.style.backgroundImage = url ? `url("${url}")` : "";
  });
  photo.querySelector("input").addEventListener("change", async e => {
    const file = e.target.files[0], note = photo.querySelector("[role=status]");
    if (!file || !user) return;
    note.textContent = "Envoi…";
    try {
      const img = await createImageBitmap(file), s = Math.min(1, 600 / Math.max(img.width, img.height));
      const c = el("canvas", { width: img.width * s, height: img.height * s });
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      const blob = await new Promise(r => c.toBlob(r, "image/jpeg", .85));
      const path = `${user.id}/avatar-${Date.now()}.jpg`;
      const up = await client.storage.from("media").upload(path, blob, { contentType: "image/jpeg" });
      if (up.error) throw up.error;
      const url = client.storage.from("media").getPublicUrl(path).data.publicUrl;
      const { error } = await client.from("profiles").update({ avatar_url: url }).eq("id", user.id);
      if (error) throw error;
      paint(url); note.textContent = "Photo enregistrée ✅";
    } catch { note.textContent = "Impossible d’envoyer la photo."; }
  });

  client?.auth.onAuthStateChange((_event, session) => setTimeout(async () => {
    user = session?.user || null;
    photo.hidden = !user;
    loadIdeas();
    if (!user) return paint("");
    const { data } = await client.from("profiles").select("avatar_url").eq("id", user.id).maybeSingle();
    paint(data?.avatar_url || "");
  }, 0));
})();
