import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './components/home/home.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, HomeComponent], // Ajoute RouterModule ici
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {}
