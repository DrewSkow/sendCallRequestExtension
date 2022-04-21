const port = chrome.runtime.connect({name: "exchangeData"});

const date_picker_element = document.querySelector('.date-picker');
const selected_date_element = document.querySelector('.date-picker .selected-date');
const dates_element = document.querySelector('.date-picker .dates');
const mth_element = document.querySelector('.date-picker .dates .month .mth');
const next_mth_element = document.querySelector('.date-picker .dates .month .next-mth');
const prev_mth_element = document.querySelector('.date-picker .dates .month .prev-mth');
const days_element = document.querySelector('.date-picker .dates .days');

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const setGMTTime = (offset) => {
	let utc;
	const d = new Date();
	localTime = d.getTime();
	localOffset = d.getTimezoneOffset() * 60000;
	utc = localTime + localOffset;
	const nd = new Date(utc + (3600000*offset));
	utc = new Date(utc);
	return utc
}

const date = setGMTTime(0);
const maxDate = new Date(date);
maxDate.setMonth(maxDate.getMonth()+6);
let day = date.getDate();
let month = date.getMonth();
let year = date.getFullYear();

let selectedDate = date;
let selectedDay = day;
let selectedMonth = month;
let selectedYear = year;

const thisMonth = new Date(date);
const nextMonth = new Date(thisMonth);
nextMonth.setMonth(nextMonth.getMonth()+1);

let amount_days = (nextMonth.getTime() - thisMonth.getTime()) /1000/24/60/60;

mth_element.textContent = months[month] + ' ' + year;

selected_date_element.textContent = formatDate(date);
selected_date_element.dataset.value = selectedDate;

populateDates();

// EVENT LISTENERS
date_picker_element.addEventListener('click', toggleDatePicker);
next_mth_element.addEventListener('click', goToNextMonth);
prev_mth_element.addEventListener('click', goToPrevMonth);

// FUNCTIONS
function toggleDatePicker (e) {
	if (!checkEventPathForClass(e.path, 'dates')) {
		dates_element.classList.toggle('active');
	}
}

function goToNextMonth (e) {
	
	thisMonth.setMonth(thisMonth.getMonth()+1);
	nextMonth.setMonth(nextMonth.getMonth()+1);

	amount_days = (nextMonth.getTime() - thisMonth.getTime()) /1000/24/60/60;
	
	month++;
	if (month > 11) {
		month = 0;
		year++;
	}
	mth_element.textContent = months[month] + ' ' + year;
	populateDates();
}

function goToPrevMonth (e) {
	
	thisMonth.setMonth(thisMonth.getMonth()-1);
	nextMonth.setMonth(nextMonth.getMonth()-1);
	amount_days = (nextMonth.getTime() - thisMonth.getTime()) /1000/24/60/60;
	month--;
	if (month < 0) {
		month = 11;
		year--;
	}
	mth_element.textContent = months[month] + ' ' + year;
	populateDates();
}

function populateDates (e) {
	days_element.innerHTML = '';

	for (let i = 0; i < amount_days; i++) {
		const day_element = document.createElement('div');
		const checkDate = new Date(thisMonth);
		checkDate.setDate(i+1);
		if(checkDate.getMonth() < maxDate.getMonth() 
		&& checkDate.getMonth() > date.getMonth() 
		&& checkDate.getFullYear() <= maxDate.getFullYear() 
		&& checkDate.getFullYear() >= date.getFullYear() ){
			day_element.classList.add('day');
		} else if((checkDate.getMonth() === date.getMonth() && checkDate.getDate() >= date.getDate()) || (checkDate.getMonth() == maxDate.getMonth() && checkDate.getDate() <= maxDate.getDate())){
			day_element.classList.add('day');
		} else {day_element.classList.add('notAvailableDay');}
		

		day_element.textContent = i + 1;

		if (selectedDay == (i + 1) && selectedYear == year && selectedMonth == month) {
			day_element.classList.add('selected');
		}

		day_element.addEventListener('click', function () {
			selectedDate = new Date(year + '-' + (month + 1) + '-' + (i + 1));
			selectedDay = (i + 1);
			selectedMonth = month;
			selectedYear = year;

			selected_date_element.textContent = formatDate(selectedDate);
			selected_date_element.dataset.value = selectedDate;

			populateDates();
		});

		days_element.appendChild(day_element);
	}
}

// HELPER FUNCTIONS
function checkEventPathForClass (path, selector) {
	for (let i = 0; i < path.length; i++) {
		if (path[i].classList && path[i].classList.contains(selector)) {
			return true;
		}
	}
	
	return false;
}
function formatDate (d) {
	let day = d.getDate();
	if (day < 10) {
		day = '0' + day;
	}

	let month = d.getMonth() + 1;
	if (month < 10) {
		month = '0' + month;
	}

	let year = d.getFullYear();

	const dateForSend = {
		day,
		month,
		year
	}
	const btn = document.getElementById("sendButton")
	btn.innerHTML = "Начать рассылку";
	btn.style.backgroundColor = "#333ADE"

	if(+dateForSend.month == (date.getMonth()+1) && dateForSend.year == date.getFullYear() && dateForSend.day >= date.getDate()){
		port.postMessage({method: "sendDate", date: dateForSend})
	} else if (+dateForSend.month > (date.getMonth()+1) && dateForSend.year >= date.getFullYear() &&
	+dateForSend.month < (maxDate.getMonth()+1) && dateForSend.year <= maxDate.getFullYear()) { port.postMessage({method: "sendDate", date: dateForSend}) }
	else if((+dateForSend.month == (maxDate.getMonth()+1) && dateForSend.year == maxDate.getFullYear() && dateForSend.day <= maxDate.getDate())){port.postMessage({method: "sendDate", date: dateForSend}) }
	else {
		btn.innerHTML = "Выбрана некорректная дата";
		btn.style.backgroundColor = "rgb(255, 80, 57)"
	}


	return day + ' / ' + month + ' / ' + year;
}
