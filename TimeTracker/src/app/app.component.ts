import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, Inject, inject } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Observable, map, startWith, switchMap } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { catchError, of, firstValueFrom } from 'rxjs';
import { ENV } from '../../environment';
import { AsyncPipe } from '@angular/common';
import { NgFor } from '@angular/common';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MatMomentDateModule,
  MomentDateAdapter,
} from '@angular/material-moment-adapter';

import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { DownloadComponent } from './download/download.component';
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
const headers = { Authorization: ENV.API_KEY };
@Component({
  selector: 'app-root',
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
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatMomentDateModule,
    MatButtonModule,
    HttpClientModule,
    AsyncPipe,
    NgFor,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    CommonModule,
    MatIconButton,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    public dialog: MatDialog
  ) {}
  // OnInit
  ngOnInit() {
    this.fetchProjects();
    this.route.queryParams.subscribe((params) => {
      if (params['password'] === ENV.PASSWORD) {
        this.authorized = true;
        this.showNotification = false;
      } else {
        this.notification = 'Nicht authorisiert';
        this.isSuccess = false;
        this.isError = true;
        this.showNotification = true;
      }
    });
  }
  // states
  isLoading = false;
  showNotification = false;
  notification = '';
  isError = false;
  isSuccess = false;
  authorized = false;

  // form
  date = new FormControl(new Date());
  comment = '-';
  title = '';
  status = false;
  from = this.setCurrentTime();
  to = this.setCurrentTime();
  selectedProject: any;
  selectedTask: any;
  projectSearch = '';
  taskSearch = '';

  // ===============================================================================
  /**
   * Filters
   */
  projectControl = new FormControl();
  taskControl = new FormControl();
  projects: [string, string][] = [];
  tasks: [string, string][] = [];
  filteredProjects: Observable<[string, string][]> = new Observable();
  filteredTasks: Observable<[string, string][]> = new Observable();
  private setupProjectFilters() {
    this.filteredProjects = new Observable();
    this.filteredProjects = this.projectControl.valueChanges.pipe(
      startWith(''),
      map((value) => this.filter('projects', value))
    );
  }
  private setupTaskFilters() {
    this.filteredTasks = new Observable();
    this.filteredTasks = this.taskControl.valueChanges.pipe(
      startWith(''),
      map((value) => this.filter('tasks', value))
    );
  }
  private filter(
    arrayName: 'projects' | 'tasks',
    value: string
  ): [string, string][] {
    const filterValue = value.toLowerCase();
    return this[arrayName].filter((option) =>
      option[1].toLowerCase().includes(filterValue)
    );
  }

  // ===============================================================================
  /**
   * Dialog
   */
  openDialog(): void {
    const dialogRef = this.dialog.open(DownloadComponent);

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      this.download(this.getDate(result.from), this.getDate(result.to));
    });
  }

  // ===============================================================================
  /**
   * Helper Functions
   */
  public getDate(date: any) {
    let tmpDate = '';
    if (date instanceof Date === false) {
      const tmp = (date as any)._i;
      tmpDate =
        tmp.year +
        '-' +
        this.leadingZero(tmp.month + 1) +
        '-' +
        this.leadingZero(tmp.date);
    } else {
      tmpDate = date.toISOString().split('T')[0];
    }
    return tmpDate;
  }
  private setCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private leadingZero(value: number) {
    return value < 10 ? '0' + value : value;
  }

  public taskSelected(id: string) {
    this.selectedTask = id;
  }

  public reset() {
    this.comment = '-';
    this.title = '';
    this.status = false;
    this.from = this.setCurrentTime();
    this.to = this.setCurrentTime();
    this.selectedProject = '';
    this.selectedTask = '';
    this.projectSearch = '';
    this.taskSearch = '';
  }

  private notify() {
    this.showNotification = true;
    setTimeout(() => {
      this.showNotification = false;
    }, 3000);
  }

  public async daily() {
    const result = await this.fetchMeeting();
    if (result) {
      this.fetchDaily(result[0].id);
    } else {
      console.log('No result from fetchMeeting');
    }

    this.from = '08:45';
    this.to = '09:00';
    this.title = 'Daily';
    this.comment = 'Meeting - Standup';
  }

  public setFrom() {
    this.from = this.setCurrentTime();
  }

  public setTo() {
    this.to = this.setCurrentTime();
  }

  // ===============================================================================
  /**
   * Handlers
   */

  public fetchDaily(project: any) {
    this.tasks = [];
    this.getDaily({ project: project }).then((tasks: any) => {
      if (tasks === null) {
        this.notification = 'Fehler beim Abrufen des Dailys';
        this.isSuccess = false;
        this.isError = true;
        this.notify();
        return;
      }
      if (tasks.length === 0) {
        this.notification = 'Kein Daily für dieses Projekt gefunden';
        this.isSuccess = false;
        this.isError = true;
        this.notify();
        return;
      }
      if (tasks[0] === null) {
        this.notification = 'Kein Daily für dieses Projekt gefunden';
        this.isSuccess = false;
        this.isError = true;
        this.notify();
        return;
      }
      this.tasks.push([tasks[0].id, tasks[0].name]);
      this.selectedTask = tasks[0].id;
      this.taskSearch = tasks[0].name;
      this.setupTaskFilters();
    });
  }

  public async fetchMeeting() {
    this.projects = [];
    try {
      const projects: any = await this.getMeeting(); // Await the promise resolution
      if (projects === null) {
        this.notification = 'Fehler beim Abrufen der Projekte';
        this.isSuccess = false;
        this.isError = true;
        this.notify();
        return null; // Ensure you return a value indicating failure or lack of projects
      }

      projects.forEach((project: any) => {
        this.projects.push([project.id, project.name]);
        this.selectedProject = project.id;
        this.projectSearch = project.name;
      });
      this.setupProjectFilters();
      return projects; // Return the projects or some relevant value at the end
    } catch (error) {
      console.error(error);
      // Handle any errors that might occur during getMeeting
      this.notification = 'Error message here';
      this.isSuccess = false;
      this.isError = true;
      this.notify();
      return null; // Return a value indicating an error occurred
    }
  }

  public fetchProjects() {
    this.projects = [];
    this.getProjects().then((projects: any) => {
      if (projects === null) {
        this.notification = 'Fehler beim Abrufen der Projekte';
        this.isSuccess = false;
        this.isError = true;
        this.notify();
        return;
      }
      projects.forEach((project: any) => {
        this.projects.push([project.id, project.name]);
      });
      this.setupProjectFilters();
    });
  }

  public projectSelected(id: string) {
    this.selectedProject = id;
    this.tasks = [];
    this.getTasks({ project: id }).then((tasks: any) => {
      if (tasks === null) {
        this.notification = 'Feher beim Abrufen der Tasks';
        this.isSuccess = false;
        this.isError = true;
        this.notify();
        return;
      }
      try {
        tasks.forEach((task: any) => {
          this.tasks.push([task.id, task.name]);
        });
        this.setupTaskFilters();
      } catch (error) {
        this.notification = 'Kein Task für dieses Projekt gefunden';
        this.isSuccess = false;
        this.isError = true;
        this.notify();
      }
    });
  }

  public async save() {
    if (this.projectSearch === '' || this.taskSearch === '') {
      this.notification = 'Bitte Projekt und Task auswählen';
      this.isSuccess = false;
      this.isError = true;
      this.notify();
      return;
    }
    if (this.title === '') {
      this.notification = 'Bitte Titel eingeben';
      this.isSuccess = false;
      this.isError = true;
      this.notify();
      return;
    }
    if (this.comment === '') {
      this.comment = '-';
    }
    if (this.from === this.to) {
      this.notification = 'Bitte unterschiedliche Zeiten eingeben';
      this.isSuccess = false;
      this.isError = true;
      this.notify();
      return;
    }
    this.isLoading = true;
    const body = {
      date: this.getDate(this.date.value),
      from: this.from,
      to: this.to,
      project: this.selectedProject,
      task: this.selectedTask,
      kommentar: this.comment,
      status: this.status ? 'Erledigt' : 'In Bearbeitung',
      bezeichnung: this.title,
    };
    this.postLog(body).then((response: any) => {
      if (response === null) {
        this.notification = 'Fehler beim Speichern des Eintrags';
        this.isSuccess = false;
        this.isError = true;
        this.notify();
        this.isLoading = false;
        return;
      }
      this.notification = 'Eintrag erfolgreich gespeichert';
      this.isSuccess = true;
      this.isError = false;
      this.notify();
      this.isLoading = false;
      this.reset();
    });
  }

  public download(from: string, to: string) {
    this.isLoading = true;
    const queryParams = {
      from: from,
      to: to,
    };
    this.downloadExcel(queryParams).then((response: any) => {
      if (response === null) {
        this.notification = 'Fehler beim Download';
        this.isSuccess = false;
        this.isError = true;
        this.isLoading = false;
        this.notify();
        return;
      }
      this.notification = 'Download erfolgreich';
      this.isSuccess = true;
      this.isError = false;
      this.isLoading = false;
      this.notify();
    });
  }

  // ===============================================================================
  /**
   * API Calls
   */
  async getProjects() {
    const observable = this.http.get(ENV.URL + '/projects', { headers }).pipe(
      catchError(() => {
        return of(null);
      })
    );
    return await firstValueFrom(observable);
  }
  async getMeeting() {
    const observable = this.http.get(ENV.URL + '/meeting', { headers }).pipe(
      catchError(() => {
        return of(null);
      })
    );
    return await firstValueFrom(observable);
  }
  async getTasks(queryParams: { [key: string]: string }) {
    let params = new HttpParams();
    for (const key of Object.keys(queryParams)) {
      params = params.append(key, queryParams[key]);
    }
    const options = { params: params, headers: headers };
    const observable = this.http.get(ENV.URL + '/tasks', options).pipe(
      catchError(() => {
        return of(null);
      })
    );
    return await firstValueFrom(observable);
  }
  async getDaily(queryParams: { [key: string]: string }) {
    let params = new HttpParams();
    for (const key of Object.keys(queryParams)) {
      params = params.append(key, queryParams[key]);
    }
    const options = { params: params, headers: headers };
    const observable = this.http.get(ENV.URL + '/daily', options).pipe(
      catchError(() => {
        return of(null);
      })
    );
    return await firstValueFrom(observable);
  }
  async postLog(body: { [key: string]: any }) {
    const observable = this.http.post(ENV.URL + '/log', body, { headers }).pipe(
      catchError(() => {
        return of(null);
      })
    );
    return firstValueFrom(observable);
  }

  async downloadExcel(queryParams: { [key: string]: string }) {
    let params = new HttpParams();
    for (const key of Object.keys(queryParams)) {
      params = params.append(key, queryParams[key]);
    }
    const httpOptions = {
      headers: headers,
      params: params,
      responseType: 'arraybuffer' as 'arraybuffer', // This tells Angular to expect a Blob as response
    };

    this.http.get(ENV.URL + '/logs', httpOptions).subscribe(
      (arrayBuffer) => {
        const blob = new Blob([arrayBuffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

        // Proceed to create the download link as before
        const anchor = document.createElement('a');
        anchor.href = URL.createObjectURL(blob);
        anchor.download = 'filename.xlsx';

        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);

        URL.revokeObjectURL(anchor.href);
      },
      (error) => {
        this.isError = true;
        this.isSuccess = false;
        this.notification = 'Fehler beim Download';
        this.notify();
      }
    );
  }
}
