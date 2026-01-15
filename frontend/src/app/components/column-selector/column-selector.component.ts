import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-column-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './column-selector.component.html',
  styleUrl: './column-selector.component.css'
})
export class ColumnSelectorComponent implements OnChanges {
  @Input() columns: string[] = [];
  @Output() columnsSelected = new EventEmitter<{xColumn: string, yColumns: string[]}>();

  selectedXColumn: string = '';
  selectedYColumns: string[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    // Reset selections when columns change (new file uploaded)
    if (changes['columns'] && !changes['columns'].firstChange) {
      this.selectedXColumn = '';
      this.selectedYColumns = [];
    }
  }

  onXColumnChange(column: string) {
    this.selectedXColumn = column;
    this.emitSelection();
  }

  onYColumnToggle(column: string) {
    const index = this.selectedYColumns.indexOf(column);
    if (index > -1) {
      this.selectedYColumns.splice(index, 1);
    } else {
      this.selectedYColumns.push(column);
    }
    this.emitSelection();
  }

  isYColumnSelected(column: string): boolean {
    return this.selectedYColumns.includes(column);
  }

  emitSelection() {
    if (this.selectedXColumn && this.selectedYColumns.length > 0) {
      this.columnsSelected.emit({
        xColumn: this.selectedXColumn,
        yColumns: this.selectedYColumns
      });
    }
  }
}
