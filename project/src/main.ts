import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { bootstrapApplication } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

interface HourlyWeather {
  time: string;
  temperature: number;
  condition: string;
  icon: string;
}

interface WeatherDay {
  date: Date;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  latitude: number;
  longitude: number;
  icon: string;
  hourlyData: HourlyWeather[];
}

interface City {
  name: string;
  latitude: number;
  longitude: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="padding: 20px;">
      <h1 style="color: white; text-align: center; font-size: 2.5em; margin-bottom: 30px;">
        Météo historique
      </h1>
      
      <div class="search-container">
        <div class="search-wrapper">
          <input
            type="text"
            class="search-input"
            [(ngModel)]="searchCity"
            (input)="onSearchInput()"
            placeholder="Rechercher une ville..."
          />
          @if (showSuggestions && filteredCities.length > 0) {
            <div class="suggestions-container">
              @for (city of filteredCities; track city.name) {
                <div 
                  class="suggestion-item"
                  (click)="selectCity(city)"
                >
                  {{ city.name }}
                </div>
              }
            </div>
          }
        </div>
        <input
          type="date"
          class="date-input"
          [(ngModel)]="selectedDate"
          (change)="onDateChange()"
          [min]="'1996-01-01'"
          [max]="maxDate"
        />
      </div>

      @if (weatherData.length > 0) {
        <div class="weather-grid">
          @for (day of weatherData; track day.date) {
            <div class="weather-card" (click)="showDetails(day)">
              <div class="date">{{ day.date | date:'EEEE d MMMM yyyy' }}</div>
              <div class="weather-icon">{{ day.icon }}</div>
              <div class="temperature">{{ day.temperature }}°C</div>
              <div class="condition">{{ day.condition }}</div>
              
              <div class="tab-container">
                <div class="info-tab">
                  <div style="font-weight: bold;">Humidité</div>
                  {{ day.humidity }}%
                </div>
                <div class="info-tab">
                  <div style="font-weight: bold;">Vent</div>
                  {{ day.windSpeed }} km/h
                </div>
              </div>
              
              <div class="tab-container" style="margin-top: 10px;">
                <div class="info-tab">
                  <div style="font-weight: bold;">Coordonnées</div>
                  {{ day.latitude }}°N, {{ day.longitude }}°E
                </div>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="no-results">
          Aucune donnée météo disponible pour cette ville ou cette date.
          Veuillez sélectionner une ville et une date valides.
        </div>
      }

      @if (selectedDay) {
        <div class="fullscreen-details">
          <button class="back-button" (click)="closeDetails()">
            ← Retour
          </button>
          
          <div class="details-content">
            <div style="text-align: center; margin-bottom: 30px;">
              <div class="date" style="font-size: 1.5em;">
                {{ selectedDay.date | date:'EEEE d MMMM yyyy' }}
              </div>
              <div class="weather-icon" style="font-size: 3em;">
                {{ selectedDay.icon }}
              </div>
              <div class="temperature" style="font-size: 3em;">
                {{ selectedDay.temperature }}°C
              </div>
              <div class="condition" style="font-size: 1.3em;">
                {{ selectedDay.condition }}
              </div>
            </div>

            <div class="tab-container" style="margin-bottom: 30px;">
              <div class="info-tab">
                <div style="font-weight: bold;">Humidité</div>
                {{ selectedDay.humidity }}%
              </div>
              <div class="info-tab">
                <div style="font-weight: bold;">Vent</div>
                {{ selectedDay.windSpeed }} km/h
              </div>
              <div class="info-tab">
                <div style="font-weight: bold;">Coordonnées</div>
                {{ selectedDay.latitude }}°N, {{ selectedDay.longitude }}°E
              </div>
            </div>

            <h2 style="color: #2c3e50; margin-bottom: 20px;">Prévisions horaires</h2>
            <div class="hourly-grid">
              @for (hour of selectedDay.hourlyData; track hour.time) {
                <div class="hourly-card">
                  <div class="time">{{ hour.time }}</div>
                  <div class="icon">{{ hour.icon }}</div>
                  <div class="temp">{{ hour.temperature }}°C</div>
                  <div class="condition">{{ hour.condition }}</div>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class App implements OnInit {
  weatherData: WeatherDay[] = [];
  selectedDay: WeatherDay | null = null;
  searchCity: string = '';
  selectedDate: string = '';
  maxDate: string = new Date().toISOString().split('T')[0];
  showSuggestions: boolean = false;
  filteredCities: City[] = [];

  cities: City[] = [
    { name: 'Paris', latitude: 48.8566, longitude: 2.3522 },
    { name: 'Lyon', latitude: 45.7578, longitude: 4.8320 },
    { name: 'Marseille', latitude: 43.2965, longitude: 5.3698 },
    { name: 'Bordeaux', latitude: 44.8378, longitude: -0.5792 },
    { name: 'Lille', latitude: 50.6292, longitude: 3.0573 },
    { name: 'Toulouse', latitude: 43.6047, longitude: 1.4442 },
    { name: 'Nice', latitude: 43.7102, longitude: 7.2620 },
    { name: 'Nantes', latitude: 47.2184, longitude: -1.5536 },
    { name: 'Strasbourg', latitude: 48.5734, longitude: 7.7521 },
    { name: 'Montpellier', latitude: 43.6108, longitude: 3.8767 }
  ];

  onSearchInput() {
    if (this.searchCity.trim()) {
      this.showSuggestions = true;
      this.filteredCities = this.cities.filter(city =>
        city.name.toLowerCase().includes(this.searchCity.toLowerCase())
      );
    } else {
      this.showSuggestions = false;
      this.filteredCities = [];
    }
  }

  selectCity(city: City) {
    this.searchCity = city.name;
    this.showSuggestions = false;
    if (this.selectedDate) {
      this.generateWeatherData(city, new Date(this.selectedDate));
    }
  }

  showDetails(day: WeatherDay) {
    this.selectedDay = day;
  }

  closeDetails() {
    this.selectedDay = null;
  }

  generateHourlyData(baseTemp: number, date: Date): HourlyWeather[] {
    const hours = [];
    const conditions = [
      { name: 'Ensoleillé', icon: '☀️' },
      { name: 'Nuageux', icon: '☁️' },
      { name: 'Pluvieux', icon: '🌧️' },
      { name: 'Partiellement nuageux', icon: '⛅' }
    ];

    const seed = date.getTime();
    const pseudoRandom = (n: number) => {
      return ((Math.sin(seed * n) + 1) / 2);
    };

    for (let hour = 0; hour < 24; hour += 3) {
      const conditionIndex = Math.floor(pseudoRandom(hour + 1) * conditions.length);
      const condition = conditions[conditionIndex];
      const tempVariation = (pseudoRandom(hour + 2) * 4) - 2;

      hours.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        temperature: Math.round(baseTemp + tempVariation),
        condition: condition.name,
        icon: condition.icon
      });
    }

    return hours;
  }

  generateWeatherData(city: City, startDate: Date) {
    const conditions = [
      { name: 'Ensoleillé', icon: '☀️' },
      { name: 'Nuageux', icon: '☁️' },
      { name: 'Pluvieux', icon: '🌧️' },
      { name: 'Partiellement nuageux', icon: '⛅' }
    ];

    this.weatherData = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const seed = date.getTime();
      const pseudoRandom = (n: number) => {
        return ((Math.sin(seed * n) + 1) / 2);
      };

      const conditionIndex = Math.floor(pseudoRandom(1) * conditions.length);
      const condition = conditions[conditionIndex];
      const baseTemp = Math.floor(15 + pseudoRandom(2) * 10);
      
      this.weatherData.push({
        date: date,
        temperature: baseTemp,
        condition: condition.name,
        icon: condition.icon,
        humidity: Math.floor(40 + pseudoRandom(3) * 50),
        windSpeed: Math.floor(5 + pseudoRandom(4) * 25),
        latitude: city.latitude,
        longitude: city.longitude,
        hourlyData: this.generateHourlyData(baseTemp, date)
      });
    }
  }

  onSearch() {
    if (this.searchCity && this.selectedDate) {
      const city = this.cities.find(c => 
        c.name.toLowerCase().includes(this.searchCity.toLowerCase())
      );
      
      if (city) {
        this.generateWeatherData(city, new Date(this.selectedDate));
      } else {
        this.weatherData = [];
      }
    }
  }

  onDateChange() {
    if (this.searchCity && this.selectedDate) {
      const city = this.cities.find(c => 
        c.name.toLowerCase().includes(this.searchCity.toLowerCase())
      );
      
      if (city) {
        this.generateWeatherData(city, new Date(this.selectedDate));
      }
    }
  }

  ngOnInit() {
    this.searchCity = 'Paris';
    this.selectedDate = new Date().toISOString().split('T')[0];
    const paris = this.cities[0];
    this.generateWeatherData(paris, new Date());
  }
}

bootstrapApplication(App);