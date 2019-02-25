const watch = require('node-watch');
const fs = require('fs');
const fast = require('fast.js');
const axios = require('axios').default;
const { headers } = require('./headers');
const BASE_URL = 'http://178.128.151.68/api/weather-station';
console.log('Ready');
watch(`${__dirname}/data`, { recursive: true }, async function(evt, name) {
  try {
    console.log('New file Update');
    console.log(`${BASE_URL}/last-date`);
    const { data } = await axios.get(`${BASE_URL}/last-date`);
    let lastDate = data.date || 0; //TODO use api to get the last date of the records
    lastDate = new Date(lastDate);
    //console.log('%s changed.', name);
    //console.log(name);
    const file = fs.readFileSync(name);
    const arr = file.toString('UTF-8').split('\n');
    const propsRegex = /(\s+)/;
    /* let head0 = arr[0].split(propsRegex);
    let head = arr[1].split(propsRegex);*/

    const filter = e => {
      return e.trim().length > 0;
    };
    /* head0 = fast.filter(head0, filter);
    head = fast.filter(head, filter);
    head = head.map(item => {
      return item.split('.').join('');
    });*/
    for (let i = 3; i < arr.length; i++) {
      let result = arr[i].split(propsRegex);
      result = fast.filter(result, filter);

      //DATE
      const [day, month, year] = result[0].split('/');
      const dateStr = `${month}/${day}/${year}`;
      const date = new Date(dateStr);
      debugger;
      if (date > lastDate) {
        const json = {
          date
        };
        fast.forEach(headers, (item, index) => {
          json[item] = result[index];
        });
        const { data } = await axios.post(`${BASE_URL}`, json);
        console.log('Item added ' + date);
      }
    }
  } catch (e) {
    console.log('ERROR');
    console.log(e);
  }
});
