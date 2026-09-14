import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';
import { HotelService } from '../../../services/hotel.service';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-hotels',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ConfirmDialogComponent],
  templateUrl: './hotels.component.html',
  styleUrls: ['./hotels.component.css'],
})
export class HotelsComponent implements OnInit {
  hotels: any[] = [];
  showModal = false;
  editing = false;
  editingId = 0;
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  form: any = this.emptyForm();
  showConfirmDialog = false;
  deleteHotelId: number | null = null;
  Math = Math;

  constructor(
    private api: ApiService,
    private toast: ToastService,
    private hotelService: HotelService
  ) {}

  ngOnInit(): void { this.load(); }

  emptyForm(): any {
    return {
      name: '', address: '', city: '', country: 'Tanzania',
      phone: '', email: '', description: '', starRating: 3,
      checkInTime: '14:00', checkOutTime: '11:00', isActive: true,
      imageUrl: '',
    };
  }

  load(): void {
    this.api.getMyHotels().subscribe({
      next: (data: any) => {
        this.hotels = data;
        this.totalPages = Math.ceil(this.hotels.length / this.itemsPerPage);
        this.currentPage = 1;
      },
    });
  }

  get paginatedHotels(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.hotels.slice(start, end);
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

  openModal(): void {
    this.editing = false;
    this.form = this.emptyForm();
    this.showModal = true;
  }

  editItem(h: any): void {
    this.editing = true;
    this.editingId = h.id;
    this.form = { ...h };
    this.showModal = true;
  }

  save(): void {
    // Normalize image path: convert backslashes to forward slashes and add leading slash if needed
    if (this.form.imageUrl) {
      this.form.imageUrl = this.form.imageUrl.replace(/\\/g, '/');
      if (!this.form.imageUrl.startsWith('/')) {
        this.form.imageUrl = '/' + this.form.imageUrl;
      }
    }
    
    const obs = this.editing
      ? this.api.updateHotel(this.editingId, this.form)
      : this.api.createHotel(this.form);
    obs.subscribe({
      next: () => {
        this.showModal = false;
        this.load();
        this.toast.success('Saved', 'Hotel saved successfully.');
        // Refresh hotel list in the switcher
        this.api.getMyHotels().subscribe({ next: (hotels: any) => this.hotelService.setHotels(hotels) });
      },
      error: (err: any) => this.toast.error('Error', err.error?.message || 'Failed to save hotel'),
    });
  }

  deleteItem(id: number): void {
    this.deleteHotelId = id;
    this.showConfirmDialog = true;
  }

  onConfirmDelete(): void {
    if (this.deleteHotelId) {
      this.api.deleteHotel(this.deleteHotelId).subscribe({
        next: () => {
          this.load();
          this.showConfirmDialog = false;
          this.deleteHotelId = null;
          this.toast.success('Deleted', 'Hotel removed.');
        },
        error: (err: any) => this.toast.error('Error', err.error?.message || 'Failed to delete'),
      });
    }
  }

  onCancelDelete(): void {
    this.showConfirmDialog = false;
    this.deleteHotelId = null;
  }
}
