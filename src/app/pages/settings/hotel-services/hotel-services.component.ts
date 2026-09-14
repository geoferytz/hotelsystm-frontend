import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';
import { SharedTableAction, SharedTableColumn, SharedTableComponent } from '../../../shared';

@Component({
  selector: 'app-hotel-services',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedTableComponent],
  templateUrl: './hotel-services.component.html',
  styleUrls: ['./hotel-services.component.css'],
})
export class HotelServicesComponent implements OnInit {
  // Category to icon mapping
  categoryIcons: { [key: string]: string } = {
    amenity: 'bi-star',
    transport: 'bi-car-front',
    spa: 'bi-droplet',
    laundry: 'bi-basket',
    event: 'bi-calendar-event',
    other: 'bi-three-dots'
  };

  items: any[] = [];
  showModal = false;
  editing = false;
  editingId = 0;
  filterCategory = '';
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  form: any = this.emptyForm();
  selectedImageFile: File | null = null;
  uploadingImage = false;
  Math = Math;

  serviceColumns: SharedTableColumn[] = [];

  @ViewChild('serviceImageTemplate', { static: true }) serviceImageTemplate!: TemplateRef<any>;

  serviceActions: SharedTableAction[] = [
    { action: 'edit', label: 'Edit', icon: 'bi-pencil', class: 'btn-outline-primary' },
    { action: 'delete', label: 'Delete', icon: 'bi-trash', class: 'btn-outline-danger' },
  ];

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void {
    this.serviceColumns = [
      { key: 'imageUrl', label: 'Image', sortable: false, type: 'template', template: this.serviceImageTemplate },
      { key: 'icon', label: 'Icon', sortable: false, formatter: (s) => `<i class="bi ${s.icon || 'bi-star'}"></i>` },
      { key: 'name', label: 'Name', sortable: true },
      { key: 'category', label: 'Category', sortable: true, formatter: (s) => `<span class="badge bg-primary text-capitalize">${s.category}</span>` },
      { key: 'price', label: 'Price', sortable: true, align: 'end', formatter: (s) => `${Number(s.price || 0).toLocaleString()} Tsh` },
      { key: 'description', label: 'Description', sortable: true, formatter: (s) => s.description || '-' },
      { key: 'isActive', label: 'Status', type: 'status', sortable: true, statusClass: (isActive) => isActive ? 'success' : 'secondary', formatter: (s) => s.isActive ? 'Active' : 'Inactive' },
    ];
    this.load();
  }

  emptyForm(): any {
    return { name: '', category: 'amenity', price: 0, icon: this.categoryIcons['amenity'], imageUrl: '', description: '', isActive: true };
  }

  load(): void {
    const params: any = {};
    if (this.filterCategory) params.category = this.filterCategory;
    this.api.getHotelServices(params).subscribe({ 
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

  onServiceTableAction(event: { action: string; row: any }): void {
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
    this.selectedImageFile = null;
    this.showModal = true;
  }

  editItem(s: any): void {
    this.editing = true;
    this.editingId = s.id;
    this.form = { ...s };
    this.selectedImageFile = null;
    this.showModal = true;
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.toast.warning('Invalid File', 'Please select an image file.');
      input.value = '';
      return;
    }
    this.selectedImageFile = file;
    const reader = new FileReader();
    reader.onload = () => this.form.imageUrl = reader.result as string;
    reader.readAsDataURL(file);
  }

  uploadSelectedImage(): Promise<string | null> {
    return new Promise((resolve) => {
      if (!this.selectedImageFile || !this.form.imageUrl?.startsWith('data:image/')) {
        resolve(null);
        return;
      }

      this.uploadingImage = true;
      this.api.uploadHotelServiceImage({ fileName: this.selectedImageFile.name, dataUrl: this.form.imageUrl }).subscribe({
        next: (res: any) => {
          this.uploadingImage = false;
          resolve(res.url);
        },
        error: (err: any) => {
          this.uploadingImage = false;
          this.toast.error('Upload Failed', err.error?.message || 'Image upload failed');
          resolve(null);
        },
      });
    });
  }

  async save(): Promise<void> {
    const uploadedUrl = await this.uploadSelectedImage();
    const payload = { ...this.form, imageUrl: uploadedUrl || this.form.imageUrl };
    const obs = this.editing
      ? this.api.updateHotelService(this.editingId, payload)
      : this.api.createHotelService(payload);
    obs.subscribe({
      next: () => { this.showModal = false; this.selectedImageFile = null; this.load(); this.toast.success('Saved', 'Service saved successfully.'); },
      error: (err: any) => this.toast.error('Save Failed', err.error?.message || 'Error saving service'),
    });
  }

  deleteItem(id: number): void {
    if (confirm('Delete this service?')) {
      this.api.deleteHotelService(id).subscribe({ next: () => this.load() });
    }
  }

  onCategoryChange(): void {
    // Auto-assign icon based on category
    if (this.form.category && this.categoryIcons[this.form.category]) {
      this.form.icon = this.categoryIcons[this.form.category];
      console.log('Category changed to:', this.form.category, 'Icon set to:', this.form.icon);
    }
  }
}
