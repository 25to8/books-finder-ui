import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit, OnDestroy {
  @Output() search = new EventEmitter<string>();

  queryControl = new FormControl();

  private queryChanges$: Subscription;

  constructor() { }

  ngOnInit() {
    this.listenQueryChanges();
    this.queryControl.setValue(environment.defaultQuery);
  }

  ngOnDestroy(): void {
    this.queryChanges$.unsubscribe();
  }

  listenQueryChanges(): void {
    this.queryChanges$ = this.queryControl.valueChanges.pipe(
      debounceTime(800),
      distinctUntilChanged()
    ).subscribe(value => {
      this.search.emit(value ? value : `You don't know JS`);
    });
  }
}
