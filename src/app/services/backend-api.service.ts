import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BackendApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Secure Dify API calls through backend
  sendToDify(data: {
    query: string;
    msgUid: string;
    instructionId: string;
    amount?: number;
    currency?: string;
    date?: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/dify/chat`, data);
  }

  streamDifyResponse(data: {
    query: string;
    msgUid: string;
    instructionId: string;
    amount?: number;
    currency?: string;
    date?: string;
  }): Observable<any> {
    return this.http.post(`${this.apiUrl}/dify/stream`, data);
  }

  // Secure Supabase operations through backend
  getTemplates(): Observable<any> {
    return this.http.get(`${this.apiUrl}/templates`);
  }

  createTemplate(template: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/templates`, template);
  }

  updateTemplate(id: string, template: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/templates/${id}`, template);
  }

  deleteTemplate(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/templates/${id}`);
  }

  // Other secure database operations
  getCurrencies(): Observable<any> {
    return this.http.get(`${this.apiUrl}/currencies`);
  }

  getEntities(): Observable<any> {
    return this.http.get(`${this.apiUrl}/entities`);
  }
}