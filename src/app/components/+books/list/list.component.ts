import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BookModel } from '../../../models/book.model';

@Component({
  selector: 'app-books-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class BooksListComponent implements OnInit {
  @Input() title = 'Books';
  @Input() books: BookModel[];
  @Input() errorMessage: string;

  @Output() loadMore = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
  }

}
