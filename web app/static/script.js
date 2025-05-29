document.addEventListener("DOMContentLoaded", () => {
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");
  const searchBtn = document.getElementById("searchBtn");
  const cityInput = document.getElementById("cityInput");
  const darkModeToggle = document.getElementById("darkModeToggle");
  const unitSelect = document.getElementById("unitSelect");
  const savedCitiesList = document.getElementById("savedCitiesList");

  let unit = "metric";
  let savedCities = [];

  // Tab switching
  tabButtons.forEach(button => {
    button.addEventListener("click", () => {
      document.querySelector(".tab-button.active")?.classList.remove("active");
      document.querySelector(".tab-content.active")?.classList.remove("active");

      button.classList.add("active");
      document.getElementById(button.dataset.tab).classList.add("active");
    });
  });

  // Search weather
  searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (!city) return alert("Please enter a city name.");

    fetch("/get_weather", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `city=${encodeURIComponent(city)}&units=${unit}`
    })
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
      } else {
        updateWeatherDisplay(data, city);
        addCityToList(city);
      }
    })
    .catch(() => alert("Failed to fetch weather."));
  });

  // Update UI with weather
  function updateWeatherDisplay(data, city) {
    document.getElementById("cityName").textContent = city;
    document.getElementById("temperature").textContent = `${data.temperature} ${unit === "metric" ? "°C" : "°F"}`;
    document.getElementById("description").textContent = data.description;
    document.getElementById("humidity").textContent = `Humidity: ${data.humidity}`;
    document.getElementById("windSpeed").textContent = `Wind Speed: ${data.wind_speed}`;
    document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${data.icon}@2x.png`;

    const forecastContainer = document.getElementById("forecastContainer");
    forecastContainer.innerHTML = "";

    data.forecast.forEach(day => {
      const card = document.createElement("div");
      card.className = "forecast-day";
      card.innerHTML = `
        <h4>${day.date}</h4>
        <img src="https://openweathermap.org/img/wn/${day.icon}@2x.png" alt="${day.desc}" />
        <p>${day.temp} ${unit === "metric" ? "°C" : "°F"}</p>
        <p>${day.desc}</p>
      `;
      forecastContainer.appendChild(card);
    });
  }

  // Add city to saved list
  function addCityToList(city) {
    if (!savedCities.includes(city)) {
      savedCities.push(city);
      const li = document.createElement("li");
      li.textContent = city;
      savedCitiesList.appendChild(li);
    }
  }

  // Dark mode toggle
  darkModeToggle.addEventListener("change", () => {
    document.body.classList.toggle("dark-mode", darkModeToggle.checked);
  });

  // Unit toggle
  unitSelect.addEventListener("change", () => {
    unit = unitSelect.value;
    if (document.getElementById("cityName").textContent) {
      searchBtn.click(); // Re-fetch with new unit
    }
  });
});