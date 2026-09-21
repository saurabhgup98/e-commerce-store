import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CompareService } from '../../core/compare.service';

@Component({
  selector: 'app-compare-tray',
  standalone: true,
  imports: [],
  templateUrl: './compare-tray.component.html',
  styleUrl: './compare-tray.component.scss',
})
export class CompareTrayComponent {
  compare = inject(CompareService);
  private router = inject(Router);

  viewCompare() {
    this.router.navigateByUrl('/compare');
  }
}
