import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './restaurant-detail.component.html',
  styleUrls: ['./restaurant-detail.component.css'],
})
export class RestaurantDetailComponent implements OnInit {
  restaurant: any = null;
  menuItems: any[] = [];
  menuCategories: string[] = [];
  loading = true;
  error = '';

  // Table booking form
  showTableBookingForm = false;
  tableBookingForm = {
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    numberOfGuests: 2,
    bookingDate: '',
    bookingTime: '',
    specialRequests: ''
  };

  // Menu order form
  showMenuOrderForm = false;
  menuOrderForm = {
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
  selectedMenuItems: Set<number> = new Set();

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadRestaurant(id);
      this.loadRestaurantMenus(id);
    } else {
      this.error = 'Invalid restaurant ID.';
      this.loading = false;
    }
  }

  loadRestaurant(id: number): void {
    this.api.getGuestRestaurant(id).subscribe({
      next: (data: any) => {
        this.restaurant = data;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load restaurant details.';
        this.loading = false;
      },
    });
  }

  loadRestaurantMenus(id: number): void {
    this.api.getGuestRestaurantMenus(id).subscribe({
      next: (data: any[]) => {
        this.menuItems = data;
        this.menuCategories = [...new Set(data.map(item => item.category))];
      },
      error: () => this.menuItems = [],
    });
  }

  getMenuItemsByCategory(category: string): any[] {
    return this.menuItems.filter(item => item.category === category);
  }

  getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
      breakfast: 'Breakfast',
      lunch: 'Lunch',
      dinner: 'Dinner',
      drink: 'Drinks',
      dessert: 'Desserts',
      snack: 'Snacks',
      other: 'Others',
    };
    return labels[category] || category;
  }

  imageUrl(url: string | undefined): string {
    if (!url) return '';
    let normalized = url.replace(/\\/g, '/');
    if (normalized.startsWith('/uploads')) return `http://localhost:5000${normalized}`;
    if (!normalized.startsWith('/') && !normalized.startsWith('http')) {
      normalized = '/' + normalized;
    }
    return normalized;
  }

  toggleMenuItemSelection(itemId: number): void {
    if (this.selectedMenuItems.has(itemId)) {
      this.selectedMenuItems.delete(itemId);
    } else {
      this.selectedMenuItems.add(itemId);
    }
    this.updateOrderTotal();
  }

  isMenuItemSelected(itemId: number): boolean {
    return this.selectedMenuItems.has(itemId);
  }

  updateOrderTotal(): void {
    this.menuOrderForm.items = this.menuItems
      .filter(item => this.selectedMenuItems.has(item.id))
      .map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1
      }));
    this.menuOrderForm.totalAmount = this.menuOrderForm.items.reduce(
      (sum, item) => sum + (item.price * item.quantity),
      0
    );
  }

  submitTableBooking(): void {
    const bookingData = {
      ...this.tableBookingForm,
      restaurantId: this.restaurant.id
    };
    this.api.createRestaurantTableBooking(bookingData).subscribe({
      next: () => {
        this.toast.success('Success', 'Table booking submitted successfully!');
        this.showTableBookingForm = false;
        this.resetTableBookingForm();
      },
      error: (err: any) => {
        this.toast.error('Error', err.error?.message || 'Failed to submit booking');
      }
    });
  }

  submitMenuOrder(): void {
    if (this.menuOrderForm.items.length === 0) {
      this.toast.warning('Warning', 'Please select at least one menu item');
      return;
    }
    const orderData = {
      ...this.menuOrderForm,
      restaurantId: this.restaurant.id
    };
    this.api.createRestaurantMenuOrder(orderData).subscribe({
      next: () => {
        this.toast.success('Success', 'Menu order submitted successfully!');
        this.showMenuOrderForm = false;
        this.resetMenuOrderForm();
      },
      error: (err: any) => {
        this.toast.error('Error', err.error?.message || 'Failed to submit order');
      }
    });
  }

  resetTableBookingForm(): void {
    this.tableBookingForm = {
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      numberOfGuests: 2,
      bookingDate: '',
      bookingTime: '',
      specialRequests: ''
    };
  }

  resetMenuOrderForm(): void {
    this.menuOrderForm = {
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
    this.selectedMenuItems.clear();
  }
}
