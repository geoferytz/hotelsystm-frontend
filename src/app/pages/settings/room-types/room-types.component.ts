import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';
import { SharedTableAction, SharedTableColumn, SharedTableComponent } from '../../../shared';

@Component({
  selector: 'app-room-types',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedTableComponent],
  templateUrl: './room-types.component.html',
  styleUrls: ['./room-types.component.css'],
})
export class RoomTypesComponent implements OnInit {
  items: any[] = [];
  showModal = false;
  editing = false;
  editingId = 0;
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  form: any = this.emptyForm();
  Math = Math;

  roomTypeColumns: SharedTableColumn[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'basePrice', label: 'Base Price', sortable: true, align: 'end', formatter: (r) => `${Number(r.basePrice || 0).toLocaleString()} Tsh` },
    { key: 'maxOccupancy', label: 'Max Occupancy', sortable: true, formatter: (r) => `${r.maxOccupancy} guests` },
    { key: 'amenities', label: 'Amenities', sortable: true, formatter: (r) => r.amenities || '-' },
    { key: 'isActive', label: 'Status', type: 'status', sortable: true, statusClass: (isActive) => isActive ? 'success' : 'secondary', formatter: (r) => r.isActive ? 'Active' : 'Inactive' },
  ];

  roomTypeActions: SharedTableAction[] = [
    { action: 'edit', label: 'Edit', icon: 'bi-pencil', class: 'btn-outline-primary' },
    { action: 'delete', label: 'Delete', icon: 'bi-trash', class: 'btn-outline-danger' },
  ];

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void { this.load(); }

  emptyForm(): any {
    return { name: '', basePrice: 0, maxOccupancy: 2, amenities: '', description: '', isActive: true };
  }

  load(): void {
    this.api.getRoomTypes().subscribe({ 
      next: (d: any) => {
        this.items = d;
        this.totalPages = Math.ceil(this.items.length / this.itemsPerPage);
        this.currentPage = 1;
      }
    });
  }

  get paginatedItems(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.items.slice(start, end);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onRoomTypeTableAction(event: { action: string; row: any }): void {
    if (event.action === 'edit') this.editItem(event.row);
    if (event.action === 'delete') this.deleteItem(event.row.id);
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

  editItem(r: any): void {
    this.editing = true;
    this.editingId = r.id;
    this.form = { ...r };
    this.showModal = true;
  }

  save(): void {
    const obs = this.editing
      ? this.api.updateRoomType(this.editingId, this.form)
      : this.api.createRoomType(this.form);
    obs.subscribe({
      next: () => { this.showModal = false; this.load(); this.toast.success('Saved', 'Room type saved successfully.'); },
      error: (err: any) => this.toast.error('Save Failed', err.error?.message || 'Error saving room type'),
    });
  }

  deleteItem(id: number): void {
    if (confirm('Delete this room type?')) {
      this.api.deleteRoomType(id).subscribe({ next: () => this.load() });
    }
  }
}
