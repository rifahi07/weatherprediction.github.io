const App = {

history: [],
lastResult:null,
tempUnit:"C",
windUnit:"kmh",

init(){

this.loadHistory()

document.getElementById("prediction-form")
.addEventListener("submit",(e)=>this.handlePredict(e))

document.getElementById("tempToggle").onclick=()=>this.toggleTemp()
document.getElementById("windToggle").onclick=()=>this.toggleWind()

initChart()

},

handlePredict(e){

e.preventDefault()

const city=document.getElementById("city-input").value
const date=document.getElementById("date-input").value
const time=document.getElementById("time-input").value

fetch("/predict",{

method:"POST",
headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
city:city,
date:date,
time:time
})

})
.then(res=>res.json())
.then(result=>{

this.lastResult=result

document.getElementById("res-city").textContent=result.city
document.getElementById("res-value").textContent=result.temp
document.getElementById("temp-unit").textContent="°C"

document.getElementById("res-humidity").textContent=result.humidity+"%"
document.getElementById("res-wind").textContent=result.wind+" km/h"

const iconMap={
Sunny:"☀️",
Cloudy:"☁️",
Hot:"🔥",
Cold:"❄️",
Windy:"💨",
Rainy:"🌧️",
"Clear Night":"🌙"
}

document.getElementById("res-icon").textContent=
iconMap[result.condition]||"⛅"

document.getElementById("res-condition").textContent=result.condition

updateChart(result.forecast)

this.saveToHistory(result)

this.showPage("prediction")

})

},

toggleTemp(){

if(!this.lastResult) return

if(this.tempUnit==="C"){

let f=(this.lastResult.temp*9/5)+32
document.getElementById("res-value").textContent=f.toFixed(1)
document.getElementById("temp-unit").textContent="°F"
this.tempUnit="F"

}else{

document.getElementById("res-value").textContent=this.lastResult.temp
document.getElementById("temp-unit").textContent="°C"
this.tempUnit="C"

}

},

toggleWind(){

if(!this.lastResult) return

let wind=this.lastResult.wind

if(this.windUnit==="kmh"){

let ms=(wind/3.6).toFixed(2)
document.getElementById("res-wind").textContent=ms+" m/s"
this.windUnit="ms"

}else{

document.getElementById("res-wind").textContent=wind+" km/h"
this.windUnit="kmh"

}

},

showPage(page){

document.querySelectorAll(".page")
.forEach(p=>p.classList.remove("active"))

document.getElementById(page)
.classList.add("active")

},

saveToHistory(result){

this.history.unshift(result)

if(this.history.length>10)
this.history.pop()

localStorage.setItem(
"weatherHistory",
JSON.stringify(this.history)
)

this.renderHistory()

},

loadHistory(){

const data=localStorage.getItem("weatherHistory")

if(data){
this.history=JSON.parse(data)
this.renderHistory()
}

},

renderHistory(){

const container=document.getElementById("history-list")

if(!container) return

container.innerHTML=""

this.history.forEach(item=>{

const div=document.createElement("div")
div.className="history-item"

div.innerHTML=`
<div>
<strong>${item.city}</strong><br>
<span>${item.temp}°C</span>
</div>
`

container.appendChild(div)

})

}

}

let chart

function initChart(){

const ctx=document.getElementById("weatherChart")

if(!ctx) return

chart=new Chart(ctx,{
type:"line",
data:{
labels:[],
datasets:[{
label:"",
data:[],
borderWidth:3,
tension:0.4,
fill:true,
backgroundColor:"rgba(79,172,254,0.2)",
borderColor:"#4facfe"
}]
}
})

}

function updateChart(forecast){

chart.data.labels=[]
chart.data.datasets[0].data=[]
chart.data.datasets[0].pointBackgroundColor=[]

forecast.forEach((point,i)=>{

chart.data.labels.push(point.time)
chart.data.datasets[0].data.push(point.temp)

if(i===3){
chart.data.datasets[0].pointBackgroundColor.push("#ff4757")
}else{
chart.data.datasets[0].pointBackgroundColor.push("#4facfe")
}

})

chart.update()

}

const app=App

window.onload=()=>app.init()