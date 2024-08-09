import "./style.css";
import fr from "date-fns/locale/fr";
import { format } from "date-fns";
import Chart from "chart.js/auto";

async function getWeatherData(location) {
  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?unitGroup=metric&include=hours%2Cdays%2Ccurrent&lang=fr&key=PCPL3M6MNZYZB2UG7M8QQPD9N&contentType=json`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const weather = await response.json();
    return filterWeatherData(weather);
  } catch (error) {
    console.log(error);
  }
}

function filterWeatherData(weather) {
  let currentConditions = weather.currentConditions;

  const currentConditionsResult = (({
    conditions,
    temp,
    feelslike,
    sunrise,
    sunset,
    icon,
  }) => ({
    conditions,
    temp,
    feelslike,
    sunrise,
    sunset,
    icon,
  }))(currentConditions);
  weather.currentConditions = currentConditionsResult;

  let days = [];
  let hours = [];

  for (const day of weather.days) {
    for (const hour of day.hours) {
      const hourResults = (({ datetime, temp }) => ({
        datetime,
        temp,
      }))(hour);
      hours.push(hourResults);
    }
    day.hours = hours;
    hours = [];
    const daysResult = (({
      conditions,
      datetime,
      tempmax,
      tempmin,
      icon,
      hours,
    }) => ({
      conditions,
      datetime,
      tempmax,
      tempmin,
      icon,
      hours,
    }))(day);
    days.push(daysResult);
  }
  weather.days = days;

  let result = (({ address, resolvedAddress, currentConditions, days }) => ({
    address,
    resolvedAddress,
    currentConditions,
    days,
  }))(weather);

  return result;
}

function formHandler() {
  const form = document.querySelector("#locationForm");
  form.addEventListener("submit", (e) => {
    const data = new FormData(form);
    const location = data.get("location");
    getWeatherData(location).then((weather) => {
      console.log(weather);
      display(weather);
    });
    e.preventDefault();
  });
}

formHandler();

function display(weather) {
  const container = document.querySelector(".container");
  const chart = document.querySelector("#myChart");
  container.innerHTML = "";
  chart.innerHTML = "";
  const locationData = document.createElement("div");
  locationData.className = "location-data";
  const currentConditions = document.createElement("div");
  currentConditions.className = "current-conditions";
  const daysForecast = document.createElement("div");
  daysForecast.className = "days-forecast";
  const todayForecast = document.createElement("div");
  todayForecast.className = "today-forecast";
  const dailyForecast = document.createElement("div");
  dailyForecast.className = "daily-forecast";
  const hourlyForecast = document.createElement("div");
  hourlyForecast.className = "hourly-forecast";
  const address = document.createElement("p");
  address.id = "address";
  address.textContent = weather.address;
  const resolvedAddress = document.createElement("p");
  resolvedAddress.id = "resolvedAddress";
  resolvedAddress.textContent = weather.resolvedAddress;
  locationData.appendChild(address);
  locationData.appendChild(resolvedAddress);
  const currIcon = require(`./images/${weather.currentConditions.icon}.png`);
  const currImage = document.createElement("img");
  currImage.src = currIcon;
  const currCondition = document.createElement("p");
  currCondition.id = "current-condition";
  currCondition.textContent = weather.currentConditions.conditions;
  const currFeelsLike = document.createElement("p");
  currFeelsLike.id = "current-feels-like";
  currFeelsLike.textContent =
    Math.round(weather.currentConditions.feelslike) + "°";
  const sunrise = document.createElement("p");
  sunrise.id = "sunrise";
  sunrise.textContent = weather.currentConditions.sunrise;
  const sunset = document.createElement("p");
  sunset.id = "sunset";
  sunset.textContent = weather.currentConditions.sunset;
  const currTemp = document.createElement("p");
  currTemp.id = "current-temp";
  currTemp.textContent = Math.round(weather.currentConditions.temp) + "°";
  currentConditions.appendChild(currImage);
  currentConditions.appendChild(currCondition);
  currentConditions.appendChild(currFeelsLike);
  currentConditions.appendChild(sunrise);
  currentConditions.appendChild(sunset);
  currentConditions.appendChild(currTemp);

  const todayHeader = document.createElement("h3");
  todayHeader.textContent = "Today";
  const minmax = document.createElement("p");
  minmax.className = "minmax";
  minmax.textContent =
    Math.round(weather.days[0].tempmin) +
    "°/ " +
    Math.round(weather.days[0].tempmax) +
    "°";

  const todayCondition = document.createElement("p");
  todayCondition.className = "forecast-condition";
  todayCondition.textContent = weather.days[0].conditions;
  const icon = require(`./images/${weather.days[0].icon}.png`);
  const todayImage = document.createElement("img");
  todayImage.src = icon;
  todayForecast.appendChild(todayHeader);
  todayForecast.appendChild(minmax);
  todayForecast.appendChild(todayImage);
  todayForecast.appendChild(todayCondition);

  const dailyForecastTitle = document.createElement("h3");
  dailyForecastTitle.innerText = "15-DAY FORECAST";
  const card = document.createElement("div");
  card.className = "card";
  const locale = fr;
  for (let i = 1; i < weather.days.length; i++) {
    const item = document.createElement("div");
    item.className = "card-item";
    const day = document.createElement("p");
    day.className = "day";
    day.innerText = format(weather.days[i].datetime, "EEEE", { locale });

    const icon = require(`./images/${weather.days[i].icon}.png`);
    const dayImage = document.createElement("img");
    dayImage.src = icon;
    const minmax = document.createElement("p");
    minmax.className = "minmax";
    minmax.textContent =
      Math.round(weather.days[i].tempmin) +
      "°/ " +
      Math.round(weather.days[i].tempmax) +
      "°";
    const dayCondition = document.createElement("p");
    dayCondition.className = "forecast-condition";
    dayCondition.textContent = weather.days[i].conditions;
    item.appendChild(day);
    item.appendChild(dayImage);
    item.appendChild(minmax);
    item.appendChild(dayCondition);
    card.appendChild(item);
  }
  dailyForecast.appendChild(dailyForecastTitle);
  dailyForecast.appendChild(card);
  daysForecast.appendChild(todayForecast);
  daysForecast.appendChild(dailyForecast);

  let hourlyTemp = [];
  let hours = [];
  for (let i = 0; i < weather.days[0].hours.length; i++) {
    hourlyTemp.push(Math.round(weather.days[0].hours[i].temp));
    hours.push(weather.days[0].hours[i].datetime.slice(0, -3));
  }

  let chartStatus = Chart.getChart("myChart"); // <canvas> id
  if (chartStatus != undefined) {
    chartStatus.destroy();
  }
  new Chart("myChart", {
    type: "line",
    data: {
      labels: hours,
      datasets: [
        {
          label: "24-Hour Forecast",
          data: hourlyTemp,
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
      ],
    },
  });

  container.appendChild(locationData);
  container.appendChild(currentConditions);
  container.appendChild(daysForecast);
  container.appendChild(hourlyForecast);
}
