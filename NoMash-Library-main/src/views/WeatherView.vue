<template>
    <div class="container">
    <div class="header">
        <h1>WEATHER APP</h1>
        <div class="search-bar">
            <input 
                type="text" 
                v-model="city"
                placeholder="Enter city name"
                class="search-input"
            />
            <button @click="searchByCity" class="search-button">
                Search
            </button>
        </div>
    </div>
</div>
 <!--The <main> tag in HTML is used to specify the main content of a document 
      More info about main, check https://www.w3schools.com/tags/tag_main.asp-->  
      <main>
        <!--If there are no data returned, then skip rendering the information-->  
        <div v-if="weatherData">
          <!--Display the weather data attribute returned from API
          Example of API data: https://openweathermap.org/current-->  
          <h2>
              {{ weatherData.name }}, {{ weatherData.sys.country }}
          </h2>
          <div>
            <!--The image source of of the weather icon will be coming from a function called iconUrl
                which will be shared in script later-->  
            <img :src="iconUrl" alt="Weather Icon" />
            <p>{{ temperature }} °C</p>
          </div>
          <!-- weather[0] means the current weather, the way we need to obtain data depends on how
          the API JSON data looks-->
          <span>{{ weatherData.weather[0].description }}</span>
        </div>
      </main>
</template>
<script>
  // The info section in 10.1.1 provided detailed information about this package 
  import axios from "axios";

  const apikey = "c72f5a63002df542430418be07273288";
  
  export default {
    name: "App",
    data() {
      return {
        city: "",
        weatherData: null,
        hourlyForecast: [],
        dailyForecast: [],
      };
    },

    computed: {

      temperature() {
        return this.weatherData
          ? Math.floor(this.weatherData.main.temp - 273)
          : null;
      },
      //Get the current weather icon using the API link
      iconUrl() {
        return this.weatherData
          ? `https://api.openweathermap.org/img/w/${this.weatherData.weather[0].icon}.png`
          : null;
      },
    },

    mounted() {
      this.fetchCurrentLocationWeather();
    },
    methods: {

      async fetchCurrentLocationWeather() {

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apikey}`;
            await this.fetchWeatherData(url);
          });
        }
      },
      async fetchWeatherData(url) {
        try {
          const response = await axios.get(url);
          //Returned data from API is stored as JSON file in weatherData
          this.weatherData = response.data;
        } catch (error) {
          console.error("Error fetching weather data:", error);
        }
      },
      async searchByCity() {
        if (this.city.trim()) {
          const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(this.city)}&appid=${apikey}`;
          await this.fetchWeatherData(url);
        }
      }
    }
  }
</script>