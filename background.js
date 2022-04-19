let isOn;

chrome.storage.onChanged.addListener((ch, na) => {
    if(ch.switchCallReq?true:false){
        chrome.storage.local.get("switchCallReq", v => isOn = v.switchCallReq);
    }
});

let data;
let i = 15;
let hourZone = 1;
let sended = 0;
let maxSend;
let dataForSend = {}

const script = async (p) => {

    if(p.name == "exchangeData"){    
        p.onMessage.addListener(msg=>{
            if(isOn){
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
                            i=15;
                            sended=0;
                        }
                    } else {p.postMessage({method: "dataNotReady"})}
                }
            }
        })
    }
}
isOn && chrome.runtime.onConnect.addListener(p=>script(p))

// минут должно быть 60
// сделать переключение часов
// 