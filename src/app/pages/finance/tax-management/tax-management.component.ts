import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-tax-management',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tax-management.component.html',
  styleUrls: ['./tax-management.component.css'],
})
export class TaxManagementComponent {
  features = [
    { icon: 'bi-calculator', title: 'Calculate VAT or service tax automatically', text: 'Configure tax rates and let the system calculate tax on invoices.' },
    { icon: 'bi-receipt-cutoff', title: 'Add tax to invoices', text: 'Include applicable taxes in guest invoices and billing records.' },
    { icon: 'bi-file-earmark-text', title: 'Generate tax reports for government compliance', text: 'Produce tax summaries and reports for regulatory filing.' },
  ];
}
