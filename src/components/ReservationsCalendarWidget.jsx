import React, {useState, useEffect} from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css' // Import default styles
import {fetchFirestoreData} from '../../config/firebase'

const ReservationsCalendarWidget = () => {
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString())
  const [reservations, setReservations] = useState([])
  const [markedDates, setMarkedDates] = useState([])
  const [selectedDayReservations, setSelectedDayReservations] = useState([]) // New state for selected day's reservations

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchFirestoreData('reservierung_cafe')
      setReservations(data)
      const dates = data.map((res) => new Date(res.date).toLocaleDateString())
      setMarkedDates(dates)
    }

    fetchData()
  }, [])

  const tileClassName = ({date, view}) => {
    if (view === 'month') {
      // Convert the date to locale string for comparison
      const dateStr = date.toLocaleDateString()
      if (markedDates.find((dDate) => dDate === dateStr)) {
        return 'bg-pink-200' // This class indicates a date with reservations
      }
    }
  }

  const handleDayClick = (value) => {
    const clickedDate = value.toLocaleDateString()
    const eventsOnDate = reservations.filter(
      (reservation) => new Date(reservation.date).toLocaleDateString() === clickedDate,
    )
    setSelectedDayReservations(eventsOnDate)
    setCurrentDate(value.toLocaleDateString())
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        padding: '20px',
      }}
    >
      <div>
        <h2>Reservation Calendar</h2>
        <Calendar onClickDay={handleDayClick} tileClassName={tileClassName} />
      </div>
      <div style={{marginLeft: '20px', width: '100%', maxWidth: '600px'}}>
        {/* <h3>Reservations for {currentDate}</h3> */}
        {selectedDayReservations.length > 0 ? (
          <>
            <h3>Reservations for {currentDate}</h3>
            <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '20px'}}>
              <thead>
                <tr>
                  <th style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}>
                    Name
                  </th>
                  <th style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}>
                    Guests
                  </th>
                  <th style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}>
                    Kids
                  </th>
                  <th style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}>
                    TimeSlot
                  </th>
                  <th style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}>
                    Phone
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedDayReservations
                  .sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))
                  .map((reservation) => (
                    <tr key={reservation.id}>
                      <td style={{border: '1px solid #ddd', padding: '8px'}}>{reservation.name}</td>
                      <td style={{border: '1px solid #ddd', padding: '8px'}}>
                        {reservation.guests}
                      </td>
                      <td style={{border: '1px solid #ddd', padding: '8px'}}>{reservation.kids}</td>
                      <td style={{border: '1px solid #ddd', padding: '8px'}}>
                        {reservation.timeSlot}
                      </td>
                      <td style={{border: '1px solid #ddd', padding: '8px'}}>
                        {reservation.telefon}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>{' '}
          </>
        ) : (
          <p>No reservations for this day.</p>
        )}
      </div>
    </div>
  )
}

export default ReservationsCalendarWidget
