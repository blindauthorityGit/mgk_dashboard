import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {dashboardTool} from '@sanity/dashboard'
import CafeReservationsWidget from './src/components/CafeReservationsWidget' // Ensure the path matches where your widget component is located
import TodaysReservationsWidget from './src/components/TodaysReservationsWidget' // Ensure the path matches where your widget component is located
import ReservationsCalendarWidget from './src/components/ReservationsCalendarWidget' // Ensure the path matches where your widget component is located
import KurseDashboard from './src/components/kurse/kurseDashboard'

export default defineConfig({
  name: 'default',
  title: 'testProject',

  projectId: '9708x9bk',
  dataset: 'production',

  plugins: [
    structureTool(),
    visionTool(),
    dashboardTool({
      widgets: [
        {
          name: 'today-reservations',
          component: TodaysReservationsWidget,
          layout: {width: 'medium'},
        },
        {
          name: 'calendar-reservations',
          component: ReservationsCalendarWidget,
          layout: {width: 'large'},
        },
        {
          name: 'cafe-reservations',
          component: CafeReservationsWidget,
          layout: {width: 'full'},
        },
      ],
    }),
    // Define the new dashboard tool
    {
      name: 'another-dashboard',
      component: KurseDashboard,
      title: 'Another Dashboard',
    },
  ],

  schema: {
    types: schemaTypes,
  },
  tools: (prev) => {
    return [
      ...prev,
      {
        name: 'another-dashboard',
        title: 'Kurs Buchungen',
        component: KurseDashboard,
      },
    ]
  },
})
