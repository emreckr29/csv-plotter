import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CsvService } from '../../services/csv.service';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css'
})
export class UploadComponent {
  @Output() fileUploaded = new EventEmitter<any>();

  selectedFile: File | null = null;
  uploading: boolean = false;
  error: string | null = null;

  constructor(private csvService: CsvService) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.csv')) {
      this.selectedFile = file;
      this.error = null;
    } else {
      this.error = 'Please select a valid CSV file!';
      this.selectedFile = null;
    }
  }

  uploadFile() {
    if (!this.selectedFile) {
      this.error = 'Please select a file first!';
      return;
    }

    this.uploading = true;
    this.error = null;

    this.csvService.uploadFile(this.selectedFile).subscribe({
      next: (response) => {
        this.uploading = false;
        this.fileUploaded.emit(response);
      },
      error: (err) => {
        this.uploading = false;
        this.error = err.error?.error || 'Failed to upload file!';
      }
    });
  }
}
