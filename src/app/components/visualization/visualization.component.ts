import { Component, OnInit } from '@angular/core';
import { DataService } from '../../data.service';
import { CommonModule } from '@angular/common';
import { Observable, throwError } from 'rxjs';
import { catchError, delay, switchMap } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-visualization',
  standalone: true,
  templateUrl: './visualization.component.html',
  styleUrls: ['./visualization.component.css'],
  imports: [CommonModule, FormsModule],
})
export class VisualizationComponent implements OnInit {
  data: any [] = [];
  ngOnInit(): void {
  }
/*

  searchQuery: string = '';
  filteredCities: any[] = [];
  selectedCity: any = null;
  weatherData: any = null;
  currentWeather: any = null;


  // Données statiques des villes
  cities = [
    { id: 1, numerostation: '001', ville: 'Paris', long: 2.3522, lat: 48.8566 },
    { id: 2, numerostation: '002', ville: 'Marseille', long: 5.3698, lat: 43.2965 },
    { id: 3, numerostation: '003', ville: 'Lyon', long: 4.8357, lat: 45.7640 },
    { id: 4, numerostation: '004', ville: 'Toulouse', long: 1.4442, lat: 43.6047 },
    { id: 5, numerostation: '005', ville: 'Nice', long: 7.2620, lat: 43.7102 },
    { id: 6, numerostation: '006', ville: 'Perpignan', long: 7.2620, lat: 43.7102 },
    { id: 7, numerostation: '007', ville: 'Dijon', long: 47.2188, lat: 47.2188 },
  ];

  // Données statiques météorologiques liées aux stations
  weatherDataList = [
    { numerostation: '001', temperature: 15, humidity: 80 },
    { numerostation: '002', temperature: 18, humidity: 70 },
    { numerostation: '003', temperature: 10, humidity: 85 },
    { numerostation: '004', temperature: 20, humidity: 65 },
    { numerostation: '005', temperature: 22, humidity: 60 },
    { numerostation: '006', temperature: 22, humidity: 60 },
    { numerostation: '007', temperature: 22, humidity: 60 },
  ];


  private retryAttempt = 0;  // Compteur pour les tentatives de récupération
  private maxRetry = 5;  // Nombre maximum de tentatives

  constructor(private dataService: DataService) {}
  ngOnInit(): void {
    this.getData();
    this.selectedCity = this.cities.find(city => city.ville === 'Dijon');
    // this.filteredCities = this.cities;
  }

  getData(): void {
    this.makeApiRequest()
      .subscribe({
        next: (data) => {
          this.data = data;
          console.log(data);
          this.retryAttempt = 0;  // Réinitialiser le compteur en cas de succès
        },
        error: (error) => {
          console.error('Error fetching data:', error);
        },
      });
  }
  ;

  getWeatherData(stationNumber: string) {

    return this.weatherDataList.find((data) => data.numerostation === stationNumber);
  }

  // Méthode pour afficher les détails (par exemple, une action sur un bouton)
  viewDetails(city: any) {
    alert(`Détails pour ${city.ville}: ${city.numerostation}`);
  }

  makeApiRequest(): Observable<any> {
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

  onSearch(): void {
    if (this.searchQuery.trim() === '') {
      this.filteredCities = [];
      // this.selectedCity = this.cities.find(city => city.ville === 'Dijon');
    } else {
      this.filteredCities = this.cities.filter(city =>
        city.ville.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  }

  // Sélectionner une ville et récupérer les données météo
  onCitySelect(city: any): void {
    this.selectedCity = city;
    this.weatherData = this.weatherDataList.find(
      (data) => data.numerostation === city.numerostation
    );
    this.filteredCities = []; // Masquer la liste des suggestions après sélection
  }
*/
}