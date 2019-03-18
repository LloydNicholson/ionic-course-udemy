import {Component, OnDestroy, OnInit} from '@angular/core';
import {MenuController} from '@ionic/angular';

import {PlacesService} from '../places.service';
import {Place} from '../places.model';
import {Subscription} from 'rxjs';
import {AuthService} from '../../auth/auth.service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss'],
})
export class DiscoverPage implements OnInit, OnDestroy {
  loadedPlaces: Place[];
  listedLoadedPlaces: Place[];
  relevantPlaces: Place[];
  isLoading = false;
  private placesSub: Subscription;

  constructor(
      private placesService: PlacesService,
      private menuController: MenuController,
      private authService: AuthService) {
  }

  ngOnInit() {
    this.placesSub = this.placesService.places.subscribe(
        (places) => {
          this.loadedPlaces = places;
          this.relevantPlaces = this.loadedPlaces;
          this.listedLoadedPlaces = this.relevantPlaces.slice(1);

        }
    );
  }

  // onOpenMenu() {
  //   this.menuController.toggle();
  // }

  onFilterUpdate(event: CustomEvent) {
    if (event.detail.value === 'all') {
      this.relevantPlaces = this.loadedPlaces;
      this.listedLoadedPlaces = this.relevantPlaces.slice(1);
    } else {
      this.relevantPlaces = this.loadedPlaces.filter(place => place.userId !== this.authService.userId);
      this.listedLoadedPlaces = this.relevantPlaces.slice(1);
    }
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.placesService.fetchPlaces().subscribe(() => {
      this.isLoading = false;
    });
  }

  ngOnDestroy() {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }
}
