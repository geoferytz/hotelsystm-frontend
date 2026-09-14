import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cashier-shifts',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cashier-shifts.component.html',
  styleUrls: ['./cashier-shifts.component.css'],
})
export class CashierShiftsComponent {
  features = [
    { icon: 'bi-person-badge', title: 'Track cashiers per shift', text: 'Assign cashiers to shifts and track their activities.' },
    { icon: 'bi-cash-stack', title: 'Opening and closing cash balance', text: 'Record opening cash at shift start and closing cash at shift end.' },
    { icon: 'bi-exclamation-triangle', title: 'Detect shortages or overages', text: 'Compare expected and actual cash to identify discrepancies.' },
  ];
}
