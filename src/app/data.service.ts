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

  getInfo(numStation: number, date: string): Observable<any> {
    console.log("Date reçue:", date);

    let dateFin = new Date(date);
    console.log("vetitable date de fin:", dateFin);
    dateFin.setDate(dateFin.getDate()+1)
    let dateFinFormatted = dateFin.toISOString().split('T')[0];
  
    let dateF = new Date(dateFin);
  
    let dateDebut = new Date(dateF);
    dateDebut.setDate(dateDebut.getDate() - 7);
    let dateDebutFormatted = dateDebut.toISOString().split('T')[0];
  
    console.log("Date de début:", dateDebutFormatted, "| Date de fin:",dateFin);

    let url = this.apiInfoCity + numStation + "?dateDebut=" + dateFin + "&dateFin=" + dateDebutFormatted;

    console.log("URL appélé: ", url);
  
    return this.http.get(this.apiInfoCity+numStation+"?dateDebut="+dateDebutFormatted+"&dateFin="+dateFinFormatted);
  }
  
  
}
