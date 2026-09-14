import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';
import { PermissionService } from '../../../services/permission.service';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';
import { SharedTableAction, SharedTableColumn, SharedTableComponent } from '../../../shared';

@Component({
  selector: 'app-inventory-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ConfirmDialogComponent, SharedTableComponent],
  templateUrl: './inventory-categories.component.html',
  styleUrls: ['./inventory-categories.component.css'],
})
export class InventoryCategoriesComponent implements OnInit {
  categories: any[] = [];
  showModal = false;
  editing = false;
  editingId = 0;
  currentPage = 1;
  itemsPerPage = 10;
  form: any = { name: '', description: '' };
  showConfirmDialog = false;
  deleteCategoryId: number | null = null;
  Math = Math;

  categoryColumns: SharedTableColumn[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'description', label: 'Description', sortable: true, formatter: (c) => c.description || '-' },
    { key: 'createdAt', label: 'Created At', sortable: true, formatter: (c) => new Date(c.createdAt).toLocaleDateString() },
  ];

  categoryActions: SharedTableAction[] = [
    { action: 'edit', label: 'Edit', icon: 'bi-pencil', class: 'btn-outline-primary', visible: () => this.canEdit() },
    { action: 'delete', label: 'Delete', icon: 'bi-trash', class: 'btn-outline-danger', visible: () => this.canDelete() },
  ];

  constructor(private api: ApiService, private toast: ToastService, private permission: PermissionService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.api.getInventoryCategories().subscribe({
      next: (data: any) => {
        this.categories = data;
        this.currentPage = 1;
      },
    });
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  onCategoryTableAction(event: { action: string; row: any }): void {
    if (event.action === 'edit') this.editCategory(event.row);
    if (event.action === 'delete') this.deleteCategory(event.row.id);
  }

  openModal(): void {
    this.editing = false;
    this.form = { name: '', description: '' };
    this.showModal = true;
  }

  editCategory(category: any): void {
    this.editing = true;
    this.editingId = category.id;
    this.form = { ...category };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveCategory(): void {
    if (this.editing) {
      this.api.updateInventoryCategory(this.editingId, this.form).subscribe({
        next: () => { this.closeModal(); this.loadCategories(); this.toast.success('Updated', 'Category updated successfully'); },
        error: (err: any) => this.toast.error('Save Failed', err.error?.message || 'Error saving category'),
      });
    } else {
      this.api.createInventoryCategory(this.form).subscribe({
        next: () => { this.closeModal(); this.loadCategories(); this.toast.success('Created', 'Category created successfully'); },
        error: (err: any) => this.toast.error('Save Failed', err.error?.message || 'Error creating category'),
      });
    }
  }

  deleteCategory(id: number): void {
    this.deleteCategoryId = id;
    this.showConfirmDialog = true;
  }

  onConfirmDelete(): void {
    if (this.deleteCategoryId) {
      this.api.deleteInventoryCategory(this.deleteCategoryId).subscribe({ 
        next: () => { this.loadCategories(); this.showConfirmDialog = false; this.deleteCategoryId = null; this.toast.success('Deleted', 'Category deleted successfully'); },
        error: (err: any) => this.toast.error('Delete Failed', err.error?.message || 'Error deleting category')
      });
    }
  }

  onCancelDelete(): void {
    this.showConfirmDialog = false;
    this.deleteCategoryId = null;
  }

  canView(): boolean {
    return this.permission.canView('inventory');
  }

  canCreate(): boolean {
    return this.permission.canCreate('inventory');
  }

  canEdit(): boolean {
    return this.permission.canEdit('inventory');
  }

  canDelete(): boolean {
    return this.permission.canDelete('inventory');
  }
}
