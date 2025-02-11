import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';  // Importation de CommonModule
import { FormsModule } from '@angular/forms';    // Importation de FormsModule
import { trigger, state, style, animate, transition } from '@angular/animations';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],  // Ajout de CommonModule et FormsModule
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('searchAnimation', [
      state('hidden', style({
        width: '0',
        opacity: '0'
      })),
      state('visible', style({
        width: '200px',
        opacity: '1'
      })),
      transition('hidden <=> visible', animate('300ms ease-in-out'))
    ])
  ]
})
export class AppComponent {
  // isSearchActive = false;  // L'état de la barre de recherche
  // searchQuery: string = ''; // La requête de recherche
  //
  // toggleSearch() {
  //   this.isSearchActive = !this.isSearchActive;  // Inverser l'état de la recherche
  //   if (!this.isSearchActive) {
  //     this.searchQuery = '';  // Effacer la recherche si on ferme la barre
  //   }
  // }
  //
  // submitSearch() {
  //   if (this.searchQuery.trim()) {
  //     // Logique de soumission de la recherche ici
  //     console.log('Recherche soumise:', this.searchQuery);
  //     // Tu peux aussi rediriger ou exécuter une recherche.
  //     this.isSearchActive = false;  // Fermer la barre après soumission
  //   }
  // }
  isSearchActive = false;
  searchQuery = '';
  isMenuOpen = false;

  toggleSearch() {
    this.isSearchActive = !this.isSearchActive;
    if (!this.isSearchActive) {
      this.searchQuery = '';
    }
  }

  submitSearch() {
    if (this.searchQuery.trim()) {
      console.log('Searching for:', this.searchQuery);
      // Implement search functionality here
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
