import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { SharedTableAction, SharedTableColumn, SharedTableComponent } from '../../shared';

@Component({
  selector: 'app-drink-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SharedTableComponent],
  templateUrl: './drink-requests.component.html',
  styleUrls: ['./drink-requests.component.css']
})
export class DrinkRequestsComponent implements OnInit {
  requests: any[] = [];
  allRequests: any[] = [];
  rooms: any[] = [];
  filterStatus = '';
  filterRoom = '';
  showForm = false;

  currentPage = 1;
  itemsPerPage = 10;
  totalRequests = 0;
  
  form = {
    roomId: null,
    guestName: '',
    items: [{ name: '', price: 0, quantity: 1 }],
    notes: ''
  };

  requestColumns: SharedTableColumn[] = [
    { key: 'Room.roomNumber', label: 'Room', sortable: true, formatter: (r) => r.Room?.roomNumber || '-' },
    { key: 'guestName', label: 'Guest Name', sortable: true },
    { key: 'items', label: 'Items', formatter: (r) => (r.items || []).map((item: any) => `${item.name} x ${item.quantity}`).join(', ') || '-' },
    { key: 'totalAmount', label: 'Total Amount', type: 'currency', sortable: true, align: 'end', formatter: (r) => `${Number(r.totalAmount || 0).toLocaleString()} Tsh` },
    { key: 'status', label: 'Status', type: 'status', sortable: true, statusClass: (value) => this.getStatusTableClass(value) },
    { key: 'requestedBy', label: 'Requested By', sortable: true, formatter: (r) => r.requestedBy || '-' },
  ];

  requestActions: SharedTableAction[] = [
    { action: 'delivered', label: 'Mark as Delivered', icon: 'bi-check', class: 'btn-outline-success', visible: (r) => r.status === 'preparing' },
    { action: 'preparing', label: 'Mark as Preparing', icon: 'bi-clock', class: 'btn-outline-warning', visible: (r) => r.status === 'pending' },
    { action: 'cancelled', label: 'Cancel Request', icon: 'bi-x', class: 'btn-outline-danger', visible: (r) => r.status === 'pending' },
  ];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadRequests();
    this.loadRooms();
  }

  loadRequests(): void {
    this.api.getDrinkRequests().subscribe({
      next: (data: any) => {
        this.allRequests = data;
        this.applyFilters();
      },
      error: (err: any) => console.error('Error loading drink requests:', err)
    });
  }

  loadRooms(): void {
    this.api.getRooms().subscribe({
      next: (data: any) => {
        this.rooms = data;
      },
      error: (err: any) => console.error('Error loading rooms:', err)
    });
  }

  applyFilters(): void {
    let filtered = this.allRequests;

    if (this.filterStatus) {
      filtered = filtered.filter(r => r.status === this.filterStatus);
    }

    if (this.filterRoom) {
      filtered = filtered.filter(r => r.roomId === +this.filterRoom);
    }

    this.requests = filtered;
    this.totalRequests = filtered.length;
    this.currentPage = 1;
  }

  get paginatedRequests(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.requests.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.totalRequests / this.itemsPerPage);
  }

  getPages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
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

  goToPage(page: number): void {
    this.currentPage = page;
  }

  onRequestTableAction(event: { action: string; row: any }): void {
    this.updateStatus(event.row.id, event.action);
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  getEndIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalRequests);
  }

  openForm(): void {
    this.showForm = true;
    this.form = {
      roomId: null,
      guestName: '',
      items: [{ name: '', price: 0, quantity: 1 }],
      notes: ''
    };
  }

  closeForm(): void {
    this.showForm = false;
  }

  addItem(): void {
    this.form.items.push({ name: '', price: 0, quantity: 1 });
  }

  removeItem(index: number): void {
    this.form.items.splice(index, 1);
  }

  calculateTotal(): number {
    return this.form.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  submitRequest(): void {
    const request = {
      ...this.form,
      totalAmount: this.calculateTotal()
    };

    this.api.createDrinkRequest(request).subscribe({
      next: () => {
        this.closeForm();
        this.loadRequests();
      },
      error: (err: any) => console.error('Error creating drink request:', err)
    });
  }

  updateStatus(id: number, status: string): void {
    this.api.updateDrinkRequestStatus(id, { status }).subscribe({
      next: () => this.loadRequests(),
      error: (err: any) => console.error('Error updating status:', err)
    });
  }

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      pending: 'bg-warning',
      preparing: 'bg-info',
      delivered: 'bg-success',
      cancelled: 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }

  getStatusTableClass(status: string): string {
    const classes: Record<string, string> = {
      pending: 'warning',
      preparing: 'info',
      delivered: 'success',
      cancelled: 'danger'
    };
    return classes[status] || 'secondary';
  }
}
