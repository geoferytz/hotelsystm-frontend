import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-financial-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './financial-reports.component.html',
  styleUrls: ['./financial-reports.component.css'],
})
export class FinancialReportsComponent implements OnInit {
  activeTab = 'summary';
  loading = false;
  
  // Summary data
  summary: any = {};
  
  // Expense report data
  expenseReport: any = {};
  expenseFilter = { startDate: '', endDate: '', category: '', status: '' };
  
  // Refund report data
  refundReport: any = {};
  refundFilter = { startDate: '', endDate: '', status: '' };
  
  // Profit/Loss data
  profitLoss: any = {};
  profitLossFilter = { startDate: '', endDate: '' };
  
  Math = Math;

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadFinancialSummary();
    this.setDefaultDateRanges();
  }

  setDefaultDateRanges(): void {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    this.profitLossFilter.startDate = firstDayOfMonth.toISOString().split('T')[0];
    this.profitLossFilter.endDate = lastDayOfMonth.toISOString().split('T')[0];
  }

  loadFinancialSummary(): void {
    this.loading = true;
    this.api.getFinancialSummary().subscribe({
      next: (data: any) => {
        this.summary = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.toast.error('Error', 'Failed to load financial summary');
        this.loading = false;
      },
    });
  }

  loadExpenseReport(): void {
    this.loading = true;
    this.api.getExpenseReport(this.expenseFilter).subscribe({
      next: (data: any) => {
        this.expenseReport = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.toast.error('Error', 'Failed to load expense report');
        this.loading = false;
      },
    });
  }

  loadRefundReport(): void {
    this.loading = true;
    this.api.getRefundReport(this.refundFilter).subscribe({
      next: (data: any) => {
        this.refundReport = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.toast.error('Error', 'Failed to load refund report');
        this.loading = false;
      },
    });
  }

  loadProfitLossReport(): void {
    this.loading = true;
    this.api.getProfitLossReport(this.profitLossFilter).subscribe({
      next: (data: any) => {
        this.profitLoss = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.toast.error('Error', 'Failed to load profit/loss report');
        this.loading = false;
      },
    });
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'expenses') this.loadExpenseReport();
    if (tab === 'refunds') this.loadRefundReport();
    if (tab === 'profit-loss') this.loadProfitLossReport();
  }

  getCategoryColor(category: string): string {
    const colors: any = {
      supplies: '#6366f1',
      maintenance: '#f59e0b',
      utilities: '#10b981',
      salaries: '#ef4444',
      marketing: '#8b5cf6',
      other: '#6b7280',
    };
    return colors[category] || '#6b7280';
  }

  getStatusColor(status: string): string {
    const colors: any = {
      pending: '#f59e0b',
      approved: '#10b981',
      rejected: '#ef4444',
      processed: '#3b82f6',
    };
    return colors[status] || '#6b7280';
  }
}
