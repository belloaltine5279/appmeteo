import { Component, OnInit } from '@angular/core';
import { DataService } from '../../data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {HourlyWeather} from '../../models/hourly';
import { WeatherDay } from '../../models/weather';
import { City } from '../../models/city';


@Component({
  selector: 'app-interfacemeteo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './interfacemeteo.component.html',
  styleUrls: ['./interfacemeteo.component.css']
})


export class InterfacemeteoComponent implements OnInit {
  total: number = 0;

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


  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.loadTotal();
    this.searchCity = 'Paris';
    this.selectedDate = new Date().toISOString().split('T')[0];
    const paris = this.cities[0];
    this.generateWeatherData(paris, new Date());
  }

  private loadTotal(): void {
    this.dataService.getTotal().subscribe({
      next: (response) => {
        this.total = response;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération du total:', err);
        this.total = 0;
      }
    });
  }




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
}