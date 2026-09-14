import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface SharedFormOption {
  label: string;
  value: any;
}

export interface SharedFormField {
  key: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'time' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'hidden';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  options?: SharedFormOption[];
  rows?: number;
  min?: number | string;
  max?: number | string;
  step?: number | string;
  colClass?: string;
  helpText?: string;
  accept?: string;
  multiple?: boolean;
  visible?: (model: any) => boolean;
  change?: (model: any, value: any) => void;
}

@Component({
  selector: 'app-shared-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shared-form.component.html',
  styleUrls: ['./shared-form.component.css'],
})
export class SharedFormComponent implements OnChanges {
  @Input() title = '';
  @Input() fields: SharedFormField[] = [];
  @Input() model: any = {};
  @Input() submitLabel = 'Save';
  @Input() cancelLabel = 'Cancel';
  @Input() showCancel = true;
  @Input() loading = false;
  @Input() layout: 'grid' | 'stacked' = 'grid';

  @Output() modelChange = new EventEmitter<any>();
  @Output() submitForm = new EventEmitter<any>();
  @Output() cancelForm = new EventEmitter<void>();
  @Output() fieldChange = new EventEmitter<{ key: string; value: any; model: any }>();
  @Output() fileChange = new EventEmitter<{ key: string; files: FileList | null; model: any }>();

  formModel: any = {};
  submitted = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['model']) {
      this.formModel = { ...(this.model || {}) };
    }
  }

  visibleFields(): SharedFormField[] {
    return this.fields.filter(field => field.type !== 'hidden' && (field.visible ? field.visible(this.formModel) : true));
  }

  hiddenFields(): SharedFormField[] {
    return this.fields.filter(field => field.type === 'hidden');
  }

  onFieldChange(field: SharedFormField): void {
    const value = this.formModel[field.key];
    if (field.change) field.change(this.formModel, value);
    this.modelChange.emit(this.formModel);
    this.fieldChange.emit({ key: field.key, value, model: this.formModel });
  }

  onFileSelected(field: SharedFormField, event: Event): void {
    const input = event.target as HTMLInputElement;
    this.fileChange.emit({ key: field.key, files: input.files, model: this.formModel });
  }

  isInvalid(field: SharedFormField): boolean {
    const value = this.formModel[field.key];
    return this.submitted && !!field.required && (value === null || value === undefined || value === '');
  }

  submit(): void {
    this.submitted = true;
    const invalid = this.fields.some(field => field.required && (field.visible ? field.visible(this.formModel) : true) && (this.formModel[field.key] === null || this.formModel[field.key] === undefined || this.formModel[field.key] === ''));
    if (invalid) return;
    this.submitForm.emit({ ...this.formModel });
  }

  cancel(): void {
    this.cancelForm.emit();
  }

  optionValue(option: SharedFormOption): any {
    return option.value;
  }
}
