
    console.log("inject work")
    document.getElementById("womanid").addEventListener("click", (e) => {
        getWomanProfile(e.target.value);
    });    
    document.getElementById("manid").addEventListener("click", (e) => {
        getWomanProfile(e.target.value);
    });    
    document.getElementById("callm").addEventListener("click", () => {
        getCallTime("LOCAL");
    }); 
