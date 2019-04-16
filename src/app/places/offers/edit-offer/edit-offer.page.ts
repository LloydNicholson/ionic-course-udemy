import { Component, OnDestroy, OnInit } from '@angular/core';
import { Place } from '../../places.model';
import { PlacesService } from '../../places.service';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit, OnDestroy {
  place: Place;
  placeId: string;
  form: FormGroup;
  isLoading = false;
  private placeSub: Subscription;

  constructor(
      private route: ActivatedRoute,
      private placesService: PlacesService,
      private navController: NavController,
      private router: Router,
      private loadingController: LoadingController,
      private alertController: AlertController) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe(
        (paramMap) => {
          if (!paramMap.has('placeId')) {
            this.navController.navigateBack('/places/tabs/offers');
            return;
          }
          this.placeId = paramMap.get('placeId');
          this.isLoading = true;
          this.placeSub = this.placesService.getPlace(paramMap.get('placeId')).subscribe(
              (place) => {
                this.place = place;
                this.form = new FormGroup({
                  title: new FormControl(this.place.title, {
                    updateOn: 'blur',
                    validators: [Validators.required]
                  }),
                  description: new FormControl(this.place.description, {
                    updateOn: 'blur',
                    validators: [Validators.required, Validators.maxLength(180)]
                  })
                });
                this.isLoading = false;
              }, error => {
                this.alertController.create({
                  header: 'Error occured!',
                  message: 'Place could not be fetched. Please try again later.',
                  buttons: [{
                    text: 'Okay', handler: () => {
                      this.router.navigate(['/places/tabs/offers']);
                    }
                  }]
                }).then(alertEl => {
                  alertEl.present();
                });
              });
        });
  }

  onUpdateOffer() {
    if (this.form.invalid) {
      return;
    }
    this.loadingController.create({
      message: 'Updating place...'
    }).then(
        loadingEl => {
          loadingEl.present();
          this.placesService.updatePlace(
              this.place.id,
              this.form.value.title,
              this.form.value.description
          ).subscribe(() => {
            loadingEl.dismiss();
            this.form.reset();
            this.router.navigate(['/places/tabs/offers']);
          });
        }
    );
  }

  ngOnDestroy() {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }
}
