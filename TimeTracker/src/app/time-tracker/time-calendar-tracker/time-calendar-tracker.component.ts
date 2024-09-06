import {
  Component,
  signal,
  ChangeDetectorRef,
  ViewChild,
  ElementRef,
  OnInit,
  Signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import {
  CalendarOptions,
  DateSelectArg,
  EventClickArg,
  EventApi,
} from '@fullcalendar/core';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { INITIAL_EVENTS, createEventId } from './event-utils';
import { catchError, firstValueFrom, of } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ENV } from '../../../../environment';
const headers = { Authorization: ENV.API_KEY };
@Component({
  selector: 'app-time-calendar-tracker',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FullCalendarModule],
  templateUrl: './time-calendar-tracker.component.html',
  styleUrl: './time-calendar-tracker.component.scss',
})
export class TimeCalendarTrackerComponent implements OnInit {
  @ViewChild('external') external: ElementRef | undefined;

  calendarVisible = signal(true);
  calendarOptions!: Signal<CalendarOptions>;
  projects: [string, string][] = [];
  tasks: Map<string, [string, string][]> = new Map();
  currentEvents = signal<EventApi[]>([]);

  handleEventChange(changeInfo: any) {
    const { event } = changeInfo; // Access the changed event details
    console.log('Event changed:', event);

    // Example: Log new start time or any custom logic
    console.log('New start time:', event.start);
    console.log('New end time:', event.end);
  }

  handleDragStart(event: DragEvent, task: [string, string], project: string) {
    console.log('drag started');
    console.log(event);
    event.dataTransfer?.setData('text/plain', task[0]);
  }

  handleDrop(info: any) {
    console.log('Dropped on:', info.dateStr);
    const title = info.draggedEl.textContent.trim();
    const newEvent = {
      id: title,
      title,
      start: info.startStr,
      end: info.endStr,
      allDay: info.allDay,
    };

    info.view.calendar.addEvent(newEvent);
  }

  constructor(
    private changeDetector: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.fetchProjects();
    this.calendarOptions = signal<CalendarOptions>({
      plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin],
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
      },
      initialView: 'timeGridDay',
      slotMinTime: '06:00:00', // Start time
      slotMaxTime: '22:00:00', // End time
      weekends: false,
      initialEvents: INITIAL_EVENTS,
      editable: true,
      droppable: true, // this allows things to be dropped onto the calendar
      selectable: true,
      selectMirror: true,
      dayMaxEvents: true,
      allDaySlot: false,
      select: this.handleDateSelect.bind(this),
      eventsSet: this.handleEvents.bind(this),
      drop: this.handleDrop.bind(this), // Handle the drop event
      eventReceive: this.handleDrop.bind(this),
      eventChange: this.handleEventChange.bind(this),
      datesSet: this.fetchTodays.bind(this),
      /* you can update a remote database when these fire:
      eventAdd:
      eventChange:
      eventRemove:
      */
    });
    new Draggable(document.getElementById('external-events')!, {
      itemSelector: '.draggable', // Selects which elements inside the container are draggable
      eventData: function (eventEl) {
        const metadata = eventEl.querySelector('.metadata');
        if (metadata) {
          // Extract project and task values from the metadata container
          const projectSpan = metadata.querySelector('.project');
          const taskSpan = metadata.querySelector('.task');

          const project = projectSpan ? projectSpan.textContent : '';
          const task = taskSpan ? taskSpan.textContent : '';

          console.log('Project:', project);
          console.log('Task:', task);
        }
        return {
          title: eventEl.innerText.trim(), // Use the element's text as the event title
        };
      },
    });
  }

  handleCalendarToggle() {
    this.calendarVisible.update((bool) => !bool);
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    const title = prompt('Please enter a new title for your event');
    const calendarApi = selectInfo.view.calendar;

    calendarApi.unselect(); // clear date selection

    if (title) {
      calendarApi.addEvent({
        id: title,
        title,
        start: selectInfo.startStr,
        end: selectInfo.endStr,
        allDay: selectInfo.allDay,
        extendedProps: {
          customProp: 'custom value',
        },
      });
    }
  }

  eventDragStop(model: any) {
    console.log(model);
  }

  handleEvents(events: EventApi[]) {
    this.currentEvents.set(events);
    this.changeDetector.detectChanges(); // workaround for pressionChangedAfterItHasBeenCheckedError
  }

  public fetchProjects() {
    this.projects = [];
    this.getProjects().then((projects: any) => {
      if (projects === null) {
        return;
      }
      projects.forEach((project: any) => {
        this.projects.push([project.id, project.name]);
        this.projectSelected(project.id);
      });
    });
  }

  public projectSelected(id: string) {
    this.getTasks({ project: id }).then((tasks: any) => {
      if (tasks === null) {
        return;
      }
      try {
        var temptasks: [string, string][] = [];
        tasks.forEach((task: any) => {
          temptasks.push([task.id, task.name]);
        });
        this.tasks.set(id, temptasks);
      } catch (error) {}
    });
  }

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
  async getTodays(dinfo: any) {
    console.log(dinfo);
    const observable = this.http
      .request('GET', ENV.URL + '/tasksofday', {
        body: { date: dinfo.start.toISOString().split('T')[0] },
        headers: headers,
      })
      .pipe(
        catchError(() => {
          console.log('error');
          return of(null);
        })
      );
    return await firstValueFrom(observable);
  }

  public fetchTodays(dinfo: any) {
    this.projects = [];
    this.getTodays(dinfo).then((tasks: any) => {
      if (tasks === null) {
        return;
      }
      tasks.forEach((task: any) => {
        console.log(task);
      });
    });
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
