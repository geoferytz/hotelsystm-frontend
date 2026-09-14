import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-finance-integrations',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './integrations.component.html',
  styleUrls: ['./integrations.component.css'],
})
export class FinanceIntegrationsComponent {
  integrations = [
    { icon: 'bi-calendar-check', title: 'Reservations', text: 'Connect to room charges and booking payments.' },
    { icon: 'bi-shop', title: 'Restaurant', text: 'Link to food bills and restaurant order payments.' },
    { icon: 'bi-brush', title: 'Housekeeping', text: 'Connect to service fees and housekeeping charges.' },
    { icon: 'bi-box-seam', title: 'Inventory', text: 'Link to stock expenses and inventory purchase costs.' },
  ];
}
