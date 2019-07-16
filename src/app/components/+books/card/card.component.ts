import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { BookModel } from '../../../models/book.model';
import { BooksService } from '../../../services/books.service';

@Component({
  selector: 'app-books-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BooksCardComponent implements OnInit {
  @Input() book: BookModel;

  constructor(
    public booksService: BooksService
  ) { }

  ngOnInit() {
  }

  get bookImage(): string {
    const imageLinks = this.book.volumeInfo.imageLinks;
    if (!imageLinks) {
      return '';
    }

    return (
      imageLinks.thumbnail ||
      imageLinks.smallThumbnail
    );
  }
}
