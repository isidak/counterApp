import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomePagePage } from './home-page.page';

describe('HomePageComponent', () => {
  let component: HomePagePage;
  let fixture: ComponentFixture<HomePagePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomePagePage ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomePagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
