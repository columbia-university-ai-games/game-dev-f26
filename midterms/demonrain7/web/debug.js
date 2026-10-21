"use strict";
(() => {
  let state = null, editing = false;
  const names = {1:"Player",2:"Goblin",3:"Skeleton",4:"Ogre",5:"Gargoyle",6:"Dragon",7:"Turbo ogre",8:"Wall impact",9:"Normal shot",10:"Charged shot",11:"Enemy projectile",18:"Exit",19:"Torch",20:"Secret exit",21:"Turret E",22:"Turret S"};
  const playerFields = [
    ["hp","Health (HP)",0,127],["keys","Keys",0,9999],["potions","Potions",0,9999],["bolts","Bolts",0,9999],["nukes","Nukes",0,9999],
    ["power","Charge",0,13],["burst","Burst remaining",0,99],["score","Score",0,9999999],["god","Invincible (0/1)",0,1],
    ["x","Player X",0,62],["y","Player Y",0,62],["direction","Direction (0–3)",0,3],["delay","Cooldown (ticks)",0,255]
  ];
  const classFields = [["speed","Action threshold",0,256],["hp","Base HP",0,127],["damage","Damage",0,127],["points","Kill points",0,65535]];
  const objectFields = [["hp","Current HP",0,127],["x","X",1,62],["y","Y",1,62],["direction","Direction (0–3)",0,3],["active","Active (0/1)",0,1],["delay","Cooldown (ticks)",0,255]];
  const tiles = [[128,"Floor"],[129,"Solid wall"],[130,"Solid wall 2"],[136,"Breakable wall"],[143,"Wall with potion"],[144,"Wall with scroll"],[145,"Wall with key"],[162,"Potions"],[163,"Spell scroll"],[164,"Keys"],[165,"Vertical door"],[166,"Horizontal door"],[167,"Treasure (500 points)"]];
  const number = (id) => Number($(id).value);
  const message = (text) => { $("debug-message").textContent = text; };
  function option(select, value, label) { const o=document.createElement("option");o.value=value;o.textContent=label;select.append(o); }
  function buildFields(target, prefix, fields) {
    for (const [key,label,min,max] of fields) {
      const wrapper=document.createElement("label");wrapper.textContent=label;
      const input=document.createElement("input");input.id=prefix+key;input.type="number";input.min=min;input.max=max;input.step=1;input.required=true;input.title=`${min}–${max}`;
      wrapper.append(input);$(target).append(wrapper);
    }
  }
  buildFields("debug-player-fields","dp-",playerFields);
  buildFields("debug-class-fields","dc-",classFields);
  buildFields("debug-object-fields","do-",objectFields);
  for(let i=1;i<=30;i++) option($("debug-level"),i,"Level "+i);
  for(let i=2;i<=7;i++) option($("debug-spawn-class"),i,names[i]);
  for(const [id,label] of tiles) option($("debug-tile-kind"),id,label+" · "+id);
  function fill(prefix, fields, values) { for(const [key] of fields) $(prefix+key).value=values[key]; }
  function values(prefix, fields) { return fields.map(([key])=>number(prefix+key)); }
  function classForm() { const item=state?.classes.find(c=>c.id===number("debug-class"));if(item)fill("dc-",classFields,item); }
  function objectForm() {
    const item=state?.objects.find(o=>o.id===number("debug-object"));
    $("debug-object-apply").disabled=!item;$("debug-remove").disabled=!item;
    if(item)fill("do-",objectFields,{...item,hp:Math.max(0,item.hp)});
  }
  function map() {
    if(!state)return;
    const ctx=$("debug-map").getContext("2d");
    for(let y=0;y<64;y++)for(let x=0;x<64;x++) {
      const t=state.map[y][x];
      ctx.fillStyle=t===128?"#385640":t>=136&&t<=145?"#ad7241":t>=162&&t<=167?"#d2b46b":"#242b29";
      ctx.fillRect(x*8,y*8,8,8);
    }
    ctx.fillStyle="#ec8072";for(const o of state.objects)ctx.fillRect(o.x*8+2,o.y*8+2,4,4);
    ctx.fillStyle="#f2f5e9";ctx.fillRect(state.player.x*8,state.player.y*8,12,12);
    const x=number("debug-tile-x"),y=number("debug-tile-y");
    ctx.strokeStyle="#d2ed9b";ctx.lineWidth=2;ctx.strokeRect(x*8,y*8,8,8);
    $("debug-tile-current").textContent=`Selected (${x}, ${y}) · Current tile ${state.map[y]?.[x] ?? "—"}`;
  }
  function render(result) {
    state=result.state;draw(result.observation);
    fill("dp-",playerFields,state.player);
    $("debug-freeze-enemies").checked=Boolean(state.flags.freeze_enemies);
    $("debug-freeze-shots").checked=Boolean(state.flags.freeze_shots);
    $("debug-noclip").checked=Boolean(state.flags.noclip);
    const classId=$("debug-class").value,objectId=$("debug-object").value;
    $("debug-class").replaceChildren();for(const item of state.classes)option($("debug-class"),item.id,names[item.id]||"Type "+item.id);
    if(state.classes.some(c=>String(c.id)===classId))$("debug-class").value=classId;
    classForm();
    $("debug-object").replaceChildren();for(const item of state.objects)option($("debug-object"),item.id,`#${item.id} ${names[item.class]||"Effect "+item.class} · (${item.x}, ${item.y}) HP ${item.hp}`);
    if(state.objects.some(o=>String(o.id)===objectId))$("debug-object").value=objectId;
    objectForm();map();
  }
  async function locked(task) {
    if(editing || starting || !debugMode || !session)return;
    editing=true;pause();$("debug-fields").disabled=true;
    while(busy)await new Promise(resolve=>setTimeout(resolve,20));
    busy=true;
    try {await task();} catch(error){message("Could not complete: "+error.message);}
    finally {busy=false;editing=false;$("debug-fields").disabled=!debugMode;}
  }
  async function send(op,vals=[]) {
    return api("/api/debug",{session,op,values:vals,request_id:crypto.randomUUID()});
  }
  function refresh() {return locked(async()=>{render(await api("/api/debug?session="+encodeURIComponent(session)));message("Current values loaded. The game is paused; edit values, then resume.");});}
  function change(op,vals=[]) {return locked(async()=>{render(await send(op,vals));message("Applied and logged: "+op+". Click Resume below the game screen to see the result.");});}
  $("debug-button").addEventListener("click",()=>{
    $("debug-panel").hidden=!$("debug-panel").hidden;
    if(!$("debug-panel").hidden){pause();if(debugMode)refresh();$("debug-panel").scrollIntoView({behavior:"smooth",block:"start"});}
  });
  $("debug-enable").addEventListener("click",()=>{
    if(editing || starting)return;
    if(session && !confirm("Start a new debug session? This will end your current game."))return;
    const budget=number("debug-budget");
    if(!Number.isInteger(budget)||budget<1||budget>1000000){message("Tick limit must be an integer from 1 to 1,000,000.");return;}
    start({debug:true,level:number("debug-level"),max_ticks:budget});
  });
  $("debug-normal").addEventListener("click",()=>{if(!editing && !starting && (!session || confirm("End this session and restart level 1 with the original rules?")))start({});});
  $("debug-refresh").addEventListener("click",refresh);
  window.addEventListener("catacomb-session",()=>{
    state=null;$("debug-fields").disabled=!debugMode;$("debug-refresh").disabled=!debugMode;
    $("debug-mode-label").textContent=debugMode?"DEBUG · Not for evaluation":"Normal mode";
    $("debug-mode-label").classList.toggle("enabled",debugMode);
    if(debugMode){$("debug-panel").hidden=false;refresh();}else message("Normal mode is active. Debug changes ended with the previous session; original level 1 is loaded.");
  });
  $("debug-player-form").addEventListener("submit",e=>{e.preventDefault();change("player",values("dp-",playerFields));});
  $("debug-flags-form").addEventListener("submit",e=>{e.preventDefault();change("flags",[$("debug-freeze-enemies").checked?1:0,$("debug-freeze-shots").checked?1:0,$("debug-noclip").checked?1:0]);});
  $("debug-class").addEventListener("change",classForm);
  $("debug-class-form").addEventListener("submit",e=>{e.preventDefault();change("class",[number("debug-class"),...values("dc-",classFields),$("debug-apply-hp").checked?1:0]);});
  $("debug-object").addEventListener("change",objectForm);
  $("debug-object-form").addEventListener("submit",e=>{e.preventDefault();change("object",[number("debug-object"),...values("do-",objectFields)]);});
  $("debug-remove").addEventListener("click",()=>change("remove",[number("debug-object")]));
  $("debug-spawn-form").addEventListener("submit",e=>{e.preventDefault();change("spawn",[number("debug-spawn-class"),number("debug-spawn-x"),number("debug-spawn-y"),1]);});
  $("debug-clear-enemies").addEventListener("click",()=>change("clear",[0]));
  $("debug-clear-shots").addEventListener("click",()=>change("clear",[1]));
  $("debug-defaults").addEventListener("click",()=>change("defaults"));
  $("debug-tile-form").addEventListener("submit",e=>{e.preventDefault();change("tile",[number("debug-tile-x"),number("debug-tile-y"),number("debug-tile-kind")]);});
  $("debug-teleport").addEventListener("click",()=>{if(state){const p={...state.player,x:number("debug-tile-x"),y:number("debug-tile-y")};change("player",playerFields.map(([k])=>p[k]));}});
  $("debug-map").addEventListener("click",e=>{
    if(!state)return;
    const box=e.currentTarget.getBoundingClientRect();
    const x=Math.max(1,Math.min(62,Math.floor((e.clientX-box.left)/box.width*64)));
    const y=Math.max(1,Math.min(62,Math.floor((e.clientY-box.top)/box.height*64)));
    for(const prefix of ["debug-tile-","debug-spawn-"]){$(prefix+"x").value=x;$(prefix+"y").value=y;}
    map();
  });
  $("debug-step").addEventListener("click",()=>locked(async()=>{
    const ticks=number("debug-ticks");if(!Number.isInteger(ticks)||ticks<1||ticks>32)throw new Error("Ticks must be an integer from 1 to 32");
    draw(await api("/api/action",{session,sequence:sequence+1,action:{direction:$("debug-step-direction").value,fire:$("debug-step-fire").checked,ticks}}));
    render(await api("/api/debug?session="+encodeURIComponent(session)));message(`Advanced ${ticks} ticks. Paused again.`);
  }));
  $("debug-export").addEventListener("click",()=>locked(async()=>{
    render(await api("/api/debug?session="+encodeURIComponent(session)));
    const preset={schema:1,game:"Catacomb II",player:state.player,classes:state.classes,flags:state.flags};
    const url=URL.createObjectURL(new Blob([JSON.stringify(preset,null,2)],{type:"application/json"}));
    const a=document.createElement("a");a.href=url;a.download="catacomb-debug-parameters.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    message("Preset exported. The map and current objects are not included.");
  }));
  $("debug-import").addEventListener("click",()=>$("debug-import-file").click());
  $("debug-import-file").addEventListener("change",async e=>{
    const file=e.target.files[0];if(!file)return;
    try {
      if(file.size>100000)throw new Error("Preset file is too large");
      const preset=JSON.parse(await file.text());
      if(preset.schema!==1||preset.game!=="Catacomb II"||!Array.isArray(preset.classes))throw new Error("Unsupported preset format");
      const validate=(fields,record)=>{if(!record)throw new Error("Missing parameter values");for(const [k,,min,max] of fields)if(!Number.isInteger(record[k])||record[k]<min||record[k]>max)throw new Error("Value out of range: "+k);};
      validate(playerFields,preset.player);
      const seen=new Set();
      for(const c of preset.classes){if(!state.classes.some(x=>x.id===c.id)||seen.has(c.id))throw new Error("Invalid object type ID");seen.add(c.id);validate(classFields,c);}
      for(const k of ["freeze_enemies","freeze_shots","noclip"])if(![0,1].includes(preset.flags?.[k]))throw new Error("Invalid toggle value");
      if(!preset.flags.noclip && (preset.player.x!==state.player.x||preset.player.y!==state.player.y)){
        const {x,y}=preset.player;for(let dy=0;dy<2;dy++)for(let dx=0;dx<2;dx++)if(state.map[y+dy]?.[x+dx]!==128)throw new Error("The player position in this preset is not clear floor space on the current map");
      }
      await locked(async()=>{
        await send("flags",[preset.flags.freeze_enemies,preset.flags.freeze_shots,preset.flags.noclip]);
        for(const c of preset.classes)await send("class",[c.id,c.speed,c.hp,c.damage,c.points,0]);
        render(await send("player",playerFields.map(([k])=>preset.player[k])));message("Preset imported. The map, objects, and level have not changed.");
      });
    }catch(error){message("Import failed: "+error.message);}finally{e.target.value="";}
  });
})();
