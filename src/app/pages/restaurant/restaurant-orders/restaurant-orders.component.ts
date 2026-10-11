import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-restaurant-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './restaurant-orders.component.html',
  styleUrls: ['./restaurant-orders.component.css'],
})
export class RestaurantOrdersComponent implements OnInit {
  orders: any[] = [];
  loading = true;
  error = '';
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  Math = Math;

  openMenuRow: any = null;
  menuStyle: { [key: string]: string } = {};

  toggleMenu(key: any, itemCount: number, event: Event): void {
    event.stopPropagation();
    if (this.openMenuRow === key) {
      this.openMenuRow = null;
      return;
    }
    const btn = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const menuHeight = 40 * itemCount + 16;
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
    this.openMenuRow = key;
  }

  @HostListener('document:click')
  closeMenu(): void {
    this.openMenuRow = null;
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (this.openMenuRow) this.openMenuRow = null;
  }

  // Form state
  showForm = false;
  formSubmitted = false;
  orderForm = {
    restaurantId: 1,
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    orderDate: '',
    orderTime: '',
    orderType: 'dine_in' as 'dine_in' | 'takeaway' | 'delivery',
    items: [] as any[],
    totalAmount: 0,
    specialRequests: ''
  };

  constructor(
    private api: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.api.getRestaurantMenuOrders().subscribe({
      next: (data: any[]) => {
        this.orders = data;
        this.totalPages = Math.ceil(this.orders.length / this.itemsPerPage);
        this.currentPage = 1;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load menu orders.';
        this.loading = false;
      },
    });
  }

  get paginatedOrders(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.orders.slice(start, end);
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

  updateStatus(orderId: number, status: string): void {
    this.api.updateRestaurantMenuOrderStatus(orderId, status).subscribe({
      next: () => {
        this.toast.success('Success', 'Order status updated successfully!');
        this.loadOrders();
      },
      error: (err: any) => {
        this.toast.error('Error', err.error?.message || 'Failed to update status');
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    const classes: Record<string, string> = {
      pending: 'bg-warning',
      confirmed: 'bg-success',
      preparing: 'bg-info',
      ready: 'bg-primary',
      completed: 'bg-secondary',
      cancelled: 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
  }

  getOrderTypeLabel(orderType: string): string {
    const labels: Record<string, string> = {
      dine_in: 'Dine In',
      takeaway: 'Takeaway',
      delivery: 'Delivery'
    };
    return labels[orderType] || orderType;
  }

  formatItems(items: any[]): string {
    if (!items || items.length === 0) return '-';
    return items.map((item: any) => `${item.name} x${item.quantity}`).join(', ');
  }

  openForm(): void {
    this.showForm = true;
    this.formSubmitted = false;
  }

  closeForm(): void {
    this.showForm = false;
    this.resetForm();
  }

  resetForm(): void {
    this.orderForm = {
      restaurantId: 1,
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      orderDate: '',
      orderTime: '',
      orderType: 'dine_in',
      items: [],
      totalAmount: 0,
      specialRequests: ''
    };
    this.formSubmitted = false;
  }

  submitForm(): void {
    this.formSubmitted = true;
    if (!this.orderForm.guestName || !this.orderForm.guestPhone ||
        !this.orderForm.orderDate || !this.orderForm.orderTime) {
      return;
    }
    this.api.adminCreateRestaurantMenuOrder(this.orderForm).subscribe({
      next: () => {
        this.toast.success('Success', 'Menu order created successfully!');
        this.closeForm();
        this.loadOrders();
      },
      error: (err: any) => {
        this.toast.error('Error', err.error?.message || 'Failed to create order');
      }
    });
  }
}
