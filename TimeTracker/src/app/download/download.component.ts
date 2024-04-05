import { Component, Inject } from '@angular/core';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MatMomentDateModule,
  MomentDateAdapter,
} from '@angular/material-moment-adapter';

import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
} from '@angular/material/core';
import { RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
const MY_DATE_FORMAT = {
  parse: {
    dateInput: 'DD/MM/YYYY', // this is how your date will be parsed from Input
  },
  display: {
    dateInput: 'DD. MMMM', // this is how your date will get displayed on the Input
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
export interface DialogData {
  from: string;
  to: string;
}
@Component({
  selector: 'app-download',
  standalone: true,
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMAT },
  ],
  imports: [
    RouterOutlet,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatMomentDateModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    CommonModule,
    MatIconButton,
    MatDialogModule,
    MatDialogActions,
  ],
  templateUrl: './download.component.html',
  styleUrl: './download.component.scss',
})
export class DownloadComponent {
  dateFrom = new FormControl(this.getDateOfWeekDay(0));
  dateTo = new FormControl(this.getDateOfWeekDay(4));
  constructor(
    public dialogRef: MatDialogRef<DownloadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  private getDateOfWeekDay(dayOfWeek: number, referenceDate = new Date()): Date {
    const date = new Date(referenceDate.getTime());
    const diff = ((date.getDay() + 6) % 7) - dayOfWeek;
    date.setDate(date.getDate() - diff);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  download() {
    this.dialogRef.close({
      from: this.dateFrom.value,
      to: this.dateTo.value,
    });
  }
}
