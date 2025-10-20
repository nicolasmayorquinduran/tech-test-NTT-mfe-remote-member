import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError, tap } from 'rxjs';
import type { WorksMessage, MemberMessage, Work, Member, MemberDto } from 'shared';

interface WorksQueryParams {
  rows?: number;
  offset?: number;
  cursor?: string;
  filter?: string;
  query?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  select?: string;
  mailto?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CrossrefService {
  private readonly baseUrl = 'https://api.crossref.org';
  private readonly defaultMailto = 'your-email@example.com'; // TODO: Configurar email real
  
  // State signals
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  /**
   * Obtiene información de un miembro de Crossref
   * @param memberId - ID del miembro
   * @returns Observable con la información del miembro
   */
  getMember(memberId: string): Observable<MemberDto> {
    this.loading.set(true);
    this.error.set(null);

    const params = new HttpParams().set('mailto', this.defaultMailto);

    return this.http.get<MemberMessage>(`${this.baseUrl}/members/${memberId}`, { params }).pipe(
      map(response => response.message),
      tap(() => this.loading.set(false)),
      catchError(err => {
        this.loading.set(false);
        const errorMsg = err.error?.message || 'Error loading member information';
        this.error.set(errorMsg);
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  /**
   * Obtiene los trabajos (works) de un miembro de Crossref
   * @param memberId - ID del miembro
   * @param params - Parámetros de consulta opcionales
   * @returns Observable con la lista de trabajos
   */
  getMemberWorks(memberId: string, params?: WorksQueryParams): Observable<WorksMessage> {
    this.loading.set(true);
    this.error.set(null);

    let httpParams = new HttpParams()
      .set('mailto', params?.mailto || this.defaultMailto);

    // Agregar parámetros opcionales
    if (params?.rows) {
      httpParams = httpParams.set('rows', params.rows.toString());
    }
    if (params?.offset !== undefined) {
      httpParams = httpParams.set('offset', params.offset.toString());
    }
    if (params?.cursor) {
      httpParams = httpParams.set('cursor', params.cursor);
    }
    if (params?.filter) {
      httpParams = httpParams.set('filter', params.filter);
    }
    if (params?.query) {
      httpParams = httpParams.set('query', params.query);
    }
    if (params?.sort) {
      httpParams = httpParams.set('sort', params.sort);
    }
    if (params?.order) {
      httpParams = httpParams.set('order', params.order);
    }
    if (params?.select) {
      httpParams = httpParams.set('select', params.select);
    }

    return this.http.get<WorksMessage>(`${this.baseUrl}/members/${memberId}/works`, { params: httpParams }).pipe(
      tap(() => this.loading.set(false)),
      catchError(err => {
        this.loading.set(false);
        const errorMsg = err.error?.message || 'Error loading works';
        this.error.set(errorMsg);
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  /**
   * Obtiene todos los trabajos de un miembro usando paginación con cursor
   * @param memberId - ID del miembro
   * @param maxWorks - Número máximo de trabajos a obtener (opcional)
   * @returns Observable con array de trabajos
   */
  getAllMemberWorks(memberId: string, maxWorks?: number): Observable<Work[]> {
    return new Observable(observer => {
      const allWorks: Work[] = [];
      let cursor = '*';
      let hasMore = true;

      const fetchPage = () => {
        this.getMemberWorks(memberId, { 
          cursor, 
          rows: 100,
          sort: 'published',
          order: 'desc'
        }).subscribe({
          next: (response) => {
            const works = response.message.items;
            allWorks.push(...works);

            // Verificar si hay más páginas
            hasMore = works.length === 100 && response.message['next-cursor'] !== undefined;
            
            // Verificar si alcanzamos el máximo
            if (maxWorks && allWorks.length >= maxWorks) {
              hasMore = false;
            }

            if (hasMore && response.message['next-cursor']) {
              cursor = response.message['next-cursor'];
              fetchPage();
            } else {
              observer.next(maxWorks ? allWorks.slice(0, maxWorks) : allWorks);
              observer.complete();
            }
          },
          error: (err) => observer.error(err)
        });
      };

      fetchPage();
    });
  }

  /**
   * Formatea una fecha en formato legible
   * @param dateParts - Array de partes de fecha [año, mes, día]
   * @returns Fecha formateada
   */
  formatDate(dateParts?: { 'date-parts'?: number[][] }): string {
    if (!dateParts?.['date-parts']?.[0]) {
      return 'N/A';
    }

    const [year, month, day] = dateParts['date-parts'][0];
    
    if (day && month) {
      return new Date(year, month - 1, day).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } else if (month) {
      return `${new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short' })} ${year}`;
    }
    
    return year.toString();
  }

  /**
   * Obtiene el título principal de un work
   * @param work - Objeto Work
   * @returns Título del trabajo
   */
  getWorkTitle(work: Work): string {
    return work.title?.[0] || 'Untitled';
  }

  /**
   * Obtiene los autores formateados de un work
   * @param work - Objeto Work
   * @returns String con nombres de autores
   */
  getWorkAuthors(work: Work): string {
    if (!work.author || work.author.length === 0) {
      return 'Unknown authors';
    }

    const authors = work.author.slice(0, 3).map((author: any) => {
      if (author.family && author.given) {
        return `${author.given} ${author.family}`;
      } else if (author.family) {
        return author.family;
      } else if (author.name) {
        return author.name;
      }
      return 'Unknown';
    });

    if (work.author.length > 3) {
      return `${authors.join(', ')}, et al.`;
    }

    return authors.join(', ');
  }
}
