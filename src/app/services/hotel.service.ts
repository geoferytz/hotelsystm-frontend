import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Hotel {
  id: number;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  logo?: string;
  description?: string;
  starRating?: number;
  isActive?: boolean;
  role?: string;
}

@Injectable({ providedIn: 'root' })
export class HotelService {
  private readonly STORAGE_KEY = 'hms_selected_hotel';
  private hotelsSubject = new BehaviorSubject<Hotel[]>([]);
  private selectedHotelSubject = new BehaviorSubject<Hotel | null>(null);

  hotels$ = this.hotelsSubject.asObservable();
  selectedHotel$ = this.selectedHotelSubject.asObservable();

  constructor() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        this.selectedHotelSubject.next(JSON.parse(saved));
      } catch {}
    }
  }

  get selectedHotel(): Hotel | null {
    return this.selectedHotelSubject.value;
  }

  get selectedHotelId(): number | null {
    return this.selectedHotelSubject.value?.id || null;
  }

  get hotels(): Hotel[] {
    return this.hotelsSubject.value;
  }

  setHotels(hotels: Hotel[]): void {
    this.hotelsSubject.next(hotels);
    // Auto-select first hotel if none selected
    if (!this.selectedHotelSubject.value && hotels.length > 0) {
      this.selectHotel(hotels[0]);
    }
    // If selected hotel is no longer in the list, select first
    if (this.selectedHotelSubject.value) {
      const still = hotels.find(h => h.id === this.selectedHotelSubject.value!.id);
      if (!still && hotels.length > 0) {
        this.selectHotel(hotels[0]);
      }
    }
  }

  selectHotel(hotel: Hotel): void {
    this.selectedHotelSubject.next(hotel);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(hotel));
  }

  clear(): void {
    this.hotelsSubject.next([]);
    this.selectedHotelSubject.next(null);
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
