(() => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const views = ["accueil", "decouvrir", "academie", "projets", "favoris", "profil"];
  const titles = {accueil:"Tableau de bord",decouvrir:"Découvrir",academie:"Académie numérique",projets:"Projets & défis",favoris:"Mes favoris",profil:"Mon profil"};

  function showView(name) {
    if (!views.includes(name)) return;
    $$(".view").forEach(v => v.classList.toggle("active", v.id === "view-" + name));
    $$(".nav-link[data-view]").forEach(b => b.classList.toggle("active", b.dataset.view === name));
    $("#pageHeading").textContent = titles[name];
    $("#sidebar").classList.remove("open");
    $("#mobileOverlay").classList.remove("show");
    window.location.hash = name;
    window.scrollTo({top:0, behavior:"smooth"});
  }

  $$("[data-view]").forEach(button => button.addEventListener("click", () => showView(button.dataset.view)));
  $$("[data-go]").forEach(button => button.addEventListener("click", () => showView(button.dataset.go)));

  $("#menuToggle").addEventListener("click", () => {
    $("#sidebar").classList.add("open");
    $("#mobileOverlay").classList.add("show");
  });
  $("#mobileOverlay").addEventListener("click", () => {
    $("#sidebar").classList.remove("open");
    $("#mobileOverlay").classList.remove("show");
  });

  const dialog = $("#authDialog");
  function openAuth() {
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }
  $("#accountButton").addEventListener("click", openAuth);
  $("#profileSignIn").addEventListener("click", openAuth);
  $("#closeAuth").addEventListener("click", () => dialog.close());
  $("#googleSignIn").addEventListener("click", () => window.CongoAuth.signInWithGoogle());

  function updateUser(session) {
    const user = session?.user;
    const name = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || "Visiteur";
    const initials = user ? name.slice(0,1).toUpperCase() : "?";
    $("#headerUserName").textContent = user ? name.split(" ")[0] : "Visiteur";
    $("#headerUserStatus").textContent = user ? "Connecté" : "Non connecté";
    $("#avatarInitials").textContent = initials;
    $("#profileAvatar").textContent = initials;
    $("#profileName").textContent = user ? name : "Profil non connecté";
    $("#profileEmail").textContent = user?.email || "Connecte-toi pour commencer ton profil.";
    if (user && dialog.open) dialog.close();
  }

  window.CongoAuth.getSession().then(updateUser);
  window.CongoAuth.onAuthChange(updateUser);

  $("#themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    const light = document.body.classList.contains("light-mode");
    $("#themeToggle").textContent = light ? "☀" : "◐";
  });

  $("#year").textContent = new Date().getFullYear();
  const initialView = location.hash.replace("#", "");
  if (views.includes(initialView)) showView(initialView);

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
  }
})();
