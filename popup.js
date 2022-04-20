const btn = document.getElementById("sendButton");
const womenId = document.getElementById("i_w_id");
const menData = document.getElementById("i_m_id");
const quantity = document.getElementById("req_quantity");

const port = chrome.runtime.connect({name: "exchangeData"});

const switchButton = document.getElementById("switchButton");
chrome.storage.local.get("switchCallReq", v => switchButton.checked = v.switchCallReq)

chrome.storage.local.get("wId", v => womenId.value = v.wId||"");
chrome.storage.local.get("mId", v => menData.value = v.mId||"");
chrome.storage.local.get("quantity", v => quantity.value = +v.quantity||0);

womenId.addEventListener('input', e=>chrome.storage.local.set({wId:e.target.value}));
menData.addEventListener('input', e=>chrome.storage.local.set({mId:e.target.value}));
quantity.addEventListener('input', e=>chrome.storage.local.set({quantity:e.target.value}));

const handleClick = async () => {
    await chrome.tabs.query({url:"http://www.charmdate.com/clagt/lovecall/add.php"}, v =>{
        console.log(v.length)
        v.length == 0 && port.postMessage({method: "createTab"});
        v.length != 0 && port.postMessage({method: "switchOnTab", tabid: v[0].id})
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

btn.addEventListener('click', handleClick)

const switchClick = (e) => {
    chrome.storage.local.set({switchCallReq: e.target.checked})
}

switchButton.addEventListener("click", switchClick);