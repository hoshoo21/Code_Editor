
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



