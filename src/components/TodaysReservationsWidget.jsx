import React, {useEffect, useState} from 'react'
import {fetchFirestoreData} from '../../config/firebase' // Adjust the import path as necessary

const TodaysReservationsWidget = () => {
  const [reservations, setReservations] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchFirestoreData('reservierung_cafe')
      const filteredData = data.filter((reservation) => {
        const reservationDate = new Date(reservation.date).toDateString()
        const todayDate = new Date().toDateString()
        return reservationDate === todayDate
      })
      setReservations(filteredData.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot)))
      console.log(filteredData.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot)))
    }

    fetchData()
  }, [])

  return (
    <div style={{padding: '20px', fontFamily: 'Arial, sans-serif'}}>
      <h2 style={{color: '#333'}}>Todays Reservations</h2>
      {reservations.length > 0 ? (
        <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '20px'}}>
          <thead>
            <tr>
              <th style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}>Name</th>
              <th style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}>Guests</th>
              <th style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}>Kids</th>
              <th style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}>
                TimeSlot
              </th>
              <th style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}>Email</th>
              <th style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}>Phone</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => (
              <tr key={reservation.id}>
                <td style={{border: '1px solid #ddd', padding: '8px'}}>{reservation.name}</td>
                <td style={{border: '1px solid #ddd', padding: '8px'}}>{reservation.guests}</td>
                <td style={{border: '1px solid #ddd', padding: '8px'}}>{reservation.kids}</td>
                <td style={{border: '1px solid #ddd', padding: '8px'}}>{reservation.timeSlot}</td>
                <td style={{border: '1px solid #ddd', padding: '8px'}}>{reservation.email}</td>
                <td style={{border: '1px solid #ddd', padding: '8px'}}>
                  {reservation.telefon}
                </td>{' '}
                {/* Ensure you have a phone field in your data */}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No reservations for today.</p>
      )}
    </div>
  )
}

export default TodaysReservationsWidget
