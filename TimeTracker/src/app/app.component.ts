import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Observable, map, startWith, switchMap } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { catchError, of, firstValueFrom } from 'rxjs';
import { ENV } from '../../envitonment';
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
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MatMomentDateModule,
  MomentDateAdapter,
} from '@angular/material-moment-adapter';

import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
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
  constructor(private http: HttpClient, private route: ActivatedRoute) {}
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
   * Helper Functions
   */
  public getDate() {
    let tmpDate = '';
    if (this.date.value instanceof Date === false) {
      const tmp = (this.date.value as any)._i;
      tmpDate =
        tmp.year +
        '-' +
        this.leadingZero(tmp.month + 1) +
        '-' +
        this.leadingZero(tmp.date);
    } else {
      tmpDate = this.date.value.toISOString().split('T')[0];
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

  private reset() {
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

  public daily() {
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
      date: this.getDate(),
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
  async postLog(body: { [key: string]: any }) {
    const observable = this.http.post(ENV.URL + '/log', body, { headers }).pipe(
      catchError(() => {
        return of(null);
      })
    );
    return firstValueFrom(observable);
  }
}
