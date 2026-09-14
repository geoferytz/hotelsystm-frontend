import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

interface Booking {
  id: number;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  specialRequests: string;
  status: string;
  createdAt: string;
  Room?: {
    id: number;
    roomNumber: string;
    type: string;
    price: number;
  };
  Hotel?: {
    id: number;
    name: string;
    city: string;
    country: string;
  };
  Customer?: {
    id: number;
    fullName: string;
    email: string;
    phone: string;
  };
}

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.css']
})
export class MyBookingsComponent implements OnInit {
  bookings: Booking[] = [];
  loading = true;
  error = '';
  userBookingsOnly = true;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.loadBookings();
  }

  loadBookings(): void {
    this.api.getBookings().subscribe({
      next: (data: Booking[]) => {
        // Filter bookings for current user (by email match with customer)
        const currentUser = this.auth.getStoredUser();
        if (currentUser) {
          this.bookings = data.filter(b => 
            b.Customer?.email === currentUser.email
          );
        } else {
          this.bookings = data;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load bookings. Please try again later.';
        this.loading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'confirmed': return 'status-confirmed';
      case 'checked-in': return 'status-checked-in';
      case 'checked-out': return 'status-checked-out';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-pending';
    }
  }

  getStatusLabel(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ');
  }

  calculateNights(checkIn: string, checkOut: string): number {
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    return Math.ceil((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  viewHotel(hotelId: number): void {
    this.router.navigate(['/public/hotels', hotelId]);
  }

  goToHotels(): void {
    this.router.navigate(['/public/hotels']);
  }
}
