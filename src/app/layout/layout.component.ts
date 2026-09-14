import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ApiService } from '../services/api.service';
import { ThemeService, THEMES } from '../services/theme.service';
import { HotelService, Hotel } from '../services/hotel.service';
import { PermissionService } from '../services/permission.service';
import { FooterComponent } from '../footer/footer.component';
import { SessionLockComponent } from '../components/session-lock/session-lock.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FooterComponent, SessionLockComponent ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent implements OnInit, OnDestroy {
  user;
  unreadCount = 0;
  currentTheme = 'green';
  showThemePicker = false;
  showUserMenu = false;
  themes: any[] = [];
  hotels: Hotel[] = [];
  selectedHotelId: number | null = null;
  activeCategory: string | null = null;
  private pollTimer: any;
  private clickHandler: any;

  constructor(
    private authService: AuthService,
    private api: ApiService,
    private themeService: ThemeService,
    private hotelService: HotelService,
    private permission: PermissionService
  ) {
    this.user = this.authService.getStoredUser();
    this.currentTheme = this.themeService.currentTheme;
    this.themes = Object.entries(THEMES).map(([key, theme]) => ({ key, theme }));
    this.selectedHotelId = this.hotelService.selectedHotelId;
  }

  ngOnInit(): void {
    this.loadUnreadCount();
    this.loadHotels();
    this.pollTimer = setInterval(() => this.loadUnreadCount(), 30000);
    this.themeService.currentTheme$.subscribe(t => this.currentTheme = t);
    this.hotelService.selectedHotel$.subscribe(h => this.selectedHotelId = h?.id || null);
    // Load active category from localStorage
    this.activeCategory = localStorage.getItem('activeSidebarCategory');
    // Clear category when navigating to home or dashboard
    this.clickHandler = (e: Event) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.theme-picker')) {
        this.showThemePicker = false;
      }
      if (!target.closest('.user-menu')) {
        this.showUserMenu = false;
      }
    };
    document.addEventListener('click', this.clickHandler);
  }

  ngOnDestroy(): void {
    if (this.pollTimer) clearInterval(this.pollTimer);
    if (this.clickHandler) document.removeEventListener('click', this.clickHandler);
  }

  loadUnreadCount(): void {
    this.api.getUnreadCount().subscribe({ next: (d: any) => this.unreadCount = d.count });
  }

  getPageTitle(): string {
    const titles: Record<string, string> = {
      home: 'Home',
      dashboard: 'Dashboard',
      rooms: 'Rooms Management',
      bookings: 'Booking System',
      customers: 'Customers (Guests)',
      billing: 'Billing & Invoices',
      inventory: 'Inventory Management',
      shifts: 'Work Shifts',
      workers: 'Workers',
      users: 'User Management',
      roles: 'Roles & Permissions',
      reports: 'Reports & Analytics',
      notifications: 'Notifications',
      hotels: 'My Hotels',
      'room-types': 'Room Types & Pricing',
      meals: 'Meals & Pricing',
      'hotel-services': 'Hotel Services & Pricing',
    };
    const path = window.location.pathname.split('/').pop() || 'dashboard';
    return titles[path] || path.charAt(0).toUpperCase() + path.slice(1);
  }

  logout(): void {
    this.authService.logout();
  }

  setTheme(themeKey: string): void {
    this.themeService.setTheme(themeKey);
    this.showThemePicker = false;
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    console.log('User menu toggled:', this.showUserMenu);
  }

  loadHotels(): void {
    console.log('Loading hotels...');
    this.api.getMyHotels().subscribe({
      next: (hotels: Hotel[]) => {
        console.log('Hotels loaded:', hotels);
        this.hotels = hotels;
        this.hotelService.setHotels(hotels);
      },
      error: (err) => {
        console.error('Error loading hotels:', err);
        this.hotels = [];
      }
    });
  }

  switchHotel(hotelId: any): void {
    if (hotelId === null) {
      // All Hotels selected - clear selection
      this.hotelService.selectHotel(null as any);
      window.location.reload();
    } else {
      const hotel = this.hotels.find(h => h.id === +hotelId);
      if (hotel) {
        this.hotelService.selectHotel(hotel);
        window.location.reload(); // Reload to fetch data for new hotel
      }
    }
  }

  canView(module: string): boolean {
    return this.permission.canView(module);
  }

  canViewSettings(): boolean {
    return this.permission.canView('hotels') || this.permission.canView('settings');
  }

  clearCategory(): void {
    localStorage.removeItem('activeSidebarCategory');
    this.activeCategory = null;
  }

  shouldShowSection(section: string): boolean {
    if (!this.activeCategory) return true; // Show all if no category is set
    return this.activeCategory === section;
  }
}
