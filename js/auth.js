(() => {
  const cfg = window.CONGO_CONFIG || {};
  let client = null;
  const message = (text) => {
    const node = document.getElementById("authMessage");
    if (node) node.textContent = text;
  };
  const configured = Boolean(cfg.supabaseUrl && cfg.supabaseAnonKey && window.supabase?.createClient);
  if (configured) {
    client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
    window.CONGO_AUTH = {
      client,
      signIn: async () => {
        message("Connexion sécurisée en cours…");
        const { error } = await client.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: window.location.href.split("#")[0] }
        });
        if (error) message("Connexion impossible : " + error.message);
      },
      signOut: async () => client.auth.signOut()
    };
    client.auth.getSession().then(({ data }) => window.dispatchEvent(new CustomEvent("congo-auth-ready", { detail: data.session })));
    client.auth.onAuthStateChange((_event, session) => window.dispatchEvent(new CustomEvent("congo-auth-ready", { detail: session })));
  } else {
    window.CONGO_AUTH = {
      client: null,
      signIn: async () => message("La connexion Google n'est pas encore activée. L'équipe doit d'abord configurer Supabase et Google OAuth dans les paramètres du projet."),
      signOut: async () => {}
    };
  }
})();
