import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './finance.component.html',
  styleUrls: ['./finance.component.css'],
})
export class FinanceComponent {
  purposes = [
    {
      title: 'Track Hotel Income',
      icon: 'bi-graph-up-arrow',
      description: 'Monitor revenue from rooms, restaurant orders, services, and other hotel income streams.',
    },
    {
      title: 'Manage Guest Payments',
      icon: 'bi-credit-card',
      description: 'Record payments, review paid amounts, and follow up on pending or partial balances.',
    },
    {
      title: 'Handle Refunds',
      icon: 'bi-arrow-counterclockwise',
      description: 'Support refund tracking for cancelled services, booking adjustments, and payment corrections.',
    },
    {
      title: 'Monitor Expenses',
      icon: 'bi-wallet2',
      description: 'Track operational expenses to help management understand costs and profitability.',
    },
    {
      title: 'Generate Reports',
      icon: 'bi-file-earmark-bar-graph',
      description: 'Use financial records to support daily, monthly, and management decision-making reports.',
    },
  ];

  quickLinks = [
    {
      label: 'Billing & Invoices',
      route: '/billing',
      icon: 'bi-receipt-cutoff',
      text: 'Create invoices, manage guest bills, and record payment status.',
    },
    {
      label: 'Refund Management',
      route: '/finance/refunds',
      icon: 'bi-arrow-counterclockwise',
      text: 'Process refunds for cancellations and track refund history.',
    },
    {
      label: 'Expense Management',
      route: '/finance/expenses',
      icon: 'bi-wallet2',
      text: 'Track staff salaries, utilities, maintenance, and supply expenses.',
    },
    {
      label: 'Salary Management',
      route: '/finance/salary',
      icon: 'bi-cash-coin',
      text: 'Manage employee salaries, bonuses, overtime, and deductions.',
    },
    {
      label: 'Financial Reports',
      route: '/finance/reports',
      icon: 'bi-file-earmark-bar-graph',
      text: 'Generate daily revenue, profit/loss, and expense breakdown reports.',
    },
    {
      label: 'Tax Management',
      route: '/finance/tax',
      icon: 'bi-percent',
      text: 'Configure VAT/service tax and generate compliance reports.',
    },
    {
      label: 'Cashier & Shifts',
      route: '/finance/cashier-shifts',
      icon: 'bi-cash-stack',
      text: 'Track cashiers per shift and detect cash shortages or overages.',
    },
    {
      label: 'Integrations',
      route: '/finance/integrations',
      icon: 'bi-diagram-3',
      text: 'View Finance connections with Reservations, Restaurant, Housekeeping, and Inventory.',
    },
  ];
}
