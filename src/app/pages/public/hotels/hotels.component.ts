import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { ApiService } from '../../../services/api.service';
import { ThemeService, THEMES } from '../../../services/theme.service';
import { DateRangePickerComponent } from '../../../components/date-range-picker/date-range-picker.component';
import { GuestSelectorComponent } from '../../../components/guest-selector/guest-selector.component';
import { CitySelectorComponent } from '../../../components/city-selector/city-selector.component';

interface Hotel {
  id: number;
  name: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  description: string;
  starRating: number;
  logo?: string;
  imageUrl?: string;
  HotelServices?: {
    id: number;
    name: string;
    category: string;
    description: string;
    price: number;
    icon: string;
  }[];
}

@Component({
  selector: 'app-public-hotels',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DateRangePickerComponent, GuestSelectorComponent, CitySelectorComponent],
  templateUrl: './hotels.component.html',
  styleUrls: ['./hotels.component.css']
})
export class PublicHotelsComponent implements OnInit {
  hotels: Hotel[] = [];
  filteredHotels: Hotel[] = [];
  allHotels: Hotel[] = [];
  cities: string[] = [];
  restaurants: any[] = [];
  loading = true;
  error = '';
  selectedCity = '';
  checkIn = '';
  checkOut = '';
  adults = 2;
  children = 0;
  rooms = 1;
  currentTheme = 'green';
  showThemePicker = false;
  themes: any[] = [];
  unreadCount = 0;
  activeTab: 'hotels' | 'restaurants' = 'hotels';

  minDate = '';
  maxDate = '';

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private themeService: ThemeService
  ) {
    this.currentTheme = this.themeService.currentTheme;
    this.themes = Object.entries(THEMES).map(([key, theme]) => ({ key, theme }));
    // Set min date to today
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
    
    // Set max date to 1 year from now
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    this.maxDate = maxDate.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'restaurants') {
        this.activeTab = 'restaurants';
      }
    });
    this.loadHotels();
    this.loadRestaurants();
    this.themeService.currentTheme$.subscribe(t => this.currentTheme = t);
  }

  setTheme(themeKey: string): void {
    this.themeService.setTheme(themeKey);
    this.showThemePicker = false;
  }

  loadHotels(): void {
    this.api.getPublicHotels().subscribe({
      next: (data: Hotel[]) => {
        this.allHotels = data;
        this.hotels = data;
        this.filteredHotels = data;
        // Extract unique cities
        this.cities = [...new Set(data.map(h => h.city))].sort();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load hotels. Please try again later.';
        this.loading = false;
      }
    });
  }

  loadRestaurants(): void {
    this.api.getGuestRestaurants().subscribe({
      next: (data: any[]) => this.restaurants = data,
      error: () => this.restaurants = [],
    });
  }

  onDateRangeChange(dates: { checkIn: string; checkOut: string }): void {
    this.checkIn = dates.checkIn;
    this.checkOut = dates.checkOut;
  }

  onCityChange(city: string): void {
    this.selectedCity = city;
  }

  onGuestsChange(guests: { adults: number; children: number; rooms: number }): void {
    this.adults = guests.adults;
    this.children = guests.children;
    this.rooms = guests.rooms;
  }

  onSearch(): void {
    this.filteredHotels = this.allHotels.filter(hotel => {
      const matchesCity = !this.selectedCity || hotel.city === this.selectedCity;
      return matchesCity;
    });
    this.hotels = this.filteredHotels;
  }

  normalizeImageUrl(url: string | undefined): string {
    if (!url) return '';
    // Convert backslashes to forward slashes
    let normalized = url.replace(/\\/g, '/');
    // Ensure it starts with /
    if (!normalized.startsWith('/')) {
      normalized = '/' + normalized;
    }
    return normalized;
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

  clearSearch(): void {
    this.selectedCity = '';
    this.checkIn = '';
    this.checkOut = '';
    this.adults = 2;
    this.children = 0;
    this.rooms = 1;
    this.filteredHotels = this.allHotels;
    this.hotels = this.allHotels;
  }

  viewHotel(id: number): void {
    this.router.navigate(['/public/hotels', id], {
      state: {
        checkIn: this.checkIn,
        checkOut: this.checkOut,
        adults: this.adults,
        children: this.children,
        rooms: this.rooms
      }
    });
  }
}
