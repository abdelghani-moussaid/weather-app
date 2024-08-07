import "./style.css";

async function getWeatherData(location) {
  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}?unitGroup=metric&include=hours%2Cdays%2Ccurrent%2Calerts%2Cevents&key=PCPL3M6MNZYZB2UG7M8QQPD9N&contentType=json`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const weather = await response.json();
    console.log(filterWeatherData(weather));
    // console.log(weather);
  } catch (error) {
    console.log(error);
  }
}

getWeatherData("paris");

function filterWeatherData(weather) {
  let currentConditions = weather.currentConditions;

  const currentConditionsResult = (({
    conditions,
    datetime,
    temp,
    feelslike,
    sunrise,
    sunset,
    precip,
    precipprob,
    preciptype,
    humidity,
  }) => ({
    conditions,
    datetime,
    temp,
    feelslike,
    sunrise,
    sunset,
    precip,
    precipprob,
    preciptype,
    humidity,
  }))(currentConditions);
  weather.currentConditions = currentConditionsResult;

  let days = [];
  let hours = [];

  for (const day of weather.days) {
    for (const hour of day.hours) {
      const hourResults = (({
        datetime,
        icon,
        temp,
        precip,
        precipprob,
        pressiptype,
        windspeed,
        uvindex,
        humidity,
      }) => ({
        datetime,
        icon,
        temp,
        precip,
        precipprob,
        pressiptype,
        windspeed,
        uvindex,
        humidity,
      }))(hour);
      hours.push(hourResults);
    }
    day.hours = hours;
    hours = [];
    const daysResult = (({
      conditions,
      datetime,
      description,
      sunrise,
      sunset,
      temp,
      tempmax,
      tempmin,
      uvindex,
      precip,
      precipprob,
      preciptype,
      windspeed,
      hours,
    }) => ({
      conditions,
      datetime,
      description,
      sunrise,
      sunset,
      temp,
      tempmax,
      tempmin,
      uvindex,
      precip,
      precipprob,
      preciptype,
      windspeed,
      hours,
    }))(day);
    days.push(daysResult);
  }
  weather.days = days;

  let result = (({
    address,
    resolvedAddress,
    timezone,
    currentConditions,
    days,
  }) => ({
    address,
    resolvedAddress,
    timezone,
    currentConditions,
    days,
  }))(weather);

  return result;
}
