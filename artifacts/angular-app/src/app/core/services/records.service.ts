import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RecordsResponse } from '../models/record.model';

const API_BASE = '/api';

@Injectable({ providedIn: 'root' })
export class RecordsService {
  constructor(private http: HttpClient) {}

  getRecords(delayMs = 0): Observable<RecordsResponse> {
    let params = new HttpParams();
    if (delayMs > 0) {
      params = params.set('delay', delayMs.toString());
    }
    return this.http.get<RecordsResponse>(`${API_BASE}/records`, { params });
  }
}
