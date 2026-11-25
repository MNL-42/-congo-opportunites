(() => {
  const $ = (id) => document.getElementById(id);
  const titles = { accueil:"Tableau de bord", decouvrir:"Découvrir les opportunités", academie:"Académie numérique", projets:"Projets & défis", favoris:"Mes favoris", profil:"Mon profil" };
  const sidebar = $("sidebar"), overlay = $("mobileOverlay"), dialog = $("authDialog");
  function go(view) {
    if (!titles[view]) return;
    document.querySelectorAll(".view").forEach(el => el.classList.toggle("active", el.id === "view-" + view));
    document.querySelectorAll("[data-view]").forEach(el => el.classList.toggle("active", el.dataset.view === view));
    $("pageHeading").textContent = titles[view];
    sidebar.classList.remove("open"); overlay.classList.remove("show");
    window.scrollTo({top:0,behavior:"smooth"});
  }
  document.addEventListener("click", e => {
    const nav = e.target.closest("[data-view]");
    const target = e.target.closest("[data-go]");
    if (nav) go(nav.dataset.view);
    if (target) go(target.dataset.go);
  });
  $("menuToggle").addEventListener("click", () => { sidebar.classList.toggle("open"); overlay.classList.toggle("show"); });
  overlay.addEventListener("click", () => { sidebar.classList.remove("open"); overlay.classList.remove("show"); });
  $("themeToggle").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("congo-theme", next);
    $("themeToggle").textContent = next === "light" ? "☀" : "◐";
  });
  const savedTheme = localStorage.getItem("congo-theme") || "dark";
  document.documentElement.dataset.theme = savedTheme;
  $("themeToggle").textContent = savedTheme === "light" ? "☀" : "◐";
  function openAuth(){ if (dialog && !dialog.open) dialog.showModal(); }
  $("accountButton").addEventListener("click", openAuth);
  $("profileSignIn").addEventListener("click", openAuth);
  $("closeAuth").addEventListener("click", () => dialog.close());
  $("googleSignIn").addEventListener("click", () => window.CONGO_AUTH?.signIn());
  window.addEventListener("congo-auth-ready", event => {
    const session = event.detail;
    if (!session?.user) return;
    const user = session.user;
    const name = user.user_metadata?.full_name || user.user_metadata?.name || user.email || "Membre";
    const initial = name.trim().charAt(0).toUpperCase();
    $("headerUserName").textContent = name.split(" ")[0];
    $("headerUserStatus").textContent = "Connecté";
    $("avatarInitials").textContent = initial;
    $("profileAvatar").textContent = initial;
    $("profileName").textContent = name;
    $("profileEmail").textContent = user.email || "Compte Google connecté";
    $("authMessage").textContent = "Connexion réussie.";
    setTimeout(() => dialog.close(), 700);
  });
  $("year").textContent = new Date().getFullYear();
  const search = $("searchInput");
  if (search) search.addEventListener("input", () => {
    $("resultsCount").textContent = search.value.trim() ? "Recherche prête — le catalogue sera disponible après activation de la base de données." : "Aucune annonce chargée";
  });
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
  }
})();
