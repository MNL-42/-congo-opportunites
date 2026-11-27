/* Catalogue local d'opportunités — aucune base de données requise. */
(() => {
  "use strict";
  const $ = (s, root=document) => root.querySelector(s);
  const view = $("#view-decouvrir");
  const search = $("#searchInput"), cat = $("#categoryFilter"), prov = $("#provinceFilter");
  const count = $("#resultsCount");
  if (!view || !count) return;

  const empty = view.querySelector(".empty-state");
  const list = document.createElement("div");
  list.className = "opportunity-grid";
  list.id = "opportunityList";
  list.setAttribute("aria-live", "polite");
  if (empty) empty.before(list); else view.append(list);

  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  })[c]);
  const safeUrl = value => {
    try {
      const u = new URL(String(value || ""), location.href);
      return ["https:", "http:"].includes(u.protocol) ? u.href : "#";
    } catch { return "#"; }
  };
  const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
  const fmt = value => {
    if (!validDate(value)) return "Non précisée";
    return new Date(value + "T00:00:00").toLocaleDateString("fr-FR", {
      day:"numeric", month:"long", year:"numeric"
    });
  };
  const readFavs = () => {
    try {
      const value = JSON.parse(localStorage.getItem("congo-favs") || "[]");
      return Array.isArray(value) ? value : [];
    } catch { return []; }
  };
  let items = [];
  let loadFailed = false;

  function render() {
    const today = new Date().toISOString().slice(0, 10);
    const q = (search?.value || "").toLocaleLowerCase("fr").trim();
    const category = cat?.value || "";
    const province = prov?.value || "";
    const rows = items.filter(o => {
      const notExpired = !validDate(o.deadline) || o.deadline >= today;
      const matchesCategory = !category || o.category === category;
      const matchesProvince = !province || o.province === province || o.province === "National";
      const haystack = [o.title, o.organization, o.summary, o.category, o.province]
        .join(" ").toLocaleLowerCase("fr");
      return notExpired && matchesCategory && matchesProvince && (!q || haystack.includes(q));
    }).sort((a,b) => (a.deadline || "9999-12-31").localeCompare(b.deadline || "9999-12-31"));

    const favorites = readFavs();
    count.textContent = loadFailed ? "Catalogue momentanément indisponible"
      : items.length ? rows.length + " opportunité" + (rows.length > 1 ? "s" : "")
      : "Aucune annonce chargée";

    if (empty) {
      empty.hidden = rows.length > 0;
      const heading = empty.querySelector("h3");
      const paragraph = empty.querySelector("p");
      if (heading) heading.textContent = loadFailed ? "Impossible de charger les annonces" :
        items.length ? "Aucun résultat pour ces filtres" : "Aucune opportunité disponible pour le moment";
      if (paragraph) paragraph.textContent = loadFailed
        ? "Vérifie ta connexion puis recharge la page."
        : items.length ? "Essaie une autre recherche ou réinitialise les filtres."
        : "Le catalogue sera alimenté avec des annonces réelles, leurs conditions, leurs dates limites et leurs sources officielles.";
    }

    list.innerHTML = rows.map(card).join("");
    renderFavorites(favorites);
  }

  function card(o) {
      const favorites = readFavs();
      const id = esc(o.id);
      const source = safeUrl(o.source_url);
      const apply = safeUrl(o.apply_url);
      const favorite = favorites.includes(o.id);
      const sourceLabel = esc(o.source_name || "Source non précisée");
      const shareText = encodeURIComponent((o.title || "Opportunité") + " — " + apply);
      return '<article class="opportunity-card">' +
        '<span class="academy-card-tag">' + esc(o.category || "Opportunité").toLocaleUpperCase("fr") + '</span>' +
        (o.image_url && safeUrl(o.image_url) !== "#" ? '<img src="' + esc(safeUrl(o.image_url)) + '" alt="" loading="lazy" style="width:100%;border-radius:12px">' : '') +
        '<h3>' + esc(o.title || "Annonce sans titre") + '</h3>' +
        '<p class="opp-meta">' + esc(o.organization || "Organisme non précisé") + ' · ' + esc(o.province || "Zone non précisée") + '</p>' +
        '<p>' + esc(o.summary || "") + '</p>' +
        (validDate(o.deadline) ? '<p class="opp-deadline">Date limite : <strong>' + esc(fmt(o.deadline)) + '</strong></p>' : '') +
        '<p class="opp-source"><small>Source : ' +
        (source !== "#" ? '<a href="' + source + '" target="_blank" rel="noopener noreferrer">' + sourceLabel + '</a>' : sourceLabel) +
        ' · vérifié le ' + esc(fmt(o.verified_on)) + '</small></p>' +
        '<div class="lesson-actions">' +
        (apply !== "#" ? '<a class="academy-primary" href="' + apply + '" target="_blank" rel="noopener noreferrer">Voir et postuler</a>' : '<span class="academy-quiet">Lien de candidature indisponible</span>') +
        '<button class="academy-quiet" type="button" data-fav="' + id + '" aria-pressed="' + favorite + '">' +
        (favorite ? "♥ Favori" : "♡ Favori") + '</button>' +
        '<a class="academy-quiet" target="_blank" rel="noopener noreferrer" href="https://wa.me/?text=' + shareText + '">Partager</a>' +
        '</div></article>';
  }

  const favView = $("#view-favoris");
  const favEmpty = favView?.querySelector(".empty-state");
  const favList = document.createElement("div");
  favList.className = "opportunity-grid";
  favEmpty?.before(favList);

  function renderFavorites(favorites) {
    const saved = items.filter(o => favorites.includes(o.id));
    favList.innerHTML = saved.map(card).join("");
    if (favEmpty) favEmpty.hidden = saved.length > 0;
  }

  const onFavClick = event => {
    const button = event.target.closest("[data-fav]");
    if (!button) return;
    const favorites = readFavs(), id = button.dataset.fav;
    const index = favorites.indexOf(id);
    if (index < 0) favorites.push(id); else favorites.splice(index, 1);
    try { localStorage.setItem("congo-favs", JSON.stringify(favorites)); } catch {}
    render();
  };
  list.addEventListener("click", onFavClick);
  favList.addEventListener("click", onFavClick);

  [search, cat, prov].forEach(control => {
    control?.addEventListener(control === search ? "input" : "change", render);
  });

  const json = (url, options) => fetch(url, options).then(r => {
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  });

  // Annonces publiées dans Supabase (table opportunities)
  function fromSupabase() {
    const c = window.APP_CONFIG || {};
    if (!c.SUPABASE_URL) return Promise.resolve([]);
    return json(c.SUPABASE_URL + "/rest/v1/opportunities?status=eq.published&select=*", {
      headers: { apikey: c.SUPABASE_ANON_KEY }
    }).then(rows => rows.map(o => ({
      ...o, summary: o.description, apply_url: o.application_url
    })));
  }

  const fromFile = () => json("./data/opportunities.json", { cache:"no-cache" })
    .then(data => data.items || []);

  Promise.allSettled([fromSupabase(), fromFile()]).then(results => {
    loadFailed = results.every(r => r.status === "rejected");
    items = results.flatMap(r => r.status === "fulfilled" ? r.value : [])
      .filter(o => o && o.id && o.title);
    render();
  });
})();
