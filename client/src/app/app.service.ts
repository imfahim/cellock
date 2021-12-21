import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rider } from './riders';


@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(private http: HttpClient) { }

  private baseUrl = "http://localhost:8010/api"

  getRiders(): Observable<any> {
    return this.http.get<any>(this.baseUrl +'/rides');
  }

  putRider(rider: Rider,id: number): Observable<any> {
    return this.http.post<any>(this.baseUrl +'/rides/'+id, rider);
  }

  deleteRider(id: number): Observable<any> {
    return this.http.delete<any>(this.baseUrl +'/rides/'+id);
  }

}