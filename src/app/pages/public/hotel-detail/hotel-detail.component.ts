import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';

interface Room {
  id: number;
  roomNumber: string;
  type: string;
  price: number;
  floor: number;
  description: string;
  status: string;
  imageUrl?: string;
}

interface HotelService {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  icon: string;
  imageUrl?: string;
}

interface Meal {
  id: number;
  name: string;
  category: string;
  description: string;
  price: number;
  imageUrl?: string;
  portionSize?: string;
  preparationTime?: number;
  calories?: number;
  dietaryTags?: string[];
}

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
  checkInTime: string;
  checkOutTime: string;
  latitude?: number;
  longitude?: number;
  Rooms?: Room[];
  HotelServices?: HotelService[];
  Meals?: Meal[];
}

@Component({
  selector: 'app-hotel-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hotel-detail.component.html',
  styleUrls: ['./hotel-detail.component.css']
})
export class HotelDetailComponent implements OnInit {
  hotel: Hotel | null = null;
  loading = true;
  error = '';
  activeTab = 'rooms';
  checkIn = '';
  checkOut = '';
  adults = 2;
  children = 0;
  rooms = 1;

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router
  ) {
    // Get booking parameters from router state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      const state = navigation.extras.state as any;
      this.checkIn = state.checkIn || '';
      this.checkOut = state.checkOut || '';
      this.adults = state.adults || 2;
      this.children = state.children || 0;
      this.rooms = state.rooms || 1;
    }
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadHotel(+id);
    } else {
      this.router.navigate(['/public/hotels']);
    }
  }

  loadHotel(id: number): void {
    this.api.getPublicHotelDetails(id).subscribe({
      next: (data: Hotel) => {
        this.hotel = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load hotel details.';
        this.loading = false;
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  viewRoom(room: Room): void {
    this.router.navigate(['/public/hotels', this.hotel?.id, 'rooms', room.id], {
      state: {
        room,
        hotel: this.hotel,
        checkIn: this.checkIn,
        checkOut: this.checkOut,
        adults: this.adults,
        children: this.children,
        rooms: this.rooms,
      }
    });
  }

  bookRoom(room: Room): void {
    const bookingState = {
      hotelId: this.hotel?.id,
      hotelName: this.hotel?.name,
      roomId: room.id,
      roomNumber: room.roomNumber,
      roomType: room.type,
      roomPrice: room.price,
      roomImageUrl: room.imageUrl,
      checkIn: this.checkIn,
      checkOut: this.checkOut,
      adults: this.adults,
      children: this.children,
      rooms: this.rooms
    };

    this.router.navigate(['/public/booking'], { state: bookingState });
  }

  normalizeMealImageUrl(url: string | undefined): string {
    if (!url) return '';
    if (url.startsWith('/uploads')) return url;
    return url;
  }

  normalizeImageUrl(url: string | undefined): string {
    if (!url) return '';
    let normalized = url.replace(/\\/g, '/');
    if (normalized.startsWith('/uploads')) return normalized;
    if (!normalized.startsWith('/') && !normalized.startsWith('http')) {
      normalized = '/' + normalized;
    }
    return normalized;
  }

  goBack(): void {
    this.router.navigate(['/public/hotels']);
  }

  getMapUrl(latitude: number, longitude: number): string {
    return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.0!2d${longitude}!3d${latitude}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2z!5e0!3m2!1sen!2stz!4v0!5m2!1sen!2stz!4v0`;
  }
}
