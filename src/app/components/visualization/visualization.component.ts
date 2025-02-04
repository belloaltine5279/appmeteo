import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { DataService } from '../../data.service';
import { City } from '../../models/city';
import { YearlyStat } from '../../models/yearly_stat';

@Component({
  selector: 'app-visualization',
  standalone: true,
  templateUrl: './visualization.component.html',
  styleUrls: ['./visualization.component.css'],
  imports: [CommonModule, FormsModule, NgxChartsModule], 
})
export class VisualizationComponent implements OnInit {
  data: any[] = [];
  isLoading: boolean = false;
  cities: City[] = [];
  rawData: YearlyStat[] = [];
  searchCity: string = '';
  showSuggestions: boolean = false;
  filteredCities: City[] = [];
  infoCity: City = { id: 0, numeroStation: 0, ville: '', latitude: 0, longitude: 0, altitude: 0 };

  // Options du graphique
  view: [number, number] = [1000, 600]; 
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  xAxisLabel = 'Année';
  showYAxisLabel = true;
  yAxisLabel = 'Valeurs';



  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.getLocations();
  }


  generateChart(numStation: number){
    this.isLoading = true;
    this.getYearlyStats(numStation);
  
    setTimeout(() => {
    this.updateChart();
    this.isLoading = false;
    },1000);
  }

  private updateChart() {
    // Clés à afficher (sans num_station)
    const keys = ["temperature", "pression", "wind_speed", "precipitation"];
  
    // Transformation des données pour ngx-charts (une série par clé)
    this.data = keys.map(key => ({
      name: key, // Nom de la série
      series: this.rawData.map(item => ({
        name: item.annee.toString(), // Axe X : Année
        value: key === "precipitation" 
          ? (item[key as keyof YearlyStat] as number) / 10  // Division par 1000 si précipitation
          : item[key as keyof YearlyStat] // Valeur normale sinon
      }))
    }));
  
    console.log("Graphique mis à jour", this.data);
}

  
  

  private getYearlyStats(num_station: number): void {
    this.dataService.getYearlyStats(num_station).subscribe({
      next: (response: any) => {
        this.rawData = response;
        console.log("Chargement des données: ", this.rawData);
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
            this.infoCity = c;
            this.generateChart(c.numeroStation);
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
      this.infoCity = city;
      this.generateChart(city.numeroStation);

      console.log(city.numeroStation)
    }
}
