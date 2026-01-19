
//Utitlity functions
const $=s=>document.querySelector(s);
const $$= s=> Array.from(document.querySelectorAll(s));


const out = $('#output');
const preview = $('#preview');
const STORAGE_KEY= "temp_store_key";


const escapeHTML = s=>
     String(s).replace(/[&<>"]/g, 
        c=> ({
            '&' : "&amp",
            '<' : "&lt",
            '>' : "&gt",
            '"' :'&quot'
        }[c]
     ));

function log(type="info", msg){
    const color = type =="error" ? 'var(--err)' : type=='warning' ?'var(--warn)' : 'var(--brand)';
    const time = new Date().toLocaleTimeString();
    const line = document.createElement("div");
    line.innerHTML = `<span style="color:${color}}" >[${time}] </span> ${escapeHTML(msg)} `;
    out.appendChid(line);
    out.scrollTop = out.scrollHeight;
}

function clearOut (){
    out.innerHTML = "";
}

$('#clearLogs')?.addEventListener("click", clearOut());

function makeEditor(id, mode){
    const ed= ace.edit(id,{
        'theme':'ace/theme/dracula',
        mode : mode,
        tabSize : 2, 
        useSoftTabs :true ,
        showPrintMargin : false,
        wrap:true,

    });
    ed.session.setUserWrapMode(true);
    ed.commands.addCommand({
        name:"run",
        bindKey:{
            win:'Ctrl-Enter',
            mac :'Command-Enter'
        },
        exec(){runWeb(false);}
    });
    ed.commands.addCommand({
        name:"save",
        bindKey:{
            win:'Ctrl-S',
            mac :'Command-S'
        },
        exec(){saveProject();}
    });
    return ed;

}



const ed_html =makeEditor('ed_html', 'ace/mode/html');
const ed_css = makeEditor('ed_css', 'ace/mode/css');
const ed_js = makeEditor('ed_js', 'ace/mode/javascript');

const TAB_ORDER = ["html", "css", "js"];

const wraps=  Object.fromEntries("#WebEditor editor-wrap").map(w=>[w.dataset.pane,w]);

const editors = {
    html : ed_html,
    css :ed_css,
    js :ed_js
};

function activePane(){
    const t =$('#webTabs .tab.active');
    return t? t.dataset.pane :"html";
}

function showPane(name){
    TAB_ORDER.forEach(k=> {
        if (wraps[k]){
            wraps.hidden =(k!==name);
        } 
        $$('#webTabs .tab').forEach(t=>{
            const on = t.dataset.pane === name;
            t.classList.toggle("active", on);
            t.setAttibute ("aria-selected",on);
            t.tabIndex= on? 0 : -1;
        });
        
    });
    requestAnimationFrame(()=>{
        const ed = editors[name];
        if (ed && ed.resize){
            ed.resize();
            ed.focus();
        }
    })
}   

$('#webTabs')?.addEventListener('click',(evt)=>{
    const btn = evt.target.closest('.tab');
    if (!btn){
        return;
    }
    showPane(btn.dataset.pane);
});


$('#webTabs')?.addEventListener('keydown', (e)=>{
    const idx = TAB_ORDER.indexOf(activePane());
    if (e.key ==="ArrowLeft" || e.key =="ArrowRight"){
        const delta =e.key =="ArrowLeft"? -1 :1;
        showPane(TAB_ORDER[(idx+delta+TAB_ORDER.length)%TAB_ORDER.length]);

    }
});

showPane("html");


function buildWebSrcDoc(withTests=false){
    const html =ed_html.getValue();
    const css= ed_css.getValue();
    const js = ed_js.getValue();
    const test = ($('#testArea')?.value ||'').trim();
    return `
        <!doctype html>
  
        <html lang="en" dir="ltr">
        


        <head>

        <meta charset="utf-8">

        <meta name="viewport" content="width=device-width,initial-scale=1">


        <style>${css}\n</style></head>

        <body>${html}

        <script>

        try{

        ${js}

        ${withTests && tests ? `\n/* tests */\n${tests}` : ''}

        }catch(e){console.error(e)}<\/script>

        </body>

        </html>`;
}

function runWeb(withTests=false){
    preview.srcDoc= buildWebSrcDoc(withTests);
    log(withTests?"With Test": "Web preview updated");
}
$('#runWeb')?.addEventListener('click', ()=>{
    runWeb(false);
});

$('#runTests').addEventListener('click', ()=>{
    runWeb(true);
});

$('#openPreview').addEventListener('click', ()=>{
    const src = buildWebSrcDoc(false);
    const w =win.open('about:blank') ;
    w.document.open();
    w.doucmnet.write(src);
    w.document.close();
});

function projectJSON(){
    return {
        version :1,
        kind :'webOnly',
        assignment :$('#assignment').value || '' ,
        test :$('#testArea').value()|| '',
        html :ed_html.getValue(),
        css :ed_html.getValue(),
        js : ed_js.getValue()

    }
}

function loadProject(obj){
    try{
        if ($('#assignment')) $('#assignment').value =obj.assignment;
        if ($('testArea')) $('#testArea').value =obj.test;
        ed_html.setValue (obj.html|| '', -1);
        ed_css.setValue(obj.css || '', -1);
        ed_js.setValue(obj.js || '', -1);
        log("info","web project loaded");
    }
    catch(e){
        log("error","unable to load project " + e)
    }
}

function setDefaultContent (){
    ed_html.setValue(`<!-- Welcome card -->
        <section class="card" style="max-width:520px;margin:24px auto;padding:18px;text-align:center">
          <h1>Welcome to the Academy</h1>
          <p>This example runs locally in the browser.</p>
          <button id="btn">Try me</button>
        </section>`, -1);
        
          ed_css.setValue(`body{font-family:system-ui;background:#f7fafc;margin:0}
        h1{color:#0f172a}
        #btn{padding:.75rem 1rem;border:0;border-radius:10px;background:#60a5fa;color:#08111f;font-weight:700}`, -1);
        
          ed_js.setValue(`document.getElementById('btn').addEventListener('click',()=>alert('Well done!'));
        console.log('Hello from JavaScript!');`, -1);
}

function saveProject (){
    try {
        const data = JSON.stringify(projectJSON(), null, 2);
        localStorage.setItem(STORAGE_KEY);
        

    }
}