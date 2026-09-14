import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-guest',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './guest.component.html',
  styleUrls: ['./guest.component.css'],
})
export class GuestComponent implements OnInit {
  rooms: any[] = [];
  menuItems: any[] = [];
  menuCategories: string[] = [];
  restaurants: any[] = [];
  roomSummary: any = { total: 0, available: 0, types: [] };
  guestForm: any = { fullName: '', phone: '', email: '', idNumber: '', nationality: '', roomId: '', checkIn: '', checkOut: '', adults: 1, children: 0, specialRequests: '' };
  bookingSuccess = false;
  bookingResult: any = {};
  bookingError = '';
  submitting = false;
  showPaymentForm = false;
  paymentAmount = 0;
  paymentMethod = 'cash';

  services = [
    { icon: 'bi-wifi', name: 'Free Wi-Fi', desc: 'High-speed internet in all rooms' },
    { icon: 'bi-cup-hot', name: 'Restaurant', desc: 'Fine dining & room service' },
    { icon: 'bi-water', name: 'Swimming Pool', desc: 'Outdoor heated pool' },
    { icon: 'bi-car-front', name: 'Free Parking', desc: 'Secure on-site parking' },
    { icon: 'bi-shield-check', name: '24/7 Security', desc: 'Round-the-clock safety' },
    { icon: 'bi-telephone', name: 'Concierge', desc: 'Personalized guest services' },
    { icon: 'bi-flower1', name: 'Spa & Wellness', desc: 'Relax and rejuvenate' },
    { icon: 'bi-truck', name: 'Airport Shuttle', desc: 'Complimentary transfers' },
  ];

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadRooms();
    this.loadSummary();
    this.loadMenu();
    this.loadRestaurants();
  }

  loadRooms(): void {
    this.api.getGuestRooms().subscribe({ next: (data: any) => this.rooms = data });
  }

  loadSummary(): void {
    this.api.getGuestRoomSummary().subscribe({ next: (data: any) => this.roomSummary = data });
  }

  loadMenu(): void {
    this.api.getGuestMenu().subscribe({
      next: (data: any[]) => {
        this.menuItems = data;
        this.menuCategories = [...new Set(data.map(item => item.category))];
      },
      error: () => this.menuItems = [],
    });
  }

  loadRestaurants(): void {
    this.api.getGuestRestaurants().subscribe({
      next: (data: any[]) => this.restaurants = data,
      error: () => this.restaurants = [],
    });
  }

  getMenuItemsByCategory(category: string): any[] {
    return this.menuItems.filter(item => item.category === category);
  }

  imageUrl(url: string | undefined): string {
    if (!url) return '';
    let normalized = url.replace(/\\/g, '/');
    if (normalized.startsWith('/uploads')) return `http://localhost:5000${normalized}`;
    if (!normalized.startsWith('/') && !normalized.startsWith('http')) {
      normalized = '/' + normalized;
    }
    return normalized;
  }

  submitBooking(): void {
    if (!this.guestForm.fullName || !this.guestForm.phone || !this.guestForm.roomId || !this.guestForm.checkIn || !this.guestForm.checkOut) {
      this.bookingError = 'Please fill in all required fields.';
      return;
    }
    this.submitting = true;
    this.bookingError = '';
    this.api.createGuestBooking(this.guestForm).subscribe({
      next: (res: any) => {
        this.bookingSuccess = true;
        this.bookingResult = res;
        this.paymentAmount = res.billing?.totalAmount || 0;
        this.submitting = false;
      },
      error: (err: any) => {
        this.bookingError = err.error?.message || 'Booking failed.';
        this.submitting = false;
      },
    });
  }

  makePayment(): void {
    if (!this.paymentAmount || this.paymentAmount <= 0) { this.toast.warning('Invalid Amount', 'Please enter a valid payment amount.'); return; }
    this.api.guestPayment({
      billingId: this.bookingResult.billing?.id,
      amount: this.paymentAmount,
      paymentMethod: this.paymentMethod,
    }).subscribe({
      next: () => { this.toast.success('Payment Successful', 'Your payment has been recorded.'); this.showPaymentForm = false; },
      error: (err: any) => this.toast.error('Payment Failed', err.error?.message || 'Payment failed.'),
    });
  }

  shareWhatsApp(): void {
    const b = this.bookingResult;
    const text = `🏨 *Hotel Invoice*%0A%0AGuest: ${b.customer?.fullName}%0ARoom: ${b.booking?.roomNumber} (${b.booking?.roomType})%0ACheck-In: ${b.booking?.checkIn}%0ACheck-Out: ${b.booking?.checkOut}%0ATotal: $${b.billing?.totalAmount}%0AInvoice #${b.billing?.id}%0A%0AThank you for your booking!`;
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }
}
