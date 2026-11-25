(() => {
"use strict";
const $=(s,r=document)=>r.querySelector(s),grid=$("#academyGrid"),courses=window.CongoCourses||[];
if(!grid||!courses.length)return;
const images={Technologie:"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80",Business:"https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=80",Création:"https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=900&q=80",Sciences:"https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",Carrière:"https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80"};
const completed=(()=>{try{return JSON.parse(localStorage.getItem("co-academy-progress")||"{}")}catch{return{}}})();
const totalLessons=courses.reduce((n,c)=>n+c.lessons.length,0),safe=v=>String(v??"").replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
let activeCategory="Tous",activeCourse=null,activeLesson=0;
function progress(c){return Math.round(c.lessons.filter((_,i)=>completed[c.id+"-"+i]).length/c.lessons.length*100)}
function stats(){$("#academyCourseCount").textContent=courses.length;$("#academyLessonCount").textContent=totalLessons;$("#academyProgressCount").textContent=Object.values(completed).filter(Boolean).length}
function render(){
const q=$("#academySearch").value.trim().toLocaleLowerCase("fr"),level=$("#academyLevel").value;
const list=courses.filter(c=>(activeCategory==="Tous"||c.category===activeCategory)&&(!level||c.level===level)&&(!q||[c.title,c.desc,c.tag,c.skills.join(" ")].join(" ").toLocaleLowerCase("fr").includes(q)));
$("#academyResultsCount").textContent=list.length+" parcours";
grid.innerHTML=list.length?list.map((c,i)=>'<article class="academy-card" style="--card-index:'+Math.min(i,8)+'"><div class="academy-cover"><img loading="lazy" src="'+(images[c.category]||images.Technologie)+'" alt="" onerror="this.style.display=\'none\'"><span class="academy-course-icon '+c.tone+'">'+safe(c.icon)+'</span><span class="academy-level">'+safe(c.level)+'</span></div><div class="academy-card-body"><span class="academy-card-tag">'+safe(c.tag)+'</span><h3>'+safe(c.title)+'</h3><p>'+safe(c.desc)+'</p><div class="academy-skills">'+c.skills.map(x=>'<span>'+safe(x)+'</span>').join("")+'</div><div class="academy-card-bottom"><span>'+c.lessons.length+' leçons</span><span>'+progress(c)+'% terminé</span></div><div class="academy-progress"><i style="width:'+progress(c)+'%"></i></div><button class="academy-open" type="button" data-open-course="'+safe(c.id)+'">Ouvrir le cours <span>→</span></button></div></article>').join(""):'<div class="academy-no-results"><span>⌕</span><h3>Aucun cours trouvé</h3><p>Essaie un autre mot-clé ou un autre domaine.</p></div>';
stats();
}
function sample(c,language){
const lang=language||(c.id==="web"?"html":c.id==="python"?"python":c.id==="php"?"php":c.id==="flutter"?"dart":c.id==="sql"?"sql":"javascript");
const samples={
html:['<!doctype html>','<html lang="fr"><body>','<h1>Bonjour Congo !</h1>','<p>Ma première page.</p>','<button onclick="this.textContent=&quot;Bravo !&quot;">Tester</button>','</body></html>'].join("\n"),
css:['body { font-family: Arial; padding: 24px; background: #e8fff4; }','h1 { color: #087a5b; }'].join("\n"),
javascript:['const nom = "Congo";','console.log("Bonjour " + nom);','document.body.innerHTML += "<p>Le code fonctionne !</p>";'].join("\n"),
python:['nom = "Congo"','print("Bonjour", nom)'].join("\n"),
php:['<?php','$nom = "Congo";','echo "Bonjour " . $nom;','?>'].join("\n"),
dart:['void main() {','  final nom = "Congo";','  print("Bonjour $nom");','}'].join("\n"),
sql:['SELECT nom, ville','FROM apprenants','ORDER BY nom;'].join("\n")
};
return samples[lang]||samples.javascript;
}
function lessonMarkup(c,i){
const l=c.lessons[i],extra=(window.COURSE_LESSONS||{})[c.id+"-"+i],intro=extra?.intro||l[1]||"Découvre les notions essentielles de cette leçon.",points=extra?.points||["Comprends le principe présenté.","Observe les mots-clés et les notions importantes.","Essaie de reformuler la leçon avec tes propres mots."],example=extra?.example||"Exemple : "+l[0]+".",exercise=extra?.exercise||"Réalise un petit exemple qui utilise cette notion.";
return '<div class="lesson-reading"><span class="academy-card-tag">LEÇON '+String(i+1).padStart(2,"0")+'</span><h2>'+safe(l[0])+'</h2><p class="lesson-lead">'+safe(intro)+'</p><section class="lesson-block"><h3>Comprendre</h3><p>'+safe(intro)+'</p><ul class="lesson-points">'+points.map(x=>'<li>'+safe(x)+'</li>').join("")+'</ul></section><section class="lesson-callout"><strong>EXEMPLE À OBSERVER</strong><p>'+safe(example)+'</p></section><section class="lesson-block"><h3>Mini-défi</h3><p>'+safe(exercise)+'</p></section><pre class="lesson-code"><code>'+safe(sample(c))+'</code></pre><div class="lesson-actions"><button class="academy-primary" type="button" data-open-lab="'+safe(c.id)+'">Ouvrir l’espace pratique</button><button class="academy-quiet" type="button" data-mark-lesson="'+safe(c.id)+'-'+i+'">'+(completed[c.id+"-"+i]?"✓ Leçon terminée":"Marquer comme terminée")+'</button></div></div>';
}
function reader(){
const c=activeCourse;if(!c)return;const pct=progress(c);
$("#academyDialogContent").innerHTML='<div class="reader-top"><div><span class="academy-card-tag">'+safe(c.tag)+'</span><h2 id="academyDialogTitle">'+safe(c.title)+'</h2><p>'+safe(c.desc)+'</p></div><div class="reader-progress"><strong>'+pct+'%</strong><span>progression</span></div></div><div class="academy-progress"><i style="width:'+pct+'%"></i></div><div class="reader-layout"><nav class="reader-lessons" aria-label="Leçons du cours"><h3>Contenu du cours</h3>'+c.lessons.map((l,i)=>'<button type="button" class="reader-lesson '+(i===activeLesson?'active ':'')+(completed[c.id+"-"+i]?'done':'')+'" data-select-lesson="'+i+'"><span>'+(completed[c.id+"-"+i]?'✓':String(i+1).padStart(2,"0"))+'</span><span>'+safe(l[0])+'</span></button>').join("")+'</nav><main class="reader-main">'+lessonMarkup(c,activeLesson)+'<div class="reader-pager"><button type="button" class="academy-quiet" data-prev '+(activeLesson===0?'disabled':'')+'>← Précédent</button><span>Leçon '+(activeLesson+1)+' / '+c.lessons.length+'</span><button type="button" class="academy-primary" data-next '+(activeLesson===c.lessons.length-1?'disabled':'')+'>Suivant →</button></div></main></div><div class="academy-disclaimer">Les cours sont hébergés directement dans Congo Opportunités. Les contenus seront enrichis progressivement.</div>';
}
function openCourse(id){activeCourse=courses.find(c=>c.id===id);activeLesson=0;if(!activeCourse)return;reader();const d=$("#academyDialog");if(!d.open)d.showModal()}
function openLab(id){
const c=courses.find(x=>x.id===id);if(!c)return;
const lang=c.id==="web"?"html":c.id==="python"?"python":c.id==="php"?"php":c.id==="flutter"?"dart":c.id==="sql"?"sql":"javascript";
$("#academyDialogContent").innerHTML='<div class="lab-heading"><span class="academy-card-tag">ATELIER INTERACTIF</span><h2>Espace de code</h2><p>Écris, modifie et teste ton exemple sans quitter le cours.</p></div><div class="lab-toolbar"><label>Langage<select id="labLanguage"><option value="html">HTML</option><option value="css">CSS</option><option value="javascript">JavaScript</option><option value="python">Python</option><option value="php">PHP</option><option value="sql">SQL</option><option value="dart">Dart / Flutter</option></select></label><button class="academy-primary" id="runCode" type="button">▶ Exécuter</button><button class="academy-quiet" id="resetCode" type="button">Réinitialiser</button></div><textarea class="code-editor" id="codeEditor" spellcheck="false" autocapitalize="off" autocomplete="off" aria-label="Éditeur de code"></textarea><div class="lab-output-head"><strong>Résultat</strong><span id="labStatus">Prêt à exécuter</span></div><iframe class="code-output" id="codeOutput" title="Résultat du code" sandbox="allow-scripts"></iframe><p class="lab-note" id="labNote">Aperçu local isolé. Le code ne peut pas accéder aux données du compte.</p><button class="academy-quiet" type="button" id="backToLesson">← Retour au cours</button>';
const select=$("#labLanguage"),editor=$("#codeEditor");select.value=lang;editor.value=sample(c,lang);const initial=editor.value;
function run(){
const mode=select.value,code=editor.value,frame=$("#codeOutput");
if(["html","css","javascript"].includes(mode)){
let page=mode==="html"?code:mode==="css"?'<!doctype html><html><head><style>'+code+'</style></head><body><h1>Mon aperçu CSS</h1><p>Modifie les styles pour observer le résultat.</p></body></html>':'<!doctype html><html><body><h1>Console JavaScript</h1><pre id="log"></pre><script>const log=(...v)=>document.querySelector("#log").textContent+=v.join(" ")+"\\n";console.log=log;try{'+code+'}catch(e){log(e.message)}<\\/script></body></html>';
frame.srcdoc=page;$("#labStatus").textContent="Exécuté dans l’aperçu";$("#labNote").textContent="Aperçu local isolé. Les scripts n’ont pas accès au compte ni aux données du site.";
}else{
frame.srcdoc='<!doctype html><html><body style="font:14px system-ui;padding:18px;color:#334"><h3>Environnement non activé</h3><p>Le code '+safe(mode.toUpperCase())+' reste dans l’éditeur, mais ce langage nécessite un moteur dédié qui n’est pas encore intégré.</p></body></html>';
$("#labStatus").textContent="Moteur non intégré";$("#labNote").textContent="HTML, CSS et JavaScript sont exécutables ici. Python, PHP, SQL et Dart/Flutter nécessitent un moteur adapté.";
}}
$("#runCode").addEventListener("click",run);$("#resetCode").addEventListener("click",()=>{editor.value=initial;$("#labStatus").textContent="Exemple restauré"});select.addEventListener("change",()=>{editor.value=sample(c,select.value);$("#labStatus").textContent="Exemple "+select.value.toUpperCase()+" chargé"});$("#backToLesson").addEventListener("click",reader);
}
grid.addEventListener("click",e=>{const b=e.target.closest("[data-open-course]");if(b)openCourse(b.dataset.openCourse)});
$("#academyDialogContent").addEventListener("click",e=>{
const lesson=e.target.closest("[data-select-lesson]");if(lesson){activeLesson=Number(lesson.dataset.selectLesson);reader();return}
if(e.target.closest("[data-prev]")){activeLesson=Math.max(0,activeLesson-1);reader();return}
if(e.target.closest("[data-next]")){activeLesson=Math.min(activeCourse.lessons.length-1,activeLesson+1);reader();return}
const lab=e.target.closest("[data-open-lab]");if(lab){openLab(lab.dataset.openLab);return}
const mark=e.target.closest("[data-mark-lesson]");if(mark){completed[mark.dataset.markLesson]=!completed[mark.dataset.markLesson];localStorage.setItem("co-academy-progress",JSON.stringify(completed));reader();render()}
});
$("#academyDialogClose").addEventListener("click",()=>$("#academyDialog").close());
$("#academyDialog").addEventListener("click",e=>{if(e.target===$("#academyDialog"))$("#academyDialog").close()});
$("#academySearch").addEventListener("input",render);$("#academyLevel").addEventListener("change",render);
$("#academyCategories").addEventListener("click",e=>{const b=e.target.closest("[data-acategory]");if(!b)return;activeCategory=b.dataset.acategory;$("#academyCategories").querySelectorAll("button").forEach(x=>x.classList.toggle("active",x===b));render()});
render();
})();