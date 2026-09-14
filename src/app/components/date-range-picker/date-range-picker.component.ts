import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-date-range-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './date-range-picker.component.html',
  styleUrls: ['./date-range-picker.component.css']
})
export class DateRangePickerComponent implements OnChanges {
  @Input() checkIn: string = '';
  @Input() checkOut: string = '';
  @Input() minDate: string = '';
  @Input() maxDate: string = '';
  @Output() datesChange = new EventEmitter<{ checkIn: string; checkOut: string }>();

  isOpen = false;
  tempCheckIn: string = '';
  tempCheckOut: string = '';
  currentMonth = new Date();
  hoveredDate: string | null = null;

  ngOnChanges(): void {
    this.tempCheckIn = this.checkIn;
    this.tempCheckOut = this.checkOut;
  }

  get currentMonthYear(): string {
    return this.currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  get calendarDays(): Array<{ date: Date; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean; isInRange: boolean; isHovered: boolean }> {
    const days: Array<{ date: Date; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean; isInRange: boolean; isHovered: boolean }> = [];
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Previous month days
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isCurrentMonth: false, isToday: false, isSelected: false, isInRange: false, isHovered: false });
    }

    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      // Use local date format for comparison
      const yearStr = date.getFullYear();
      const monthStr = String(date.getMonth() + 1).padStart(2, '0');
      const dayStr = String(date.getDate()).padStart(2, '0');
      const dateStr = `${yearStr}-${monthStr}-${dayStr}`;
      
      const isToday = date.getTime() === today.getTime();
      const isSelected = dateStr === this.tempCheckIn || dateStr === this.tempCheckOut;
      const isInRange = this.isDateInRange(dateStr);
      const isHovered = dateStr === this.hoveredDate;
      days.push({ date, isCurrentMonth: true, isToday, isSelected, isInRange, isHovered });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({ date, isCurrentMonth: false, isToday: false, isSelected: false, isInRange: false, isHovered: false });
    }

    return days;
  }

  isDateInRange(dateStr: string): boolean {
    if (!this.tempCheckIn || !this.tempCheckOut) return false;
    return dateStr >= this.tempCheckIn && dateStr <= this.tempCheckOut;
  }

  isDateDisabled(date: Date): boolean {
    // Use local date format for comparison
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    if (this.minDate && dateStr < this.minDate) return true;
    if (this.maxDate && dateStr > this.maxDate) return true;
    return false;
  }

  toggleCalendar(): void {
    console.log('Toggle calendar called, current isOpen:', this.isOpen);
    this.isOpen = !this.isOpen;
    console.log('After toggle, isOpen:', this.isOpen);
    if (this.isOpen) {
      this.tempCheckIn = this.checkIn;
      this.tempCheckOut = this.checkOut;
      this.currentMonth = this.checkIn ? new Date(this.checkIn) : new Date();
      console.log('Calendar should be visible now');
    }
  }

  selectDate(date: Date): void {
    // Fix timezone issue by using local date
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    if (!this.tempCheckIn || (this.tempCheckIn && this.tempCheckOut)) {
      this.tempCheckIn = dateStr;
      this.tempCheckOut = '';
    } else if (dateStr < this.tempCheckIn) {
      this.tempCheckIn = dateStr;
      this.tempCheckOut = '';
    } else {
      this.tempCheckOut = dateStr;
      this.datesChange.emit({ checkIn: this.tempCheckIn, checkOut: this.tempCheckOut });
      this.isOpen = false;
    }
  }

  onDateHover(date: Date): void {
    // Use local date format for comparison
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    if (this.tempCheckIn && !this.tempCheckOut && dateStr >= this.tempCheckIn) {
      this.hoveredDate = dateStr;
    } else {
      this.hoveredDate = null;
    }
  }

  previousMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1);
  }

  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1);
  }

  get displayValue(): string {
    if (this.checkIn && this.checkOut) {
      const checkInDate = new Date(this.checkIn);
      const checkOutDate = new Date(this.checkOut);
      return `${checkInDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${checkOutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return 'Select dates';
  }

  closeCalendar(): void {
    this.isOpen = false;
    this.tempCheckIn = this.checkIn;
    this.tempCheckOut = this.checkOut;
  }

  clearDates(): void {
    this.checkIn = '';
    this.checkOut = '';
    this.tempCheckIn = '';
    this.tempCheckOut = '';
    this.datesChange.emit({ checkIn: '', checkOut: '' });
    this.isOpen = false;
  }
}
