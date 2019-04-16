import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Place } from './places.model';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject, of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { PlaceLocation } from './location.model';

// [
//   new Place(
//     'p1',
//     'The Westcliff',
//     'Beautiful hotel in Johannesburg',
//     'http://johannesburg.hotelguide.co.za/images/four-seasons-hotel-view-590x390.jpg',
//     10000,
//     new Date('2019-01-01'),
//     new Date('2019-12-31'),
//     'abc'
//   ),
//   new Place(
//     'p2',
//     'The Beverley Hills',
//     'Beautiful hotel in Durban',
//     'https://media-cdn.tripadvisor.com/media/photo-s/04/a0/02/61/beverly-hills-hotel.jpg',
//     14000,
//     new Date('2019-03-01'),
//     new Date('2019-05-31'),
//     'abc'
//   ),
//   new Place(
//     'p3',
//     'Foggy Palace',
//     'Not your average place',
//     'https://ui.cltpstatic.com/places/hotels/7325/732564/images/Pool_(2)_w.jpg',
//     8000,
//     new Date('2019-05-01'),
//     new Date('2020-12-31'),
//     'abc'
//   )
// ]

interface PlaceData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
  location: PlaceLocation;
}

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([]);

  constructor(private authService: AuthService, private httpClient: HttpClient) {
  }

  get places() {
    return this._places.asObservable();
  }

  fetchPlaces() {
    return this.httpClient
    .get<{[key: string]: PlaceData}>('https://ionic-angular-udemy-course.firebaseio.com/offered-places.json')
    .pipe(
        map(response => {
          const places = [];
          for (const key in response) {
            if (response.hasOwnProperty(key)) {
              places.push(
                  new Place(
                      key,
                      response[key].title,
                      response[key].description,
                      response[key].imageUrl,
                      response[key].price,
                      new Date(response[key].availableFrom),
                      new Date(response[key].availableTo),
                      response[key].userId,
                      response[key].location
                  ));
            }
          }
          return places;
          // return [];
        }),
        tap(places => {
          this._places.next(places);
        })
    );
  }

  getPlace(id: string) {
    return this.httpClient.get<PlaceData>(
        `https://ionic-angular-udemy-course.firebaseio.com/offered-places/${ id }.json`
    ).pipe(
        map(placeData => {
          return new Place(
              id,
              placeData.title,
              placeData.description,
              placeData.imageUrl,
              placeData.price,
              new Date(placeData.availableFrom),
              new Date(placeData.availableTo),
              placeData.userId,
              placeData.location
          );
        })
    );
  }

  uploadImage(image: File) {
    const uploadData = new FormData();
    uploadData.append('image', image);

    return this.httpClient.post<{imageUrl: string, imagePath: string}>
    ('https://us-central1-ionic-angular-udemy-course.cloudfunctions.net/storeImage', uploadData);
  }

  addPlace(
      title: string,
      description: string,
      price: number,
      dateFrom: Date,
      dateTo: Date,
      location: PlaceLocation,
      imageUrl: string
  ) {
    let generatedId: string;
    const newPlace = new Place(
        Math.random().toString(),
        title,
        description,
        imageUrl,
        price,
        dateFrom,
        dateTo,
        this.authService.userId,
        location
    );

    return this.httpClient.post<{name: string}>(
        'https://ionic-angular-udemy-course.firebaseio.com/offered-places.json',
        {...newPlace, id: null}
    ).pipe(
        switchMap(response => {
          generatedId = response.name;
          return this.places;
        }),
        take(1),
        tap(places => {
          newPlace.id = generatedId;
          this._places.next(places.concat(newPlace));
        })
    );
  }

  updatePlace(placeId: string, title: string, description: string) {
    let updatedPlaces: Place[];
    return this.places.pipe(
        take(1),
        switchMap(places => {
          if (!places || places.length <= 0) { // finding the places before we update them
            return this.fetchPlaces();
          } else {
            return of(places);
          }
        }),
        switchMap(places => {
          const updatedPlaceIndex = places.findIndex(pl => pl.id === placeId);
          updatedPlaces = [...places];
          const oldPlace = updatedPlaces[updatedPlaceIndex];
          updatedPlaces[updatedPlaceIndex] = new Place(
              oldPlace.id,
              title,
              description,
              oldPlace.imageUrl,
              oldPlace.price,
              oldPlace.availableFrom,
              oldPlace.availableTo,
              oldPlace.userId,
              oldPlace.location
          );
          return this.httpClient.put(
              `https://ionic-angular-udemy-course.firebaseio.com/offered-places/${ placeId }.json`,
              {...updatedPlaces[updatedPlaceIndex], id: null}
          );
        }),
        tap(() => {
          this._places.next(updatedPlaces);
        })
    );
  }
}
