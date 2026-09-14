import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';
import { SharedTableAction, SharedTableColumn, SharedTableComponent } from '../../../shared';

@Component({
  selector: 'app-meals',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedTableComponent],
  templateUrl: './meals.component.html',
  styleUrls: ['./meals.component.css'],
})
export class MealsComponent implements OnInit {
  items: any[] = [];
  hotels: any[] = [];
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

  mealColumns: SharedTableColumn[] = [];

  @ViewChild('mealImageTemplate', { static: true }) mealImageTemplate!: TemplateRef<any>;

  mealActions: SharedTableAction[] = [
    { action: 'edit', label: 'Edit', icon: 'bi-pencil', class: 'btn-outline-primary' },
    { action: 'delete', label: 'Delete', icon: 'bi-trash', class: 'btn-outline-danger' },
  ];

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void {
    this.mealColumns = [
      { key: 'imageUrl', label: 'Image', sortable: false, type: 'template', template: this.mealImageTemplate },
      { key: 'name', label: 'Name', sortable: true },
      { key: 'Hotel.name', label: 'Hotel', sortable: true, formatter: (m) => m.Hotel?.name || this.getHotelName(m.hotelId) },
      { key: 'category', label: 'Category', sortable: true, formatter: (m) => `<span class="badge bg-info text-dark text-capitalize">${m.category}</span>` },
      { key: 'price', label: 'Price', sortable: true, align: 'end', formatter: (m) => `${Number(m.price || 0).toLocaleString()} Tsh` },
      { key: 'description', label: 'Description', sortable: true, formatter: (m) => m.description || '-' },
      { key: 'isAvailable', label: 'Status', type: 'status', sortable: true, statusClass: (isAvailable) => isAvailable ? 'success' : 'secondary', formatter: (m) => m.isAvailable ? 'Available' : 'Unavailable' },
    ];
    this.loadHotels();
    this.load();
  }

  emptyForm(): any {
    return {
      name: '',
      category: 'lunch',
      price: 0,
      description: '',
      isAvailable: true,
      hotelId: '',
      imageUrl: '',
      portionSize: '',
      preparationTime: null,
      calories: null,
      dietaryTagsText: '',
    };
  }

  loadHotels(): void {
    this.api.getMyHotels().subscribe({ next: (hotels: any[]) => this.hotels = hotels });
  }

  load(): void {
    const params: any = {};
    if (this.filterCategory) params.category = this.filterCategory;
    this.api.getMeals(params).subscribe({ 
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

  onMealTableAction(event: { action: string; row: any }): void {
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

  getHotelName(hotelId: number | null): string {
    if (!hotelId) return 'All Hotels';
    return this.hotels.find(hotel => hotel.id === hotelId)?.name || 'Unknown Hotel';
  }

  openModal(): void {
    this.editing = false;
    this.form = this.emptyForm();
    this.selectedImageFile = null;
    this.showModal = true;
  }

  editItem(m: any): void {
    this.editing = true;
    this.editingId = m.id;
    this.form = { ...m, dietaryTagsText: (m.dietaryTags || []).join(', ') };
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
      this.api.uploadMealImage({ fileName: this.selectedImageFile.name, dataUrl: this.form.imageUrl }).subscribe({
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
    const payload = {
      ...this.form,
      imageUrl: uploadedUrl || this.form.imageUrl,
      hotelId: this.form.hotelId ? Number(this.form.hotelId) : null,
      dietaryTags: this.form.dietaryTagsText
        ? this.form.dietaryTagsText.split(',').map((tag: string) => tag.trim()).filter(Boolean)
        : [],
    };
    delete payload.dietaryTagsText;

    const obs = this.editing
      ? this.api.updateMeal(this.editingId, payload)
      : this.api.createMeal(payload);
    obs.subscribe({
      next: () => { this.showModal = false; this.selectedImageFile = null; this.load(); this.toast.success('Saved', 'Meal saved successfully.'); },
      error: (err: any) => this.toast.error('Save Failed', err.error?.message || 'Error saving meal'),
    });
  }

  deleteItem(id: number): void {
    if (confirm('Delete this meal?')) {
      this.api.deleteMeal(id).subscribe({ next: () => this.load() });
    }
  }
}
