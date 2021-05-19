const puppeteer = require('puppeteer');
const Excel = require('exceljs');
const db = require('./db');

const flightModel = require('./flight');
const airline_dynamicModel = require('./airline_dynamic');
const airline_report_dynamicModel = require('./airline_report_dynamic');

const flightsArr = require('./airline-data');
const moment = require('moment');
// const generateExcelFile = require('./app2');

const wait = 1000 * 60 * 5;
const commonTrunk = async (browser, flightCode) => {
  try {
    const flightInfo = await getFlightInfoFromFlightAra(browser, {
      flightno: flightCode,
    });
    log(`${flightCode} found in flightare.com seats:  ${flightInfo.economySeats}`);
    return flightInfo;
  } catch (e) {
    return {
      economySeatsStr: '',
      aircraftFullName: '',
      economySeats: '',
    };
  }
};

const containsNumber = (str) => {
  return !!str.match(/\d/g);
};

const getFormatDiscount = (discount) => {
  if (containsNumber(discount)) {
    return `${parseFloat(discount.replace(/[^\d.]/g, '')) * 10}%`;
  } else {
    return '100%';
  }
};

const getFormatAircraft = (aircraft) => {
  return aircraft ? aircraft.replace(/[^\d.a-zA-Z-]/g, '') : '';
};
const sleep = (ms) => {
  return new Promise(function (resolve) {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};

const getRandom = function (from, to) {
  return Math.floor(from + Math.random() * (to - from));
};

const log = function () {
  let args = arguments;
  let str = '';
  for (let i = 0, l = args.length; i < l; i++) {
    if (i == 0) {
      str = args[i];
    } else {
      str = str + ', ' + args[i];
    }
  }
  let date = new Date();
  date = date + '';
  date = date.substring(0, date.length - 15);
  return console.log(date + ' : ', str);
};

const getToday = function () {
  let today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth() + 1;
  let yyyy = today.getFullYear();

  if (dd < 10) {
    dd = '0' + dd;
  }
  if (mm < 10) {
    mm = '0' + mm;
  }
  today = yyyy + '' + mm + '' + dd;
  return today;
};

const findCarriers = (carrier) => {
  if (carrier == 'CA') {
    return {
      $or: [
        { carrier: 'CA' },
        { carrier: 'KY' },
        { carrier: 'SC' },
        { carrier: 'TV' },
        { carrier: 'ZH' },
      ],
    };
  }
  if (carrier == 'MU') {
    return {
      $or: [{ carrier: 'KN' }, { carrier: 'MU' }, { carrier: 'FM' }],
    };
  }
  if (carrier == 'CZ') {
    return {
      $or: [
        { carrier: 'OQ' },
        { carrier: 'CZ' },
        { carrier: 'NS' },
        { carrier: 'RY' },
        { carrier: 'MF' },
      ],
    };
  }
  if (carrier == 'HU') {
    return {
      $or: [
        { carrier: 'HU' },
        { carrier: 'GT' },
        { carrier: 'JD' },
        { carrier: '9H' },
        { carrier: 'FU' },
        { carrier: 'GN' },
        { carrier: 'GX' },
        { carrier: '8L' },
        { carrier: 'UQ' },
        { carrier: 'PN' },
        { carrier: 'Y8' },
      ],
    };
  }
  if (carrier == '9C') {
    return {
      carrier: '9C',
    };
  }
  if (carrier == '3U') {
    return {
      carrier: '3U',
    };
  }
  if (carrier == 'HO') {
    return {
      $or: [{ carrier: 'HO' }, { carrier: 'AQ' }],
    };
  }
  if (carrier == 'Other') {
    return {
      $and: [
        { carrier: { $ne: 'CA' } },
        { carrier: { $ne: 'KY' } },
        { carrier: { $ne: 'SC' } },
        { carrier: { $ne: 'TV' } },
        { carrier: { $ne: 'ZH' } },
        { carrier: { $ne: 'KN' } },
        { carrier: { $ne: 'MU' } },
        { carrier: { $ne: 'FM' } },
        { carrier: { $ne: 'OQ' } },
        { carrier: { $ne: 'CZ' } },
        { carrier: { $ne: 'NS' } },
        { carrier: { $ne: 'RY' } },
        { carrier: { $ne: 'MF' } },
        { carrier: { $ne: 'HU' } },
        { carrier: { $ne: 'GT' } },
        { carrier: { $ne: 'JD' } },
        { carrier: { $ne: '9H' } },
        { carrier: { $ne: 'FU' } },
        { carrier: { $ne: 'GN' } },
        { carrier: { $ne: 'GX' } },
        { carrier: { $ne: '8L' } },
        { carrier: { $ne: 'UQ' } },
        { carrier: { $ne: 'PN' } },
        { carrier: { $ne: '9C' } },
        { carrier: { $ne: 'HO' } },
        { carrier: { $ne: 'AQ' } },
        { carrier: { $ne: '3U' } },
        { carrier: { $ne: 'Y8' } },
      ],
    };
  }
};

const toDecimal = (x) => {
  var f = parseFloat(x);
  if (isNaN(f)) {
    return;
  }
  f = Math.round(x * 100) / 100;
  return f;
};

const carrierArr = [
  { en: 'CA', cn: '中国国航' },
  { en: 'MU', cn: '东方航空' },
  { en: 'CZ', cn: '南方航空' },
  { en: 'HU', cn: '海南航空' },
  { en: '9C', cn: '春秋航空' },
  { en: 'HO', cn: '吉祥航空' },
  { en: '3U', cn: '四川航空' },
  { en: 'Other', cn: '其他' },
];

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = 100;
      var timer = setInterval(() => {
        var scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}
const carrierMap = {
  MU: 'China Eastern',
  CZ: 'China Southern',
  CA: 'Air China',
  HU: 'Hainan Airlines',
  '9C': 'Spring Airlines',
  MF: 'Xiamen Airlines',
  KA: 'Cathay Dragon',
};

const saveSheetsData = async (scrapeDate) => {
  const domesticAirlines = [...flightsArr]
    .filter((v) => v.zoneCode == 1)
    .map((v) => ({
      airline: v.airline,
      weekly: v.weekly,
      distance: v.distance,
      airlineCN: v.airlineCN,
    }));

  for (let i = 0, l = carrierArr.length; i < l; i++) {
    const carrier = carrierArr[i];
    const arr = [];
    for (let ii = 0, ll = domesticAirlines.length; ii < ll; ii++) {
      const airline = domesticAirlines[ii].airline;
      const airlineCN = domesticAirlines[ii].airlineCN;
      const distance = domesticAirlines[ii].distance;
      const query1 = Object.assign(
        {},
        { departureDate: '2021-07-02', airline: airline, scrapeDate: scrapeDate },
        findCarriers(carrier.en)
      );

      const query7 = Object.assign(
        {},
        { departureDate: '2021-08-06', airline: airline, scrapeDate: scrapeDate },
        findCarriers(carrier.en)
      );
      // const query14 = Object.assign(
      //   {},
      //   { departureDate: '2021-04-23', airline: airline, scrapeDate: scrapeDate },
      //   findCarriers(carrier.en)
      // );

      // const query15 = Object.assign(
      //   {},
      //   { departureDate: '2021-05-14', airline: airline, scrapeDate: scrapeDate },
      //   findCarriers(carrier.en)
      // );

      let nextArr = await airline_dynamicModel.airline_dynamic.getData(query1);
      let _7DayArr = await airline_dynamicModel.airline_dynamic.getData(query7);
      // let _14DayArr = await airline_dynamicModel.airline_dynamic.getData(query14);
      // let _15DayArr = await airline_dynamicModel.airline_dynamic.getData(query15);

      nextArr = nextArr.filter(
        (v) => v.economySeats != '' && v.formatPrice != '' && v.formatDiscount != ''
      );
      _7DayArr = _7DayArr.filter(
        (v) => v.economySeats != '' && v.formatPrice != '' && v.formatDiscount != ''
      );
      // _14DayArr = _14DayArr.filter(
      //   (v) => v.economySeats != '' && v.formatPrice != '' && v.formatDiscount != ''
      // );
      // _15DayArr = _15DayArr.filter(
      //   (v) => v.economySeats != '' && v.formatPrice != '' && v.formatDiscount != ''
      // );

      const weekly =
        ii == 0 || domesticAirlines[ii].weekly != domesticAirlines[ii - 1].weekly
          ? domesticAirlines[ii].weekly
          : '';
      const nextDayPrice =
        nextArr && nextArr.length
          ? toDecimal(
              nextArr
                .map(
                  (v) =>
                    parseInt(v.formatPrice) *
                    parseInt(
                      v.economySeats
                        .replace(' standard seats', '')
                        .replace(' 经济舱', '')
                        .replace('座位', '')
                    )
                )
                .reduce((acc, current) => parseInt(acc) + parseInt(current)) /
                nextArr
                  .map((v) =>
                    parseInt(
                      v.economySeats
                        .replace(' standard seats', '')
                        .replace(' 经济舱', '')
                        .replace('座位', '')
                    )
                  )
                  .reduce((acc, current) => parseInt(acc) + parseInt(current))
            )
          : 0;
      const _7DayPrice =
        _7DayArr && _7DayArr.length
          ? toDecimal(
              _7DayArr
                .map(
                  (v) =>
                    parseInt(v.formatPrice) *
                    parseInt(
                      v.economySeats
                        .replace(' standard seats', '')
                        .replace(' 经济舱', '')
                        .replace('座位', '')
                    )
                )
                .reduce((acc, current) => parseInt(acc) + parseInt(current)) /
                _7DayArr
                  .map((v) =>
                    parseInt(
                      v.economySeats
                        .replace(' standard seats', '')
                        .replace(' 经济舱', '')
                        .replace('座位', '')
                    )
                  )
                  .reduce((acc, current) => parseInt(acc) + parseInt(current))
            )
          : 0;
      // const _14DayPrice =
      //   _14DayArr && _14DayArr.length
      //     ? toDecimal(
      //         _14DayArr
      //           .map(
      //             (v) =>
      //               parseInt(v.formatPrice) *
      //               parseInt(
      //                 v.economySeats
      //                   .replace(' standard seats', '')
      //                   .replace(' 经济舱', '')
      //                   .replace('座位', '')
      //               )
      //           )
      //           .reduce((acc, current) => parseInt(acc) + parseInt(current)) /
      //           _14DayArr
      //             .map((v) =>
      //               parseInt(
      //                 v.economySeats
      //                   .replace(' standard seats', '')
      //                   .replace(' 经济舱', '')
      //                   .replace('座位', '')
      //               )
      //             )
      //             .reduce((acc, current) => parseInt(acc) + parseInt(current))
      //       )
      //     : 0;
      // const _15DayPrice =
      //   _15DayArr && _15DayArr.length
      //     ? toDecimal(
      //         _15DayArr
      //           .map(
      //             (v) =>
      //               parseInt(v.formatPrice) *
      //               parseInt(
      //                 v.economySeats
      //                   .replace(' standard seats', '')
      //                   .replace(' 经济舱', '')
      //                   .replace('座位', '')
      //               )
      //           )
      //           .reduce((acc, current) => parseInt(acc) + parseInt(current)) /
      //           _15DayArr
      //             .map((v) =>
      //               parseInt(
      //                 v.economySeats
      //                   .replace(' standard seats', '')
      //                   .replace(' 经济舱', '')
      //                   .replace('座位', '')
      //               )
      //             )
      //             .reduce((acc, current) => parseInt(acc) + parseInt(current))
      //       )
      //     : 0;
      const nextDayPriceDivideByKM = nextDayPrice / distance;
      const _7DayPriceDivideByKM = _7DayPrice / distance;
      // const _14DayPriceDivideByKM = _14DayPrice / distance;
      // const _15DayPriceDivideByKM = _15DayPrice / distance;
      // console.log(nextDayPrice, domesticAirlines[ii], nextDayPriceDivideByKM);
      const nextDayDiscount =
        nextArr && nextArr.length
          ? toDecimal(
              nextArr
                .map((v) =>
                  v.formatDiscount == 'NaN%'
                    ? 1
                    : parseInt(v.formatDiscount.replace('%', '')) *
                      parseInt(
                        v.economySeats
                          .replace(' standard seats', '')
                          .replace(' 经济舱', '')
                          .replace('座位', '')
                      )
                )
                .reduce((acc, current) => parseInt(acc) + parseInt(current)) /
                nextArr
                  .map((v) =>
                    parseInt(
                      v.economySeats
                        .replace(' standard seats', '')
                        .replace(' 经济舱', '')
                        .replace('座位', '')
                    )
                  )
                  .reduce((acc, current) => parseInt(acc) + parseInt(current))
            ) / 100
          : 0;
      const _7DayDiscount =
        _7DayArr && _7DayArr.length
          ? toDecimal(
              _7DayArr
                .map((v) =>
                  v.formatDiscount == 'NaN%'
                    ? 1
                    : parseInt(v.formatDiscount.replace('%', '')) *
                      parseInt(
                        v.economySeats
                          .replace(' standard seats', '')
                          .replace(' 经济舱', '')
                          .replace('座位', '')
                      )
                )
                .reduce((acc, current) => parseInt(acc) + parseInt(current)) /
                _7DayArr
                  .map((v) =>
                    parseInt(
                      v.economySeats
                        .replace(' standard seats', '')
                        .replace(' 经济舱', '')
                        .replace('座位', '')
                    )
                  )
                  .reduce((acc, current) => parseInt(acc) + parseInt(current))
            ) / 100
          : 0;
      // const _14DayDiscount =
      //   _14DayArr && _14DayArr.length
      //     ? toDecimal(
      //         _14DayArr
      //           .map((v) =>
      //             v.formatDiscount == 'NaN%'
      //               ? 1
      //               : parseInt(v.formatDiscount.replace('%', '')) *
      //                 parseInt(
      //                   v.economySeats
      //                     .replace(' standard seats', '')
      //                     .replace(' 经济舱', '')
      //                     .replace('座位', '')
      //                 )
      //           )
      //           .reduce((acc, current) => parseInt(acc) + parseInt(current)) /
      //           _14DayArr
      //             .map((v) =>
      //               parseInt(
      //                 v.economySeats
      //                   .replace(' standard seats', '')
      //                   .replace(' 经济舱', '')
      //                   .replace('座位', '')
      //               )
      //             )
      //             .reduce((acc, current) => parseInt(acc) + parseInt(current))
      //       ) / 100
      //     : 0;

      // const _15DayDiscount =
      //   _15DayArr && _15DayArr.length
      //     ? toDecimal(
      //         _15DayArr
      //           .map((v) =>
      //             v.formatDiscount == 'NaN%'
      //               ? 1
      //               : parseInt(v.formatDiscount.replace('%', '')) *
      //                 parseInt(
      //                   v.economySeats
      //                     .replace(' standard seats', '')
      //                     .replace(' 经济舱', '')
      //                     .replace('座位', '')
      //                 )
      //           )
      //           .reduce((acc, current) => parseInt(acc) + parseInt(current)) /
      //           _15DayArr
      //             .map((v) =>
      //               parseInt(
      //                 v.economySeats
      //                   .replace(' standard seats', '')
      //                   .replace(' 经济舱', '')
      //                   .replace('座位', '')
      //               )
      //             )
      //             .reduce((acc, current) => parseInt(acc) + parseInt(current))
      //       ) / 100
      //     : 0;

      const nextDayASK =
        nextArr && nextArr.length
          ? (toDecimal(
              nextArr
                .map((v) =>
                  parseInt(
                    v.economySeats
                      .replace(' standard seats', '')
                      .replace(' 经济舱', '')
                      .replace('座位', '')
                  )
                )
                .reduce((acc, current) => parseInt(acc) + parseInt(current))
            ) *
              distance) /
            Math.pow(10, 6)
          : 0;
      const _7DayASK =
        _7DayArr && _7DayArr.length
          ? (toDecimal(
              _7DayArr
                .map((v) =>
                  parseInt(
                    v.economySeats
                      .replace(' standard seats', '')
                      .replace(' 经济舱', '')
                      .replace('座位', '')
                  )
                )
                .reduce((acc, current) => parseInt(acc) + parseInt(current))
            ) *
              distance) /
            Math.pow(10, 6)
          : 0;
      // const _14DayASK =
      //   _14DayArr && _14DayArr.length
      //     ? (toDecimal(
      //         _14DayArr
      //           .map((v) =>
      //             parseInt(
      //               v.economySeats
      //                 .replace(' standard seats', '')
      //                 .replace(' 经济舱', '')
      //                 .replace('座位', '')
      //             )
      //           )
      //           .reduce((acc, current) => parseInt(acc) + parseInt(current))
      //       ) *
      //         distance) /
      //       Math.pow(10, 6)
      //     : 0;
      // const _15DayASK =
      //   _15DayArr && _15DayArr.length
      //     ? (toDecimal(
      //         _15DayArr
      //           .map((v) =>
      //             parseInt(
      //               v.economySeats
      //                 .replace(' standard seats', '')
      //                 .replace(' 经济舱', '')
      //                 .replace('座位', '')
      //             )
      //           )
      //           .reduce((acc, current) => parseInt(acc) + parseInt(current))
      //       ) *
      //         distance) /
      //       Math.pow(10, 6)
      //     : 0;

      const ASK = nextDayASK + _7DayASK; //+ _7DayASK + _15DayASK;
      await airline_report_dynamicModel.airline_report_dynamic.createData({
        weekly: weekly,
        airline: airline,
        airlineCN: airlineCN,
        distance: distance,
        _20210702Price: nextDayPrice,
        _20210806Price: _7DayPrice,
        // _20210423Price: _14DayPrice,
        // _20210514Price: _15DayPrice,

        _20210702PriceDivideByKM: nextDayPriceDivideByKM,
        _20210806PriceDivideByKM: _7DayPriceDivideByKM,
        // _20210423PriceDivideByKM: _14DayPriceDivideByKM,
        // _20210514PriceDivideByKM: _15DayPriceDivideByKM,

        _20210702Discount: nextDayDiscount,
        _20210806Discount: _7DayDiscount,
        // _20210423Discount: _14DayDiscount,
        // _20210514Discount: _15DayDiscount,

        _20210702ASK: nextDayASK,
        _20210806ASK: _7DayASK,
        // _20210423ASK: _14DayASK,
        // _20210514ASK: _15DayASK,

        ASK: ASK,
        carrier: carrier.en,
        carrierCN: carrier.cn,
        order: ii,
        sheet: carrier.en,
        scrapeDate: moment(scrapeDate).format('DD-MMM-YYYY'),
        _20210702: '02-Jul-2021',
        _20210806: '06-Aug-2021',
        // _20210423: '23-Apr-2021',
        // _20210514: '14-May-2021',
      });
    }
  }
  log(`all sheets data saved`);
};

const getFlightInfoFromSeatGuru = async (browser, { carrier, date, flightno }) => {
  let page2 = await browser.newPage();
  page2.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
  );
  page2.setViewport({
    width: 1280,
    height: 768,
  });
  await page2.goto(`https://www.seatguru.com/findseatmap/findseatmap.php`, {
    timeout: wait,
  });

  await page2.waitForSelector('#airline-select', {
    timeout: wait,
  });
  const closeBtn = await page2.$('#TB_ajaxContent');
  if (closeBtn) {
    await page2.tap('.email.close_button img');
  }

  await page2.evaluate(function () {
    document.querySelector('input#airline-select').value = '';
  });

  await page2.type('#airline-select', carrier, {
    delay: 400,
  });

  await page2.waitForSelector('#airline_suggestions ul li >img', {
    timeout: wait,
  });

  await page2.tap('#airline_suggestions ul li >img');

  await page2.evaluate(function () {
    document.querySelector('input#form_date_datepicker').value = '';
  });

  await page2.type('#form_date_datepicker', date, {
    delay: 100,
  });

  await page2.evaluate(function () {
    document.querySelector('input#flightno').value = '';
  });

  await page2.type('#flightno', flightno, {
    delay: 100,
  });

  await page2.tap('#search');

  await page2.waitForSelector('.chooseFlight', {
    timeout: wait,
  });
  await sleep(2000);

  const noMap = await page2.$('.no-map');
  const error = await page2.$('#error-text');
  // const noMapBtn = await page2.$('.view-map-button');
  if (noMap || error) {
    page2.close();
    return null;
  }
  try {
    await page2.waitForSelector('.view-map-button', {
      timeout: wait,
    });
  } catch (e) {
    return null;
  }

  await page2.tap('.view-map-button');
  await page2.waitForSelector('.seat-list', {
    timeout: wait,
  });
  const info = await page2.evaluate(() => {
    const trs = document.querySelectorAll('.seat-list tr');
    const last = trs[trs.length - 1].querySelector('.item4 .value');
    const name = document.querySelector('.h1-fix');

    return {
      economySeatsStr: last && last.innerText ? last.innerText : '',
      aircraftFullName: name && name.innerText ? name.innerText : '',
      economySeats: last && last.innerText ? last.innerText.replace(/[^\d.]/g, '') : '',
    };
  });
  page2.close();
  return info;
};

const getFlightInfoFromFlightAra = async (browser, { flightno }) => {
  let page3 = await browser.newPage();
  page3.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
  );
  page3.setViewport({
    width: 1280,
    height: 768,
  });
  await page3.goto(`https://www.flightera.net/zh/flight/${flightno}`, {
    timeout: wait,
  });

  await page3.waitForSelector('#cont-top', {
    timeout: wait,
  });
  await sleep(3000);

  let seats = await page3.$('.badge.badge-info-inv');
  let arrow = await page3.$('.py-2.px-0.text-center.align-middle >a');
  let calendar = await page3.$('.col-calendar-item a');
  if (seats) {
    seats = await page3.evaluate(function () {
      return document.querySelector('.badge.badge-info-inv').innerText;
    });
    // log('first query');
  } else if (!arrow && calendar) {
    const href11 = await page3.evaluate(function () {
      const arr = Array.from(document.querySelectorAll('.col-calendar-item a'));
      return arr[0].href;
    });
    await page3.goto(`${href11}`, {
      timeout: wait,
    });
    await page3.waitForSelector('.py-2.px-0.text-center.align-middle >a', {
      timeout: wait,
    });
    const href12 = await page3.evaluate(function () {
      const arr = Array.from(document.querySelectorAll('.py-2.px-0.text-center.align-middle >a'));
      return arr[arr.length - 1].href;
    });
    await page3.goto(`${href12}`, {
      timeout: wait,
    });
    await page3.waitForSelector('#cont-top', {
      timeout: wait,
    });

    seats = await page3.$('.badge.badge-info-inv');
    if (seats) {
      seats = await page3.evaluate(function () {
        return document.querySelector('.badge.badge-info-inv').innerText;
      });
      log('deep query 1');
    } else {
      const href11 = await page3.evaluate(function () {
        const arr = Array.from(document.querySelectorAll('.col-calendar-item a'));
        return arr[0].href;
      });
      await page3.goto(`${href11}`, {
        timeout: wait,
      });
      await page3.waitForSelector('.py-2.px-0.text-center.align-middle >a', {
        timeout: wait,
      });
      const href12 = await page3.evaluate(function () {
        const arr = Array.from(document.querySelectorAll('.py-2.px-0.text-center.align-middle >a'));
        return arr[arr.length - 2].href;
      });
      await page3.goto(`${href12}`, {
        timeout: wait,
      });
      await page3.waitForSelector('#cont-top', {
        timeout: wait,
      });

      seats = await page3.$('.badge.badge-info-inv');
      if (seats) {
        seats = await page3.evaluate(function () {
          return document.querySelector('.badge.badge-info-inv').innerText;
        });
        log('deep query 2');
      }
    }
  } else if (arrow) {
    const href = await page3.evaluate(function () {
      const arr = Array.from(document.querySelectorAll('.py-2.px-0.text-center.align-middle >a'));
      return arr[arr.length - 1].href;
    });
    await page3.goto(`${href}`, {
      timeout: wait,
    });
    await page3.waitForSelector('#cont-top', {
      timeout: wait,
    });

    seats = await page3.$('.badge.badge-info-inv');
    if (seats) {
      seats = await page3.evaluate(function () {
        return document.querySelector('.badge.badge-info-inv').innerText;
      });
      log('second query');
    } else {
      const href = await page3.evaluate(function () {
        const arr = Array.from(document.querySelectorAll('.py-2.px-0.text-center.align-middle >a'));
        return arr[arr.length - 2].href;
      });
      await page3.goto(`${href}`, {
        timeout: wait,
      });
      await page3.waitForSelector('#cont-top', {
        timeout: wait,
      });

      seats = await page3.$('.badge.badge-info-inv');
      if (seats) {
        seats = await page3.evaluate(function () {
          return document.querySelector('.badge.badge-info-inv').innerText;
        });
        log('third query');
      } else {
        const href = await page3.evaluate(function () {
          const arr = Array.from(
            document.querySelectorAll('.py-2.px-0.text-center.align-middle >a')
          );
          return arr[arr.length - 3].href;
        });
        await page3.goto(`${href}`, {
          timeout: wait,
        });
        await page3.waitForSelector('#cont-top', {
          timeout: wait,
        });

        seats = await page3.$('.badge.badge-info-inv');
        if (seats) {
          seats = await page3.evaluate(function () {
            return document.querySelector('.badge.badge-info-inv').innerText;
          });
          log('fourth query');
        }
      }
    }
  } else {
    seats = 0;
  }
  let aircraftFullName = '';
  if (seats != 0) {
    aircraftFullName = await page3.evaluate(function () {
      const arr = Array.from(
        document.querySelectorAll('.detail-box-bottom-right .detail-box.p-2 a')
      );
      return arr[1].innerText;
    });
  }
  page3.close();
  return {
    economySeatsStr: seats ? seats : '',
    aircraftFullName: aircraftFullName,
    economySeats: seats ? seats.replace(/[^\d.]/g, '') : '',
  };
};

const scrape = async (from) => {
  const today = `${getToday()}`;
  const scrapeDate = moment().format('YYYY-MM-DD');
  const day1 = 1;
  const day8 = 8;
  const day15 = 15;

  const daysArr = [
    { departureDate: '2021-07-02', type: '-1', formatterDate: '07/02/2021' },
    { departureDate: '2021-08-06', type: '-1', formatterDate: '08/06/2021' },
    // { departureDate: '2021-04-23', type: '-1', formatterDate: '04/23/2021' },
    // { departureDate: '2021-05-14', type: '-1', formatterDate: '05/14/2021' },
    // { departureDate: _8Day, type: '-2', formatterDate: _8DayFormatter },
    // { departureDate: _15Day, type: '-3', formatterDate: _15DayFormatter },
  ];

  const domesticFlights = [...flightsArr].filter((v) => v.zoneCode == 1);

  const doDomesticAirlines = async (from) => {
    let browser = await puppeteer.launch({
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    let page = await browser.newPage();
    page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
    );
    page.setViewport({
      width: 1280,
      height: 768,
    });
    await page.authenticate('a534561', '19821013rr;;');
    for (let i = from, l = domesticFlights.length; i < l; i++) {
      console.log('');
      log(
        `--------------- [ ${domesticFlights[i].airlineCN} ] step: ${i}/${domesticFlights.length} ---------------`
      );
      for (let ii = 0, ll = daysArr.length; ii < ll; ii++) {
        log(`${domesticFlights[i].url}${daysArr[ii].departureDate}`);
        log(` ${daysArr[ii].formatterDate}`);

        await page.goto(`${domesticFlights[i].url}${daysArr[ii].departureDate}`, {
          timeout: wait,
        });
        try {
          await page.waitForSelector('.result-wrapper', {
            timeout: wait,
          });
        } catch (e) {
          continue;
        }
        await sleep(3000);
        await autoScroll(page);
        const list = await page.evaluate(() => {
          const getCarrier = (carrier) => {
            let _carrier = carrier;
            if (carrier == 'C') {
              _carrier = '9C';
            } else if (carrier == 'U') {
              _carrier = '3U';
            } else if (carrier == 'L') {
              _carrier = '8L';
            } else if (carrier == 'Y') {
              _carrier = 'Y8';
            } else if (carrier == 'G') {
              _carrier = 'G5';
            } else if (carrier == 'H') {
              _carrier = '9H';
            } else if (carrier == 'A') {
              _carrier = 'A6';
            }
            return _carrier;
          };
          const getAircraft = (str) => {
            const arr = str.split('\xa0');

            if (arr.length == 3) {
              arr.shift();
              return arr.join(' ');
            } else if (arr.length == 2) {
              arr.shift();
              return arr.join();
            } else {
              return arr.join();
            }
          };
          let wrapper = Array.from(document.querySelectorAll('.flight-item.domestic'));

          return wrapper.map((v) => {
            const isOneWay = v.querySelector('.arrow-oneway');
            const isShared = v.querySelector('.plane-share');

            const flightCode = v.querySelector('.plane-No');
            const carrierCN = v.querySelector('.airline-name');
            // .querySelector('strong');

            const price = v.querySelector('.price');
            const discount = v.querySelector('.sub-price-item');
            const departureTime = v.querySelector('.depart-box .time');
            const arrivalTime = v.querySelector('.arrive-box .time');
            const departureTerminal = v.querySelector('.depart-box  .airport');
            const arrivalTerminal = v.querySelector('.arrive-box  .airport');
            const punctualityRate = v.querySelector('.flight-arrival-punctuality');

            const carrierInnerText =
              flightCode && flightCode.innerText ? flightCode.innerText.split('\xa0')[0] : '';
            let carrier = carrierInnerText.replace(/[^a-zA-Z]/g, '');
            carrier = getCarrier(carrier);

            const aircraft = flightCode && flightCode.innerText ? flightCode.innerText : '';
            return {
              carrier: carrier,
              carrierCN: carrierCN && carrierCN.innerText ? carrierCN.innerText : '',
              flightCode: carrierInnerText,
              aircraft: getAircraft(aircraft),
              price: price && price.innerText ? price.innerText : '',
              discount: discount && discount.innerText ? discount.innerText : '',
              departureTime:
                departureTime && departureTime.innerText ? departureTime.innerText : '',
              arrivalTime: arrivalTime && arrivalTime.innerText ? arrivalTime.innerText : '',
              departureTerminal:
                departureTerminal && departureTerminal.innerText ? departureTerminal.innerText : '',
              arrivalTerminal:
                arrivalTerminal && arrivalTerminal.innerText ? arrivalTerminal.innerText : '',
              punctualityRate:
                punctualityRate && punctualityRate.innerText ? punctualityRate.innerText : '',
              isShared: isShared ? true : false,
              isOneWay: isOneWay ? true : false,
            };
          });
        });
        let notSharedList = list.filter((v) => !v.isShared);
        let oneWayList = notSharedList.filter((v) => v.isOneWay);

        log(
          `total: ${list.length}, not shared: ${notSharedList.length}, one way: ${oneWayList.length}`
        );

        for (let iii = 0, lll = oneWayList.length; iii < lll; iii++) {
          const item = oneWayList[iii];
          // console.log(item);
          const formatAircraft = getFormatAircraft(item.aircraft);
          if (!item.flightCode) {
            log(`----  ${item.flightCode} - ${item.aircraft} -----`);
          }
          let flightInfo = 0;
          // console.log(item.flightCode, item.aircraft, formatAircraft);
          const data = await flightModel.flight.getData({
            flightCode: item.flightCode,
            formatAircraft: formatAircraft,
          });
          if (data && data.length > 0) {
            flightInfo = data[0];
          } else {
            const data = await flightModel.flight.getData({
              carrier: item.carrier,
              aircraft: item.aircraft,
            });
            if (data && data.length > 0) {
              flightInfo = data[0];
            } else {
              log(`${item.flightCode} not found in database`);
              flightInfo = await commonTrunk(browser, item.flightCode);
            }

            await flightModel.flight.createData({
              day: today,
              carrier: item.carrier,
              carrierCN: item.carrierCN,
              flightCode: item.flightCode,
              aircraft: item.aircraft,
              aircraftFullName: flightInfo.aircraftFullName,
              airline: domesticFlights[i].airline,
              airlineCN: domesticFlights[i].airlineCN,
              departure: domesticFlights[i].airline.split('-')[0],
              arrival: domesticFlights[i].airline.split('-')[1],
              departureCN: domesticFlights[i].airlineCN.split('-')[0],
              arrivalCN: domesticFlights[i].airlineCN.split('-')[1],
              economySeats: flightInfo.economySeats,
              economySeatsStr: flightInfo.economySeatsStr,
              firstSeats: 0,
              businessSeats: 0,
              premiumEconomySeats: 0,
              formatAircraft: formatAircraft,
              isMatched:
                formatAircraft == '738'
                  ? flightInfo.aircraftFullName.indexOf('737-800') != -1
                  : flightInfo.aircraftFullName.indexOf(formatAircraft) != -1,
            });
          }

          await airline_dynamicModel.airline_dynamic.createData({
            carrier: item.carrier,
            carrierCN: item.carrierCN,
            flightCode: item.flightCode,
            aircraft: item.aircraft,
            price: item.price,
            discount: item.discount,
            departureTime: item.departureTime,
            arrivalTime: item.arrivalTime,
            departureTerminal: item.departureTerminal,
            arrivalTerminal: item.arrivalTerminal,
            formatPrice: item.price ? item.price.replace('¥', '').replace('起', '') : '',
            formatDiscount: getFormatDiscount(item.discount),
            formatAircraft: formatAircraft,
            punctualityRate: item.punctualityRate,
            day: today,
            airline: domesticFlights[i].airline,
            airlineCN: domesticFlights[i].airlineCN,
            departure: domesticFlights[i].airline.split('-')[0],
            arrival: domesticFlights[i].airline.split('-')[1],
            url: `${domesticFlights[i].url}${daysArr[ii].departureDate}`,
            weekly: domesticFlights[i].weekly,
            zone: domesticFlights[i].zone,
            zoneCode: domesticFlights[i].zoneCode,
            departureDateType: daysArr[ii].type,
            departureCN: domesticFlights[i].airlineCN.split('-')[0],
            arrivalCN: domesticFlights[i].airlineCN.split('-')[1],
            departureDate: daysArr[ii].departureDate,
            scrapeDate: scrapeDate,
            distance: domesticFlights[i].distance,
            economySeats: flightInfo.economySeats,
            economySeatsStr: flightInfo.economySeatsStr,
          });
        }

        let timer = getRandom(1000 * 5, 10 * 1000);
        log(`sleep ${timer / 1000} seconds!`);
        await sleep(timer);
      }
    }
    browser.close();
  };

  log(`---- Domestic airlines ----`);
  await doDomesticAirlines(from);
  log(`---- Domestic airlines scraped! ----`);

  log(`---- Short-haul airlines ----`);
  // await doShortHaulAirlines();
  log(`---- Short-haul airlines scraped! ----`);

  // await browser.close();
  log(`---- All airlines have been successfully scraped!! ----`);

  log(`---- saving sheets data ----`);
  // await saveSheetsData(scrapeDate);
};

// scrape();

// dataTransfer();

// ┌────────────── second (optional)
// │ ┌──────────── minute
// │ │ ┌────────── hour
// │ │ │ ┌──────── day of month
// │ │ │ │ ┌────── month
// │ │ │ │ │ ┌──── day of week
// │ │ │ │ │ │
// │ │ │ │ │ │
// * * * * * *
// let num = 1;

// cron.schedule('0 01 00 * * 4', async () => {
//   const scrapeDate = moment().format('YYYY-MM-DD');
//   await scrape();
// await generateExcelFile(scrapeDate);
//   log(`${scrapeDate}'s data scraped！`);
// });

const exportExcel = async () => {
  const workbook = new Excel.Workbook();
  const ws = workbook.addWorksheet('all');

  ws.columns = [
    'weekly',
    'airline',
    'airlineCN',
    'distance',
    '_20210702Price',
    '_20210806Price',
    // '_20210423Price',
    // '_20210514Price',
    '_20210702PriceDivideByKM',
    '_20210806PriceDivideByKM',
    // '_20210423PriceDivideByKM',
    // '_20210514PriceDivideByKM',
    '_20210702Discount',
    '_20210806Discount',
    // '_20210423Discount',
    // '_20210514Discount',
    '_20210702ASK',
    '_20210806ASK',
    // '_20210423ASK',
    // '_20210514ASK',
    'ASK',
    'carrier',
    'carrierCN',
    'order',
    'sheet',
    'scrapeDate',
    '_20210702',
    '_20210806',
    // '_20210423',
    // '_20210514',
  ].map((v) => {
    return {
      header: v,
      key: v,
      width: 20,
    };
  });
  const list = await airline_report_dynamicModel.airline_report_dynamic.getData({});
  ws.addRows(
    list.map((payload) => ({
      weekly: payload.weekly,
      airline: payload.airline,
      airlineCN: payload.airlineCN,
      distance: payload.distance,
      _20210702Price: payload._20210702Price,
      _20210806Price: payload._20210806Price,
      // _20210423Price: payload._20210423Price,
      // _20210514Price: payload._20210514Price,

      _20210702PriceDivideByKM: payload._20210702PriceDivideByKM,
      _20210806PriceDivideByKM: payload._20210806PriceDivideByKM,
      // _20210423PriceDivideByKM: payload._20210423PriceDivideByKM,
      // _20210514PriceDivideByKM: payload._20210514PriceDivideByKM,

      _20210702Discount: payload._20210702Discount,
      _20210806Discount: payload._20210806Discount,
      // _20210423Discount: payload._20210423Discount,
      // _20210514Discount: payload._20210514Discount,

      _20210702ASK: payload._20210702ASK,
      _20210806ASK: payload._20210806ASK,
      // _20210423ASK: payload._20210423ASK,
      // _20210514ASK: payload._20210514ASK,

      ASK: payload.ASK,
      carrier: payload.carrier,
      carrierCN: payload.carrierCN,
      order: payload.order,
      sheet: payload.sheet,
      scrapeDate: payload.scrapeDate,
      _20210702: payload._20210702,
      _20210806: payload._20210806,
    }))
  );
  await workbook.xlsx.writeFile(`Price-Tracker-0702-0806.xlsx`);
};

(async () => {
  const scrapeDate = moment().format('YYYY-MM-DD');
  await scrape(44);
  await saveSheetsData(scrapeDate);
  await exportExcel();
  log(`${scrapeDate}'s data scraped！`);
})();
