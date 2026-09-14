import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-restaurant',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './restaurant.component.html',
  styleUrls: ['./restaurant.component.css'],
})
export class RestaurantComponent implements OnInit {
  activeTab: 'restaurants' | 'menus' = 'restaurants';
  restaurants: any[] = [];
  menus: any[] = [];
  showRestaurantModal = false;
  showMenuModal = false;
  editingRestaurant = false;
  editingMenu = false;
  editingRestaurantId = 0;
  editingMenuId = 0;
  filterRestaurantId = '';
  restaurantForm: any = this.emptyRestaurantForm();
  menuForm: any = this.emptyMenuForm();
  selectedRestaurantImageFile: File | null = null;
  selectedMenuImageFile: File | null = null;
  uploadingRestaurantImage = false;
  uploadingMenuImage = false;
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  Math = Math;

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadRestaurants();
    this.loadMenus();
  }

  emptyRestaurantForm(): any {
    return { name: '', location: '', phone: '', email: '', openingTime: '', closingTime: '', description: '', isActive: true };
  }

  emptyMenuForm(): any {
    return { restaurantId: '', name: '', category: 'other', price: 0, imageUrl: '', description: '', isAvailable: true };
  }

  loadRestaurants(): void {
    this.api.getRestaurants().subscribe({
      next: (d: any) => {
        this.restaurants = d;
        this.totalPages = Math.ceil(this.restaurants.length / this.itemsPerPage);
        this.currentPage = 1;
      }
    });
  }

  loadMenus(): void {
    const params: any = {};
    if (this.filterRestaurantId) params.restaurantId = this.filterRestaurantId;
    this.api.getRestaurantMenus(params).subscribe({
      next: (d: any) => {
        this.menus = d;
        this.totalPages = Math.ceil(this.menus.length / this.itemsPerPage);
        this.currentPage = 1;
      }
    });
  }

  get paginatedRestaurants(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.restaurants.slice(start, end);
  }

  get paginatedMenus(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.menus.slice(start, end);
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

  openRestaurantModal(): void {
    this.editingRestaurant = false;
    this.restaurantForm = this.emptyRestaurantForm();
    this.selectedRestaurantImageFile = null;
    this.showRestaurantModal = true;
  }

  editRestaurant(item: any): void {
    this.editingRestaurant = true;
    this.editingRestaurantId = item.id;
    this.restaurantForm = { ...item };
    this.selectedRestaurantImageFile = null;
    this.showRestaurantModal = true;
  }

  onRestaurantImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.toast.warning('Invalid File', 'Please select an image file.');
      input.value = '';
      return;
    }
    this.selectedRestaurantImageFile = file;
    const reader = new FileReader();
    reader.onload = () => this.restaurantForm.imageUrl = reader.result as string;
    reader.readAsDataURL(file);
  }

  uploadSelectedRestaurantImage(): Promise<string | null> {
    return new Promise((resolve) => {
      if (!this.selectedRestaurantImageFile || !this.restaurantForm.imageUrl?.startsWith('data:image/')) {
        resolve(null);
        return;
      }
      this.uploadingRestaurantImage = true;
      this.api.uploadRestaurantImage({ fileName: this.selectedRestaurantImageFile.name, dataUrl: this.restaurantForm.imageUrl }).subscribe({
        next: (res: any) => { this.uploadingRestaurantImage = false; resolve(res.url); },
        error: (err: any) => {
          this.uploadingRestaurantImage = false;
          this.toast.error('Upload Failed', err.error?.message || 'Image upload failed');
          resolve(null);
        },
      });
    });
  }

  async saveRestaurant(): Promise<void> {
    const uploadedUrl = await this.uploadSelectedRestaurantImage();
    const payload = { ...this.restaurantForm, imageUrl: uploadedUrl || this.restaurantForm.imageUrl };
    const obs = this.editingRestaurant
      ? this.api.updateRestaurant(this.editingRestaurantId, payload)
      : this.api.createRestaurant(payload);
    obs.subscribe({
      next: () => { this.showRestaurantModal = false; this.selectedRestaurantImageFile = null; this.loadRestaurants(); this.toast.success('Saved', 'Restaurant saved successfully.'); },
      error: (err: any) => this.toast.error('Save Failed', err.error?.message || 'Error saving restaurant'),
    });
  }

  deleteRestaurant(id: number): void {
    if (confirm('Delete this restaurant?')) {
      this.api.deleteRestaurant(id).subscribe({ next: () => { this.loadRestaurants(); this.loadMenus(); } });
    }
  }

  openMenuModal(): void {
    this.editingMenu = false;
    this.menuForm = this.emptyMenuForm();
    this.selectedMenuImageFile = null;
    if (this.restaurants.length === 1) this.menuForm.restaurantId = this.restaurants[0].id;
    this.showMenuModal = true;
  }

  editMenu(item: any): void {
    this.editingMenu = true;
    this.editingMenuId = item.id;
    this.menuForm = { ...item };
    this.selectedMenuImageFile = null;
    this.showMenuModal = true;
  }

  onMenuImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.toast.warning('Invalid File', 'Please select an image file.');
      input.value = '';
      return;
    }
    this.selectedMenuImageFile = file;
    const reader = new FileReader();
    reader.onload = () => this.menuForm.imageUrl = reader.result as string;
    reader.readAsDataURL(file);
  }

  uploadSelectedMenuImage(): Promise<string | null> {
    return new Promise((resolve) => {
      if (!this.selectedMenuImageFile || !this.menuForm.imageUrl?.startsWith('data:image/')) {
        resolve(null);
        return;
      }
      this.uploadingMenuImage = true;
      this.api.uploadRestaurantMenuImage({ fileName: this.selectedMenuImageFile.name, dataUrl: this.menuForm.imageUrl }).subscribe({
        next: (res: any) => { this.uploadingMenuImage = false; resolve(res.url); },
        error: (err: any) => {
          this.uploadingMenuImage = false;
          this.toast.error('Upload Failed', err.error?.message || 'Image upload failed');
          resolve(null);
        },
      });
    });
  }

  async saveMenu(): Promise<void> {
    const uploadedUrl = await this.uploadSelectedMenuImage();
    const payload = { ...this.menuForm, imageUrl: uploadedUrl || this.menuForm.imageUrl };
    const obs = this.editingMenu
      ? this.api.updateRestaurantMenu(this.editingMenuId, payload)
      : this.api.createRestaurantMenu(payload);
    obs.subscribe({
      next: () => { this.showMenuModal = false; this.selectedMenuImageFile = null; this.loadMenus(); this.toast.success('Saved', 'Menu item saved successfully.'); },
      error: (err: any) => this.toast.error('Save Failed', err.error?.message || 'Error saving menu item'),
    });
  }

  deleteMenu(id: number): void {
    if (confirm('Delete this menu item?')) {
      this.api.deleteRestaurantMenu(id).subscribe({ next: () => this.loadMenus() });
    }
  }

  restaurantName(id: number): string {
    return this.restaurants.find(r => r.id === id)?.name || '-';
  }

  imageUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('/uploads')) return `http://localhost:5000${url}`;
    return url;
  }
}
