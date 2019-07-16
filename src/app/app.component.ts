import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { BooksService } from './services/books.service';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
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

  books$ = new BehaviorSubject<BookModel[]>(null);
  favoritesBooks$ = new Observable<BookModel[]>();

  // I use that instead takeUntil
  // because in this component
  // we have only one subscription
  private booksSubscription$: Subscription;

  constructor(
    private booksService: BooksService
  ) {}

  ngOnInit(): void {
    this.favoritesBooks$ = this.booksService.favoritesCache$.asObservable();
  }

  ngOnDestroy(): void {
    this.booksSubscription$.unsubscribe();
  }

  search(query: string, forced = true): void {
    this.queryCache = query;
    this.booksSubscription$ = this.booksService.fetchVolumesList(
      query,
      this.startIndex,
      this.maxResults,
    ).subscribe(books => {
      // Refresh books for new search
      if (forced) {
        this.books$.next(books);
        return;
      }

      // Complete books for load more
      const latestLoadedBooks = this.books$.getValue();
      this.books$.next([
        ...latestLoadedBooks,
        ...books
      ]);
    });
  }

  /**
   * Load more books with start index
   * equals loaded books count
   */
  loadMore(): void {
    this.startIndex += LOAD_MORE_STEP;
    this.search(this.queryCache, false);
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
