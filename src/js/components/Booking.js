import { templates, select, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';


class Booking{
  constructor(element) {
    const thisBooking = this;

    thisBooking.pickedTable = 0;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();


  }

  getData() {
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam
      ],
      eventCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam
      ],
      eventRepeat: [
        settings.db.repeatParam,
        endDateParam
      ]
    };

    // console.log('getData params', params);

    const urls = {
      bookings:      settings.db.url + '/' + settings.db.bookings + '?' + params.booking.join('&') ,
      eventsCurrent: settings.db.url + '/' + settings.db.events   + '?' + params.eventCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.events   + '?' + params.eventRepeat.join('&')
    };

    console.log('urls', urls);

    Promise.all([
      fetch(urls.bookings),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat)
    ])
      .then(function (allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json()
        ]);
      })
      .then(function ([bookings,eventsCurrent,eventsRepeat]) {
        // console.log(bookings);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  // eslint-disable-next-line no-unused-vars
  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date,item.hour,item.duration,item.table);
    }

    console.log('thisBooking.booked ', thisBooking.booked);

    for (let item of bookings) {
      thisBooking.makeBooked(item.date,item.hour,item.duration,item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    thisBooking.updateDOM();
  }

  makeBooked(date,hour,duration,table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};

    }

    const startHour = utils.hourToNumber(hour);


    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock+= 0.5){
      // console.log('loop ', hourBlock);

      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];

      }

      thisBooking.booked[date][hourBlock].push(table);

    }
  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ) {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId) > -1
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  initTables(event) {
    const thisBooking = this;
    console.log(thisBooking);

    const clickedElement = event.target;
    console.log(event.target);

    if (clickedElement.classList.contains('table')) {
      if (!clickedElement.classList.contains('booked')) {

        const tableNumber = clickedElement.getAttribute('data-table');
        const allTables = clickedElement.offsetParent.querySelectorAll('.table.selected');
        console.log([...allTables]);
        if (!clickedElement.classList.contains('selected') ) {
          thisBooking.pickedTable = tableNumber;

          clickedElement.classList.add('selected');
          for (let table of allTables) {
            table.classList.remove('selected');
            thisBooking.pickedTable = 0;
          }

        } else {
          clickedElement.classList.remove('selected');
        }
      } else {
        alert('this table has already been booked, please try another one');
      }

    }
  }

  render(element) {
    const thisBooking = this;
    const generatedHTML = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    console.log(thisBooking.dom.wrapper);
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);

    thisBooking.dom.datePickerWrapper = document.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPickerWrapper = document.querySelector(select.widgets.hourPicker.wrapper);

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    // tutaj jest div ze wszystkimi stolikami
    thisBooking.dom.wholeTables = document.querySelector(select.booking.wholeTables);

    thisBooking.dom.address = element.querySelector(select.booking.address);
    thisBooking.dom.phone = element.querySelector(select.booking.phone);

    console.log(thisBooking.dom.address.value);

  }

  resetTable() {
    // eslint-disable-next-line no-unused-vars
    const thisBooking = this;
    const allTables = document.querySelectorAll('.table.selected');
    for (let table of allTables) {
      if (table.classList.contains('selected')) {
        table.classList.remove('selected');
      }
    }
  }

  initWidgets(){
    const thisBooking = this;
    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    // thisBooking.dom.submitButton = document.querySelector(select.booking.submitButton);

    thisBooking.dom.peopleAmount.addEventListener('click', function () {
      console.log('zmiana liczby ludzi');
      thisBooking.resetTable();

    });

    thisBooking.dom.hoursAmount.addEventListener('click', function () {
      console.log('zmiana liczby godzin');
      thisBooking.resetTable();
    });

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePickerWrapper);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPickerWrapper);

    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.resetTable();
      thisBooking.updateDOM();
      console.log('zmiana godziny i daty');
      console.log(thisBooking.starters);
    });

    // eslint-disable-next-line no-undef
    thisBooking.dom.wholeTables.addEventListener('click', thisBooking.initTables);

    // const thisBooking = this;
    thisBooking.starters = [];
    const startersWrapper = document.querySelectorAll('.booking-options .checkbox');
    console.log(startersWrapper);

    for (let checkbox of startersWrapper) {
      checkbox.addEventListener('change', function (event) {
        if (event.target.checked) {
          thisBooking.starters.push(event.target.value);
        } else {
          thisBooking.starters.splice(thisBooking.starters.indexOf(event.target.value), 1);
        }
      });
    }
    console.log(thisBooking.starters);

    thisBooking.dom.wrapper.addEventListener('submit', function (event) {
      event.preventDefault();
      thisBooking.sendBooking(event);
    });


  }

  // getStartersData() {
  //   const thisBooking = this;
  //   thisBooking.starters = [];
  //   const startersWrapper = document.querySelectorAll('.booking-options .checkbox');
  //   console.log(startersWrapper);

  //   for (let checkbox of startersWrapper) {
  //     checkbox.addEventListener('change', function (event) {
  //       if (event.target.checked) {
  //         thisBooking.starters.push(event.target.value);
  //       } else {
  //         thisBooking.starters.splice(thisBooking.starters.indexOf(event.target.value), 1);
  //       }
  //     });
  //   }
  //   console.log(thisBooking.starters);
  // }



  sendBooking() {
    const thisBooking = this;
    // eslint-disable-next-line no-unused-vars
    const url = settings.db.url + '/' + settings.db.bookings;

    // thisBooking.getStartersData();

    const payload = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: thisBooking.pickedTable,
      duration: parseInt(thisBooking.dom.hoursAmount.querySelector('input').value),
      ppl: parseInt(thisBooking.dom.peopleAmount.querySelector('input').value),
      starters: thisBooking.starters,
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
    };

    console.log(payload.starters);
    console.log(payload);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function () {
        thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
        thisBooking.updateDOM();
      });

  }
}

export default Booking;