let isOn;
console.log("start")

chrome.storage.local.get("switchCallReq", v => isOn = v.switchCallReq);

chrome.storage.onChanged.addListener((ch, na) => {
    if(ch.switchCallReq){
        chrome.storage.local.get("switchCallReq", v => isOn = v.switchCallReq);
    }
});

let data;
const time = {
    minute: 1,
    hour: 1,
    day: 0,
}
let date;
let sended = 0;
let maxSend;
let dataForSend = {}

const script = async (p) => {

    if(p.name == "exchangeData"){    
        p.onMessage.addListener(msg=>{ 
            if(isOn){
                if(msg.method == "createTab"){
                    chrome.tabs.create({active: false, index:5, url:"http://www.charmdate.com/clagt/loginb.htm"})
                }
                if(msg.method == "switchOnTab") {
                    chrome.tabs.reload(msg.tabid)
                }
                if(msg.method == "sendData"){
                    data = msg.data;
                    time.hour = 1;
                    p.postMessage({method: "dataNotReady"})
                }
                if(msg.method == "sended"){
                    sended++;
                } 
                if(msg.method == "sendDate"){
                    date = msg.date
                }
                if(msg.method == "askData"){
                    if(!!data){
                        maxSend=data.qV
                        if(time.minute==60){time.minute=1, time.hour++}
                        if(time.hour==24){time.hour=1; time.day++}
                        if(time.day==3){console.log(time.day); p.postMessage({method: "daysError", day:time.day})}
                        if(data.menId.length>0 && sended<maxSend){
                            dataForSend = {
                                wId: data.wId,
                                mId: data.menId[0],
                                minute: time.minute,
                                hour: time.hour,
                                date: date || undefined
                            }            
                            p.postMessage({method: "data", dataForSend});
                            time.minute++;
                        } else if(data.menId.length>0 && sended==maxSend){
                            data.menId.shift();
                            // time.day=0;
                            // time.hour=1;
                            // time.minute=1;
                            sended=0;
                        }
                    } else {p.postMessage({method: "dataNotReady"})}
                }
            }
        })
    }
}
chrome.runtime.onConnect.addListener(p=>script(p))
 

// сделать ввод даты для мужчины, -2 дня,
// выпадающий каледарь,
// продолжать у мужиков после смены мужчины,
// 