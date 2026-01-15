import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CsvService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  // Upload CSV file
  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  // Get plot data for selected columns
  getPlotData(filePath: string, xColumn: string, yColumns: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/plot-data`, {
      filePath,
      xColumn,
      yColumns
    });
  }
}
