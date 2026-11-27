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
    if(!document.getElementById("authFormStyles")){
      const style=document.createElement("style"); style.id="authFormStyles";
      style.textContent=".email-auth-form{display:grid;gap:12px;margin:18px 0}.auth-field{display:grid;gap:7px;text-align:left;font-size:13px;color:var(--text-secondary,#aab7c4)}.auth-field input{width:100%;min-height:46px;border:1px solid var(--border,rgba(255,255,255,.14));border-radius:12px;padding:12px 14px;background:rgba(255,255,255,.06);color:inherit;font:inherit;outline:none}.auth-field input:focus{border-color:#10b981;box-shadow:0 0 0 3px rgba(16,185,129,.15)}.auth-submit{width:100%;justify-content:center}.auth-links{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}.auth-links button{border:0;background:none;color:#10b981;font:inherit;font-size:13px;cursor:pointer;padding:4px}.auth-message.success{color:#10b981}.auth-dialog #profileSignOut{margin:12px 0}";
      document.head.appendChild(style);
    }
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
    recovery.innerHTML=`<p>Choisis un nouveau mot de passe.</p><label class="auth-field">Nouveau mot de passe<input name="password" type="password" minlength="8" required autocomplete="new-password"></label><button class="primary-button" type="submit">Enregistrer le mot de passe</button>`;
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


  async function syncProfile(session){
    if(!client || !session?.user) return;
    const user=session.user;
    const fallback=String(user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "Membre").slice(0,70);
    const {data:profile,error}=await client.from("profiles").select("display_name,username,bio,city").eq("id",user.id).maybeSingle();
    if(error){console.warn("Profil indisponible:",error.message);return;}
    const name=profile?.display_name || fallback;
    const nameNode=$("#profileName"), emailNode=$("#profileEmail");
    if(nameNode) nameNode.textContent=name;
    if(emailNode) emailNode.textContent=user.email || "";
    if(!$("#profileEditForm")){
      const panel=$(".profile-panel");
      if(panel){
        const form=document.createElement("form");
        form.id="profileEditForm"; form.className="profile-edit-form";
        form.innerHTML=`
          <label class="auth-field">Nom affiché<input name="display_name" maxlength="70" required></label>
          <label class="auth-field">Nom d’utilisateur<input name="username" maxlength="30" pattern="[A-Za-z0-9_]{3,30}" placeholder="ex. manasse_01"></label>
          <label class="auth-field">Ville / province<input name="city" maxlength="80" placeholder="Kinshasa"></label>
          <label class="auth-field">Présentation<textarea name="bio" maxlength="280" rows="3" placeholder="Présente-toi en quelques mots"></textarea></label>
          <button class="primary-button" type="submit">Enregistrer mon profil</button>
          <p class="auth-message" id="profileSaveMessage" role="status"></p>`;
        panel.insertAdjacentElement("afterend",form);
        form.addEventListener("submit",async e=>{
          e.preventDefault();
          const data=new FormData(form);
          const save=form.querySelector("button[type=submit]");
          const status=$("#profileSaveMessage");
          save.disabled=true; save.textContent="Enregistrement…";
          const payload={id:user.id,display_name:String(data.get("display_name")||"").trim(),username:String(data.get("username")||"").trim().toLowerCase()||null,city:String(data.get("city")||"").trim(),bio:String(data.get("bio")||"").trim(),updated_at:new Date().toISOString()};
          const {error}=await client.from("profiles").upsert(payload,{onConflict:"id"});
          save.disabled=false; save.textContent="Enregistrer mon profil";
          if(error){status.textContent=error.code==="23505"?"Ce nom d’utilisateur est déjà utilisé.":error.message;status.classList.remove("success");return;}
          if(nameNode) nameNode.textContent=payload.display_name;
          status.textContent="Profil enregistré.";status.classList.add("success");
        });
      }
    }
    const form=$("#profileEditForm");
    if(form){
      form.elements.display_name.value=name;
      form.elements.username.value=profile?.username||"";
      form.elements.city.value=profile?.city||"";
      form.elements.bio.value=profile?.bio||"";
    }
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
    }catch(err){message(({"Invalid login credentials":"E-mail ou mot de passe incorrect.","User already registered":"Ce compte existe déjà : touche « J’ai déjà un compte »."})[err.message]||err.message||"Une erreur est survenue.");}
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
      if(session?.user) syncProfile(session); else { const f=$("#profileEditForm"); if(f) f.remove(); }
      if(event==="PASSWORD_RECOVERY"){
        const f=$("#passwordRecoveryForm"), login=$("#emailAuthForm");
        if(f&&login){f.hidden=false;login.hidden=true;open();}
      }
    });
  }
  async function hideGoogleIfDisabled(){
    const button=$("#googleSignIn");
    if(!button||!client) return;
    button.hidden=true;
    try{
      const res=await fetch(config.SUPABASE_URL+"/auth/v1/settings",{headers:{apikey:config.SUPABASE_ANON_KEY}});
      const settings=await res.json();
      button.hidden=!settings?.external?.google;
    }catch{}
  }
  hideGoogleIfDisabled();
  window.CongoAuth={signInWithGoogle,signOut,getSession,onAuthChange,isConfigured:()=>Boolean(client),getClient:()=>client,open};
})();
