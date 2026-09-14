import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-guest-order',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './guest-order.component.html',
  styleUrls: ['./guest-order.component.css'],
})
export class GuestOrderComponent implements OnInit {
  rooms: any[] = [];
  restaurantMenu: any[] = [];
  filteredMenu: any[] = [];
  orders: any[] = [];
  selectedRoom: any = null;
  guestName: string = '';
  selectedItems: any[] = [];
  totalAmount: number = 0;
  hotelId: number = 0;
  activeTab: string = 'food';

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadRooms();
    this.loadRestaurantMenu();
    this.loadOrders();
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return 'assets/placeholder-food.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    // Remove /api from base URL for uploads (uploads are served from root, not /api)
    const baseUrl = this.api.getBaseUrl.replace('/api', '');
    return `${baseUrl}${imagePath}`;
  }

  loadRooms(): void {
    this.api.getRooms().subscribe({
      next: (data: any) => {
        this.rooms = data;
      },
      error: (err: any) => this.toast.error('Error', 'Failed to load rooms'),
    });
  }

  loadRestaurantMenu(): void {
    this.api.getRestaurants().subscribe({
      next: (data: any) => {
        // Flatten all menu items from all restaurants
        this.restaurantMenu = data.flatMap((restaurant: any) =>
          (restaurant.Menus || []).map((menu: any) => ({
            ...menu,
            restaurantName: restaurant.name
          }))
        ).filter((item: any) => item.isAvailable);
        this.filterMenu();
      },
      error: (err: any) => this.toast.error('Error', 'Failed to load restaurant menu'),
    });
  }

  filterMenu(): void {
    if (this.activeTab === 'food') {
      this.filteredMenu = this.restaurantMenu.filter((item: any) =>
        ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'other'].includes(item.category)
      );
    } else if (this.activeTab === 'drinks') {
      this.filteredMenu = this.restaurantMenu.filter((item: any) => item.category === 'drink');
    } else {
      this.filteredMenu = this.restaurantMenu;
    }
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
    this.filterMenu();
  }

  loadOrders(): void {
    this.api.getFoodRequests().subscribe({
      next: (data: any) => {
        this.orders = data;
      },
      error: (err: any) => this.toast.error('Error', 'Failed to load orders'),
    });
  }

  onRoomChange(): void {
    if (this.selectedRoom) {
      // Get guest name from room's active booking
      this.api.getBookings().subscribe({
        next: (bookings: any) => {
          const activeBooking = bookings.find((b: any) =>
            b.roomId === this.selectedRoom.id && b.status === 'checked-in'
          );
          if (activeBooking) {
            this.guestName = activeBooking.Customer?.fullName || '';
            this.hotelId = activeBooking.hotelId || this.selectedRoom.hotelId;
          } else {
            this.guestName = '';
            this.toast.warning('Warning', 'No active booking found for this room');
          }
        },
        error: (err: any) => this.toast.error('Error', 'Failed to load booking'),
      });
    }
  }

  addItem(item: any): void {
    const existingItem = this.selectedItems.find((i: any) => i.id === item.id);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.selectedItems.push({
        ...item,
        quantity: 1
      });
    }
    this.calculateTotal();
  }

  removeItem(index: number): void {
    this.selectedItems.splice(index, 1);
    this.calculateTotal();
  }

  updateQuantity(index: number, change: number): void {
    const item = this.selectedItems[index];
    item.quantity = Math.max(1, item.quantity + change);
    this.calculateTotal();
  }

  calculateTotal(): void {
    this.totalAmount = this.selectedItems.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
  }

  submitOrder(): void {
    if (!this.selectedRoom || !this.guestName) {
      this.toast.error('Error', 'Please select a room with an active booking');
      return;
    }

    if (this.selectedItems.length === 0) {
      this.toast.error('Error', 'Please select at least one item');
      return;
    }

    // Separate items into food and drinks
    const foodItems = this.selectedItems.filter((item: any) =>
      ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'other'].includes(item.category)
    );
    const drinkItems = this.selectedItems.filter((item: any) => item.category === 'drink');

    const requests = [];

    // Create food request if there are food items
    if (foodItems.length > 0) {
      const foodTotal = foodItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const foodOrderData = {
        roomId: this.selectedRoom.id,
        guestName: this.guestName,
        items: foodItems.map((item: any) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalAmount: foodTotal,
        notes: `Food order from room ${this.selectedRoom.roomNumber}`,
        hotelId: this.hotelId
      };
      requests.push(this.api.createFoodRequest(foodOrderData));
    }

    // Create drink request if there are drink items
    if (drinkItems.length > 0) {
      const drinkTotal = drinkItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const drinkOrderData = {
        roomId: this.selectedRoom.id,
        guestName: this.guestName,
        items: drinkItems.map((item: any) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        totalAmount: drinkTotal,
        notes: `Drink order from room ${this.selectedRoom.roomNumber}`,
        hotelId: this.hotelId
      };
      requests.push(this.api.createDrinkRequest(drinkOrderData));
    }

    if (requests.length === 0) {
      this.toast.error('Error', 'No valid items in order');
      return;
    }

    // Execute all requests
    Promise.all(requests.map(req => req.toPromise())).then(() => {
      this.toast.success('Success', 'Order placed successfully');
      this.selectedItems = [];
      this.totalAmount = 0;
      this.loadOrders();
    }).catch((err) => {
      this.toast.error('Error', 'Failed to place order');
    });
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'breakfast':
        return 'bi-egg-fried';
      case 'lunch':
        return 'bi-cup-hot';
      case 'dinner':
        return 'bi-utensils';
      case 'drink':
        return 'bi-cup-straw';
      case 'dessert':
        return 'bi-cake';
      case 'snack':
        return 'bi-cookie';
      default:
        return 'bi-basket';
    }
  }

  getCategoryColor(category: string): string {
    switch (category) {
      case 'drink':
        return 'primary';
      case 'dessert':
        return 'danger';
      case 'breakfast':
        return 'warning';
      case 'lunch':
        return 'success';
      case 'dinner':
        return 'info';
      default:
        return 'secondary';
    }
  }
}
