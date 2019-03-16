import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActionSheetController, LoadingController, ModalController, NavController} from '@ionic/angular';
import {ActivatedRoute} from '@angular/router';

import {PlacesService} from '../../places.service';
import {Place} from '../../places.model';
import {CreateBookingComponent} from '../../../bookings/create-booking/create-booking.component';
import {Subscription} from 'rxjs';
import {BookingService} from '../../../bookings/booking.service';
import {AuthService} from '../../../auth/auth.service';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  place: Place;
  private placeSub: Subscription;
  isBookable = false;

  constructor(
      private navController: NavController,
      private route: ActivatedRoute,
      private placesService: PlacesService,
      private modalController: ModalController,
      private actionSheetController: ActionSheetController,
      private bookingService: BookingService,
      private loadingController: LoadingController,
      private authService: AuthService) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe(
        (paramMap) => {
          if (!paramMap.has('placeId')) {
            this.navController.navigateBack('/places/tabs/discover');
            return;
          }
          this.placeSub = this.placesService.getPlace(paramMap.get('placeId')).subscribe(
              (place) => {
                this.place = place;
                this.isBookable = place.userId !== this.authService.userId;
              }
          );
        });
  }

  onBookPlace() {
    // this.router.navigateByUrl('/places/tabs/discover');
    // this.navController.navigateBack('/places/tabs/discover');
    this.actionSheetController.create({
      header: 'Choose an action',
      buttons: [
        {
          text: 'Select Date',
          handler: () => {
            this.openBookingModal('select');
          }
        },
        {
          text: 'Random Date',
          handler: () => {
            this.openBookingModal('random');
          }
        },
        {
          text: 'Cancel',
          role: 'cancel'
        }
      ]
    }).then(
        (actionSheetEl) => {
          actionSheetEl.present();
        }
    );
  }

  openBookingModal(mode: 'select' | 'random') { // can only be specific values
    console.log(mode);
    this.modalController
        .create({
          component: CreateBookingComponent,
          componentProps: {selectedPlace: this.place, selectedMode: mode}
        })
        .then(
            (modalEl) => {
              modalEl.present();
              return modalEl.onDidDismiss();
            })
        .then(result => {
          console.log(result.data, result.role);
          if (result.role === 'confirm') {
            this.loadingController.create({
              message: 'Booking place...'
            }).then(loadingEl => {
              loadingEl.present();
              const data = result.data.bookingData;
              this.bookingService.addBooking(
                  this.place.id,
                  this.place.title,
                  this.place.imageUrl,
                  data.firstName,
                  data.lastName,
                  data.guestNumber,
                  data.startDate,
                  data.endDate
              ).subscribe(
                  () => loadingEl.dismiss()
              );
            });
          }
        });
  }

  ngOnDestroy() {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }
}
