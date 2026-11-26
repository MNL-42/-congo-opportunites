(() => {
  const config = window.APP_CONFIG || {};
  const ready = Boolean(window.supabase?.createClient && config.SUPABASE_URL && config.SUPABASE_ANON_KEY);
  const client = ready ? window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  }) : null;
  const $ = (s, root=document) => root.querySelector(s);
  const dialog = $("#authDialog");
  const message = (text, good=false) => {
    const node=$("#authMessage");
    if(node){node.textContent=text;node.classList.toggle("success",good);}
  };
  const safe = (s) => String(s || "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  let mode = "login";

  function installAuthForm(){
    if(!dialog || $("#emailAuthForm")) return;
    const intro = dialog.querySelector("p");
    if(intro) intro.textContent="Crée ton compte ou connecte-toi avec ton adresse e-mail.";
    const form=document.createElement("form");
    form.id="emailAuthForm";
    form.className="email-auth-form";
    form.innerHTML=`
      <label class="auth-field auth-name-field" hidden>Nom complet<input name="name" type="text" autocomplete="name" maxlength="70" placeholder="Ton nom complet"></label>
      <label class="auth-field">Adresse e-mail<input name="email" type="email" autocomplete="email" required placeholder="nom@exemple.com"></label>
      <label class="auth-field">Mot de passe<input name="password" type="password" autocomplete="current-password" minlength="8" required placeholder="8 caractères minimum"></label>
      <button class="primary-button auth-submit" type="submit">Se connecter</button>
      <div class="auth-links"><button type="button" id="authModeToggle">Créer un compte</button><button type="button" id="authForgot">Mot de passe oublié ?</button></div>`;
    const google=$("#googleSignIn");
    if(google) dialog.insertBefore(form,google); else dialog.appendChild(form);
    form.addEventListener("submit", submitEmail);
    $("#authModeToggle",form).addEventListener("click",toggleMode);
    $("#authForgot",form).addEventListener("click",resetPassword);
    const recovery=document.createElement("form");
    recovery.id="passwordRecoveryForm";
    recovery.className="email-auth-form";
    recovery.hidden=true;
    recovery.innerHTML=`<p>Choisis un nouveau mot de passe.</p><label class="auth-field">Nouveau mot de passe<input name="password" type="password" minlength="8" required autocomplete="new-password"></label><button class="primary-button" type="submit">Enregistrer le mot de passe</button></form>`;
    dialog.appendChild(recovery);
    recovery.addEventListener("submit", async e=>{
      e.preventDefault();
      const password=new FormData(recovery).get("password");
      const {error}=await client.auth.updateUser({password});
      if(error) return message(error.message);
      recovery.hidden=true; form.hidden=false; message("Mot de passe mis à jour.",true);
    });
    const signout=document.createElement("button");
    signout.type="button"; signout.id="profileSignOut"; signout.className="secondary-button";
    signout.textContent="Se déconnecter";
    signout.hidden=true;
    const panel=$(".profile-panel");
    if(panel) panel.insertAdjacentElement("afterend",signout);
    signout.addEventListener("click",async()=>{
      const {error}=await client.auth.signOut();
      if(error) message(error.message); else message("Tu es déconnecté.",true);
    });
  }

  function toggleMode(){
    mode=mode==="login"?"signup":"login";
    const form=$("#emailAuthForm");
    const name=$(".auth-name-field",form);
    const password=$('input[name="password"]',form);
    name.hidden=mode!=="signup";
    password.autocomplete=mode==="signup"?"new-password":"current-password";
    $(".auth-submit",form).textContent=mode==="signup"?"Créer mon compte":"Se connecter";
    $("#authModeToggle",form).textContent=mode==="signup"?"J’ai déjà un compte":"Créer un compte";
    $("#authForgot",form).hidden=mode==="signup";
    message(mode==="signup"?"Inscris-toi avec ton nom, ton e-mail et un mot de passe sécurisé.":"Connecte-toi à ton espace.");
  }

  async function submitEmail(e){
    e.preventDefault();
    if(!client) return message("Le service de connexion n’est pas configuré.");
    const form=e.currentTarget, data=new FormData(form);
    const email=String(data.get("email")||"").trim();
    const password=String(data.get("password")||"");
    const name=String(data.get("name")||"").trim();
    const submit=$(".auth-submit",form);
    submit.disabled=true; submit.textContent="Patiente…";
    try{
      if(mode==="signup"){
        const {data:result,error}=await client.auth.signUp({email,password,options:{data:{full_name:name},emailRedirectTo:location.origin+location.pathname}});
        if(error) throw error;
        if(result.session) message("Compte créé. Bienvenue !",true);
        else message("Compte créé. Vérifie ta boîte e-mail pour confirmer ton adresse.",true);
      }else{
        const {error}=await client.auth.signInWithPassword({email,password});
        if(error) throw error;
        message("Connexion réussie.",true);
      }
    }catch(err){message(err.message||"Une erreur est survenue.");}
    finally{submit.disabled=false;submit.textContent=mode==="signup"?"Créer mon compte":"Se connecter";}
  }

  async function resetPassword(){
    const email=$('#emailAuthForm input[name="email"]').value.trim();
    if(!email) return message("Saisis d’abord ton adresse e-mail.");
    const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname});
    if(error) message(error.message); else message("Si cette adresse est enregistrée, un lien de réinitialisation sera envoyé.",true);
  }

  async function signInWithGoogle(){
    if(!client) return message("Le service de connexion n’est pas configuré.");
    const {error}=await client.auth.signInWithOAuth({provider:"google",options:{redirectTo:location.origin+location.pathname}});
    if(error) message("Google n’est pas encore activé dans les fournisseurs Supabase. Utilise l’e-mail pour le moment.");
  }
  async function signOut(){if(client) await client.auth.signOut();}
  async function getSession(){if(!client)return null;const {data}=await client.auth.getSession();return data.session||null;}
  function onAuthChange(callback){if(client)client.auth.onAuthStateChange((_event,session)=>callback(session));}
  function open(){if(dialog?.showModal)dialog.showModal();else dialog?.setAttribute("open","");}
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",installAuthForm); else installAuthForm();
  if(client){
    client.auth.onAuthStateChange((event,session)=>{
      document.dispatchEvent(new CustomEvent("congo-auth-state",{detail:{event,session}}));
      if(event==="PASSWORD_RECOVERY"){
        const f=$("#passwordRecoveryForm"), login=$("#emailAuthForm");
        if(f&&login){f.hidden=false;login.hidden=true;open();}
      }
    });
  }
  window.CongoAuth={signInWithGoogle,signOut,getSession,onAuthChange,isConfigured:()=>Boolean(client),getClient:()=>client,open};
})();