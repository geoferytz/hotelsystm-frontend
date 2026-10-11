import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PermissionService } from '../../services/permission.service';
import { ThemeService, THEMES } from '../../services/theme.service';
import { ApiService } from '../../services/api.service';
import { FooterComponent } from '../../footer/footer.component';

interface ModuleTile {
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  gradient: string;
  permissionModule?: string;
  category?: 'operations' | 'finance' | 'restaurant' | 'food-drinks' | 'administration' | 'settings'| 'inventory';
  children?: { label: string; route: string }[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FooterComponent, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  user;
  greeting = '';
  today = new Date();
  unreadCount = 0;
  currentTheme = 'navy';
  showThemePicker = false;
  showUserMenu = false;
  themes: any[] = [];
  private pollTimer: any;
  private clickHandler: any;

  tiles: ModuleTile[] = [
    {
      title: 'Customers',
      description: 'Manage guest profiles, check-in records, and customer history',
      icon: 'bi-people-fill',
      route: '/customers',
      color: '#6366f1',
      gradient: 'linear-gradient(135deg, #6366f1, #818cf8)',
      permissionModule: 'customers',
      category: 'operations',
    },
    {
      title: 'Rooms',
      description: 'View room availability, manage room types, and track status',
      icon: 'bi-door-open-fill',
      route: '/rooms',
      color: '#0ea5e9',
      gradient: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
      permissionModule: 'rooms',
      category: 'operations',
    },
    {
      title: 'Bookings',
      description: 'Create and manage reservations, check-ins, and check-outs',
      icon: 'bi-calendar-check-fill',
      route: '/bookings',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #10b981, #34d399)',
      permissionModule: 'bookings',
      category: 'operations',
    },
    {
      title: 'Finance',
      description: 'Track hotel income, guest payments, refunds, expenses, and financial reports',
      icon: 'bi-cash-coin',
      route: '/billing',
      color: '#059669',
      gradient: 'linear-gradient(135deg, #059669, #34d399)',
      permissionModule: 'billing',
      category: 'finance',
    },
    {
      title: 'Inventory',
      description: 'Manage stock, track items, categories, and inventory movements',
      icon: 'bi-box-seam',
      route: '/inventory',
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
      permissionModule: 'inventory',
      category: 'inventory',
    },
    {
      title: 'Restaurant',
      description: 'Manage restaurants and create menus for each restaurant',
      icon: 'bi-shop',
      route: '/restaurant',
      color: '#f97316',
      gradient: 'linear-gradient(135deg, #f97316, #fb923c)',
      permissionModule: 'restaurant',
      category: 'restaurant',
    },
    {
      title: 'Food & Drinks',
      description: 'Request food from kitchen and drinks from bar for guest rooms',
      icon: 'bi-cup-hot',
      route: '/food-requests',
      color: '#dc2626',
      gradient: 'linear-gradient(135deg, #dc2626, #f87171)',
      category: 'food-drinks',
      // children: [
      //   { label: 'Food Requests', route: '/food-requests' },
      //   { label: 'Drink Requests', route: '/drink-requests' },
      //   { label: 'Guest Order', route: '/guest-order' },
      // ],
    },
    {
      title: 'Workers',
      description: 'Manage worker profiles, attendance, and shift assignments',
      icon: 'bi-person-badge-fill',
      route: '/workers',
      color: '#0891b2',
      gradient: 'linear-gradient(135deg, #0891b2, #22d3ee)',
      permissionModule: 'workers',
      category: 'administration',
    },
    {
      title: 'Reports',
      description: 'View daily/monthly revenue, occupancy rates, and business analytics',
      icon: 'bi-bar-chart-line-fill',
      route: '/reports',
      color: '#14b8a6',
      gradient: 'linear-gradient(135deg, #14b8a6, #2dd4bf)',
      permissionModule: 'reports',
      category: 'administration',
    },
    {
      title: 'Users',
      description: 'Manage staff accounts, assign roles, and control access',
      icon: 'bi-person-gear',
      route: '/users',
      color: '#ef4444',
      gradient: 'linear-gradient(135deg, #ef4444, #f87171)',
      permissionModule: 'users',
      category: 'administration',
    },
    {
      title: 'User Manual',
      description: 'View documentation and guides for using the hotel management system',
      icon: 'bi-book-fill',
      route: '/settings/user-manual',
      color: '#e11d48',
      gradient: 'linear-gradient(135deg, #e11d48, #fb7185)',
      permissionModule: 'settings',
      category: 'administration',
    },
    {
      title: 'Settings',
      description: 'Configure hotels, room types, meals, and hotel services',
      icon: 'bi-gear-fill',
      route: '/settings/hotels',
      color: '#8b5cf6',
      gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
      category: 'settings',
      // children: [
      //   { label: 'My Hotels', route: '/settings/hotels' },
      //   { label: 'Room Types', route: '/settings/room-types' },
      //   { label: 'Meals', route: '/settings/meals' },
      //   { label: 'Hotel Services', route: '/settings/hotel-services' },
      // ],
    },
  ];

  constructor(
    private authService: AuthService,
    private permission: PermissionService,
    private router: Router,
    private themeService: ThemeService,
    private api: ApiService
  ) {
    this.user = this.authService.getStoredUser();
    this.greeting = this.getGreeting();
    this.currentTheme = this.themeService.currentTheme;
    this.themes = Object.entries(THEMES).map(([key, theme]) => ({ key, theme }));
  }

  ngOnInit(): void {
    this.loadUnreadCount();
    this.pollTimer = setInterval(() => this.loadUnreadCount(), 30000);
    this.themeService.currentTheme$.subscribe(t => this.currentTheme = t);
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

  setTheme(themeKey: string): void {
    this.themeService.setTheme(themeKey);
    this.showThemePicker = false;
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
    console.log('User menu toggled:', this.showUserMenu);
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  navigateTo(route: string, category?: string): void {
    // Store the active category in localStorage for sidebar filtering
    if (category) {
      localStorage.setItem('activeSidebarCategory', category);
    } else {
      localStorage.removeItem('activeSidebarCategory');
    }
    this.router.navigate([route]);
  }

  canViewTile(tile: ModuleTile): boolean {
    if (this.permission.isAdmin()) return true;
    if (tile.permissionModule) {
      return this.permission.canView(tile.permissionModule);
    }
    return true;
  }

  logout(): void {
    this.authService.logout();
  }
}
