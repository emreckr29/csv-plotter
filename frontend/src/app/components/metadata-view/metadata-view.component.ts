import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-metadata-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './metadata-view.component.html',
  styleUrl: './metadata-view.component.css'
})
export class MetadataViewComponent {
  @Input() metadata: string[] = [];
  @Input() hasMetadata: boolean = false;

  isExpanded: boolean = false;

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }
}
