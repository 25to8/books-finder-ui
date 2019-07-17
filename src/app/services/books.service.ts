import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { BookModel } from '../models/book.model';
import { catchError, switchMap } from 'rxjs/operators';

const FAVORITES_LS_KEY = 'favoritesBooks';

export interface IGetVolumesList {
  kind: string;
  totalItems: number;
  items: any[];
}

@Injectable({
  providedIn: 'root'
})
export class BooksService {
  volumesCache$ = new BehaviorSubject<BookModel[]>(null);
  favoritesCache$ = new BehaviorSubject<BookModel[]>(null);

  constructor(
    private apiService: ApiService
  ) {
    this.fetchFavorites();
  }

  /**
   * Loads volumes from API
   * updates service cache
   * and returns volumes data
   */
  fetchVolumesList(
    query: string,
    startIndex = 0,
    maxResults = 5
  ): Observable<BookModel[]> {
    return this.apiService.get('volumes', {
      q: query,
      maxResults,
      startIndex
    }).pipe(
      switchMap((data: IGetVolumesList) => {
        const items = data.items || [];
        const favorites = this.favoritesCache$.getValue();
        const books = items.map(book => {
          // Check each a book, if it is true
          // mark model as favorite
          const isFavorite = favorites.findIndex(
            favorite => book.id === favorite.id
          ) > -1;

          return new BookModel(book, isFavorite);
        });

        this.volumesCache$.next(books);
        return of(books);
      }),
      catchError((error) => {
        console.error('This error is caught on booksService level');
        return throwError(error);
      })
    );
  }

  /**
   * Save book to favorites list
   */
  saveToFavorites(book: BookModel): void {
    const favorites = this.favoritesCache$.getValue() || [];
    book.isFavorite = true;

    try {
      localStorage.setItem(FAVORITES_LS_KEY, JSON.stringify([
        ...favorites,
        book
      ]));
    } catch (e) {
      console.error('Cannot update favorites in localStorage');
    }

    this.fetchFavorites();
  }

  /**
   * Remove book from favorites
   */
  removeFromFavorites(book: BookModel): void {
    const favorites = this.favoritesCache$.getValue() || [];
    const updatedList = favorites.filter(
      favorite => favorite.id !== book.id
    );

    book.isFavorite = false;

    try {
      localStorage.setItem(FAVORITES_LS_KEY, JSON.stringify(updatedList));
    } catch (e) {
      console.error('Cannot update favorites in localStorage');
    }

    this.fetchFavorites();
  }

  /**
   * Loads favorites list from LocalStorage
   */
  private fetchFavorites(): void {
    try {
      const favorites = localStorage.getItem(FAVORITES_LS_KEY);
      this.favoritesCache$.next(JSON.parse(favorites));
    } catch (e) {
      console.error('Cannot load favorites from localStorage');
    }
  }
}
