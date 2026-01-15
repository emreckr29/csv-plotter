import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-data-preview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-preview.component.html',
  styleUrl: './data-preview.component.css'
})
export class DataPreviewComponent {
  @Input() data: any[] = [];
  @Input() columns: string[] = [];
  @Input() rowCount: number = 0;

  isExpanded: boolean = false;

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }
}
