import {Injectable} from '@angular/core';
import {Place} from './places.model';
import {AuthService} from '../auth/auth.service';
import {BehaviorSubject} from 'rxjs';
import {delay, map, take, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([
    new Place(
        'p1',
        'The Westcliff',
        'Beautiful hotel in Johannesburg',
        'http://johannesburg.hotelguide.co.za/images/four-seasons-hotel-view-590x390.jpg',
        10000,
        new Date('2019-01-01'),
        new Date('2019-12-31'),
        'abc'
    ),
    new Place(
        'p2',
        'The Beverley Hills',
        'Beautiful hotel in Durban',
        'https://media-cdn.tripadvisor.com/media/photo-s/04/a0/02/61/beverly-hills-hotel.jpg',
        14000,
        new Date('2019-03-01'),
        new Date('2019-05-31'),
        'abc'
    ),
    new Place(
        'p3',
        'Foggy Palace',
        'Not your average place',
        'https://ui.cltpstatic.com/places/hotels/7325/732564/images/Pool_(2)_w.jpg',
        8000,
        new Date('2019-05-01'),
        new Date('2020-12-31'),
        'abc'
    )
  ]);

  constructor(private authService: AuthService) {
  }

  get places() {
    return this._places.asObservable();
  }

  getPlace(id: string) {
    return this.places.pipe(
        take(1),
        map(places => {
          return {...places.find(p => p.id === id)};
        })
    );
  }

  addPlace(
      title: string,
      description: string,
      price: number,
      dateFrom: Date,
      dateTo: Date
  ) {
    const newPlace = new Place(
        Math.random().toString(),
        title,
        description,
        'http://johannesburg.hotelguide.co.za/images/four-seasons-hotel-view-590x390.jpg',
        price,
        dateFrom,
        dateTo,
        this.authService.userId
    );

    return this.places.pipe(
        take(1),
        delay(1000),
        tap(places => {
          this._places.next(places.concat(newPlace));
        })
    );
  }

  updatePlace(placeId: string, title: string, description: string) {
    return this.places.pipe(
        take(1),
        delay(1000),
        tap((places) => {
          const updatedPlaceIndex = places.findIndex(pl => pl.id === placeId);
          const updatedPlaces = [...places];
          const oldPlace = updatedPlaces[updatedPlaceIndex];
          updatedPlaces[updatedPlaceIndex] = new Place(
              oldPlace.id,
              title,
              description,
              oldPlace.imageUrl,
              oldPlace.price,
              oldPlace.availableFrom,
              oldPlace.availableTo,
              oldPlace.userId
          );
          this._places.next(updatedPlaces);
        })
    );
  }
}
