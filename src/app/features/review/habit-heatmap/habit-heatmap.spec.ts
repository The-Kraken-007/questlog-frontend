import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HabitHeatmapComponent } from './habit-heatmap';
import { HabitDay } from '../../../core/models/review';

const week: HabitDay[] = [
  { date: '2026-07-20', completed: 3, total: 3, rate: 100 },
  { date: '2026-07-21', completed: 1, total: 3, rate: 33.3 },
  { date: '2026-07-22', completed: 0, total: 3, rate: 0 },
  { date: '2026-07-23', completed: 0, total: 0, rate: 0 },
  { date: '2026-07-24', completed: 2, total: 2, rate: 100 },
  { date: '2026-07-25', completed: 1, total: 2, rate: 50 },
  { date: '2026-07-26', completed: 0, total: 2, rate: 0 }
];

describe('HabitHeatmapComponent', () => {
  let component: HabitHeatmapComponent;
  let fixture: ComponentFixture<HabitHeatmapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HabitHeatmapComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(HabitHeatmapComponent);
    component = fixture.componentInstance;
    component.days = week;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render 7 cells for the week', () => {
    const cells = fixture.nativeElement.querySelectorAll('.heatmap-cell');
    expect(cells.length).toBe(7);
  });

  it('should classify a fully completed day as full', () => {
    expect(component.cellClass(week[0])).toBe('full');
    expect(component.cellClass(week[4])).toBe('full');
  });

  it('should classify a partially completed day as partial', () => {
    expect(component.cellClass(week[1])).toBe('partial');
    expect(component.cellClass(week[5])).toBe('partial');
  });

  it('should classify a day with no completions as empty', () => {
    expect(component.cellClass(week[2])).toBe('empty');
  });

  it('should classify a day with no habits tracked as none', () => {
    expect(component.cellClass(week[3])).toBe('none');
  });

  it('should build useful tooltips', () => {
    expect(component.tooltip(week[0])).toBe('3/3 habits completed');
    expect(component.tooltip(week[3])).toBe('No habits tracked');
  });
});
