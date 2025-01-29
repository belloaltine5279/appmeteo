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
      //console.log(this.calculateAverageForAllParams(g));
      this.data.push(this.calculateAverageForAllParams(g));
    })

    //console.log("voici data: ", this.data);
    
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
  
  
  
  

  private getInfo(num_station: number): void {
    this.dataService.getInfo(num_station).subscribe({
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

  generateHourlyData(baseTemp: number, date: string): HourlyWeather[] {

    const daily_data= this.filterByDate(this.data_details, date);
    const hours:HourlyWeather[] = [];

    daily_data.forEach((daily) => {
      const condition = this.getWeatherCondition(daily.t, daily.rr12).split(" ");
      const time  = daily.date.split(" ")[1].slice(0, 5);
      hours.push({
        time: time,
        temperature: daily.t,
        condition: condition[0],
        icon: condition[1]
      });
    })
    
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
    this.weatherData = [];
    this.getInfo(city.numeroStation)
    setTimeout(() => {
      console.log("Données dans data après un délai:", this.data);

      
      this.data.forEach((d) => {
        console.log("Info sur: "+city.ville +" n°"+d.numer_sta+" le: "+d.date+": ", d);
        const condition = this.getWeatherCondition(d.t, d.rr12).split(" ");
        const date = new Date(this.formatDateEN(d.date));
        this.weatherData.push({
          date: date,
          temperature: d.t,
          condition: condition[0],
          icon: condition[1],
          humidity: d.u,
          windSpeed: d.ff,
          latitude: city.latitude,
          longitude: city.longitude,
          hourlyData: this.generateHourlyData(d.t, d.date)
        });

        console.log(this.filterByDate(this.data_details, d.date));
      })

      
    }, 100);
  }


  formatDateEN(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }).format(date);
  }

  getWeatherCondition(temperature: number, precipitation: number = 0): string {
    if (precipitation > 0) {
      return 'Pluvieux 🌧️';
    } else if (temperature >= 25) {
      return 'Ensoleillé ☀️';
    } else if (temperature >= 15 && temperature < 25) {
      return 'Partiellement nuageux ⛅';
    } else if (temperature >= 5 && temperature < 15) {
      return 'Nuageux ☁️';
    } else {
      return 'Froid ❄️';
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