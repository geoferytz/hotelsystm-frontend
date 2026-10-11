import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output, TemplateRef } from '@angular/core';
import { SharedPaginationComponent } from '../shared-pagination/shared-pagination.component';

export interface SharedTableColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'datetime' | 'currency' | 'status' | 'boolean' | 'template';
  sortable?: boolean;
  width?: string;
  align?: 'start' | 'center' | 'end';
  template?: TemplateRef<any>;
  formatter?: (row: any, value: any) => string;
  statusClass?: (value: any, row: any) => string;
}

export interface SharedTableAction {
  label: string;
  icon?: string;
  class?: string;
  visible?: (row: any) => boolean;
  disabled?: (row: any) => boolean;
  action: string;
}

@Component({
  selector: 'app-shared-table',
  standalone: true,
  imports: [CommonModule, SharedPaginationComponent],
  templateUrl: './shared-table.component.html',
  styleUrls: ['./shared-table.component.css'],
})
export class SharedTableComponent {
  @Input() columns: SharedTableColumn[] = [];
  @Input() data: any[] = [];
  @Input() actions: SharedTableAction[] = [];
  @Input() loading = false;
  @Input() emptyMessage = 'No records found';
  @Input() trackByKey = 'id';
  @Input() showPagination = true;
  @Input() currentPage = 1;
  @Input() itemsPerPage = 10;
  @Input() totalItems = 0;
  @Input() striped = false;
  @Input() hover = true;
  @Input() responsive = true;

  @Output() pageChange = new EventEmitter<number>();
  @Output() sortChange = new EventEmitter<{ key: string; direction: 'asc' | 'desc' }>();
  @Output() actionClick = new EventEmitter<{ action: string; row: any }>();
  @Output() rowClick = new EventEmitter<any>();

  sortKey = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  Math = Math;

  openMenuRow: any = null;
  menuStyle: { [key: string]: string } = {};

  get pagedData(): any[] {
    if (!this.showPagination || this.totalItems > this.data.length) {
      return this.data;
    }
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.data.slice(start, start + this.itemsPerPage);
  }

  get totalCount(): number {
    return this.totalItems || this.data.length;
  }

  trackByRow = (_: number, row: any): any => row?.[this.trackByKey] ?? row;

  getValue(row: any, key: string): any {
    return key.split('.').reduce((value, part) => value?.[part], row);
  }

  displayValue(row: any, column: SharedTableColumn): string {
    const value = this.getValue(row, column.key);
    if (column.formatter) return column.formatter(row, value);
    if (value === null || value === undefined || value === '') return '-';
    if (column.type === 'boolean') return value ? 'Yes' : 'No';
    if (column.type === 'currency') return Number(value).toLocaleString();
    if (column.type === 'date') return new Date(value).toLocaleDateString();
    if (column.type === 'datetime') return new Date(value).toLocaleString();
    return String(value);
  }

  statusClass(row: any, column: SharedTableColumn): string {
    const value = this.getValue(row, column.key);
    if (column.statusClass) return column.statusClass(value, row);
    const status = String(value || '').toLowerCase();
    if (['active', 'paid', 'approved', 'completed', 'available', 'success'].includes(status)) return 'success';
    if (['pending', 'scheduled', 'partial', 'warning'].includes(status)) return 'warning';
    if (['inactive', 'cancelled', 'rejected', 'failed', 'terminated', 'danger'].includes(status)) return 'danger';
    return 'secondary';
  }

  sort(column: SharedTableColumn): void {
    if (!column.sortable) return;
    this.sortDirection = this.sortKey === column.key && this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.sortKey = column.key;
    this.sortChange.emit({ key: column.key, direction: this.sortDirection });
  }

  goToPage(page: number): void {
    this.pageChange.emit(page);
  }

  triggerAction(action: SharedTableAction, row: any, event: Event): void {
    event.stopPropagation();
    this.actionClick.emit({ action: action.action, row });
  }

  isActionVisible(action: SharedTableAction, row: any): boolean {
    return action.visible ? action.visible(row) : true;
  }

  isActionDisabled(action: SharedTableAction, row: any): boolean {
    return action.disabled ? action.disabled(row) : false;
  }

  hasVisibleActions(row: any): boolean {
    return this.actions.some(a => this.isActionVisible(a, row));
  }

  menuItemClass(action: SharedTableAction): string {
    const c = action.class || '';
    if (c.includes('danger')) return 'item-danger';
    if (c.includes('warning')) return 'item-warning';
    if (c.includes('success')) return 'item-success';
    if (c.includes('info')) return 'item-info';
    return '';
  }

  toggleMenu(row: any, event: Event): void {
    event.stopPropagation();
    if (this.openMenuRow === row) {
      this.openMenuRow = null;
      return;
    }
    const btn = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const menuHeight = 40 * this.actions.length + 16;
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
    this.openMenuRow = row;
  }

  onMenuAction(action: SharedTableAction, row: any, event: Event): void {
    this.openMenuRow = null;
    this.triggerAction(action, row, event);
  }

  @HostListener('document:click')
  closeMenu(): void {
    this.openMenuRow = null;
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (this.openMenuRow) this.openMenuRow = null;
  }
}
