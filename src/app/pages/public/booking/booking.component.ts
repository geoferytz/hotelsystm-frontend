import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationStart } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

interface Room {
  id: number;
  roomNumber: string;
  type: string;
  price: number;
  floor: number;
  description: string;
  imageUrl?: string;
}

interface Hotel {
  id: number;
  name: string;
  address: string;
  city: string;
  country: string;
  checkInTime: string;
  checkOutTime: string;
}

@Component({
  selector: 'app-public-booking',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css']
})
export class PublicBookingComponent implements OnInit {
  hotel: Hotel | null = null;
  room: Room | null = null;
  
  bookingForm = {
    fullName: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    adults: 1,
    children: 0,
    specialRequests: ''
  };

  loading = false;
  submitting = false;
  error = '';
  success = false;
  minDate = '';
  maxDate = '';

  constructor(
    private router: Router,
    private api: ApiService,
    private auth: AuthService
  ) {
    // Get hotel and room from navigation state
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state) {
      this.hotel = {
        id: state['hotelId'],
        name: state['hotelName'],
        address: '',
        city: '',
        country: '',
        checkInTime: '',
        checkOutTime: ''
      };
      this.room = {
        id: state['roomId'],
        roomNumber: state['roomNumber'],
        type: state['roomType'],
        price: state['roomPrice'],
        floor: 0,
        description: '',
        imageUrl: state['roomImageUrl'] || ''
      };
      // Pre-fill booking form from state
      this.bookingForm.checkIn = state['checkIn'] || '';
      this.bookingForm.checkOut = state['checkOut'] || '';
      this.bookingForm.adults = state['adults'] || 2;
      this.bookingForm.children = state['children'] || 0;
    }
    
    // Set min date to today
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    
    // Set max date to 1 year from now
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    this.maxDate = maxDate.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    if (!this.hotel || !this.room) {
      this.router.navigate(['/public/hotels']);
      return;
    }

    // Pre-fill form if user is logged in
    if (this.auth.isLoggedIn()) {
      const user = this.auth.getStoredUser();
      if (user) {
        this.bookingForm.fullName = user.fullName || '';
        this.bookingForm.email = user.email || '';
      }
    }
  }

  calculateTotal(): number {
    if (!this.bookingForm.checkIn || !this.bookingForm.checkOut) return 0;
    
    const checkIn = new Date(this.bookingForm.checkIn);
    const checkOut = new Date(this.bookingForm.checkOut);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    return nights > 0 ? nights * this.room!.price : 0;
  }

  submitBooking(): void {
    if (!this.isFormValid()) return;

    this.submitting = true;
    this.error = '';

    // Use guest booking endpoint (no auth required)
    const bookingData = {
      hotelId: this.hotel!.id,
      roomId: this.room!.id,
      fullName: this.bookingForm.fullName,
      email: this.bookingForm.email,
      phone: this.bookingForm.phone,
      checkIn: this.bookingForm.checkIn,
      checkOut: this.bookingForm.checkOut,
      adults: this.bookingForm.adults,
      children: this.bookingForm.children,
      specialRequests: this.bookingForm.specialRequests
    };

    this.api.createGuestBooking(bookingData).subscribe({
      next: () => {
        this.success = true;
        this.submitting = false;
      },
      error: (err) => {
        console.error('Booking error full response:', err);
        this.error = err.error?.message || err.error?.error || 'Failed to create booking. Please try again.';
        this.submitting = false;
      }
    });
  }

  isFormValid(): boolean {
    return !!(
      this.bookingForm.fullName &&
      this.bookingForm.email &&
      this.bookingForm.phone &&
      this.bookingForm.checkIn &&
      this.bookingForm.checkOut &&
      this.bookingForm.adults > 0
    );
  }

  goBack(): void {
    this.router.navigate(['/public/hotels', this.hotel!.id]);
  }

  goToHotels(): void {
    this.router.navigate(['/public/hotels']);
  }

  normalizeImageUrl(url: string | undefined): string {
    if (!url) return '';
    let normalized = url.replace(/\\/g, '/');
    if (normalized.startsWith('/uploads')) return `http://localhost:5000${normalized}`;
    if (!normalized.startsWith('/') && !normalized.startsWith('http')) {
      normalized = '/' + normalized;
    }
    return normalized;
  }
}
