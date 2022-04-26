const sendBtn = document.getElementById("sendButton");
const womenId = document.getElementById("i_w_id");
const menData = document.getElementById("i_m_id");
const quantity = document.getElementById("req_quantity");
const timeM = document.getElementById("timeM");
const timeH = document.getElementById("timeH");
const dateField = document.querySelector(".selected-date");
const switchButton = document.getElementById("switchButton");
const wrapper = document.querySelector(".wrapper");
const multiPageBtn = document.getElementById("switchButtonMultiPage");
const multiPageInput = document.getElementById("multiPage");

let date;

//connect to port
const port = chrome.runtime.connect({name: "exchangeData"});

//switcher 
chrome.storage.local.get("switchCallReq", v => switchButton.checked = v.switchCallReq)

switchButton.addEventListener("click", e => chrome.storage.local.set({switchCallReq: e.target.checked}));

//set and get data (localstorage)
wrapper.addEventListener("input", (e) => {
    chrome.storage.local.set({[e.target.id]:e.target.value})
})

chrome.storage.local.get(["i_w_id", "i_m_id", "req_quantity", "minute", "hour", "date", "multiPage"], v => {
    womenId.value = v.i_w_id || null;
    menData.value = v.i_m_id || null;
    quantity.value = v.req_quantity || null;
    timeM.value = v.minute || "";
    timeH.value = v.hour || "";
    multiPageInput.value = v.multiPage || null;
    v?.date?.selectedDay? dateField.innerHTML = `${v.date.selectedDay+" / "+(+v.date.selectedMonth+1) +" / "+v.date.selectedYear}`:false;
    date = !!v.date && new Date(`${v.date.selectedYear+ "-" + v.date.selectedMonth + "-" + v.date.selectedDay}`)  || null;
})

//mouse wheel using
const onWheelHandler = (e, t) => {
    if(e.deltaY>0){
        e.target.value--;
        if (e.target.value<0){e.target.value=0}
    } else {
        e.target.value++;
        if(t == "m" && e.target.value>59){
            e.target.value = 59;
        } else if(t=="h" && e.target.value>23){e.target.value=23};
    }
    t=="m" && chrome.storage.local.set({minute: e.target.value});
    t=="h" && chrome.storage.local.set({hour: e.target.value});
}

timeH.addEventListener("mousewheel", e => onWheelHandler(e, "h"));
timeH.addEventListener('input', e => {
    if(e.target.value>23){
        e.target.value=23;
    } else if(e.target.value<0){e.target.value = 0}
    chrome.storage.local.set({hour: e.target.value});
})
timeM.addEventListener("mousewheel", e => onWheelHandler(e, "m"));
timeM.addEventListener('input', e => {
    if(e.target.value>59){
        e.target.value=59;
    } else if(e.target.value<0){e.target.value = 0}
    chrome.storage.local.set({minute: e.target.value});
})

// switch multi-mode
chrome.storage.local.get("multiMode", v => multiPageBtn.checked = v.multiMode)
multiPageBtn.addEventListener('click', e => chrome.storage.local.set({multiMode: e.target.checked}))

//send data
const sendData = async () => {
    await chrome.tabs.query({url:["http://www.charmdate.com/clagt/lovecall/add.php", "http://www.charmdate.com/clagt/lovecall/add.php?act=saveandsubmit"]}, v =>{
        v.length == 0 && port.postMessage({method: "createTab"});
        v.length != 0 && port.postMessage({method: "runScriptInTab", tabid: v[0].id})
    })
    const menId = menData.value.split(",");
    const wId = womenId.value;
    const qV = quantity.value
    const hour = +timeH.value;
    const minute = +timeM.value;
    const data = {menId, wId, qV, hour, minute}

    await port.postMessage({method: "multiPage", multiPages: multiPageInput.value});

    if(!!wId && !!menId && !!qV){
        await port.postMessage({method: "sendData", data, date})
    } else{
        alert("одно из полей не заполнено")
    }
//   await chrome.storage.local.remove(["i_w_id", "i_m_id", "req_quantity", "minute", "hour", "date"]);
}
sendBtn.addEventListener('click', sendData)


