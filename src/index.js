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
    var errorElement = document.getElementById("error");
    errorElement.style.display = "none";
    return filterWeatherData(weather);
  } catch (error) {
    showError("Cette Adresse est introuvable");
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

    const graph = document.querySelector(".graph");
    graph.style.visibility = "hidden";
    getWeatherData(location).then((weather) => {
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
  const todayForecast = document.createElement("div");
  todayForecast.className = "today-forecast";
  const dailyForecast = document.createElement("div");
  dailyForecast.className = "daily-forecast";
  const resolvedAddress = document.createElement("p");
  resolvedAddress.id = "resolvedAddress";
  resolvedAddress.textContent = weather.resolvedAddress;
  const sunrise = document.createElement("div");
  sunrise.className = "sunrise";
  const sunriseImage = document.createElement("img");
  sunriseImage.src = require("./images/sunrise.svg");
  const sunriseTime = document.createElement("p");
  sunriseTime.id = "sunrise";
  sunriseTime.textContent = weather.currentConditions.sunrise.slice(0, -3);
  sunrise.appendChild(sunriseImage);
  sunrise.appendChild(sunriseTime);
  const sunset = document.createElement("div");
  sunset.className = "sunset";
  const sunsetImage = document.createElement("img");
  sunsetImage.src = require("./images/sunset.svg");
  const sunsetTime = document.createElement("p");
  sunsetTime.id = "sunset";
  sunsetTime.textContent = weather.currentConditions.sunset.slice(0, -3);
  sunset.appendChild(sunsetImage);
  sunset.appendChild(sunsetTime);
  const sunriseSunset = document.createElement("div");
  sunriseSunset.className = "sunrise-sunset";
  sunriseSunset.appendChild(sunrise);
  sunriseSunset.appendChild(sunset);
  locationData.appendChild(resolvedAddress);
  locationData.appendChild(sunriseSunset);
  const currIcon = require(`./images/${weather.currentConditions.icon}.svg`);
  const currImage = document.createElement("img");
  currImage.src = currIcon;
  const currCondition = document.createElement("p");
  currCondition.id = "current-condition";
  currCondition.textContent = weather.currentConditions.conditions;
  const currFeelsLike = document.createElement("p");
  currFeelsLike.id = "current-feels-like";
  currFeelsLike.textContent =
    "Ressentie : " + Math.round(weather.currentConditions.feelslike) + "°";
  const currTemp = document.createElement("div");
  currTemp.id = "current-temp";
  currTemp.textContent = Math.round(weather.currentConditions.temp) + "°";
  const currContent = document.createElement("div");
  currContent.className = "current-content";
  const currDetails = document.createElement("div");
  currDetails.className = "current-details";
  const minmax = document.createElement("p");
  // minmax.className = "minmax";
  // minmax.textContent =
  //   "Min : " +
  //   Math.round(weather.days[0].tempmin) +
  //   "° | Max: " +
  //   Math.round(weather.days[0].tempmax) +
  //   "°";
  currDetails.appendChild(currCondition);
  currDetails.appendChild(currFeelsLike);
  // currDetails.appendChild(minmax);
  // currDetails.appendChild(sunrise);
  // currDetails.appendChild(sunset);
  currContent.appendChild(currTemp);
  currContent.appendChild(currDetails);
  currentConditions.appendChild(currImage);
  currentConditions.appendChild(currContent);

  const todayHeader = document.createElement("h3");
  todayHeader.textContent = "Today";

  // const todayCondition = document.createElement("p");
  // todayCondition.className = "forecast-condition";
  // todayCondition.textContent = weather.days[0].conditions;
  // const icon = require(`./images/${weather.days[0].icon}.svg`);
  // const todayImage = document.createElement("img");
  // todayImage.src = icon;
  // todayForecast.appendChild(todayHeader);
  // todayForecast.appendChild(minmax);
  // todayForecast.appendChild(todayImage);
  // todayForecast.appendChild(todayCondition);

  const dailyForecastTitle = document.createElement("h3");
  dailyForecastTitle.innerText = "Prévisions à 15 jours";
  const card = document.createElement("div");
  card.className = "card";
  const locale = fr;
  for (let i = 0; i < weather.days.length; i++) {
    const item = document.createElement("div");
    item.className = "card-item";
    const day = document.createElement("p");
    day.className = "day";
    day.innerText = format(weather.days[i].datetime, "EEEE", { locale });

    const icon = require(`./images/${weather.days[i].icon}.svg`);
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

  const graph = document.querySelector(".graph");
  graph.style.visibility = "visible";
  new Chart("myChart", {
    type: "line",
    data: {
      labels: hours,
      datasets: [
        {
          label: "Prévisions sur 24 heures",
          data: hourlyTemp,
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          labels: {
            color: "#eef2ff",
            font: {
              size: 18,
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            callback: function (tick, index) {
              return index % 2 ? "" : hours[tick];
            },

            color: "#eef2ff",
          },
        },
        y: {
          grid: {
            display: false,
          },
          ticks: {
            color: "#eef2ff",
          },
        },
      },
    },
  });

  container.appendChild(locationData);
  container.appendChild(currentConditions);
  container.appendChild(dailyForecast);
}

function showError(message) {
  var errorElement = document.getElementById("error");
  errorElement.innerHTML = message;
  errorElement.style.display = "block";
}
