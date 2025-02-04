import { Component, OnInit } from '@angular/core';
import { DataService } from '../../data.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {HourlyWeather} from '../../models/hourly';
import { WeatherDay } from '../../models/weather';
import { City } from '../../models/city';
import { Data } from '../../models/data';


@Component({
  selector: 'app-interfacemeteo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './interfacemeteo.component.html',
  styleUrls: ['./interfacemeteo.component.css']
})


export class InterfacemeteoComponent implements OnInit {
  total: number = 0;
  data: Data[] = [];
  data_details: Data[]= [];

  infoCity: City = { id: 0, numeroStation: 0, ville: '', latitude: 0, longitude: 0, altitude: 0 };


  isLoading: boolean = false;

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

  groupByDate(dataList: Data[]): void{
    const groupedData: Data[][] = [];
    const tempGroup: { [date: string]: Data[] } = {};

    dataList.forEach((data) => {
        const date = new Date(data.date).toLocaleDateString('fr-CA');  

        if (!tempGroup[date]) {
            tempGroup[date] = [];
        }

        tempGroup[date].push(data);
    });

    for (const date in tempGroup) {
        if (tempGroup.hasOwnProperty(date)) {
            groupedData.push(tempGroup[date]);
        }
    }
  
    console.log("voici le tri: ", groupedData);
    this.data = [];
    groupedData.forEach((g) => {
      this.data.push(this.calculateAverageForAllParams(g));
    })
    
  }

  calculateFeelsLike(temp: number, windSpeed: number, humidity: number, dewPoint: number): number {
    if (temp <= 10 && windSpeed > 5) {
      return 13.12 + 0.6215 * temp - 11.37 * Math.pow(windSpeed, 0.16) + 0.3965 * temp * Math.pow(windSpeed, 0.16);
    } else if (temp >= 20 && humidity > 40) {
      return temp + 0.5555 * (6.11 * Math.exp(5417.7530 * ((1/273.16) - (1/(dewPoint + 273.16)))) - 10);
    }
    return temp;
  }

  calculateAverageForAllParams(dataList: Data[]): Data {
    const paramsToExclude = ['id', 'date'];
    const averages: Partial<Data> = {}; 
  
    averages.id = dataList[0].id;
    averages.date = dataList[0].date;
  
    const params = Object.keys(dataList[0]).filter((key) => !paramsToExclude.includes(key));
  
    params.forEach((param) => {
      const total = dataList.reduce((sum, data) => {
        const value = data[param as keyof Data];
        return typeof value === 'number' ? sum + value : sum;
      }, 0);
  
      (averages as any)[param] = Math.round(total / dataList.length);
    });
  
    return averages as Data;
  }
  
  
  
  

  private getInfo(num_station: number, dateFin: string): void {
    this.dataService.getInfo(num_station, dateFin).subscribe({
      next: (response: any) => {
        this.data_details = response;
        console.log('Données chargées de '+num_station+": ", this.data);
        this.groupByDate(this.data_details);
        console.log("Après groupByDate, data:", this.data);
      },
      error: (err) => {
        console.error('Erreur:', err);
      }
    });
  }


  private getLocations(): void {
    this.dataService.getLocalisations().subscribe({
      next: (response: City[]) => {
        this.cities = response;
        console.log('Villes chargées:', this.cities);
        
        const c = this.cities.find(c => c.ville.includes('DIJON')) || this.cities[0];
        if ( c ) {
          this.searchCity =  c .ville;
          this.generateWeatherData( c , new Date(this.selectedDate));
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

  generateHourlyData(baseTemp: number, date: string): HourlyWeather[] {

    const daily_data= this.filterByDate(this.data_details, date);
    const hours:HourlyWeather[] = [];

    daily_data.reverse().forEach((daily) => {
      const condition = this.getWeatherCondition(daily.t, daily.rr12).split(" ");
      const time = daily.date.split(" ")[1].slice(0, 5);
      hours.push({
        time: time,
        temperature: Math.round(daily.t),
        condition: condition[0],
        icon: condition[1]
      });
    });    
    
    return hours;
  }

  filterByDate(dataList: Data[], dateToMatch: string): Data[] {
    const targetDate = new Date(dateToMatch).toLocaleDateString('fr-CA'); 
    const filteredData = dataList.filter(data => {
        const dataDate = new Date(data.date).toLocaleDateString('fr-CA');
        return dataDate === targetDate;
    });

    return filteredData;
}

  generateWeatherData(city: City, startDate: Date) {
    this.isLoading = true;
    this.weatherData = [];

    this.infoCity = city;

    console.log("Date qu'on pour la requete: ", startDate);
    this.getInfo(city.numeroStation, startDate.toISOString().split('T')[0]);
    setTimeout(() => {
      console.log("Données dans data après un délai:", this.data);
      
      this.data.reverse().forEach((d) => {
        console.log("Info sur: "+city.ville +" n°"+d.numer_sta+" le: "+d.date+": ", d);
        const condition = this.getWeatherCondition(d.t, d.rr12).split(" ");
        const date = new Date(this.formatDateEN(d.date));
        this.weatherData.push({
          date: date,
          temperature: d.t,
          condition: condition[0],
          icon: condition[1],
          humidity: d.u,
          prose: d.td,
          windQuality: this.windQuality(d.u, d.ff, d.t, d.rr12),
          visibility: Math.round(d.vv/1000),
          windSpeed: Math.round(d.ff*3.6),
          realFeel: Math.round(this.calculateFeelsLike(d.t, d.ff, d.u, d.td)),
          windDirection: this.getWindDirection(d.dd).split(" ")[0],
          precipitation: d.rr12,
          pmer: d.pmer / 100000,
          latitude: city.latitude,
          longitude: city.longitude,
          hourlyData: this.generateHourlyData(d.t, d.date)
        });
      })
      this.isLoading = false;
    }, 500);
  }

  windQuality(humidity: number, windSpeed: number, temperature: number, precipitation: number = 0): string {
    let score = 100;

    if (windSpeed < 5) score -= 30; 
    else if (windSpeed > 20) score += 10; 

 
    if (humidity > 80) score -= 20;
    else if (humidity < 30) score += 10;

    if (temperature > 30) score -= 20;
    else if (temperature < 5) score -= 10;

    if (precipitation > 0) score += 20;

    if (score >= 80) return "Bonne alert-success";
    if (score >= 60) return "Acceptable alert-info";
    if (score >= 40) return "Médiocre alert-warning";
    if (score >= 20) return "Mauvaise alert-danger";
    return "Très-mauvaise alert-secondary";
}


/**
 * Formats a date string into a human-readable format in English (UK).
 * The formatted date includes the weekday, day, month, and year.
 * 
 * @param dateString - The date string to format, expected in a format 
 *                     that can be parsed by the JavaScript Date object.
 * @returns A string representing the formatted date in the format 
 *          "weekday, day month year", e.g., "Monday, 1 January 2023".
 */

  formatDateEN(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }).format(date);
  }

  /**
   * Returns a string representing the weather condition, based on the given temperature and precipitation.
   * The condition is determined as follows:
   * - If precipitation is greater than 0, the condition is 'Pluvieux'.
   * - If the temperature is above 25, the condition is 'Ensoleillé'.
   * - If the temperature is between 15 and 25, the condition is 'Partiellement nuageux'.
   * - If the temperature is between 5 and 15, the condition is 'Nuageux'.
   * - If the temperature is below 5, the condition is 'Froid'.
   * @param temperature The temperature in degrees Celsius.
   * @param precipitation The amount of precipitation in mm/h.
   * @returns A string representing the weather condition.
   */
  getWeatherCondition(temperature: number, precipitation: number = 0): string {
    if (precipitation > 0) {
      return 'Pluvieux 🌧️';
    } else if (temperature >= 25) {
      return 'Ensoleillé ☀️';
    } else if (temperature >= 15 && temperature < 25) {
      return 'Partiellement-nuageux ⛅';
    } else if (temperature >= 5 && temperature < 15) {
      return 'Nuageux ☁️';
    } else {
      return 'Froid ❄️';
    }
  }
  
  /**
   * Renvoie une direction de vent sous forme de string, en fonction de son angle en degrés.
   * Les directions sont renvoyées sous forme d'emojis, avec une direction cardinale.
   * Les directions intermédiaires sont renvoyées avec un mélange de deux directions cardinales.
   * Si la direction n'est pas comprise entre 0 et 360 degrés, la méthode renvoie "Inconnue".
   * @param degree L'angle de la direction du vent, en degrés.
   * @returns La direction du vent, sous forme de string.
   */
  getWindDirection(degree: number): string {
    if (degree >= 337.5 || degree < 22.5) {
      return '⬆️ Nord';
    } else if (degree >= 22.5 && degree < 67.5) {
      return '↗️ Nord-Est';
    } else if (degree >= 67.5 && degree < 112.5) {
      return '➡️ Est';
    } else if (degree >= 112.5 && degree < 157.5) {
      return '↘️ Sud-Est';
    } else if (degree >= 157.5 && degree < 202.5) {
      return '⬇️ Sud';
    } else if (degree >= 202.5 && degree < 247.5) {
      return '↙️ Sud-Ouest';
    } else if (degree >= 247.5 && degree < 292.5) {
      return '⬅️ Ouest';
    } else if (degree >= 292.5 && degree < 337.5) {
      return '↖️ Nord-Ouest';
    } else {
      return '❓ Inconnue';
    }
  }
  


  /**
   * Called when the user searches for a city.
   * If the search input is not empty and a date is selected,
   * it will search for a city with the given name and
   * generate the weather data for the selected date if found.
   * If no city is found, it will clear the weather data array.
   */
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



  /**
   * Called when the user changes the selected date.
   * If the search input is not empty and a city is found,
   * it will generate the weather data for the selected date.
   */
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