/* Catalogue Congo Opportunités — catalogue local, sans base de données. */
(() => {
  "use strict";
  const $ = (s, root = document) => root.querySelector(s);
  const view = $("#view-decouvrir");
  const search = $("#searchInput");
  const category = $("#categoryFilter");
  const province = $("#provinceFilter");
  const count = $("#resultsCount");
  const favView = $("#view-favoris");
  if (!view || !count) return;

  const empty = view.querySelector(".empty-state");
  const list = document.createElement("div");
  list.className = "opportunity-grid";
  list.id = "opportunityList";
  list.setAttribute("aria-live", "polite");
  if (empty) empty.before(list); else view.append(list);

  const home = $("#view-accueil");
  const homeEmpty = home?.querySelector(".compact-empty");
  const homeList = document.createElement("div");
  homeList.className = "opportunity-grid home-opportunity-grid";
  homeList.id = "homeOpportunityList";
  homeList.setAttribute("aria-live", "polite");
  if (homeEmpty) homeEmpty.before(homeList);

  const favEmpty = favView?.querySelector(".empty-state");
  const favList = document.createElement("div");
  favList.className = "opportunity-grid";
  favList.id = "favoriteOpportunityList";
  favList.setAttribute("aria-live", "polite");
  if (favEmpty) favEmpty.before(favList);

  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  })[c]);
  const safeUrl = value => {
    try {
      const u = new URL(String(value || ""));
      return ["https:", "http:"].includes(u.protocol) ? u.href : "";
    } catch { return ""; }
  };
  const validDate = value => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return false;
    const d = new Date(value + "T00:00:00Z");
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
  };
  const fmt = value => validDate(value)
    ? new Date(value + "T00:00:00Z").toLocaleDateString("fr-FR", {day:"numeric",month:"long",year:"numeric",timeZone:"UTC"})
    : "Non précisée";
  const today = () => {
    const d = new Date();
    return [d.getFullYear(), String(d.getMonth()+1).padStart(2,"0"), String(d.getDate()).padStart(2,"0")].join("-");
  };
  const readFavs = () => {
    try {
      const value = JSON.parse(localStorage.getItem("congo-favs") || "[]");
      return Array.isArray(value) ? value.filter(x => typeof x === "string") : [];
    } catch { return []; }
  };
  let items = [];
  let loadFailed = false;

  function card(o, compact = false) {
    const source = safeUrl(o.source_url);
    const apply = safeUrl(o.apply_url);
    const favorite = readFavs().includes(String(o.id));
    const shareText = encodeURIComponent((o.title || "Opportunité") + (apply ? " — " + apply : ""));
    return '<article class="opportunity-card' + (compact ? ' opportunity-card-compact' : '') + '">' +
      '<span class="academy-card-tag">' + esc(o.category || "Opportunité").toLocaleUpperCase("fr") + '</span>' +
      '<h3>' + esc(o.title || "Annonce sans titre") + '</h3>' +
      '<p class="opp-meta">' + esc(o.organization || "Organisme non précisé") + ' · ' + esc(o.province || "Zone non précisée") + '</p>' +
      '<p>' + esc(o.summary || "") + '</p>' +
      (validDate(o.deadline) ? '<p class="opp-deadline">Date limite : <strong>' + esc(fmt(o.deadline)) + '</strong></p>' : '') +
      '<p class="opp-source"><small>Source : ' +
      (source ? '<a href="' + esc(source) + '" target="_blank" rel="noopener noreferrer">' + esc(o.source_name || "Source officielle") + '</a>' : esc(o.source_name || "Source non précisée")) +
      (validDate(o.verified_on) ? ' · vérifié le ' + esc(fmt(o.verified_on)) : '') + '</small></p>' +
      '<div class="lesson-actions">' +
      (apply ? '<a class="academy-primary" href="' + esc(apply) + '" target="_blank" rel="noopener noreferrer">Voir et postuler</a>' : '<span class="academy-quiet">Lien de candidature indisponible</span>') +
      '<button class="academy-quiet" type="button" data-fav="' + esc(o.id) + '" aria-pressed="' + favorite + '">' + (favorite ? "♥ Favori" : "♡ Favori") + '</button>' +
      '<a class="academy-quiet" target="_blank" rel="noopener noreferrer" href="https://wa.me/?text=' + shareText + '">Partager</a>' +
      '</div></article>';
  }

  function render() {
    const q = (search?.value || "").toLocaleLowerCase("fr").trim();
    const selectedCategory = category?.value || "";
    const selectedProvince = province?.value || "";
    const rows = items.filter(o => {
      const notExpired = !validDate(o.deadline) || o.deadline >= today();
      const matchesCategory = !selectedCategory || o.category === selectedCategory;
      const matchesProvince = !selectedProvince || o.province === selectedProvince || o.province === "National";
      const haystack = [o.title,o.organization,o.summary,o.category,o.province].join(" ").toLocaleLowerCase("fr");
      return notExpired && matchesCategory && matchesProvince && (!q || haystack.includes(q));
    }).sort((a,b) => (a.deadline || "9999-12-31").localeCompare(b.deadline || "9999-12-31"));

    count.textContent = loadFailed ? "Catalogue momentanément indisponible"
      : items.length ? rows.length + " opportunité" + (rows.length > 1 ? "s" : "") + " affichée" + (rows.length > 1 ? "s" : "")
      : "Aucune annonce publiée pour le moment";

    if (empty) {
      empty.hidden = rows.length > 0;
      const h = empty.querySelector("h3"), p = empty.querySelector("p");
      if (h) h.textContent = loadFailed ? "Impossible de charger les annonces" : items.length ? "Aucun résultat pour ces filtres" : "Aucune opportunité disponible pour le moment";
      if (p) p.textContent = loadFailed ? "Vérifie ta connexion puis recharge la page." : items.length ? "Essaie une autre recherche ou réinitialise les filtres." : "Les annonces seront publiées après vérification de leur source et de leurs conditions.";
    }
    list.innerHTML = rows.map(o => card(o)).join("");

    const favorites = readFavs();
    const saved = items.filter(o => favorites.includes(String(o.id)));
    favList.innerHTML = saved.map(o => card(o)).join("");
    if (favEmpty) {
      favEmpty.hidden = saved.length > 0;
      const h = favEmpty.querySelector("h3"), p = favEmpty.querySelector("p");
      if (h) h.textContent = "Ton espace favoris est vide";
      if (p) p.textContent = "Appuie sur le bouton Favori d'une annonce pour la retrouver ici. Tes favoris sont conservés sur cet appareil.";
    }

    const recent = items.filter(o => !validDate(o.deadline) || o.deadline >= today())
      .sort((a,b) => (b.verified_on || "").localeCompare(a.verified_on || "")).slice(0,3);
    homeList.innerHTML = recent.map(o => card(o, true)).join("");
    if (homeEmpty) homeEmpty.hidden = recent.length > 0;
  }

  function toggleFavorite(event) {
    const button = event.target.closest("[data-fav]");
    if (!button) return;
    const id = button.dataset.fav;
    const favorites = readFavs();
    const index = favorites.indexOf(id);
    if (index < 0) favorites.push(id); else favorites.splice(index, 1);
    try { localStorage.setItem("congo-favs", JSON.stringify(favorites)); } catch {
      count.textContent = "Le stockage local est indisponible sur cet appareil.";
    }
    render();
  }
  document.addEventListener("click", toggleFavorite);
  [search, category, province].forEach(control => {
    control?.addEventListener(control === search ? "input" : "change", render);
  });

  fetch("./data/opportunities.json", {cache:"no-cache"})
    .then(response => { if (!response.ok) throw new Error("HTTP " + response.status); return response.json(); })
    .then(data => {
      if (!data || !Array.isArray(data.items)) throw new Error("Format JSON invalide");
      const seen = new Set();
      items = data.items.filter(o => {
        if (!o || typeof o !== "object" || !o.id || !o.title || seen.has(String(o.id))) return false;
        seen.add(String(o.id));
        return true;
      });
      render();
    })
    .catch(() => { loadFailed = true; render(); });
})();