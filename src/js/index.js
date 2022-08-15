import '../css/styles.css';
import debounce from 'lodash.debounce';
import Notiflix from 'notiflix';
// import Handlebars from 'handlebars';
import { fetchCountries } from './fetchCountries';
import countryListTpl from '../templates/countryList.hbs';
import countryInfoTpl from '../templates/countryInfo.hbs';

const DEBOUNCE_DELAY = 300;

const refs = {
  input: document.querySelector("input#search-box"),
  list: document.querySelector(".country-list"),
  info: document.querySelector(".country-info"),
}

refs.list.addEventListener('click', (evt) => {
  refs.input.value = evt.target.closest('li').dataset.name;
  refs.input.dispatchEvent(new Event('input'));
})

const getFirstOccurrence = (obj, str, path = '', c = 0) => {
  if (typeof obj === 'string') {
    if (obj.toLowerCase().includes(str))
      return path + '=' + obj;
  }
  else if (Array.isArray(obj)) {
    let res = '';
    obj.forEach((el, idx) => {
      const inner = getFirstOccurrence(el, str, path + '[' + idx + ']', c + 1);
      if (inner) {
        res = inner;
        return inner;
      }
    })
    if (res) return res;
  }
  else if (typeof obj === 'object' && obj !== null) {
    for (let f in obj) {
      // console.log('object', f, obj[f]);
      const val = obj[f];
      const inner = getFirstOccurrence(val, str, path + '.' + f, c + 1);
      if (inner) {
        return inner;
      }
    }
  }
  return '';
}

refs.input.addEventListener('input', debounce(evt => {
  refs.list.textContent = '';
  refs.info.textContent = '';
  const searchString = evt.target.value.trim().toLowerCase();
  if (!searchString) return;
  fetchCountries(searchString)
    .then((data) => {
      const count = data.length;
      if (count) {
        if (count === 1) {
          refs.info.insertAdjacentHTML('beforeend', countryInfoTpl({ ...data[0], languages: Object.values(data[0].languages).join(', ') }));
        } else if (count > 10) {
          Notiflix.Notify.info('Too many matches found. Please enter a more specific name.');
        } else {
          // data = data.map(country => ({ ...country, searchPath: getFirstOccurrence(country, searchString).slice(1) }));
          data = data.map(el => {
            const searchPath = getFirstOccurrence(el, searchString).slice(1);
            const pos = el.name.official.toLowerCase().indexOf(searchString);
            if (~pos) {
              const nameParts = {};
              nameParts.begin = el.name.official.slice(0, pos);
              nameParts.searchString = el.name.official.slice(pos, pos + searchString.length);
              nameParts.end = el.name.official.slice(pos + searchString.length);
              return { ...el, nameParts, searchPath };
            }
            return { ...el, searchPath };
          })
          // console.log(data)
          refs.list.insertAdjacentHTML('beforeend', countryListTpl(data));
        }
      }
    })
    .catch((err) => {
      console.log(err);
      Notiflix.Notify.failure("Oops, there is no country with that name");
    })
}, DEBOUNCE_DELAY));