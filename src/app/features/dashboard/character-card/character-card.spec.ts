import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { CharacterCardComponent } from './character-card';
import { GamificationService } from '../../../core/api/gamification.service';

describe('CharacterCardComponent', () => {
  let component: CharacterCardComponent;
  let fixture: ComponentFixture<CharacterCardComponent>;
  let httpTesting: HttpTestingController;
  let service: GamificationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CharacterCardComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    service = TestBed.inject(GamificationService);
    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(CharacterCardComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should create', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne('/api/gamification/profile');
    req.flush({ totalXp: 0, currentLevel: 1, title: 'Novice', xpInCurrentLevel: 0, xpForCurrentLevel: 100, xpToNextLevel: 100 });
    expect(component).toBeTruthy();
  });

  it('should show loading state initially', () => {
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.skeleton-card');
    expect(el).toBeTruthy();
    httpTesting.expectOne('/api/gamification/profile').flush({});
  });

  it('should display profile data when loaded', () => {
    fixture.detectChanges();

    const profile = {
      totalXp: 150,
      currentLevel: 2,
      title: 'Novice',
      xpInCurrentLevel: 50,
      xpForCurrentLevel: 282,
      xpToNextLevel: 232
    };

    httpTesting.expectOne('/api/gamification/profile').flush(profile);
    fixture.detectChanges();

    const levelNum = fixture.nativeElement.querySelector('.level-number');
    const title = fixture.nativeElement.querySelector('.character-title');
    const xpText = fixture.nativeElement.querySelector('.xp-text');
    const xpNext = fixture.nativeElement.querySelector('.xp-next');

    expect(levelNum.textContent).toContain('2');
    expect(title.textContent).toContain('Novice');
    expect(xpText.textContent).toContain('50 / 282 XP');
    expect(xpNext.textContent).toContain('232 XP to next level');
  });

  it('should compute xp percentage correctly', () => {
    fixture.detectChanges();

    httpTesting.expectOne('/api/gamification/profile').flush({
      totalXp: 150,
      currentLevel: 2,
      title: 'Novice',
      xpInCurrentLevel: 50,
      xpForCurrentLevel: 200,
      xpToNextLevel: 150
    });
    fixture.detectChanges();

    expect(component.xpPercent()).toBe(25);
  });

  it('should not render card when profile is null and not loading', () => {
    fixture.detectChanges();
    httpTesting.expectOne('/api/gamification/profile').error(new ProgressEvent('error'));
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('.character-card:not(.skeleton-card)');
    expect(card).toBeNull();
  });
});
