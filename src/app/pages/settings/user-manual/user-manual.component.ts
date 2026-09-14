import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-manual',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-manual.component.html',
  styleUrls: ['./user-manual.component.css'],
})
export class UserManualComponent {
  sections = [
    {
      title: 'Getting Started',
      icon: 'bi-play-circle',
      items: [
        'Login with your assigned username and password.',
        'Use the Home page module cards to open system areas quickly.',
        'Use the sidebar to navigate between modules after opening a category.',
        'Use the theme picker in the header to change the system theme.',
      ],
    },
    {
      title: 'Hotel Settings',
      icon: 'bi-gear',
      items: [
        'Configure hotel profile details from My Hotels.',
        'Create and maintain room categories from Room Types.',
        'Configure meal menus from Meals.',
        'Configure additional chargeable services from Hotel Services.',
      ],
    },
    {
      title: 'Rooms',
      icon: 'bi-door-open',
      items: [
        'Create single or multiple rooms with room number, type, floor, price, and images.',
        'Filter rooms by status or type.',
        'Update room details when room information changes.',
        'Track room status such as available, occupied, maintenance, or dirty.',
      ],
    },
    {
      title: 'Bookings',
      icon: 'bi-calendar-check',
      items: [
        'Create guest reservations by selecting customer, room, dates, and pricing.',
        'Check in confirmed guests when they arrive.',
        'Check out guests after stay completion.',
        'Use booking status to track confirmed, checked-in, checked-out, or cancelled bookings.',
      ],
    },
    {
      title: 'Customers',
      icon: 'bi-people',
      items: [
        'Register and manage guest profiles.',
        'View customer booking history and contact details.',
        'Update guest information when needed.',
      ],
    },
    {
      title: 'Billing',
      icon: 'bi-receipt',
      items: [
        'Generate and manage guest invoices.',
        'Record payments and track pending balances.',
        'Review payment status for paid, pending, or partial bills.',
      ],
    },
    {
      title: 'Restaurant',
      icon: 'bi-shop',
      items: [
        'Manage restaurant profiles and restaurant menus.',
        'Create food and drink menu items with price, category, description, and image.',
        'Manage restaurant bookings and menu orders.',
      ],
    },
    {
      title: 'Food and Drinks Requests',
      icon: 'bi-cup-hot',
      items: [
        'Use Guest Order to select a room with an active booking and place orders for the guest.',
        'Food items are saved to Food Requests and drink items are saved to Drink Requests.',
        'Kitchen and bar staff can update request status from pending to preparing, delivered, or cancelled.',
      ],
    },
    {
      title: 'Workers and Shifts',
      icon: 'bi-person-badge',
      items: [
        'Manage worker profiles and employment details.',
        'Create and assign work shifts.',
        'Track staff attendance and shift assignments.',
      ],
    },
    {
      title: 'Users, Roles, and Permissions',
      icon: 'bi-shield-lock',
      items: [
        'Create system user accounts for staff.',
        'Assign roles to control what each user can view, create, edit, delete, or manage.',
        'Use Roles & Permissions to configure module access securely.',
      ],
    },
    {
      title: 'Reports and Notifications',
      icon: 'bi-bar-chart-line',
      items: [
        'Use Reports to review revenue, occupancy, bookings, and operational summaries.',
        'Use Notifications to monitor important system alerts and unread messages.',
      ],
    },
    {
      title: 'Session Security',
      icon: 'bi-lock',
      items: [
        'The system locks automatically after inactivity for security.',
        'Enter your password to unlock the session.',
        'Always logout when finished using the system.',
      ],
    },
  ];
}
