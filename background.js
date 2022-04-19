let isOn;
console.log("start")

chrome.storage.local.get("switchCallReq", v => isOn = v.switchCallReq);

chrome.storage.onChanged.addListener((ch, na) => {
    if(ch.switchCallReq){
        console.log(ch)
        chrome.storage.local.get("switchCallReq", v => isOn = v.switchCallReq);
    }
});


let data;
let i = 1;
let hourZone = 1;
let sended = 0;
let maxSend;
let dataForSend = {}

const script = async (p) => {

    if(p.name == "exchangeData"){    
        p.onMessage.addListener(msg=>{ 
            if(isOn){
                if(msg.method == "createTab"){
                    chrome.tabs.create({active: false, index:5, url:"https://www.charmdate.com/clagt/lovecall/add.php"})
                }
                if(msg.method == "switchOnTab") {
                    chrome.tabs.reload(msg.tabid)
                }
                if(msg.method == "sendData"){
                    data = msg.data;
                    hourZone = 1;
                    p.postMessage({method: "dataNotReady"})
                }
                if(msg.method == "sended"){
                    sended++;
                } 
                if(msg.method == "askData"){
                    if(!!data){
                        maxSend=data.qV
                        if(i==60){i=1, hourZone++}
                        if(hourZone==24){hourZone=1}
                        if(data.menId.length>0 && sended<maxSend){
                            dataForSend = {
                                wId: data.wId,
                                mId: data.menId[0],
                                i: i,
                                hourZone,
                            }            
                            p.postMessage({method: "data", dataForSend});
                            i++;
                        } else if(data.menId.length>0 && sended==maxSend){
                            data.menId.shift();
                            hourZone++;
                            i=1;
                            sended=0;
                        }
                    } else {p.postMessage({method: "dataNotReady"})}
                }
            }
        })
    }
}
chrome.runtime.onConnect.addListener(p=>script(p))
 