import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  get getBaseUrl(): string {
    return this.baseUrl;
  }

  // Dashboard
  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/dashboard/stats`);
  }

  getRecentBookings(): Observable<any> {
    return this.http.get(`${this.baseUrl}/dashboard/recent-bookings`);
  }

  // Rooms
  getRooms(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) httpParams = httpParams.set(key, params[key]);
      });
    }
    return this.http.get(`${this.baseUrl}/rooms`, { params: httpParams });
  }

  getRoom(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/rooms/${id}`);
  }

  uploadRoomImage(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/rooms/upload-image`, data);
  }

  createRoom(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/rooms`, data);
  }

  createBulkRooms(rooms: any[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/rooms/bulk`, { rooms });
  }

  updateRoom(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/rooms/${id}`, data);
  }

  deleteRoom(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/rooms/${id}`);
  }

  // Customers
  getCustomers(search?: string): Observable<any> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    return this.http.get(`${this.baseUrl}/customers`, { params });
  }

  getCustomer(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/customers/${id}`);
  }

  createCustomer(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/customers`, data);
  }

  updateCustomer(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/customers/${id}`, data);
  }

  deleteCustomer(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/customers/${id}`);
  }

  // Bookings
  getBookings(status?: string): Observable<any> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get(`${this.baseUrl}/bookings`, { params });
  }

  getBooking(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/bookings/${id}`);
  }

  createBooking(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/bookings`, data);
  }

  updateBooking(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/bookings/${id}`, data);
  }

  deleteBooking(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/bookings/${id}`);
  }

  // Billing
  getBillings(paymentStatus?: string): Observable<any> {
    let params = new HttpParams();
    if (paymentStatus) params = params.set('paymentStatus', paymentStatus);
    return this.http.get(`${this.baseUrl}/billing`, { params });
  }

  getBilling(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/billing/${id}`);
  }

  createBilling(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/billing`, data);
  }

  updateBilling(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/billing/${id}`, data);
  }

  deleteBilling(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/billing/${id}`);
  }

  // Refunds
  getRefunds(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) httpParams = httpParams.set(key, params[key]);
      });
    }
    return this.http.get(`${this.baseUrl}/refunds`, { params: httpParams });
  }

  getRefund(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/refunds/${id}`);
  }

  createRefund(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/refunds`, data);
  }

  updateRefund(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/refunds/${id}`, data);
  }

  deleteRefund(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/refunds/${id}`);
  }

  // Expenses
  getExpenses(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) httpParams = httpParams.set(key, params[key]);
      });
    }
    return this.http.get(`${this.baseUrl}/expenses`, { params: httpParams });
  }

  getExpense(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/expenses/${id}`);
  }

  createExpense(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/expenses`, data);
  }

  updateExpense(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/expenses/${id}`, data);
  }

  deleteExpense(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/expenses/${id}`);
  }

  // Salaries
  getSalaries(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) httpParams = httpParams.set(key, params[key]);
      });
    }
    return this.http.get(`${this.baseUrl}/salaries`, { params: httpParams });
  }

  getSalary(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/salaries/${id}`);
  }

  createSalary(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/salaries`, data);
  }

  updateSalary(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/salaries/${id}`, data);
  }

  deleteSalary(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/salaries/${id}`);
  }

  markSalaryAsPaid(id: number, paymentMethod: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/salaries/${id}/mark-paid`, { paymentMethod });
  }

  // Shifts
  getShifts(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) httpParams = httpParams.set(key, params[key]);
      });
    }
    return this.http.get(`${this.baseUrl}/shifts`, { params: httpParams });
  }

  createShift(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/shifts`, data);
  }

  updateShift(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/shifts/${id}`, data);
  }

  deleteShift(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/shifts/${id}`);
  }

  // Users
  getUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/auth/users`);
  }

  // Reports
  getReport(type: string, params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) httpParams = httpParams.set(key, params[key]);
      });
    }
    return this.http.get(`${this.baseUrl}/reports/${type}`, { params: httpParams });
  }

  // Financial Reports
  getExpenseReport(params?: any): Observable<any> {
    return this.getReport('expenses', params);
  }

  getRefundReport(params?: any): Observable<any> {
    return this.getReport('refunds', params);
  }

  getProfitLossReport(params?: any): Observable<any> {
    return this.getReport('profit-loss', params);
  }

  getFinancialSummary(): Observable<any> {
    return this.getReport('financial-summary');
  }

  // Workers
  getWorkers(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) httpParams = httpParams.set(key, params[key]);
      });
    }
    return this.http.get(`${this.baseUrl}/workers`, { params: httpParams });
  }

  createWorker(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/workers`, data);
  }

  updateWorker(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/workers/${id}`, data);
  }

  deleteWorker(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/workers/${id}`);
  }

  // Roles
  getRoles(): Observable<any> {
    return this.http.get(`${this.baseUrl}/roles`);
  }

  getRole(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/roles/${id}`);
  }

  createRole(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/roles`, data);
  }

  updateRole(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/roles/${id}`, data);
  }

  deleteRole(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/roles/${id}`);
  }

  // Permissions
  getPermissions(): Observable<any> {
    return this.http.get(`${this.baseUrl}/roles/permissions`);
  }

  createPermission(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/roles/permissions`, data);
  }

  deletePermission(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/roles/permissions/${id}`);
  }

  // User Management
  getUserList(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) httpParams = httpParams.set(key, params[key]);
      });
    }
    return this.http.get(`${this.baseUrl}/users`, { params: httpParams });
  }

  createUser(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/users`, data);
  }

  updateUser(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/${id}`, data);
  }

  changeUserPassword(id: number, newPassword: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/${id}/password`, { newPassword });
  }

  toggleUserActive(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/${id}/toggle-active`, {});
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/users/${id}`);
  }

  // Guest (public)
  getGuestRooms(): Observable<any> {
    return this.http.get(`${this.baseUrl}/guest/rooms`);
  }

  getGuestRoomSummary(): Observable<any> {
    return this.http.get(`${this.baseUrl}/guest/room-summary`);
  }

  getGuestMenu(params?: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/guest/menu`, { params });
  }

  getGuestRestaurants(): Observable<any> {
    return this.http.get(`${this.baseUrl}/guest/restaurants`);
  }

  getGuestRestaurant(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/guest/restaurants/${id}`);
  }

  getGuestRestaurantMenus(restaurantId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/guest/restaurants/${restaurantId}/menus`);
  }

  createRestaurantTableBooking(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/guest/restaurant/table-booking`, data);
  }

  createRestaurantMenuOrder(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/guest/restaurant/menu-order`, data);
  }

  adminCreateRestaurantTableBooking(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/restaurant-bookings/bookings`, data);
  }

  adminCreateRestaurantMenuOrder(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/restaurant-bookings/orders`, data);
  }

  getRestaurantTableBookings(): Observable<any> {
    return this.http.get(`${this.baseUrl}/restaurant-bookings/bookings`);
  }

  getRestaurantTableBookingById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/restaurant-bookings/bookings/${id}`);
  }

  updateRestaurantTableBookingStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/restaurant-bookings/bookings/${id}/status`, { status });
  }

  getRestaurantMenuOrders(): Observable<any> {
    return this.http.get(`${this.baseUrl}/restaurant-bookings/orders`);
  }

  getRestaurantMenuOrderById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/restaurant-bookings/orders/${id}`);
  }

  updateRestaurantMenuOrderStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/restaurant-bookings/orders/${id}/status`, { status });
  }

  createGuestBooking(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/guest/book`, data);
  }

  guestPayment(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/guest/pay`, data);
  }

  getGuestInvoice(billingId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/guest/invoice/${billingId}`);
  }

  // Booking extensions & cancellation
  extendBooking(id: number, newCheckOut: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/bookings/${id}/extend`, { newCheckOut });
  }

  cancelBooking(id: number, reason?: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/bookings/${id}/cancel`, { reason });
  }

  changeBookingRoom(id: number, newRoomId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/bookings/${id}/change-room`, { newRoomId });
  }

  // Customer details
  getCustomerDetails(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/customers/${id}/details`);
  }

  // Notifications
  getNotifications(): Observable<any> {
    return this.http.get(`${this.baseUrl}/notifications`);
  }

  getUnreadCount(): Observable<any> {
    return this.http.get(`${this.baseUrl}/notifications/unread-count`);
  }

  markNotificationRead(id: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/notifications/${id}/read`, {});
  }

  markAllNotificationsRead(): Observable<any> {
    return this.http.put(`${this.baseUrl}/notifications/read-all`, {});
  }

  // Room Types
  getRoomTypes(params?: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/room-types`, { params });
  }
  createRoomType(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/room-types`, data);
  }
  updateRoomType(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/room-types/${id}`, data);
  }
  deleteRoomType(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/room-types/${id}`);
  }

  // Meals
  getMeals(params?: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/meals`, { params });
  }
  uploadMealImage(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/meals/upload-image`, data);
  }
  createMeal(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/meals`, data);
  }
  updateMeal(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/meals/${id}`, data);
  }
  deleteMeal(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/meals/${id}`);
  }

  // Hotels
  getMyHotels(): Observable<any> {
    return this.http.get(`${this.baseUrl}/hotels/my-hotels`);
  }
  createHotel(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/hotels`, data);
  }
  updateHotel(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/hotels/${id}`, data);
  }
  deleteHotel(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/hotels/${id}`);
  }
  getHotelMembers(hotelId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/hotels/${hotelId}/members`);
  }
  addHotelMember(hotelId: number, data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/hotels/${hotelId}/members`, data);
  }
  removeHotelMember(hotelId: number, userId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/hotels/${hotelId}/members/${userId}`);
  }

  // Public Hotel API (no auth required)
  getPublicHotels(): Observable<any> {
    return this.http.get(`${this.baseUrl}/hotels/public`);
  }
  getPublicHotelDetails(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/hotels/public/${id}`);
  }

  // Hotel Services
  getHotelServices(params?: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/hotel-services`, { params });
  }
  uploadHotelServiceImage(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/hotel-services/upload-image`, data);
  }
  createHotelService(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/hotel-services`, data);
  }
  updateHotelService(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/hotel-services/${id}`, data);
  }
  deleteHotelService(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/hotel-services/${id}`);
  }

  // Restaurants
  getRestaurants(params?: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/restaurants`, { params });
  }
  getRestaurant(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/restaurants/${id}`);
  }
  uploadRestaurantImage(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/restaurants/upload-image`, data);
  }
  createRestaurant(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/restaurants`, data);
  }
  updateRestaurant(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/restaurants/${id}`, data);
  }
  deleteRestaurant(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/restaurants/${id}`);
  }
  getRestaurantMenus(params?: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/restaurants/menus`, { params });
  }
  uploadRestaurantMenuImage(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/restaurants/menus/upload-image`, data);
  }
  createRestaurantMenu(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/restaurants/menus`, data);
  }
  updateRestaurantMenu(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/restaurants/menus/${id}`, data);
  }
  deleteRestaurantMenu(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/restaurants/menus/${id}`);
  }

  // Inventory Categories
  getInventoryCategories(): Observable<any> {
    return this.http.get(`${this.baseUrl}/inventory/categories`);
  }

  getInventoryCategory(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/inventory/categories/${id}`);
  }

  createInventoryCategory(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/inventory/categories`, data);
  }

  updateInventoryCategory(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/inventory/categories/${id}`, data);
  }

  deleteInventoryCategory(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/inventory/categories/${id}`);
  }

  // Inventory Items
  getInventoryItems(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) httpParams = httpParams.set(key, params[key]);
      });
    }
    return this.http.get(`${this.baseUrl}/inventory/items`, { params: httpParams });
  }

  getInventoryItem(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/inventory/items/${id}`);
  }

  createInventoryItem(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/inventory/items`, data);
  }

  updateInventoryItem(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/inventory/items/${id}`, data);
  }

  deleteInventoryItem(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/inventory/items/${id}`);
  }

  // Inventory Stock Movements
  getInventoryStockMovements(params?: any): Observable<any> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key]) httpParams = httpParams.set(key, params[key]);
      });
    }
    return this.http.get(`${this.baseUrl}/inventory/stock`, { params: httpParams });
  }

  createInventoryStockMovement(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/inventory/stock`, data);
  }

  getInventoryStockSummary(): Observable<any> {
    return this.http.get(`${this.baseUrl}/inventory/summary`);
  }

  // Food Requests
  getFoodRequests(): Observable<any> {
    return this.http.get(`${this.baseUrl}/food-drink/food-requests`);
  }

  getFoodRequestsByRoom(roomId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/food-drink/food-requests/room/${roomId}`);
  }

  createFoodRequest(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/food-drink/food-requests`, data);
  }

  updateFoodRequestStatus(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/food-drink/food-requests/${id}/status`, data);
  }

  // Drink Requests
  getDrinkRequests(): Observable<any> {
    return this.http.get(`${this.baseUrl}/food-drink/drink-requests`);
  }

  getDrinkRequestsByRoom(roomId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/food-drink/drink-requests/room/${roomId}`);
  }

  createDrinkRequest(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/food-drink/drink-requests`, data);
  }

  updateDrinkRequestStatus(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/food-drink/drink-requests/${id}/status`, data);
  }
}
