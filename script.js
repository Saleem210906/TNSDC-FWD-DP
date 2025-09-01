(function(){
  const el = {
    hh: document.querySelector('.hh'),
    mm: document.querySelector('.mm'),
    ss: document.querySelector('.ss'),
    ampm: document.getElementById('ampm'),
    month: document.getElementById('month'),
    date: document.getElementById('date'),
    weekday: document.getElementById('weekday'),
    toggle24: document.getElementById('toggle24'),
    alarmTime: document.getElementById('alarmTime'),
    alarmEnabled: document.getElementById('alarmEnabled'),
    alarmLabel: document.getElementById('alarmLabel'),
    alarmState: document.getElementById('alarmState'),
    clock: document.getElementById('clock'),
  };

  const weekdays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  let beeping = false;
  let audioCtx = null;

  function pad(n){ return String(n).padStart(2,'0'); }

  function update(){
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    el.month.textContent = pad(now.getMonth()+1);
    el.date.textContent  = pad(now.getDate());
    el.weekday.textContent = weekdays[now.getDay()];

    const is24 = el.toggle24.checked;
    if(!is24){
      el.ampm.style.display = "";
      el.ampm.textContent = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
    }else{
      el.ampm.style.display = "none";
    }

    el.hh.textContent = pad(hours);
    el.mm.textContent = pad(minutes);
    el.ss.textContent = pad(seconds);

    checkAlarm(now);
  }

  function checkAlarm(now){
    if(!el.alarmEnabled.checked || !el.alarmTime.value){ stopBeep(); return; }
    const [h,m] = el.alarmTime.value.split(':').map(Number);
    const match = now.getHours() === h && now.getMinutes() === m && now.getSeconds() === 0;
    if(match){ ring(); }
  }

  function ring(){
    if(beeping) return;
    beeping = true;
    el.clock.classList.add('ringing');
    el.alarmState.textContent = "Ringing";

    try{
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = "sine";
      o.frequency.value = 880;
      g.gain.value = 0.001;
      o.connect(g).connect(audioCtx.destination);
      o.start();

      let on = true;
      const id = setInterval(()=>{
        on = !on;
        g.gain.exponentialRampToValueAtTime(on ? 0.2 : 0.001, audioCtx.currentTime + 0.05);
      }, 300);

      setTimeout(()=>{ clearInterval(id); stopBeep(); }, 20000);
    }catch(e){}
  }

  function stopBeep(){
    if(!beeping) return;
    beeping = false;
    el.clock.classList.remove('ringing');
    el.alarmState.textContent = el.alarmEnabled.checked ? "On" : "Off";
    if(audioCtx){
      try{ audioCtx.close(); }catch(e){}
      audioCtx = null;
    }
  }

  el.alarmTime.addEventListener('change', ()=>{
    el.alarmLabel.textContent = el.alarmTime.value || "--:--";
  });
  el.alarmEnabled.addEventListener('change', ()=>{
    el.alarmState.textContent = el.alarmEnabled.checked ? "On" : "Off";
    if(!el.alarmEnabled.checked) stopBeep();
  });

  el.alarmLabel.textContent = "--:--";
  el.alarmState.textContent = "Off";
  update();

  (function tick(){
    const now = Date.now();
    const delay = 1000 - (now % 1000) + 5;
    setTimeout(()=>{ update(); tick(); }, delay);
  })();
})();