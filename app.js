let viewDate=new Date(2026,7,1);
const monthSelect=document.querySelector("#monthSelect");
const yearSelect=document.querySelector("#yearSelect");
MONTHS.forEach((name,i)=>{const o=document.createElement("option");o.value=i;o.textContent=name;monthSelect.appendChild(o)});
for(let y=2024;y<=2032;y++){const o=document.createElement("option");o.value=y;o.textContent=y;yearSelect.appendChild(o)}
function sync(){monthSelect.value=viewDate.getMonth();yearSelect.value=viewDate.getFullYear()}
function render(){sync();renderCalendar(viewDate.getFullYear(),viewDate.getMonth())}
monthSelect.addEventListener("change",()=>{viewDate=new Date(+yearSelect.value,+monthSelect.value,1);render()});
yearSelect.addEventListener("change",()=>{viewDate=new Date(+yearSelect.value,+monthSelect.value,1);render()});
document.querySelector("#prevMonth").addEventListener("click",()=>{viewDate=new Date(viewDate.getFullYear(),viewDate.getMonth()-1,1);render()});
document.querySelector("#nextMonth").addEventListener("click",()=>{viewDate=new Date(viewDate.getFullYear(),viewDate.getMonth()+1,1);render()});
document.querySelector("#todayBtn").addEventListener("click",()=>{const d=new Date();viewDate=new Date(d.getFullYear(),d.getMonth(),1);render()});
render();