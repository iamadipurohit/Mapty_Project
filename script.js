'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// let clickEvent;
// let map;
// if (navigator.geolocation) {
//   navigator.geolocation.getCurrentPosition(
//     function (e) {
//       console.log(e);
//       const latitude = e.coords.latitude;
//       const longitude = e.coords.longitude;
//       console.log(`${latitude},${longitude}`);
//       console.log(`https://www.google.com/maps/@${latitude},${longitude},15z`);
//       map = L.map('map').setView([latitude, longitude], 13);

//       L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
//         attribution:
//           '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
//       }).addTo(map);

//       map.on('click', function (clickE) {
//         clickEvent = clickE;
//         form.classList.remove('hidden');
//         inputDistance.focus();
//       });
//     },
//     function () {
//       console.log('sale fail ho gya');
//     }
//   );
// }
// form.addEventListener('submit', function (e) {
//   e.preventDefault();
//   inputCadence.value =
//     inputDistance.value =
//     inputDuration.value =
//     inputElevation.value =
//       '';
//   const { lat, lng } = clickEvent.latlng;
//   console.log(lat, lng);
//   L.marker([lat, lng])
//     .addTo(map)
//     .bindPopup(
//       L.popup(e.latlng, {
//         maxWidth: 200,
//         minWidth: 50,
//         autoClose: false,
//         closeOnClick: false,
//         className: 'running-popup',
//       })
//     )
//     .setPopupContent('Workout well')
//     .openPopup();
// });
// inputType.addEventListener('change', function () {
//   inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
//   inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
// });
class workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }
  _setDescreption() {
    console.log(this);
    console.log(this.type);
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}
class running extends workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescreption();
  }
  calcPace() {
    this.pace = this.duration / this.distance;
  }
}
class cycling extends workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevgain) {
    super(coords, distance, duration, elevgain);
    this.elevgain = elevgain;
    this.calcSpeed();
    this._setDescreption();
  }
  calcSpeed() {
    this.speed = this.distance / this.duration;
  }
}

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

////////////////////////
const finite = (...value) => value.every(el => Number.isFinite(el));
const positive = (...value) => value.every(el => el > 0);
class App {
  #map;
  #mapEvent;
  #workouts = [];
  constructor() {
    console.log('logged into the website');
    this._getlocation();
    inputType.addEventListener('change', this._toggleElevationField.bind(this));
    form.addEventListener('submit', this._newWorkout.bind(this));
    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
    this._getStorage();
  }

  _getlocation() {
    navigator.geolocation.getCurrentPosition(
      this._createMap.bind(this),
      function () {
        console.log('failed');
      }
    );
  }
  _createMap(location) {
    const latitude = location.coords.latitude;
    const longitude = location.coords.longitude;
    this.#map = L.map('map').setView([latitude, longitude], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    this.#map.on('click', this._showForm.bind(this));
    this.#workouts.forEach(work => this._addMarkerToMap(work));
  }
  _showForm(Event) {
    this.#mapEvent = Event;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _toggleElevationField() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }
  _newWorkout(e) {
    let workout = {};
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const type = inputType.value;
    const { lat, lng } = this.#mapEvent.latlng;
    e.preventDefault();
    if (type == 'running') {
      const cadence = +inputCadence.value;
      if (
        !finite(distance, duration, cadence) ||
        !positive(distance, duration, cadence)
      )
        return alert('input needs to be a finite number');
      workout = new running([lat, lng], distance, duration, cadence);
    }
    if (inputType.value == 'cycling') {
      const elevgain = +inputElevation.value;
      if (
        !finite(distance, duration, elevgain) ||
        !positive(distance, duration)
      )
        return alert('bsdk shi se bharde');
      workout = new cycling([lat, lng], distance, duration, elevgain);
    }
    this.#workouts.push(workout);
    this._addMarkerToMap(workout);
    this._renderworkout(workout);
    this._hideform();
    this._setStorage();
  }
  _hideform() {
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }
  _addMarkerToMap(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 200,
          minWidth: 50,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(`${workout.description}`)
      .openPopup();
    console.log(workout.description);
  }
  _renderworkout(workout) {
    let html = `<li class="workout workout--${workout.type}" data-id="${
      workout.id
    }">
    <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">${
        workout.type == 'running' ? '🏃‍♂️' : '🚴‍♀️'
      }</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>
     `;
    if (workout.type == 'running') {
      html += `<div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.pace.toFixed(1)}</span>
      <span class="workout__unit">min/km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">🦶🏼</span>
      <span class="workout__value">${workout.cadence}</span>
      <span class="workout__unit">spm</span>
    </div>
  </li>`;
    } else {
      html += ` <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.speed}</span>
      <span class="workout__unit">km/h</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⛰</span>
      <span class="workout__value">${workout.elevgain}</span>
      <span class="workout__unit">m</span>
    </div>
  </li> -->`;
    }
    form.insertAdjacentHTML('afterend', html);
  }
  _moveToPopup(e) {
    const workEl = e.target.closest('.workout');
    if (!workEl) return;
    const workout = this.#workouts.find(el => el.id === workEl.dataset.id);
    console.log(workout);
    this.#map.setView(workout.coords, 13);
  }
  _setStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }
  _getStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    if (!data) return;
    this.#workouts = data;
    this.#workouts.forEach(work => this._renderworkout(work));
  }
}
const adi = new App();
