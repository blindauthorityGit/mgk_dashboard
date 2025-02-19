import React, {useEffect, useState} from 'react'
import {fetchFirestoreData} from '../../config/firebase' // Adjust the import path as necessary
import {useRouter} from 'part:@sanity/base/router'

const AllReservations = () => {
  const [reservations, setReservations] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchFirestoreData('dev_cafe')
      setReservations(data)
    }

    fetchData()
  }, [])

  return (
    <div style={{padding: '20px', fontFamily: 'Arial, sans-serif'}}>
      <h2 style={{color: '#333'}}>Cafe Reservations</h2>
      {reservations.length > 0 ? (
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead>
            <tr>
              <th style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}>ID</th>
              <th style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}>Name</th>
              <th style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}>Date</th>
              <th style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}>
                Timeslot
              </th>
              <th style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}>Guests</th>
              <th style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}>Kids</th>
              <th style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}>Email</th>
              <th style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}>
                Telephone
              </th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => (
              <tr key={reservation.id}>
                <td style={{border: '1px solid #ddd', padding: '8px'}}>{reservation.id}</td>
                <td style={{border: '1px solid #ddd', padding: '8px'}}>{reservation.name}</td>
                <td style={{border: '1px solid #ddd', padding: '8px'}}>
                  {new Date(reservation.date).toLocaleDateString()}
                </td>
                <td style={{border: '1px solid #ddd', padding: '8px'}}>{reservation.timeslot}</td>
                <td style={{border: '1px solid #ddd', padding: '8px'}}>{reservation.guest}</td>
                <td style={{border: '1px solid #ddd', padding: '8px'}}>{reservation.kids}</td>
                <td style={{border: '1px solid #ddd', padding: '8px'}}>{reservation.email}</td>
                <td style={{border: '1px solid #ddd', padding: '8px'}}>{reservation.telefon}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No reservations found.</p>
      )}
      {/* <button onClick={handleShowAll}>Show All Reservations</button> */}
    </div>
  )
}

export default AllReservations
