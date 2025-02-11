import { Component } from '@angular/core';
import { ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-home', // Vérifie que c'est correct
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  @ViewChild('videoElement') videoElementRef!: ElementRef;

  // Cette méthode sera appelée lorsque l'on clique sur le bouton pour activer/désactiver le son
  toggleMute() {
    const video: HTMLVideoElement = this.videoElementRef.nativeElement;
    video.muted = false; // Change l'état de l'attribut "muted"
  }

  // Cette méthode est appelée après la vue initiale pour s'assurer que le DOM est prêt
  ngAfterViewInit() {
    const video: HTMLVideoElement = this.videoElementRef.nativeElement;
    video.muted = true; // Mute la vidéo par défaut au chargement de la page
  }
}

