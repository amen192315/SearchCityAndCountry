import { Routes } from '@angular/router';
import { CitiesComponent } from './pages/cities/cities.component';
import { CountriesComponent } from './pages/countries/countries.component';
import { LayoutComponent } from './core/components/layout/layout.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { cityResolver } from './pages/cities/resolvers/city.resolver';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'countries',
        pathMatch: 'full',
      },
      {
        path: 'countries',
        component: CountriesComponent,
      },
      {
        path: 'cities',
        component: CitiesComponent,
        resolve: {
          citiesData: cityResolver,
        },
      },
    ],
  },
  { path: '404', component: NotFoundComponent },
  { path: '**', redirectTo: '404' },
];
