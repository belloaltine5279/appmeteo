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
  loc: [] = [];

  weatherData: WeatherDay[] = [];
  selectedDay: WeatherDay | null = null;
  searchCity: string = '';
  selectedDate: string = '';
  maxDate: string = new Date().toISOString().split('T')[0];
  showSuggestions: boolean = false;
  filteredCities: City[] = [];

  cities: City[] = [];


  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.loadTotal();
    this.getLocations();
    this.selectedDate = new Date().toISOString().split('T')[0];
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

  private getLocations(): void {
    this.dataService.getLocalisations().subscribe({
      next: (response: City[]) => {
        this.cities = response;
        console.log('Villes chargées:', this.cities);
        
        const paris = this.cities.find(c => c.ville.includes('DIJON')) || this.cities[0];
        if (paris) {
          this.searchCity = paris.ville;
          this.generateWeatherData(paris, new Date());
        }
      },
      error: (err) => {
        console.error('Erreur:', err);
      }
    });
  }






  onSearchInput() {
    if (this.searchCity.trim()) {
      this.showSuggestions = true;
      this.filteredCities = this.cities.filter(city =>
        city.ville.toLowerCase().includes(this.searchCity.toLowerCase())
      );
    } else {
      this.showSuggestions = false;
      this.filteredCities = [];
    }
  }

  selectCity(city: City) {
    this.searchCity = city.ville;
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
      { ville: 'Ensoleillé', icon: '☀️' },
      { ville: 'Nuageux', icon: '☁️' },
      { ville: 'Pluvieux', icon: '🌧️' },
      { ville: 'Partiellement nuageux', icon: '⛅' }
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
        condition: condition.ville,
        icon: condition.icon
      });
    }

    return hours;
  }

  generateWeatherData(city: City, startDate: Date) {
    const conditions = [
      { ville: 'Ensoleillé', icon: '☀️' },
      { ville: 'Nuageux', icon: '☁️' },
      { ville: 'Pluvieux', icon: '🌧️' },
      { ville: 'Partiellement nuageux', icon: '⛅' }
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
        condition: condition.ville,
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
        c.ville.toLowerCase().includes(this.searchCity.toLowerCase())
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
        c.ville.toLowerCase().includes(this.searchCity.toLowerCase())
      );
      
      if (city) {
        this.generateWeatherData(city, new Date(this.selectedDate));
      }
    }
  }
}