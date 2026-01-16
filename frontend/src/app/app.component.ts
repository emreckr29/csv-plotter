import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadComponent } from './components/upload/upload.component';
import { ColumnSelectorComponent } from './components/column-selector/column-selector.component';
import { ChartDisplayComponent } from './components/chart-display/chart-display.component';
import { DataPreviewComponent } from './components/data-preview/data-preview.component';
import { MetadataViewComponent } from './components/metadata-view/metadata-view.component';
import { CsvService } from './services/csv.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    UploadComponent,
    ColumnSelectorComponent,
    ChartDisplayComponent,
    DataPreviewComponent,
    MetadataViewComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'CSV Data Plotter';

  // File data
  fileUploaded: boolean = false;
  fileName: string = '';
  filePath: string = '';
  columns: string[] = [];
  rowCount: number = 0;
  previewData: any[] = [];
  hasMetadata: boolean = false;
  metadata: string[] = [];

  // Plot data
  plotData: any = null;
  selectedXColumn: string = '';
  selectedYColumns: string[] = [];

  constructor(private csvService: CsvService) {}

  onFileUploaded(response: any) {
    this.fileUploaded = true;
    this.fileName = response.fileName;
    this.filePath = response.filePath;
    this.columns = response.columns;
    this.rowCount = response.rowCount;
    this.previewData = response.preview;
    this.hasMetadata = response.hasMetadata;
    this.metadata = response.metadata || [];

    // Reset plot data
    this.plotData = null;
    this.selectedXColumn = '';
    this.selectedYColumns = [];
  }

  onColumnsSelected(selection: {xColumn: string, yColumns: string[]}) {
    this.selectedXColumn = selection.xColumn;
    this.selectedYColumns = selection.yColumns;

    // Fetch plot data
    this.csvService.getPlotData(this.filePath, selection.xColumn, selection.yColumns)
      .subscribe({
        next: (response) => {
          this.plotData = response.plotData;
        },
        error: (err) => {
          console.error('Error fetching plot data:', err);

          const errorMsg = err.error?.details || 'Failed to generate plot data!';
          alert(errorMsg);

          // Reset plot
          this.plotData = null;
        }
      });
  }
}
