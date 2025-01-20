import { Component, OnInit } from '@angular/core';
import { DataService } from '../../data.service';
import {forkJoin, Observable, throwError} from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-interfacemeteo',
  imports: [CommonModule, FormsModule],
  templateUrl: './interfacemeteo.component.html',
  styleUrls: ['./interfacemeteo.component.css']
})
export class InterfacemeteoComponent implements OnInit {
  data: any[] = [];
  data2: any[] = [];
  isfiltered: boolean = false;
  defaultCity: any = null;

  searchQuery: string = '';
  filteredCities: any[] = [];
  selectedCity: any = null;
  weatherData: any = null;
  weatherDataDefault: any = null;

  selectdefault: any = null;
  weatherData2: any = null;
  currentWeather: any = null;

  activeTab: string = 'temperature'; // Onglet actif par défaut

  private retryAttempt = 0; // Compteur pour les tentatives de récupération
  private maxRetry = 5; // Nombre maximum de tentatives

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.getData();
    this.selectDefaultCity();
    setTimeout(() => {
      this.selectedCity = this.data2.find(city => city.ville === 'DIJON');
      if (this.selectedCity) {
        this.weatherData = this.getWeatherData(this.selectedCity.numeroStation);
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
      localisation: this.makeApilocalisationRequest(),
    }).subscribe({
      next: (data) => {
        this.data = data.meteo;
        this.data2 = data.localisation;
        console.log('Données météo:', this.data);
        console.log('Données localisation:', this.data2);

        this.retryAttempt = 0; // Réinitialiser le compteur en cas de succès
        this.selectDefaultCity(); // Sélectionner la ville par défaut après récupération des données
      },
      error: (error) => {
        console.error('Error fetching data:', error);
      },
    });
  }

  selectDefaultCity(): void {
    this.selectdefault = this.data2.find(city => city.ville === 'DIJON-LONGVIC');
    if (this.selectdefault) {
      this.weatherDataDefault = this.getWeatherData2(this.selectdefault.numeroStation);
      console.log(this.weatherDataDefault);
    } else {
      console.log("Ville par défaut non trouvée");
    }
  }

  getWeatherData(stationNumber: string) {
    return this.data2.find((data) => data.numeroStation === stationNumber);
  }

  getWeatherData2(stationNumber: any) {
    return this.data.find((data) => data.numer_sta === stationNumber);
  }

  viewDetails(city: any) {
    alert(`Détails pour ${city.ville}: ${city.numerostation}`);
  }

  // Méthode pour gérer le changement d'onglet actif
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  makeApiRequest(): Observable<any> {
    this.selectDefaultCity();
    return this.dataService.getApidata().pipe(
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
  }

  makeApilocalisationRequest(): Observable<any> {
    return this.dataService.getApiLocalisation().pipe(
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
  }

  onSearch(): void {
    if (this.searchQuery.trim() === '') {
      this.filteredCities = [];
    } else {
      this.filteredCities = this.data2.filter(city =>
        city.ville.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
      this.isfiltered = true;
    }
  }

  onCitySelect(city: any): void {
    this.selectedCity = city;
    this.weatherData = this.data.find(
      (data) => data.numer_sta === this.data2.find((data)=> data.ville === city.ville).numeroStation
    );
    this.filteredCities = []; // Masquer la liste des suggestions après sélection
  }
}
