chrome.storage.local.get("switchCallReq", v => v.switchCallReq && generalSrc());
const port = chrome.runtime.connect({name: "exchangeData"});

const generalSrc = () => {

	if(document.location.href == 'http://www.charmdate.com/clagt/woman/women_profiles_allow_edit.php'){
		document.location.href = "http://www.charmdate.com/clagt/lovecall/add.php";
	}

	if (document.location.href == "http://www.charmdate.com/clagt/lovecall/add2.php?act=saveandsubmit"){
		port.postMessage({method: "sended"});
		document.location.href = "http://www.charmdate.com/clagt/lovecall/add.php";
	}

	// checking errors 
	const err = document.getElementsByClassName("red");
	if (err.length>0){
		const errEl = document.getElementsByClassName("STYLE1");
		for(let i = 0; i<err.length; i++){
			if(errEl[i].innerHTML.indexOf("Male member") == 0){
				port.postMessage({method: "skipMan"});
				location.reload();
			} else if(errEl[i].innerHTML.indexOf("Booking is full") == 0){
				port.postMessage({method: "bookingError"});
			}
		} 
	}



	

	let check = 0;

	if(check==0){port.postMessage({method: "askData"})}

	port.onMessage.addListener(msg=>{
		switch (msg.method) {
			case "data" : {
				if(check===0){
					sendReq(msg.dataForSend);
					check++;
				}
			}
			case ("daysError") : {
				if(msg.day==3){
					alert("Было проверено 6 дня от выбранной даты - это 90 попыток отправки по разным часам и месяцам");
					window.stop(); 
					return false 
				};
			}
			case "dataNotReady" : {
				setTimeout(()=>{
					if(check === 0){port.postMessage({method: "askData"})};
				}, 2000)
			}
		}
	})

	const checkZeroBefore = (t,data) => {
		if (t == "d"){
			if (data < 10) {return `0${data}`}
			else {return `${data}`};
		} else {
			if (data < 9) {return `0${data+1}`}
			else {return `${data+1}`};
		}
	}

	const checkMinutes = (id) => {
		if(id<15){return id};
		if(id>=15){return id+1};
		if(id>=28){return id+2};
	}

	//variables for profiles
	var wtskey = new Array();
	var Separator=";";
	var Fields=6;
	var womanFlag = false;
	var manFlag = false;
	var LocalOffset = 2;
	var wts = new Array();

	function GetField(Entry,number)
	{
	//read fields from array wts
	var Out="";
	var FirstChar;
	var LastChar;
	FirstChar=0;
	LastChar=Entry.indexOf(Separator);
	if(number==1){
		Out+=Entry.substring(FirstChar,LastChar);
		return Out;
	}
	if(number==Fields){
		Out+=Entry.substring(Entry.lastIndexOf(Separator)+1,Entry.length);
		return Out;
	}
	for(var i=2;i<=number;i++){
		FirstChar=LastChar+1;
		LastChar=Entry.indexOf(Separator, FirstChar);
	}
	Out+=Entry.substring(FirstChar,LastChar);
	return Out;
	}

	function getTimeZone(code){
		if(code!=''){
			var timezonelist = new Array();
			$.ajax(
			{
				url: '/includes/timezone_ajax.php',
				type: 'post',
				dataType: 'xml',
				async: false,
				data: 'code=' + code,
		
				success: function(xml){
					var i=0;
					$(xml).find('timezone').each(
						function(){
							var id			= $(this).find('id').text();
							var city		= $(this).find('city').text();
							var offset		= $(this).find('offset').text();
							var difftime	= $(this).find('difftime').text();
							var dst			= $(this).find('dst').text();
		
							var oprstr = offset<0 ? '-' : '+';
							offset = Math.abs(offset);
		
							timezonelist[i] = "GMT " + difftime + ";" + city + ";" + dst + ";" + oprstr + ";" + offset + ";" + id;
							i++;
						}
					);
				}
			});
		
			return timezonelist;
	}
	}

	function createOptions(code){
		//ajax getdata
		wts = getTimeZone(code);

		//create options
		$('#timezone').empty();
		$("<option value=''>Please choose -----</option>").appendTo('#timezone');
		for(var i=0;i<wts.length;i++){
			wtskey[GetField(wts[i],6)] = i;
			$("<option value='" + GetField(wts[i],6) + "'>" + GetField(wts[i],2) + " ( " + GetField(wts[i],1) + " )</option>").appendTo('#timezone');
		}
		//$('#timezone').val(GetField(wts[0],6));

		return wts;
	}

	function TransTime(stime,offset,hours,toType)
	{
		var onehour=3600000;

		if(offset=='+'){
			hours = hours - LocalOffset;
			stime = toType=='LOCAL' ? stime-onehour*hours : stime+onehour*hours;
		}else
		if(offset=='-'){
			hours = hours + LocalOffset;
			stime = toType=='LOCAL' ? stime+onehour*hours : stime-onehour*hours;
		}

		return stime;
	}

	function getCallTime(toType)
	{
		var tzone=document.getElementById('timezone');
		var cdate=document.getElementById('calldate');
		var chour=document.getElementById('callh');
		var cminu=document.getElementById('callm');
		var bdate=document.getElementById('bjtdate');
		var bhour=document.getElementById('bjth');
		var bminu=document.getElementById('bjtm');

		//if(tzone.selectedIndex>0){
			var vdate,vhour,vminu,offset,hours;
			var s = tzone.options[tzone.selectedIndex].value;
			vdate = toType=='LOCAL' ? cdate.value : bdate.value;
			vhour = toType=='LOCAL' ? chour.options[chour.selectedIndex].value : bhour.options[bhour.selectedIndex].value;
			vminu = toType=='LOCAL' ? cminu.options[cminu.selectedIndex].value : bminu.options[bminu.selectedIndex].value;

			if(vdate!='' && vhour!='' && vminu!=''){
				vhour = parseInt(vhour,10);
				vminu = parseInt(vminu,10);
				offset = GetField(wts[wtskey[s]],4);
				hours = GetField(wts[wtskey[s]],5);
				hours = parseFloat(hours);

				var cYear = parseInt(vdate.substring(0,4),10);
				var cMonth = parseInt(vdate.substring(5,7),10)-1;
				var cDay = parseInt(vdate.substring(8,10),10);
				var sTime = new Date(cYear,cMonth,cDay,vhour,vminu,0);
				var tTime = new Date(TransTime(sTime.getTime(),offset,hours,toType));

				cMonth = tTime.getMonth()+1;
				cMonth = cMonth<10?"0"+cMonth:cMonth;
				cDay = tTime.getDate();
				cDay = cDay<10?"0"+cDay:cDay;

				vdate = tTime.getFullYear() + "-" + cMonth + "-" + cDay;
				vhour = tTime.getHours();
				vminu = tTime.getMinutes();

				if(toType=='LOCAL'){
					bdate.value=vdate;
					bhour.selectedIndex=vhour+1;
					bminu.selectedIndex=Math.floor(vminu/15)+1;
				}else{
					cdate.value=vdate;
					chour.selectedIndex=vhour+1;
					cminu.selectedIndex=Math.floor(vminu/15)+1;
				}
			}
		//}
	}

	async function getWomanProfile(womanidVal)
	{
		var ss;
		await $.ajax(
		{
			url: 'get_info.php?act=getwomaninfo',
			type: 'post',
			dataType: 'xml',
			data: 'womanid=' + womanidVal,

			success: function(xml){
				$(xml).find('womanprofile').each(
					function(){
						var cnname		= $(this).find('cnname').text();
						var birthday	= $(this).find('birthday').text();
						var city		= $(this).find('city').text();
						var province	= $(this).find('province').text();
						var phone_ac	= $(this).find('callphone_ac').text();
						var phone		= $(this).find('callphone').text();

						womanFlag = true;
						$('#womanMsg').html('');

						ss = "";
						ss += womanidVal + "<br />";
						ss += "Name: " + cnname + "<br />";
						ss += "Birth: " + birthday + "<br />";
						ss += "City: " + city + ", " + province + "<br />";
						
						$('#womanprofile').html(ss);

						var photourl = $(this).find('photourl').text();
						ss = "";
						ss += "<a href='../woman/women_preview_profile.php?womanid=" + womanidVal + "' target='_blank'><img src='" + photourl + "' style='width:70px; height:85px;border:#CCCCCC 1px solid' /></a>";
						$('#womanphoto').html(ss);

						//$('#womanphone_ac').val(phone_ac);
						$('#womanphone2').val(phone);
						//$('#womanphone_ac').removeClass('STYLE5');
						$('#womanphone2').removeClass('STYLE5');
					}
				),

				$(xml).find('errorMsg').each(
					function(){
						var errMsg		= $(this).find('msg').text();
						ss = "";
						ss += "<font color='#FF0000'>" + errMsg +"</font>";

						womanFlag = false;
						$('#womanprofile').html('');
						$('#womanphoto').html('');
						$('#womanMsg').html(ss);
					}
				)
			}

		});//end ajax
	}

	//ajax get man profile
	async function getManProfile(manidVal)
	{
		var ss;
		await $.ajax(
		{
			url: 'get_info.php?act=getmaninfo',
			type: 'post',
			dataType: 'xml',
			data: 'manid=' + manidVal,

			success: function(xml){
				$(xml).find('manprofile').each(
					function(){
						var firstname	= $(this).find('firstname').text();
						var age			= $(this).find('age').text();
						var country		= $(this).find('country').text();
						var countrycode	= $(this).find('countrycode').text();
						var living		= $(this).find('living').text();
						var livingcode	= $(this).find('livingcode').text();

						manFlag = true;
						$('#manMsg').html('');

						ss = "";
						ss += manidVal + "<br />";
						ss += "Name: " + firstname + "<br />";
						ss += "Age: " + age + "<br />";
						ss += "Country: " + country + "<br />";
						$('#manprofile').html(ss);

						var photostr = $(this).find('photostr').text();
						ss = "";
						ss += "<a href='../admire/men_profile.php?manid=" + manidVal + "' target='_blank'><img src='" + photostr + "' width='70' height='85' border='0'></a>";
						$('#manphoto').html(ss);

						//select country
						$('#country').val(livingcode==''?countrycode:livingcode);
						wts = createOptions(livingcode==''?countrycode:livingcode);
						if( $('#bjtdate').val()!='' && $('#calldate').val()=='' ){
							getCallTime(null);
						}else{
							getCallTime('LOCAL');
						}
					}
				),

				$(xml).find('errorMsg').each(
					function(){
						var errMsg		= $(this).find('msg').text();
						ss = "";
						ss += "<font color='#FF0000'>" + errMsg +"</font>";

						manFlag = false;
						$('#manprofile').html('');
						$('#manphoto').html('');
						$('#manMsg').html(ss);
					}
				),
				
				$(xml).find('azx').each(
					function(){
						azxVal = "";
						azxVal = "<input id='manid_azx' type='text' name='manid_azx' value='" + manidVal + "'>";

						manFlag2 = true;
						$('#azx').html(azxVal);
					}
				)
			}

		});//end ajax
	}

	const setGMTTime = (offset) => {
		let utc;
		const d = new Date();
		localTime = d.getTime();
		localOffset = d.getTimezoneOffset() * 60000;
		utc = localTime + localOffset;
		const nd = new Date(utc + (3600000*offset));
		utc = new Date(utc);
		return utc;
	}

	const setTime = (data) => {
		document.getElementById("timezone").options[1].selected=true;  

		const daymill = 24*60*60*1000;
		const time = setGMTTime(0);
		time.setMonth(time.getMonth()+6);

		if(!!data?.date?.day){
			document.getElementById("calldate").value=`${data.date.year}-${data.date.month}-${data.date.day}`;
		} else {
			document.getElementById("calldate").value=`${time.getFullYear()}-${checkZeroBefore("m", time.getMonth()-data.date.month)}-${checkZeroBefore("d",time.getDate())}`;
		}

		document.getElementById("callh").options[data.hour].selected=true;

		const minutes = document.getElementById("callm");
		minutes.append(new Option (checkZeroBefore("d", checkMinutes(data.minute)), checkZeroBefore("d", checkMinutes(data.minute)), false, true));
		getCallTime("LOCAL");
		document.getElementById("womanphone").value=`+38095${data.phone}`;
		document.getElementsByName("needtrans")[1].checked=true;
	}

	const sendReq = async (data) => {
		const wid = document.getElementById("womanid");
		wid.value=data.wId;
		await getWomanProfile(data.wId);

		const mid = document.getElementById("manid");
		mid.value=data.mId;
		await getManProfile(data.mId);

		setTimeout(()=> {
			setTime(data);
		}, 2000);

		// setTimeout(()=>{
		// 	document.forms[0].action = "add.php?act=saveandsubmit";
		// 	document.forms[0].submit();
		// }, 3000)	
	}
}


