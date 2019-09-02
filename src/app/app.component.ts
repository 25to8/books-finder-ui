import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, combineLatest, Observable, of, Subject, throwError, zip } from 'rxjs';
import { catchError, filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { BooksService } from './services/books.service';
import { BookModel } from './models/book.model';

const LOAD_MORE_STEP = 3;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent implements OnInit, OnDestroy {
  // Search params
  startIndex = 0;
  maxResults = 3;
  queryCache = null;

  // Default page screen
  isFavoritesScreen = false;

  // Primary UI events subjects
  loadMore$ = new BehaviorSubject<any>(null);
  search$ = new BehaviorSubject<any>(null);

  // Data subjects
  books$ = new BehaviorSubject<BookModel[]>(null);
  favoriteBooks$ = new Observable<BookModel[]>();
  errorMessage$ = new BehaviorSubject<string>(null);

  private destroy$ = new Subject<void>();

  constructor(
    private booksService: BooksService
  ) {}

  ngOnInit(): void {
    this.favoriteBooks$ = this.booksService.favoritesCache$.pipe(
      takeUntil(this.destroy$)
    );

    // Combine primary app events and handle it
    combineLatest(
      this.search$,
      this.loadMore$
    ).pipe(
      // If it isn't query cache or loading more call
      // else user will see results from cache
      filter(([query, loadMore]) => !(this.queryCache === query && !loadMore)),
      switchMap(([query, loadMore]) => {

        // Is loadMore event?
        if (this.queryCache === query && loadMore) {
          this.loadMore(query);
          return of(null);
        }

        // It's search event
        return of(query);
      }),
      takeUntil(this.destroy$)
    ).subscribe((searchQuery) => {
      if (searchQuery) {
        this.search(searchQuery);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(); //  Unsubscribe from observables.
    this.destroy$.complete(); // Unsubscribe from ngUnsubscribe.
  }

  search(query: string, forced = true): void {
    if (this.queryCache === query && forced) {
      return;
    }

    this.queryCache = query;
    this.booksService.fetchVolumesList(
      query,
      this.startIndex,
      this.maxResults,
    ).pipe(
      takeUntil(this.destroy$),
      map(books => {
        // Refresh books for new search
        if (forced) {
          return books;
        }

        // Complete books for load more
        const latestLoadedBooks = this.books$.getValue();
        return [
          ...latestLoadedBooks,
          ...books
        ];
      }),
      catchError((error: HttpErrorResponse) => {
        this.errorMessage$.next(error.message);
        return throwError(error);
      })
    ).subscribe(books => {
      this.books$.next(books);
    });
  }

  /**
   * Load more books with start index
   * equals loaded books count
   */
  loadMore(query): void {
    this.startIndex += LOAD_MORE_STEP;
    this.search(
      query ? query : this.queryCache,
      false
    );
  }

  toggleFavoritesScreen(): void {
    this.startIndex = 0;
    this.isFavoritesScreen = true;
  }

  toggleSearchScreen(): void {
    this.startIndex = 0;
    this.isFavoritesScreen = false;
  }
}
