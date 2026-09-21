import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { CompareService } from '../../core/compare.service';

@Component({
  selector: 'app-compare-page',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './compare-page.component.html',
  styleUrl: './compare-page.component.scss',
})
export class ComparePageComponent {
  compare = inject(CompareService);

  specKeys = computed(() => {
    const keys = new Set<string>();
    for (const product of this.compare.selected()) {
      Object.keys(product.specs ?? {}).forEach((key) => keys.add(key));
    }
    return Array.from(keys);
  });
}
