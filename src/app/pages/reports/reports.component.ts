import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css'],
})
export class ReportsComponent {
  reportType = 'revenue';
  startDate = '';
  endDate = '';
  reportData: any = null;

  constructor(private api: ApiService, private toast: ToastService) {}

  generateReport(): void {
    const params: any = { startDate: this.startDate, endDate: this.endDate };
    this.api.getReport(this.reportType, params).subscribe({
      next: (data: any) => this.reportData = data,
      error: (err: any) => this.toast.error('Report Failed', err.error?.message || 'Error generating report'),
    });
  }
}
