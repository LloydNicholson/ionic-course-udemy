import { Component, OnDestroy, OnInit } from '@angular/core';
import { IonItemSliding, LoadingController } from '@ionic/angular';

import { PlacesService } from '../places.service';
import { Place } from '../places.model';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit, OnDestroy {
  offers: Place[];
  isLoading = false;
  private placesSub: Subscription;

  constructor(
      private placesService: PlacesService,
      private router: Router,
      private loadingController: LoadingController) {
  }

  ngOnInit() {
    this.placesSub = this.placesService.places.subscribe(
        (places) => {
          this.offers = places;
        }
    );
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.placesService.fetchPlaces().subscribe(() => {
      this.isLoading = false;
    });
    // this.loadingController.create({
    //   message: 'Loading places...'
    // }).then(loadingEl => {
    //   loadingEl.present();
    //   this.placesService.fetchPlaces()
    //     .subscribe(() => {
    //       loadingEl.dismiss();
    //     });
    // });

  }

  onEdit(offerId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.router.navigate(['/', 'places', 'tabs', 'offers', 'edit', offerId]);
    console.log('Editing item', offerId);
  }

  ngOnDestroy() {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }
}
