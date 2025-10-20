import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CrossrefService } from '../../services/crossref.service';
import { GlobalStateService, type Member } from 'shared';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: "./profile.component.html",
  styleUrl: "./profile.component.scss"
})
export class ProfileComponent implements OnInit {
  private router = inject(Router);
  protected readonly globalState = inject(GlobalStateService);
  crossrefService = inject(CrossrefService);
  
  memberId = this.globalState.memberId()?.toString()
  member = this.globalState.member

  ngOnInit() {
    this.loadMember();
  }

  loadMember() {
    if(!this.memberId) {
      this.router.navigate(["/"])
      return
    }
    this.crossrefService.getMember(this.memberId).subscribe({
      next: (member) => {
        this.globalState.setMember(member)
      },
      error: (err) => {
        console.error('Error loading member:', err);
      }
    });
  }
}
