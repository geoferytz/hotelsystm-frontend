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
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ConfirmDialogComponent, SharedTableComponent],
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css'],
})
export class InventoryComponent implements OnInit {
  items: any[] = [];
  categories: any[] = [];
  stockSummary: any[] = [];
  activeTab = 'items';
  showModal = false;
  showCategoryModal = false;
  showStockModal = false;
  editing = false;
  editingId = 0;
  filterCategory = '';
  filterLowStock = false;
  currentPage = 1;
  itemsPerPage = 10;
  form: any = { name: '', sku: '', description: '', unit: 'piece', minStockLevel: 10, maxStockLevel: 100, unitPrice: 0, reorderPoint: 5, categoryId: null };
  categoryForm: any = { name: '', description: '' };
  stockForm: any = { itemId: null, quantity: 0, movementType: 'in', reference: '', notes: '' };
  showConfirmDialog = false;
  deleteItemId: number | null = null;
  deleteCategoryId: number | null = null;
  Math = Math;

  inventoryColumns: SharedTableColumn[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'sku', label: 'SKU', sortable: true, formatter: (item) => item.sku || '-' },
    { key: 'Category.name', label: 'Category', sortable: true, formatter: (item) => item.Category?.name || '-' },
    { key: 'unit', label: 'Unit', sortable: true },
    { key: 'unitPrice', label: 'Price', type: 'currency', align: 'end', sortable: true, formatter: (item) => `$${item.unitPrice}` },
    { key: 'minStockLevel', label: 'Min Stock', sortable: true },
    { key: 'maxStockLevel', label: 'Max Stock', sortable: true, formatter: (item) => item.maxStockLevel || '-' },
  ];

  inventoryActions: SharedTableAction[] = [
    { action: 'edit', label: 'Edit', icon: 'bi-pencil', class: 'btn-outline-primary', visible: () => this.canEdit() },
    { action: 'delete', label: 'Delete', icon: 'bi-trash', class: 'btn-outline-danger', visible: () => this.canDelete() },
  ];

  constructor(private api: ApiService, private toast: ToastService, private permission: PermissionService) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadItems();
    this.loadStockSummary();
  }

  loadCategories(): void {
    this.api.getInventoryCategories().subscribe({
      next: (data: any) => {
        this.categories = data;
      },
    });
  }

  loadItems(): void {
    const params: any = {};
    if (this.filterCategory) params.categoryId = this.filterCategory;
    if (this.filterLowStock) params.lowStock = true;
    
    this.api.getInventoryItems(params).subscribe({
      next: (data: any) => {
        this.items = data;
        this.currentPage = 1;
      },
    });
  }

  loadStockSummary(): void {
    this.api.getInventoryStockSummary().subscribe({
      next: (data: any) => {
        this.stockSummary = data;
      },
    });
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  onInventoryTableAction(event: { action: string; row: any }): void {
    if (event.action === 'edit') this.editItem(event.row);
    if (event.action === 'delete') this.deleteItem(event.row.id);
  }

  openModal(): void {
    this.editing = false;
    this.form = { name: '', sku: '', description: '', unit: 'piece', minStockLevel: 10, maxStockLevel: 100, unitPrice: 0, reorderPoint: 5, categoryId: null };
    this.showModal = true;
  }

  editItem(item: any): void {
    this.editing = true;
    this.editingId = item.id;
    this.form = { ...item };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveItem(): void {
    if (this.editing) {
      this.api.updateInventoryItem(this.editingId, this.form).subscribe({
        next: () => { this.closeModal(); this.loadItems(); this.loadStockSummary(); this.toast.success('Updated', 'Item updated successfully'); },
        error: (err: any) => this.toast.error('Save Failed', err.error?.message || 'Error saving item'),
      });
    } else {
      this.api.createInventoryItem(this.form).subscribe({
        next: () => { this.closeModal(); this.loadItems(); this.loadStockSummary(); this.toast.success('Created', 'Item created successfully'); },
        error: (err: any) => this.toast.error('Save Failed', err.error?.message || 'Error creating item'),
      });
    }
  }

  deleteItem(id: number): void {
    this.deleteItemId = id;
    this.showConfirmDialog = true;
  }

  onConfirmDelete(): void {
    if (this.deleteItemId) {
      this.api.deleteInventoryItem(this.deleteItemId).subscribe({ 
        next: () => { this.loadItems(); this.loadStockSummary(); this.showConfirmDialog = false; this.deleteItemId = null; this.toast.success('Deleted', 'Item deleted successfully'); },
        error: (err: any) => this.toast.error('Delete Failed', err.error?.message || 'Error deleting item')
      });
    }
  }

  onCancelDelete(): void {
    this.showConfirmDialog = false;
    this.deleteItemId = null;
  }

  // Category methods
  openCategoryModal(): void {
    this.categoryForm = { name: '', description: '' };
    this.showCategoryModal = true;
  }

  saveCategory(): void {
    this.api.createInventoryCategory(this.categoryForm).subscribe({
      next: () => { this.showCategoryModal = false; this.loadCategories(); this.toast.success('Created', 'Category created successfully'); },
      error: (err: any) => this.toast.error('Save Failed', err.error?.message || 'Error creating category'),
    });
  }

  deleteCategory(id: number): void {
    this.deleteCategoryId = id;
    this.showConfirmDialog = true;
  }

  onConfirmDeleteCategory(): void {
    if (this.deleteCategoryId) {
      this.api.deleteInventoryCategory(this.deleteCategoryId).subscribe({ 
        next: () => { this.loadCategories(); this.showConfirmDialog = false; this.deleteCategoryId = null; this.toast.success('Deleted', 'Category deleted successfully'); },
        error: (err: any) => this.toast.error('Delete Failed', err.error?.message || 'Error deleting category')
      });
    }
  }

  // Stock movement methods
  openStockModal(item: any): void {
    this.stockForm = { itemId: item.id, quantity: 0, movementType: 'in', reference: '', notes: '' };
    this.showStockModal = true;
  }

  saveStockMovement(): void {
    this.api.createInventoryStockMovement(this.stockForm).subscribe({
      next: () => { this.showStockModal = false; this.loadStockSummary(); this.toast.success('Recorded', 'Stock movement recorded successfully'); },
      error: (err: any) => this.toast.error('Save Failed', err.error?.message || 'Error recording stock movement'),
    });
  }

  getStockStatus(item: any): string {
    if (!item.currentStock) return 'unknown';
    if (item.currentStock <= item.minStockLevel) return 'low';
    if (item.maxStockLevel && item.currentStock >= item.maxStockLevel) return 'overstock';
    return 'normal';
  }

  getStockStatusClass(status: string): string {
    switch (status) {
      case 'low': return 'badge bg-danger';
      case 'overstock': return 'badge bg-warning';
      case 'normal': return 'badge bg-success';
      default: return 'badge bg-secondary';
    }
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
