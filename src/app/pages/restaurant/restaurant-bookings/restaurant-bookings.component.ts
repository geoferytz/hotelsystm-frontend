import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-restaurant-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './restaurant-bookings.component.html',
  styleUrls: ['./restaurant-bookings.component.css'],
})
export class RestaurantBookingsComponent implements OnInit {
  bookings: any[] = [];
  loading = true;
  error = '';
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  Math = Math;

  openMenuRow: any = null;
  menuStyle: { [key: string]: string } = {};

  toggleMenu(key: any, itemCount: number, event: Event): void {
    event.stopPropagation();
    if (this.openMenuRow === key) {
      this.openMenuRow = null;
      return;
    }
    const btn = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const menuHeight = 40 * itemCount + 16;
    if (btn.bottom + menuHeight > window.innerHeight) {
      this.menuStyle = {
        bottom: `${window.innerHeight - btn.top + 6}px`,
        right: `${window.innerWidth - btn.right}px`,
      };
    } else {
      this.menuStyle = {
        top: `${btn.bottom + 6}px`,
        right: `${window.innerWidth - btn.right}px`,
      };
    }
    this.openMenuRow = key;
  }

  @HostListener('document:click')
  closeMenu(): void {
    this.openMenuRow = null;
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (this.openMenuRow) this.openMenuRow = null;
  }

  // Form state
  showForm = false;
  formSubmitted = false;
  bookingForm = {
    restaurantId: 1,
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    numberOfGuests: 2,
    bookingDate: '',
    bookingTime: '',
    specialRequests: ''
  };

  constructor(
    private api: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.api.getRestaurantTableBookings().subscribe({
      next: (data: any[]) => {
        this.bookings = data;
        this.totalPages = Math.ceil(this.bookings.length / this.itemsPerPage);
        this.currentPage = 1;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load table bookings.';
        this.loading = false;
      },
    });
  }

  get paginatedBookings(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.bookings.slice(start, end);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  getPages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  updateStatus(bookingId: number, status: string): void {
    this.api.updateRestaurantTableBookingStatus(bookingId, status).subscribe({
      next: () => {
        this.toast.success('Success', 'Booking status updated successfully!');
        this.loadBookings();
      },
      error: (err: any) => {
        this.toast.error('Error', err.error?.message || 'Failed to update status');
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      pending: 'bg-warning',
      confirmed: 'bg-success',
      cancelled: 'bg-danger',
      completed: 'bg-info'
    };
    return classes[status] || 'bg-secondary';
  }

  openForm(): void {
    this.showForm = true;
    this.formSubmitted = false;
  }

  closeForm(): void {
    this.showForm = false;
    this.resetForm();
  }

  resetForm(): void {
    this.bookingForm = {
      restaurantId: 1,
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      numberOfGuests: 2,
      bookingDate: '',
      bookingTime: '',
      specialRequests: ''
    };
    this.formSubmitted = false;
  }

  submitForm(): void {
    this.formSubmitted = true;
    if (!this.bookingForm.guestName || !this.bookingForm.guestPhone ||
        !this.bookingForm.bookingDate || !this.bookingForm.bookingTime) {
      return;
    }
    this.api.adminCreateRestaurantTableBooking(this.bookingForm).subscribe({
      next: () => {
        this.toast.success('Success', 'Table booking created successfully!');
        this.closeForm();
        this.loadBookings();
      },
      error: (err: any) => {
        this.toast.error('Error', err.error?.message || 'Failed to create booking');
      }
    });
  }
}
