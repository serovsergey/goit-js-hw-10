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
          data = data.map(el => {
            const pos = el.name.official.toLowerCase().indexOf(searchString);
            if (~pos) {
              const nameParts = {};
              nameParts.begin = el.name.official.slice(0, pos);
              nameParts.searchString = el.name.official.slice(pos, pos + searchString.length);
              nameParts.end = el.name.official.slice(pos + searchString.length);
              return { ...el, nameParts };
            }
            return el;
          })
          refs.list.insertAdjacentHTML('beforeend', countryListTpl(data));
        }
      }
    })
    .catch((err) => {
      // console.log(err);
      Notiflix.Notify.failure("Oops, there is no country with that name");
    })
}, DEBOUNCE_DELAY));