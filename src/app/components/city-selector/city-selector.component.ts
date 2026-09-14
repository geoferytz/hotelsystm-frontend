import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-city-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './city-selector.component.html',
  styleUrls: ['./city-selector.component.css']
})
export class CitySelectorComponent {
  @Input() cities: string[] = [];
  @Input() selectedCity: string = '';
  @Output() cityChange = new EventEmitter<string>();

  isOpen = false;
  tempCity = '';

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.tempCity = this.selectedCity;
    }
  }

  selectCity(city: string): void {
    this.tempCity = city;
    this.cityChange.emit(city);
    this.isOpen = false;
  }

  clearCity(): void {
    this.tempCity = '';
    this.cityChange.emit('');
    this.isOpen = false;
  }

  get displayValue(): string {
    return this.selectedCity || 'All Cities';
  }

  closeDropdown(): void {
    this.isOpen = false;
  }
}
