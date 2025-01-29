import { Injectable } from '@angular/core';
import {HttpClient, HttpClientModule, HttpHeaders} from '@angular/common/http';
import {Observable, throwError, forkJoin, map} from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private apiUrl_localisation = 'http://172.31.60.248:8080/api/localisations'
  private apiClimatTotal = "http://172.31.60.248:8080/api/donnees-climatiques/count"
  private apiInfoCity =  "http://172.31.60.248:8080/api/donnees-climatiques/info/"

  constructor(private http: HttpClient) {}
 
  getLocalisations() : Observable<any> {
    return this.http.get(this.apiUrl_localisation);
  }

  getTotal(): Observable<any> {
    return this.http.get(this.apiClimatTotal);
  }

  getInfo(numStation: number): Observable<any> {
    return this.http.get(this.apiInfoCity+numStation);
  }
}
