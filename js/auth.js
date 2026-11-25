(() => {
  let supabaseClient = null;
  const config = window.APP_CONFIG || {};
  const hasConfig = Boolean(config.SUPABASE_URL && config.SUPABASE_ANON_KEY);
  const sdkReady = Boolean(window.supabase && window.supabase.createClient);

  if (hasConfig && sdkReady) {
    supabaseClient = window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
  }

  const status = (message) => {
    const node = document.getElementById("authMessage");
    if (node) node.textContent = message;
  };

  async function signInWithGoogle() {
    if (!hasConfig || !supabaseClient) {
      status("La connexion n’est pas encore disponible. Réessaie plus tard.");
      return;
    }
    status("Ouverture de la connexion Google…");
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + window.location.pathname }
    });
    if (error) status("La connexion n’a pas abouti. Vérifie ta connexion Internet et réessaie.");
  }

  async function signOut() {
    if (!supabaseClient) return;
    await supabaseClient.auth.signOut();
  }

  async function getSession() {
    if (!supabaseClient) return null;
    const { data } = await supabaseClient.auth.getSession();
    return data.session || null;
  }

  async function onAuthChange(callback) {
    if (!supabaseClient) return;
    supabaseClient.auth.onAuthStateChange((_event, session) => callback(session));
  }

  window.CongoAuth = { signInWithGoogle, signOut, getSession, onAuthChange, isConfigured: () => Boolean(supabaseClient) };
})();
