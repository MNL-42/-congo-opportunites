(() => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const views = ["accueil", "decouvrir", "academie", "projets", "favoris", "profil", "conditions", "confidentialite", "apropos", "contact", "faq"];
  const titles = {accueil:"Accueil",conditions:"Conditions d’utilisation",confidentialite:"Confidentialité",apropos:"À propos",contact:"Contact",faq:"Questions fréquentes",decouvrir:"Découvrir les opportunités",academie:"Académie numérique",projets:"Projets & défis",favoris:"Mes favoris",profil:"Mon profil"};
  const sidebar = $("#sidebar"), overlay = $("#mobileOverlay"), dialog = $("#authDialog");

  function showView(name) {
    if (!views.includes(name)) return;
    $$(".view").forEach(v => v.classList.toggle("active", v.id === "view-" + name));
    $(".nav-link[data-view]").forEach(b => { const active=b.dataset.view===name; b.classList.toggle("active",active); if(active)b.setAttribute("aria-current","page"); else b.removeAttribute("aria-current"); });
    $("#pageHeading").textContent = titles[name];
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
    if (location.hash !== "#" + name) history.replaceState(null, "", "#" + name);
    window.scrollTo({top:0, behavior:"smooth"});
  }

  document.addEventListener("click", event => {
    const nav = event.target.closest("[data-view]");
    const target = event.target.closest("[data-go]");
    if (nav) showView(nav.dataset.view);
    if (target) showView(target.dataset.go);
  });

  $("#menuToggle").addEventListener("click", () => {
    sidebar.classList.add("open");
    overlay.classList.add("show");
  });
  overlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
  });

  const savedTheme = localStorage.getItem("congo-theme") || "dark";
  document.documentElement.classList.toggle("light-mode", savedTheme === "light");
  $("#themeToggle").innerHTML = savedTheme === "light" ? '<svg class="ui-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>' : '<svg class="ui-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.7 8.7 0 1 0 20.5 14.2Z"/></svg>';
  $("#themeToggle").addEventListener("click", () => {
    document.documentElement.classList.toggle("light-mode");
    const light = document.documentElement.classList.contains("light-mode");
    localStorage.setItem("congo-theme", light ? "light" : "dark");
    $("#themeToggle").innerHTML = light ? '<svg class="ui-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>' : '<svg class="ui-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.7 8.7 0 1 0 20.5 14.2Z"/></svg>';
  });

  function openAuth() {
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }
  $("#accountButton").addEventListener("click", openAuth);
  $("#profileSignIn").addEventListener("click", openAuth);
  $("#closeAuth").addEventListener("click", () => dialog.close());
  $("#googleSignIn").addEventListener("click", () => window.CongoAuth?.signInWithGoogle());

  function updateUser(session) {
    const user = session?.user;
    const name = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || "Visiteur";
    const initials = user ? name.trim().slice(0,1).toUpperCase() : "?";
    $("#headerUserName").textContent = user ? name.split(" ")[0] : "Visiteur";
    $("#headerUserStatus").textContent = user ? "Connecté" : "Non connecté";
    $("#avatarInitials").textContent = initials;
    $("#profileAvatar").textContent = initials;
    $("#profileName").textContent = user ? name : "Profil non connecté";
    $("#profileEmail").textContent = user?.email || "Connecte-toi pour commencer ton profil.";
    if (user && dialog.open) dialog.close();
  }

  if (window.CongoAuth) {
    window.CongoAuth.getSession().then(updateUser).catch(() => updateUser(null));
    window.CongoAuth.onAuthChange(updateUser);
  }
  $("#year").textContent = new Date().getFullYear();

  const search = $("#searchInput");
  const category = $("#categoryFilter");
  const province = $("#provinceFilter");
  const count = $("#resultsCount");
  function updateSearchState() {
    const hasFilter = Boolean(search.value.trim() || category.value || province.value);
    count.textContent = hasFilter
      ? "Filtres enregistrés — les annonces seront consultables dès l’activation du catalogue."
      : "Aucune annonce chargée";
  }
  [search, category, province].forEach(control => control?.addEventListener("input", updateSearchState));
  [category, province].forEach(control => control?.addEventListener("change", updateSearchState));

  const initialView = location.hash.replace("#", "");
  if (views.includes(initialView)) showView(initialView);

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
  }
})();