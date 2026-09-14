import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-guest-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './guest-selector.component.html',
  styleUrls: ['./guest-selector.component.css']
})
export class GuestSelectorComponent {
  @Input() adults: number = 2;
  @Input() children: number = 0;
  @Input() rooms: number = 1;
  @Output() guestsChange = new EventEmitter<{ adults: number; children: number; rooms: number }>();

  isOpen = false;
  tempAdults = 2;
  tempChildren = 0;
  tempRooms = 1;

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.tempAdults = this.adults;
      this.tempChildren = this.children;
      this.tempRooms = this.rooms;
    }
  }

  incrementAdults(): void {
    if (this.tempAdults < 10) this.tempAdults++;
  }

  decrementAdults(): void {
    if (this.tempAdults > 1) this.tempAdults--;
  }

  incrementChildren(): void {
    if (this.tempChildren < 10) this.tempChildren++;
  }

  decrementChildren(): void {
    if (this.tempChildren > 0) this.tempChildren--;
  }

  incrementRooms(): void {
    if (this.tempRooms < 10) this.tempRooms++;
  }

  decrementRooms(): void {
    if (this.tempRooms > 1) this.tempRooms--;
  }

  apply(): void {
    this.guestsChange.emit({ adults: this.tempAdults, children: this.tempChildren, rooms: this.tempRooms });
    this.isOpen = false;
  }

  get displayValue(): string {
    return `${this.adults} adult${this.adults !== 1 ? 's' : ''}, ${this.children} child${this.children !== 1 ? 'ren' : ''}, ${this.rooms} room${this.rooms !== 1 ? 's' : ''}`;
  }

  closeDropdown(): void {
    this.isOpen = false;
  }
}
