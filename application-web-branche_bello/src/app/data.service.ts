import { Injectable } from '@angular/core';
import {HttpClient, HttpClientModule, HttpHeaders} from '@angular/common/http';
import {Observable, throwError, forkJoin, map} from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  // private apiUrl = 'https://ipinfo.io/161.185.160.93/geo'; // Base URL for the API
  //private apiUrl = 'http://universities.hipolabs.com/search?country=United+States'; // Base URL for the API
  private apiUrl_donneclimatique = 'http://172.31.60.248:8080/api/donnees-climatiques'
  private apiUrl_localisation = 'http://172.31.60.248:8080/api/localisations'
  //private apiUrl = "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&hourly=temperature_2m"
  // ip = 161.185.160.93

  // private apiUrl = 'https://weatherbit-v1-mashape.p.rapidapi.com/forecast/3hourly'; // Remplacez par votre URL RapidAPI
  // private headers = new HttpHeaders({
  //   'X-RapidAPI-Key': '63d416e1cfmshb5a6b7bc1fe3f4ep13674fjsn41d379fffb68', // Remplacez par votre clé RapidAPI
  //   'X-RapidAPI-Host': 'weatherbit-v1-mashape.p.rapidapi.com', // Remplacez par le host RapidAPI
  // });

  constructor(private http: HttpClient) {}

  // getApidata() : Observable<any> {
  //   return this.http.get(this.apiUrl, { headers: this.headers });
  // }
  getApidata() : Observable<any> {
    return this.http.get(this.apiUrl_donneclimatique);
  }

  getApiLocalisation() : Observable<any> {
    return this.http.get(this.apiUrl_localisation);
  }
}
