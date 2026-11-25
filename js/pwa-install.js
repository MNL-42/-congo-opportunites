(() => {
  const button=document.getElementById("installAppButton");
  if(!button)return;
  let installPrompt=null;
  const dialog=document.createElement("dialog");
  dialog.className="pwa-dialog";
  dialog.id="pwaInstallDialog";
  dialog.innerHTML='<button type="button" class="academy-dialog-close" aria-label="Fermer"><svg class="ui-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button><span class="academy-card-tag">CONGO OPPORTUNITÉS</span><h2>Installer l’application</h2><p id="pwaInstallIntro">Ajoute Congo Opportunités à ton écran d’accueil pour retrouver tes cours plus facilement.</p><ol id="pwaInstallSteps"></ol><p class="pwa-tip">L’application reste accessible depuis ton écran d’accueil. Une connexion Internet peut être nécessaire pour certaines fonctions et images.</p>';
  document.body.appendChild(dialog);
  const intro=dialog.querySelector("#pwaInstallIntro"),steps=dialog.querySelector("#pwaInstallSteps");
  const ios=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
  const standalone=window.matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
  function showInstructions(){
    if(standalone){intro.textContent="Congo Opportunités est déjà installée sur cet appareil.";steps.innerHTML="<li>Ouvre-la depuis ton écran d’accueil.</li>";}
    else if(ios){intro.textContent="Sur iPhone ou iPad, l’installation se fait depuis Safari :";steps.innerHTML="<li>Ouvre cette adresse dans <strong>Safari</strong>.</li><li>Appuie sur le bouton <strong>Partager</strong> (le carré avec une flèche).</li><li>Fais défiler puis choisis <strong>Sur l’écran d’accueil</strong>.</li><li>Appuie sur <strong>Ajouter</strong>.</li>";}
    else{intro.textContent="Pour installer l’application sur Android :";steps.innerHTML="<li>Ouvre le menu ⋮ de Chrome.</li><li>Choisis <strong>Installer l’application</strong> ou <strong>Ajouter à l’écran d’accueil</strong>.</li><li>Confirme l’installation.</li>";}
    if(!dialog.open)dialog.showModal();
  }
  button.addEventListener("click",async()=>{
    if(installPrompt){installPrompt.prompt();const choice=await installPrompt.userChoice;installPrompt=null;button.hidden=choice.outcome==="accepted";return;}
    showInstructions();
  });
  dialog.querySelector(".academy-dialog-close").addEventListener("click",()=>dialog.close());
  dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close();});
  window.addEventListener("beforeinstallprompt",event=>{event.preventDefault();installPrompt=event;button.hidden=false;});
  window.addEventListener("appinstalled",()=>{installPrompt=null;button.hidden=true;intro.textContent="Congo Opportunités est maintenant installée.";});
  button.hidden=standalone?true:false;
})();