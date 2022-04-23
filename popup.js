const btn = document.getElementById("sendButton");
const womenId = document.getElementById("i_w_id");
const menData = document.getElementById("i_m_id");
const quantity = document.getElementById("req_quantity");
const timeH = document.getElementById("timeH");
const timeM = document.getElementById("timeM");

const port = chrome.runtime.connect({name: "exchangeData"});

const switchButton = document.getElementById("switchButton");
chrome.storage.local.get("switchCallReq", v => switchButton.checked = v.switchCallReq)

chrome.storage.local.get("wId", v => womenId.value = v.wId||"");
chrome.storage.local.get("mId", v => menData.value = v.mId||"");
chrome.storage.local.get("quantity", v => quantity.value = +v.quantity || null  );

womenId.addEventListener('input', e=>chrome.storage.local.set({wId:e.target.value}));
menData.addEventListener('input', e=>chrome.storage.local.set({mId:e.target.value}));
quantity.addEventListener('input', e=>chrome.storage.local.set({quantity:e.target.value}));

const handleClick = async () => {
    await chrome.tabs.query({url:"http://www.charmdate.com/clagt/lovecall/add.php"}, v =>{
        v.length == 0 && port.postMessage({method: "createTab"});
        v.length != 0 && port.postMessage({method: "runScriptInTab", tabid: v[0].id})
    })
    const menId = menData.value.split(",");
    const wId = womenId.value;
    const qV = quantity.value
    const data = {menId, wId, qV}
    if(!!wId && !!menId && !!qV){
        await port.postMessage({method: "sendData", data})
    } else{
        alert("одно из полей не заполнено")
    }
  await chrome.storage.local.remove(["wId", "mId", "quantity"]);
}

const switchClick = (e) => {
    chrome.storage.local.set({switchCallReq: e.target.checked})
}

const onWheelHandler = (e, t) => {
    if(e.deltaY>0){
        e.target.value--;
        if (e.target.value<1){e.target.value=1}
    } else {
        e.target.value++;
        if(t == "m" && e.target.value>60){
            e.target.value = 60;
        } else if(t=="h" && e.target.value>23){e.target.value=23}
    }
}

timeH.addEventListener("mousewheel", e => onWheelHandler(e, "h"))
timeM.addEventListener("mousewheel", e => onWheelHandler(e, "m"))

btn.addEventListener('click', handleClick)

switchButton.addEventListener("click", switchClick);