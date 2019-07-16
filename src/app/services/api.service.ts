import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(
    private http: HttpClient
  ) { }

  get(route: string, queryParams: object): Observable<any> {
    let params = new HttpParams().set('key', environment.apiKey);

    Object.keys(queryParams).forEach(
      key => params = params.append(key, queryParams[key])
    );

    return this.http.get(`${environment.apiUrl}/${route}`, { params }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('This error is caught on the top level', error);
        return throwError(error);
      })
    );
  }
}
