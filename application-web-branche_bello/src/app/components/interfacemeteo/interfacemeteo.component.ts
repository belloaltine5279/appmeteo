import { Component, OnInit } from '@angular/core';
import { DataService } from '../../data.service';
import {forkJoin, Observable, pipe, throwError} from 'rxjs';
import { catchError, debounceTime, switchMap } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {bootstrapApplication} from '@angular/platform-browser';
import {HttpClient, HttpClientModule, HttpHeaders} from '@angular/common/http';




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


// @ts-ignore
@Component({
  selector: 'app-interfacemeteo',
  imports: [CommonModule, FormsModule],
  templateUrl: './interfacemeteo.component.html',
  styleUrls: ['./interfacemeteo.component.css']
})


export class InterfacemeteoComponent implements OnInit {

  data: any[] = [];
  data2: any[] = [];
  datechoisie: any[] = [];
  isfiltered: boolean = false;
  defaultCity: any = null;
  dateFiltered: any = null;

  searchQuery: string = '';
  filteredCities: any[] = [];
  selectedCity: any = null;
  // weatherData: any = null;
  weatherDataDefault: any = null;


  selectdefault: any = null;
  weatherData2: any = null;
  currentWeather: any = null;
  weatherData: WeatherDay[] = [];
  selectedDay: WeatherDay | null = null;
  searchCity: string = '';
  selectedDate: string = '';
  maxDate: string = new Date().toISOString().split('T')[0];
  showSuggestions: boolean = false;
  ville: any = null ;
  date : any = null ;

  // filteredCities: City[] = [];


  activeTab : string = 'temperature'; // Onglet actif par défaut

  private retryAttempt = 0; // Compteur pour les tentatives de récupération
  private maxRetry = 5; // Nombre maximum de tentatives

  constructor(private dataService: DataService) {
  }

  generateHourlyData(date: Date): HourlyWeather[] {
    const hours = [];
    const conditions = [
      {name: 'Ensoleillé', icon: '☀️'},
      {name: 'Nuageux', icon: '☁️'},
      {name: 'Pluvieux', icon: '🌧️'},
      {name: 'Partiellement nuageux', icon: '⛅'}
    ];

    let condition:any = null;
    let temperature : any = null;

    temperature = this.datechoisie.find(data => data.temperature);

    switch (temperature) {
      case (temperature <= 0): {
        condition = conditions[1];
        break;
      }
      case (temperature > 0 && temperature <= 20): {
        condition = conditions[1];
        break;
      }
      default: {
        condition = conditions[0];
        break;
      }
    }
      hours.push({
        time: date.getHours(),
        temperature: this.datechoisie,
        condition: condition.name,
        icon: condition.icon
      });

    // @ts-ignore
    return hours;
  }

  ngOnInit(): void {
    const conditions = [
      {name: 'Ensoleillé', icon: '☀️'},
      {name: 'Nuageux', icon: '☁️'},
      {name: 'Pluvieux', icon: '🌧️'},
      {name: 'Partiellement nuageux', icon: '⛅'}
    ];

    this.getData();
    this.selectDefaultCity();
    setTimeout(() => {
      this.selectedCity = this.data2.find(city => city.ville === 'DIJON');
      if (this.selectedCity) {
        // this.weatherData = this.getWeatherData(this.selectedCity.numeroStation);
        //this.datechoisie = this.getWeatherData3(this.selectedCity.numeroStation, new Date().toISOString().split('T')[0]);
      }
    }, 1000);
  }

  getData(): void {
    // this.makeApiRequest()
    //   .subscribe({
    //     next: (data) => {
    //       this.data = data;
    //       console.log(data);
    //       this.retryAttempt = 0; // Réinitialiser le compteur en cas de succès
    //       this.selectDefaultCity();
    //     },
    //     error: (error) => {
    //       console.error('Error fetching data:', error);
    //     },
    //   });
    //
    // this.makeApilocalisationRequest()
    //   .subscribe({
    //     next: (data) => {
    //       this.data2 = data;
    //       console.log(this.data2);
    //       this.retryAttempt = 0; // Réinitialiser le compteur en cas de déséchec
    //     },
    //     error: (error) => {
    //       console.error('Error fetching data:', error);
    //     },
    //   });
    forkJoin({
      meteo: this.makeApiRequest(),
      meteo_choisit: this.makeApiRequest_selective(this.ville, this.date),
      localisation: this.makeApilocalisationRequest(),
    }).subscribe({
      next: (data) => {
        //this.data = data.meteo;
        this.data2 = data.localisation;
        this.datechoisie = data.meteo_choisit;
        console.log('Données météo:', this.data.length);
        console.log('Données localisation:', this.data2.length);

        this.retryAttempt = 0; // Réinitialiser le compteur en cas de succès
        this.selectDefaultCity(); // Sélectionner la ville par défaut après récupération des données
      },
      error: (error) => {
        console.error('Error fetching data:', error);
      },
    });
  }



  selectDefaultCity(): void {

    // this.selectdefault = this.data2.find(city => city.ville === 'DIJON-LONGVIC');
    this.ville = 'DIJON-LONGVIC';
    this.date = new Date().toISOString().split('T')[0]; // Date actuelle=
    this.datechoisie = this.getWeatherData3(this.data2.find(city => city.ville === this.ville), this.date);
    if (this.datechoisie) {
      console.log(this.datechoisie);
    } else {
      console.log("Ville par défaut non trouvée");
    }
  }

  getWeatherData(stationNumber: string) {
    return this.data2.find((data) => data.numeroStation === stationNumber);
  }

  getWeatherData2(stationNumber: any) {
    return this.datechoisie.find((data) => data.numer_sta === stationNumber);
  }

  getWeatherData3(stationNumber: any, date: any) {
    return this.datechoisie.find((data) => data.numer_sta === stationNumber && data.date === date)
  }

  generateWeatherData(city: any, date: Date) {
    const conditions = [
      {name: 'Ensoleillé', icon: '☀️'},
      {name: 'Nuageux', icon: '☁️'},
      {name: 'Pluvieux', icon: '🌧️'},
      {name: 'Partiellement nuageux', icon: '⛅'}
    ];

    this.weatherData = [];
    this.weatherData = this.getWeatherData3(city.numeroStation, date.toISOString().split('T')[0])
    // this.weatherData.push({
    //   // date: this.datechoisie.date ,
    //   // temperature: this.datechoisie.t,
    //   // // condition: this.datechoisie.condition,
    //   // icon: conditions.icon,
    //   // humidity: this.datechoisie.humidity,
    //   // windSpeed: this.datechoisie.windSpeed,
    //   // latitude: this.datechoisie.latitude,
    //   // longitude: this.datechoisie.longitude,
    //   // hourlyData: this.generateHourlyData(this.datechoisie.temp)
    // });


    // for (let i = 0; i < 7; i++) {
    //   const date = new Date(startDate);
    //   date.setDate(date.getDate() + i);
    //
    //   const seed = date.getTime();
    //   const pseudoRandom = (n: number) => {
    //     return ((Math.sin(seed * n) + 1) / 2);
    //   };


    // const conditionIndex = Math.floor(pseudoRandom(1) * conditions.length);
    // const condition = conditions[conditionIndex];
    // const baseTemp = Math.floor(15 + pseudoRandom(2) * 10);

    //   this.weatherData.push({
    //     // date: date,
    //     // temperature: baseTemp,
    //     // condition: condition.name,
    //     // icon: condition.icon,
    //     // humidity: Math.floor(40 + pseudoRandom(3) * 50),
    //     // windSpeed: Math.floor(5 + pseudoRandom(4) * 25),
    //     // latitude: city.latitude,
    //     // longitude: city.longitude,
    //     // hourlyData: this.generateHourlyData(baseTemp, date)
    //   });
    // }

    // viewDetails(city: any) {
    //   alert(`Détails pour ${city.ville}: ${city.numerostation}`);
    // }
    //
    // // Méthode pour gérer le changement d'onglet actif
    // setActiveTab(tab: string) {
    //   this.activeTab = tab;
    // }

  }


  fetchWeatherData(ville: string, date: string) {
    this.dataService.getApidata_selective(ville, date).subscribe(
      (data) => {
        this.weatherData = data;
      },
      (error) => {
        console.error('Erreur lors de la récupération des données météo :', error);
      }
    );
  }

  showDetails(day: WeatherDay) {
    this.selectedDay = day;
  }

  closeDetails() {
    this.selectedDay = null;
  }

  onSearchInput() {
    console.log("Liste des villes disponibles :", this.data2.map(data => data.ville)); // Debugging

    if (this.searchCity.trim()) {
      this.filteredCities = this.data2
        .filter(city => city.ville.toLowerCase().includes(this.searchCity.toLowerCase()))
        .map(city => city.ville); // Récupère seulement les noms des villes

      console.log("Villes filtrées :", this.filteredCities);

      this.showSuggestions = this.filteredCities.length > 0;

    } else {
      this.showSuggestions = false;
      this.filteredCities = [];
    }
  }

  // onSearchInput() {
  //   if (this.searchCity.trim()) {
  //     this.showSuggestions = true;
  //     this.filteredCities = this.data2.filter(city =>
  //       city.ville.toLowerCase().includes(this.searchCity.toLowerCase())
  //     );
  //   } else {
  //     this.showSuggestions = false;
  //     this.filteredCities = [];
  //   }
  // }

  selectCity(city: any) {
    this.searchQuery = city;
    this.showSuggestions = false;
    this.selectedCity = city;

    if (this.selectedDate) {
      this.fetchWeatherData(city, this.selectedDate);
    }
  }


  makeApiRequest_selective(ville: any, date: any): Observable<any> {
    return this.dataService.getApidata_selective(ville, date).pipe();
  }

  makeApiRequest(): Observable<any> {
    this.selectDefaultCity();
    return this.dataService.getApidata().pipe(
      /*
      catchError((error) => {
        if (error.status === 429 && this.retryAttempt < this.maxRetry) {
          this.retryAttempt++;
          const retryDelay = Math.pow(2, this.retryAttempt) * 1000; // Backoff exponentiel
          console.log(`Retrying after ${retryDelay / 1000} seconds...`);
          return new Observable<void>((observer) => { // Utilisation de new Observable et typage explicite
            setTimeout(() => {
              observer.next(); // Démarrer la prochaine tentative après le délai
              observer.complete(); // Marquer la tentative comme terminée
            }, retryDelay);
          }).pipe(
            switchMap(() => this.makeApiRequest()) // Retenter après le délai
          );
        }
        return throwError(() => error);  // En cas d'erreur autre que 429, propager l'erreur
        */
      debounceTime(300)
    )
  }

  makeApilocalisationRequest(): Observable<any> {
    return this.dataService.getApiLocalisation().pipe(
      /*
      catchError((error) => {
        if (error.status === 429 && this.retryAttempt < this.maxRetry) {
          this.retryAttempt++;
          const retryDelay = Math.pow(2, this.retryAttempt) * 1000; // Backoff exponentiel
          console.log(`Retrying after ${retryDelay / 1000} seconds...`);
          return new Observable<void>((observer) => { // Utilisation de new Observable et typage explicite
            setTimeout(() => {
              observer.next(); // Démarrer la prochaine tentative après le délai
              observer.complete(); // Marquer la tentative comme terminée
            }, retryDelay);
          }).pipe(
            switchMap(() => this.makeApiRequest()) // Retenter après le délai
          );
        }
        return throwError(() => error);  // En cas d'erreur autre que 429, propager l'erreur
      })
    );
    */
      debounceTime(300))
  }

//   onSearch(): void {
//     if (this.searchQuery.trim() === '') {
//       this.filteredCities = [];
//     } else {
//       this.filteredCities = this.data2.filter(city =>
//         city.ville.toLowerCase().includes(this.searchQuery.toLowerCase())
//       );
//       this.isfiltered = true;
//     }
//   }
//
//   onCitySelect(city: any): void {
//     this.selectedCity = city;
//     this.weatherData = this.data.find(
//       (data) => data.numer_sta === this.data2.find((data)=> data.ville === city.ville).numeroStation
//     );
//     this.filteredCities = []; // Masquer la liste des suggestions après sélection
//   }
// }

  // onSearch(): void {
  //   if (this.searchCity && this.selectedDate) {
  //     const city = this.cities.find(c => c.toLowerCase().includes(this.searchCity.toLowerCase())
  //     );
  //
  //     if (city) {
  //       this.generateWeatherData(city, new Date(this.selectedDate));
  //     } else {
  //       this.weatherData = [];
  //     }
  //   }
  // }

  // onSearch() {
  //   if (this.searchQuery && this.selectedDate) {
  //     const city = this.data2.find(c =>
  //       c.ville.toLowerCase().includes(this.searchQuery.toLowerCase())
  //     );
  //
  //     if (city) {
  //       this.fetchWeatherData(city.ville, this.selectedDate);
  //     } else {
  //       console.warn("Ville non trouvée");
  //     }
  //   }
  // }

  // onSearchInput() {
  //   if (this.searchQuery.trim()) {
  //     this.dataService.getApiLocalisation(this.searchQuery).subscribe(
  //       (cities) => {
  //         this.filteredCities = cities;
  //         this.showSuggestions = this.filteredCities.length > 0;
  //       },
  //       (error) => {
  //         console.error("Erreur lors du chargement des suggestions :", error);
  //       }
  //     );
  //   } else {
  //     this.showSuggestions = false;
  //     this.filteredCities = [];
  //   }
  // }


  onDateChange(): void {
      if (this.selectedCity && this.selectedDate) {
        this.fetchWeatherData(this.selectedCity.ville, this.selectedDate);
      }
  }
  // bootstrapApplication(InterfacemeteoComponent);
}
