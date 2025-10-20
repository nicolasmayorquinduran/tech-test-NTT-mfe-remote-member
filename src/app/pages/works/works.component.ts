import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CrossrefService } from '../../services/crossref.service';
import type { Work } from 'shared';

@Component({
  selector: 'app-works',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="works-container">
      <div class="works-header">
        <div>
          <a [routerLink]="['/dashboard/profile']" class="back-link">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to Profile
          </a>
          <h1>Member Works</h1>
          <p class="subtitle">Publications from Crossref API</p>
        </div>
        <div class="stats">
          <div class="stat-card">
            <span class="stat-value">{{ works().length }}</span>
            <span class="stat-label">Total Works</span>
          </div>
        </div>
      </div>

      @if (crossrefService.loading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Loading works...</p>
        </div>
      } @else if (crossrefService.error()) {
        <div class="error-state">
          <p>{{ crossrefService.error() }}</p>
          <button (click)="loadWorks()" class="retry-button">Retry</button>
        </div>
      } @else {
        <div class="works-grid">
          @for (work of works(); track work.DOI) {
            <div class="work-card">
              <div class="work-type">{{ work.type }}</div>
              <h3>{{ crossrefService.getWorkTitle(work) }}</h3>
              <p class="authors">{{ crossrefService.getWorkAuthors(work) }}</p>
              <div class="work-meta">
                @if (work['container-title']?.[0]) {
                  <span class="journal">{{ work['container-title']![0] }}</span>
                }
                <span class="date">{{ crossrefService.formatDate(work.published) }}</span>
              </div>
              @if (work.URL) {
                <a [href]="work.URL" target="_blank" class="view-link">
                  View Publication
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <path d="M15 3h6v6"/>
                    <path d="M10 14L21 3"/>
                  </svg>
                </a>
              }
            </div>
          } @empty {
            <div class="empty-state">
              <p>No works found for this member</p>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .works-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .works-header {
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: start;
      gap: 2rem;
      flex-wrap: wrap;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
      margin-bottom: 1rem;
      transition: color 0.2s;
    }

    .back-link:hover {
      color: #764ba2;
    }

    .works-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1a202c;
      margin: 0 0 0.5rem 0;
    }

    .subtitle {
      font-size: 1.125rem;
      color: #718096;
      margin: 0;
    }

    .stats {
      display: flex;
      gap: 1rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 120px;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: #667eea;
    }

    .stat-label {
      font-size: 0.875rem;
      color: #718096;
      margin-top: 0.25rem;
    }

    .loading-state, .error-state, .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #718096;
    }

    .spinner {
      border: 4px solid #e2e8f0;
      border-top: 4px solid #667eea;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-state {
      color: #e53e3e;
    }

    .works-grid {
      display: grid;
      gap: 1.5rem;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    }

    .work-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .work-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .work-type {
      display: inline-block;
      background: #edf2f7;
      color: #4a5568;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 1rem;
    }

    .work-card h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 0.5rem 0;
      line-height: 1.4;
    }

    .authors {
      font-size: 0.875rem;
      color: #718096;
      margin: 0 0 1rem 0;
    }

    .work-meta {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #718096;
      margin-bottom: 1rem;
    }

    .journal {
      font-style: italic;
      color: #4a5568;
    }

    .date {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .view-link {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      color: #667eea;
      font-size: 0.875rem;
      font-weight: 500;
      text-decoration: none;
      transition: color 0.2s;
    }

    .view-link:hover {
      color: #764ba2;
    }

    .retry-button {
      margin-top: 1rem;
      padding: 0.5rem 1rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
    }

    .retry-button:hover {
      background: #764ba2;
    }
  `]
})
export class WorksComponent implements OnInit {
  private route = inject(ActivatedRoute);
  crossrefService = inject(CrossrefService);
  
  works = signal<Work[]>([]);
  memberId = signal<string>('98'); // Default member ID (Cambridge University Press)

  ngOnInit() {
    // Obtener memberId de los parámetros de ruta si están disponibles
    const memberIdParam = this.route.snapshot.queryParamMap.get('memberId');
    if (memberIdParam) {
      this.memberId.set(memberIdParam);
    }
    
    this.loadWorks();
  }

  loadWorks() {
    this.crossrefService.getMemberWorks(this.memberId(), {
      rows: 50,
      sort: 'published',
      order: 'desc',
      select: 'DOI,title,author,type,published,container-title,URL'
    }).subscribe({
      next: (response) => {
        this.works.set(response.message.items);
      },
      error: (err) => {
        console.error('Error loading works:', err);
      }
    });
  }
}
