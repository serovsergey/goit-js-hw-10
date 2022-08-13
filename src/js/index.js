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

refs.input.addEventListener('input', debounce(evt => {
  refs.list.textContent = '';
  refs.info.textContent = '';
  const searchString = evt.target.value.trim();//.toLowerCase();
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
          refs.list.insertAdjacentHTML('beforeend', countryListTpl(data));
        }
      }
    })
    .catch(() => {
      Notiflix.Notify.failure("Oops, there is no country with that name");
    })
}, DEBOUNCE_DELAY));