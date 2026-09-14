import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-room-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './room-detail.component.html',
  styleUrls: ['./room-detail.component.css'],
})
export class RoomDetailComponent implements OnInit {
  room: any = null;
  hotel: any = null;
  loading = true;
  error = '';
  checkIn = '';
  checkOut = '';
  adults = 2;
  children = 0;
  rooms = 1;
  activeImage = '';
  galleryImages: string[] = [];

  // Booking modal
  showBookingModal = false;
  bookingSuccess = false;
  bookingError = '';
  bookingSubmitting = false;
  minDate = '';
  maxDate = '';
  bookingForm = {
    fullName: '', email: '', phone: '',
    checkIn: '', checkOut: '',
    adults: 1, children: 0,
    specialRequests: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private auth: AuthService
  ) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    const max = new Date();
    max.setFullYear(max.getFullYear() + 1);
    this.maxDate = max.toISOString().split('T')[0];

    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state) {
      const s = nav.extras.state as any;
      this.room = s.room || null;
      this.hotel = s.hotel || null;
      this.checkIn = s.checkIn || '';
      this.checkOut = s.checkOut || '';
      this.adults = s.adults || 2;
      this.children = s.children || 0;
      this.rooms = s.rooms || 1;
    }
  }

  ngOnInit(): void {
    if (this.room) {
      this.buildGallery();
      this.loading = false;
      return;
    }
    const hotelId = this.route.snapshot.paramMap.get('hotelId');
    const roomId = this.route.snapshot.paramMap.get('roomId');
    if (hotelId) {
      this.api.getPublicHotelDetails(+hotelId).subscribe({
        next: (data: any) => {
          this.hotel = data;
          this.room = data.Rooms?.find((r: any) => r.id === +(roomId || 0)) || null;
          if (this.room) {
            this.buildGallery();
          } else {
            this.error = 'Room not found.';
          }
          this.loading = false;
        },
        error: () => { this.error = 'Failed to load room details.'; this.loading = false; }
      });
    } else {
      this.router.navigate(['/public/hotels']);
    }
  }

  buildGallery(): void {
    const imgs: string[] = Array.isArray(this.room?.images) && this.room.images.length > 0
      ? this.room.images
      : (this.room?.imageUrl ? [this.room.imageUrl] : []);
    this.galleryImages = imgs.map((u: string) => this.normalizeImageUrl(u)).filter(u => u);
    this.activeImage = this.galleryImages[0] || '';
  }

  setActiveImage(url: string): void {
    this.activeImage = url;
  }

  previousImage(): void {
    if (this.galleryImages.length <= 1) return;
    const currentIndex = this.galleryImages.indexOf(this.activeImage);
    const nextIndex = currentIndex <= 0 ? this.galleryImages.length - 1 : currentIndex - 1;
    this.activeImage = this.galleryImages[nextIndex];
  }

  nextImage(): void {
    if (this.galleryImages.length <= 1) return;
    const currentIndex = this.galleryImages.indexOf(this.activeImage);
    const nextIndex = currentIndex >= this.galleryImages.length - 1 ? 0 : currentIndex + 1;
    this.activeImage = this.galleryImages[nextIndex];
  }

  normalizeImageUrl(url: string | undefined): string {
    if (!url) return '';
    let n = url.replace(/\\/g, '/');
    if (n.startsWith('/uploads')) return `http://localhost:5000${n}`;
    if (!n.startsWith('/') && !n.startsWith('http')) n = '/' + n;
    return n;
  }

  bookRoom(): void {
    this.bookingSuccess = false;
    this.bookingError = '';
    this.bookingForm = {
      fullName: '', email: '', phone: '',
      checkIn: this.checkIn,
      checkOut: this.checkOut,
      adults: this.adults,
      children: this.children,
      specialRequests: ''
    };
    if (this.auth.isLoggedIn()) {
      const user = this.auth.getStoredUser();
      if (user) {
        this.bookingForm.fullName = user.fullName || '';
        this.bookingForm.email = user.email || '';
      }
    }
    this.showBookingModal = true;
  }

  closeBookingModal(): void {
    this.showBookingModal = false;
  }

  calculateTotal(): number {
    if (!this.bookingForm.checkIn || !this.bookingForm.checkOut) return 0;
    const diff = new Date(this.bookingForm.checkOut).getTime() - new Date(this.bookingForm.checkIn).getTime();
    const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights * (this.room?.price || 0) : 0;
  }

  isBookingFormValid(): boolean {
    return !!(
      this.bookingForm.fullName &&
      this.bookingForm.email &&
      this.bookingForm.phone &&
      this.bookingForm.checkIn &&
      this.bookingForm.checkOut &&
      this.bookingForm.adults > 0
    );
  }

  submitBooking(): void {
    if (!this.isBookingFormValid()) return;
    this.bookingSubmitting = true;
    this.bookingError = '';
    const payload = {
      hotelId: this.hotel?.id,
      roomId: this.room?.id,
      fullName: this.bookingForm.fullName,
      email: this.bookingForm.email,
      phone: this.bookingForm.phone,
      checkIn: this.bookingForm.checkIn,
      checkOut: this.bookingForm.checkOut,
      adults: this.bookingForm.adults,
      children: this.bookingForm.children,
      specialRequests: this.bookingForm.specialRequests
    };
    this.api.createGuestBooking(payload).subscribe({
      next: () => { this.bookingSuccess = true; this.bookingSubmitting = false; },
      error: (err: any) => {
        this.bookingError = err.error?.message || 'Failed to create booking. Please try again.';
        this.bookingSubmitting = false;
      }
    });
  }

  goBack(): void {
    const hotelId = this.route.snapshot.paramMap.get('hotelId') || this.hotel?.id;
    if (hotelId) {
      this.router.navigate(['/public/hotels', hotelId], {
        state: { checkIn: this.checkIn, checkOut: this.checkOut, adults: this.adults, children: this.children, rooms: this.rooms }
      });
    } else {
      this.router.navigate(['/public/hotels']);
    }
  }

  get statusLabel(): string {
    const map: Record<string, string> = { available: 'Available', occupied: 'Occupied', maintenance: 'Under Maintenance', dirty: 'Cleaning' };
    return map[this.room?.status] || this.room?.status || '';
  }

  get isAvailable(): boolean {
    return this.room?.status === 'available';
  }

  get nightCount(): number {
    if (!this.checkIn || !this.checkOut) return 0;
    const diff = new Date(this.checkOut).getTime() - new Date(this.checkIn).getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  get totalPrice(): number {
    return (this.room?.price || 0) * (this.nightCount || 1);
  }
}
