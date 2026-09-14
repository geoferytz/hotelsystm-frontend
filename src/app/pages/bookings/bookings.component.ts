import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import { PermissionService } from '../../services/permission.service';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { SharedTableAction, SharedTableColumn, SharedTableComponent } from '../../shared';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ConfirmDialogComponent, SharedTableComponent],
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.css'],
})
export class BookingsComponent implements OnInit {
  bookings: any[] = [];
  customers: any[] = [];
  availableRooms: any[] = [];
  showModal = false;
  showExtendModal = false;
  showCancelModal = false;
  showChangeRoomModal = false;
  changeRoomBookingId = 0;
  changeRoomCurrentRoom: any = null;
  newRoomId = '';
  filterStatus = '';
  currentPage = 1;
  itemsPerPage = 10;
  form: any = { customerId: '', roomId: '', checkIn: '', checkOut: '', adults: 1, children: 0, specialRequests: '' };
  extendBookingId = 0;
  extendCurrentCheckOut = '';
  newCheckOut = '';
  cancelBookingId = 0;
  cancelReason = '';
  showConfirmDialog = false;
  deleteBookingId: number | null = null;
  Math = Math;

  bookingColumns: SharedTableColumn[] = [
    { key: 'Customer.fullName', label: 'Guest', sortable: true, formatter: (b) => b.Customer?.fullName || '-' },
    { key: 'Room.roomNumber', label: 'Room', sortable: true, formatter: (b) => `${b.Room?.roomNumber || '-'} (${b.Room?.type || '-'})` },
    { key: 'checkIn', label: 'Check-In', sortable: true },
    { key: 'checkOut', label: 'Check-Out', sortable: true },
    { key: 'status', label: 'Status', type: 'status', sortable: true, statusClass: (status) => this.getBookingStatusClass(status) },
  ];

  bookingActions: SharedTableAction[] = [
    { action: 'check-in', label: 'Check In', icon: 'bi-box-arrow-in-right', class: 'btn-outline-success', visible: (row) => row.status === 'confirmed' && this.canEdit() },
    { action: 'check-out', label: 'Check Out', icon: 'bi-box-arrow-right', class: 'btn-outline-secondary', visible: (row) => row.status === 'checked-in' && this.canEdit() },
    { action: 'extend', label: 'Extend', icon: 'bi-calendar-plus', class: 'btn-outline-info', visible: (row) => row.status === 'checked-in' && this.canEdit() },
    { action: 'change-room', label: 'Change Room', icon: 'bi-arrow-left-right', class: 'btn-outline-primary', visible: (row) => row.status !== 'checked-out' && row.status !== 'cancelled' && this.canEdit() },
    { action: 'cancel', label: 'Cancel', icon: 'bi-x-circle', class: 'btn-outline-warning', visible: (row) => row.status !== 'checked-out' && row.status !== 'cancelled' && this.canEdit() },
    { action: 'delete', label: 'Delete', icon: 'bi-trash', class: 'btn-outline-danger', visible: () => this.canDelete() },
  ];

  constructor(private api: ApiService, private toast: ToastService, private permission: PermissionService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.api.getBookings(this.filterStatus).subscribe({
      next: (data: any) => {
        this.bookings = data;
        this.currentPage = 1;
      },
      error: (err) => {
        console.error('Error loading bookings:', err);
      }
    });
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  onBookingTableAction(event: { action: string; row: any }): void {
    if (event.action === 'check-in') this.updateStatus(event.row.id, 'checked-in');
    if (event.action === 'check-out') this.updateStatus(event.row.id, 'checked-out');
    if (event.action === 'extend') this.openExtendModal(event.row);
    if (event.action === 'change-room') this.openChangeRoomModal(event.row);
    if (event.action === 'cancel') this.openCancelModal(event.row);
    if (event.action === 'delete') this.deleteBooking(event.row.id);
  }

  getBookingStatusClass(status: string): string {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'checked-in':
        return 'primary';
      case 'checked-out':
        return 'secondary';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  openModal(): void {
    this.form = { customerId: '', roomId: '', checkIn: '', checkOut: '', adults: 1, children: 0, specialRequests: '' };
    this.api.getCustomers().subscribe({ next: (data: any) => this.customers = data });
    this.api.getRooms({ status: 'available' }).subscribe({ next: (data: any) => this.availableRooms = data });
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  createBooking(): void {
    this.api.createBooking(this.form).subscribe({
      next: () => { this.closeModal(); this.loadBookings(); this.toast.success('Booking Created', 'New booking has been created successfully.'); },
      error: (err: any) => this.toast.error('Booking Failed', err.error?.message || 'Error creating booking'),
    });
  }

  updateStatus(id: number, status: string): void {
    this.api.updateBooking(id, { status }).subscribe({
      next: () => this.loadBookings(),
    });
  }

  deleteBooking(id: number): void {
    this.deleteBookingId = id;
    this.showConfirmDialog = true;
  }

  onConfirmDelete(): void {
    if (this.deleteBookingId) {
      this.api.deleteBooking(this.deleteBookingId).subscribe({ next: () => { this.loadBookings(); this.showConfirmDialog = false; this.deleteBookingId = null; } });
    }
  }

  onCancelDelete(): void {
    this.showConfirmDialog = false;
    this.deleteBookingId = null;
  }

  openExtendModal(b: any): void {
    this.extendBookingId = b.id;
    this.extendCurrentCheckOut = b.checkOut;
    this.newCheckOut = '';
    this.showExtendModal = true;
  }

  submitExtend(): void {
    if (!this.newCheckOut) { this.toast.warning('Select Date', 'Please select a new check-out date.'); return; }
    this.api.extendBooking(this.extendBookingId, this.newCheckOut).subscribe({
      next: (res: any) => { this.toast.success('Stay Extended', res.message); this.showExtendModal = false; this.loadBookings(); },
      error: (err: any) => this.toast.error('Extension Failed', err.error?.message || 'Extension failed.'),
    });
  }

  openCancelModal(b: any): void {
    this.cancelBookingId = b.id;
    this.cancelReason = '';
    this.showCancelModal = true;
  }

  openChangeRoomModal(b: any): void {
    this.changeRoomBookingId = b.id;
    this.changeRoomCurrentRoom = b.Room;
    this.newRoomId = '';
    this.api.getRooms({ status: 'available' }).subscribe({ next: (data: any) => this.availableRooms = data });
    this.showChangeRoomModal = true;
  }

  submitChangeRoom(): void {
    if (!this.newRoomId) { this.toast.warning('Select Room', 'Please select a new room.'); return; }
    this.api.changeBookingRoom(this.changeRoomBookingId, +this.newRoomId).subscribe({
      next: (res: any) => { this.toast.success('Room Changed', res.message); this.showChangeRoomModal = false; this.loadBookings(); },
      error: (err: any) => this.toast.error('Change Failed', err.error?.message || 'Failed to change room.'),
    });
  }

  submitCancel(): void {
    this.api.cancelBooking(this.cancelBookingId, this.cancelReason).subscribe({
      next: (res: any) => { this.toast.success('Booking Cancelled', res.message); this.showCancelModal = false; this.loadBookings(); },
      error: (err: any) => this.toast.error('Cancellation Failed', err.error?.message || 'Cancellation failed.'),
    });
  }

  canView(): boolean {
    return this.permission.canView('bookings');
  }

  canCreate(): boolean {
    return this.permission.canCreate('bookings');
  }

  canEdit(): boolean {
    return this.permission.canEdit('bookings');
  }

  canDelete(): boolean {
    return this.permission.canDelete('bookings');
  }
}
