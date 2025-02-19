import CafeReservationsWidget from '../components/CafeReservationsWidget'
import TodaysReservationWidget from '../components/TodaysReservationsWidget'
import ReservationsCalendarWidget from '../components/ReservationsCalendarWidget'

export default {
  widgets: [
    {
      name: 'cafe-reservations',
      component: CafeReservationsWidget,
    },
    {
      name: 'calendar-reservations',
      component: ReservationsCalendarWidget,
    },
    {
      name: 'today-reservations',
      component: TodaysReservationWidget,
    },
  ],
}
