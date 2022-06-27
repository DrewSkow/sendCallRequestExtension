//check switch on/off
let isOn;
let isMultiPageOn;

//data 
let date;
let data;
let localDate;
let multiPage;

//checker
let sended = 0;
let maxSend;
let checkNewLady;
let checkClear = true;
let checkErrors = {
    checkSended: 0,
    error: 0
};

// for send
let dataForSend = {};
let phone;
const time = {
    minute: 1,
    hour: 1,
    day: 0,
    month: 0
}

//set switch on/off
chrome.storage.local.get("switchCallReq", v => isOn = v.switchCallReq);
chrome.storage.local.get("multiMode", v => isMultiPageOn = v.multiMode);

chrome.storage.onChanged.addListener((ch, na) => {
    if(ch.switchCallReq){
        isOn =  ch.switchCallReq.newValue;
    }
    if(ch.multiMode){
        isMultiPageOn = ch.multiMode.newValue;
    }
});

function randomInteger(min, max) {
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    return Math.round(rand);
}

const openTabs = () => {
    for(let i = 0; i<multiPage;i++){
        chrome.tabs.create({active: false, url:"http://www.charmdate.com/clagt/lovecall/add.php"});
    }
} 

const script = async (p) => {
    if(p.name == "exchangeData"){
        p.onMessage.addListener(msg => {
            if(isOn){
                msg.method == "createTab" && chrome.tabs.create({active: false, index:5, url:"http://www.charmdate.com/clagt/lovecall/add.php"});

                msg.method == "runScriptInTab" && chrome.tabs.reload(msg.tabid);

                msg.method == "multiPage" && (multiPage = msg.multiPages);
                
                msg.method == "skipMan" && data.menId.shift();

                msg.method == "sendDate" && (date = msg.date);

                if(msg.method == "sended"){
                    sended++;
                    if(sended == maxSend-1 && isMultiPageOn){
                        chrome.storage.local.set({stopScr: true});
                        chrome.tabs.query({active:false}, v => {
                            v.forEach(item => chrome.tabs.remove(item.id));
                        }); 
                    }
                } 

                if (msg.method == "bookingError") {
                    if(checkErrors.error == 10){
                        time.hour++;
                    } else if(checkErrors.error > 10 && checkErrors.error%10==0) {
                        time.hour++;
                    } else if(checkErrors.error > 10 && checkErrors.error%15==0) {
                        time.day++;
                    } else if(checkErrors.error > 10 && checkErrors.error%21==0){
                        time.month++;
                    } else if(checkErrors.checkSended == sended){
                        checkErrors.error++;
                    } else {
                        checkErrors.error = 0; 
                        checkErrors.checkSended = sended;
                    }
                }

                if (msg.method == "sendData" ) {
                    data = msg.data;
                    console.log(msg.date);
                    date = new Date(msg.date);
                    if(checkNewLady !=data.wId){
                        checkNewLady = data.wId;
                        phone = randomInteger(1000009, 9999999)
                    }
                    checkClear = true;
                    isMultiPageOn && chrome.storage.local.set({stopScr: false})
                }

                if(msg.method == "askData") {
                    if(!!data){
                        maxSend=data.qV
                        if(time.minute==60){time.minute=1, time.hour++}
                        if(time.hour==24){time.hour=1; time.day++}
                        if(time.day==6){ 
                            p.postMessage({method: "daysError", day:time.day}); 
                            checkErrors.error = 0; 
                            checkErrors.checkSended = 0;
                            time.month = 0;
                        }                        

                        if(isMultiPageOn && !!multiPage){
                            openTabs();
                            chrome.storage.local.set({multiMode: false});
                        }

                        if((data.menId.length > 0 && sended < maxSend ) || (data.menId.length>0 && sended<maxSend-1 && isMultiPageOn )){
                            
                            dataForSend = {
                                wId: data.wId,
                                mId: data.menId[0],

                                date: date.setDate(!!time.day ? (date.getDate()-time.day) : date.getDate()),
                                minute: checkClear?data.minute:time.minute,
                                hour: checkClear?data.hour+1:time.hour,

                                phone
                            }           
                            p.postMessage({method: "data", dataForSend});

                            if(checkClear){
                                time.minute = data.minute;
                                data.minute = undefined;
                                
                                time.hour = data.hour+1;
                                data.hour = undefined;
                                checkClear = false;
                            }
                            time.minute++;
                        } else if(data.menId.length>0 && sended==maxSend){
                            if(isMultiPageOn){
                                setTimeout(()=> {
                                    data.menId.shift();
                                    // time.day=0;
                                    // time.hour=1;
                                    // time.minute=1;
                                    sended=0;
                                    if(data.menId.length>0){openTabs()}  
                                    chrome.storage.local.set({stopScr: false});
                                }, 5000)
                            }
                            else {
                                data.menId.shift();
                                sended=0;
                            }
                        }
                    } else {p.postMessage({method: "dataNotReady"})} 
                }
            }
        })
    }
}

chrome.runtime.onConnect.addListener(p=>script(p))


