(() => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const views = ["accueil", "decouvrir", "academie", "projets", "favoris", "profil"];
  const titles = {accueil:"Tableau de bord",decouvrir:"Découvrir les opportunités",academie:"Académie numérique",projets:"Projets & défis",favoris:"Mes favoris",profil:"Mon profil"};
  const sidebar = $("#sidebar"), overlay = $("#mobileOverlay"), dialog = $("#authDialog");

  function showView(name) {
    if (!views.includes(name)) return;
    $$(".view").forEach(v => v.classList.toggle("active", v.id === "view-" + name));
    $$(".nav-link[data-view]").forEach(b => b.classList.toggle("active", b.dataset.view === name));
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
  if (savedTheme === "light") document.body.classList.add("light-mode");
  $("#themeToggle").textContent = savedTheme === "light" ? "☀" : "◐";
  $("#themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    const light = document.body.classList.contains("light-mode");
    localStorage.setItem("congo-theme", light ? "light" : "dark");
    $("#themeToggle").textContent = light ? "☀" : "◐";
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