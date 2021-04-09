const wait = 720000;
const sleep = (ms) => {
  return new Promise(function (resolve) {
    setTimeout(() => {
      resolve();
    }, ms);
  });
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
