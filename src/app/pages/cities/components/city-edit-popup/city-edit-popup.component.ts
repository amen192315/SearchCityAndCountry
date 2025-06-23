import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';

import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CityData } from '../../models/city.interface';
import { TranslocoDirective } from '@jsverse/transloco';
import { EditCity } from '../../models/editCity.interface';

@Component({
  selector: 'app-city-edit-popup',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    TranslocoDirective,
  ],
  templateUrl: './city-edit-popup.component.html',
  styleUrl: './city-edit-popup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CityEditPopupComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CityEditPopupComponent>);
  readonly data = inject<CityData>(MAT_DIALOG_DATA);

  readonly editForm: FormGroup<EditCity> = this.fb.group({
    name: [
      this.data.name,
      [Validators.required, Validators.pattern(/^[A-Za-z\s\-]+$/)],
    ],
    country: [
      this.data.country,
      [Validators.required, Validators.pattern(/^[A-Za-z\s\-]+$/)],
    ],
    region: [
      this.data.region,
      [Validators.required, Validators.pattern(/^[A-Za-z\s\-]+$/)],
    ],
    population: [
      this.data.population,
      [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)],
    ],
    latitude: [
      this.data.latitude,
      [Validators.required, Validators.min(-90), Validators.max(90)],
    ],
    longitude: [
      this.data.longitude,
      [Validators.required, Validators.min(-180), Validators.max(180)],
    ],
  });

  //метод для проверки валидности ф-мы
  isInvalid(inp: string): boolean {
    const control = this.editForm.get(inp);
    return control
      ? control.invalid && (control.dirty || control.touched)
      : false;
  }

  //сохранение ф-мы
  saveChanges(): void {
    if (this.editForm.valid) {
      this.dialogRef.close(this.editForm.value);
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
