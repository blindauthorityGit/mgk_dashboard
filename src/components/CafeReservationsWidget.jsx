import React, {useState, useEffect} from 'react'
import {fetchFirestoreData, deleteReservation} from '../../config/firebase' // Ensure you have a delete function
import '../../css/index.css' // Import your Tailwind CSS file

const ConfirmationModal = ({isOpen, onClose, onConfirm, selectedReservationId}) => {
  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div style={{background: 'white', padding: '20px', borderRadius: '5px'}}>
        <p>Wollen Sie diesen Termin wirklich Stornieren?</p>
        <p>{selectedReservationId}</p>
        <button onClick={onConfirm}>JA</button>
        <button onClick={onClose}>NEIN</button>
      </div>
    </div>
  )
}

const ITEMS_PER_PAGE = 50

const CafeReservationsWidget = () => {
  const [reservations, setReservations] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedReservationId, setSelectedReservationId] = useState(null)

  const [sortedReservations, setSortedReservations] = useState([])
  const [sortConfig, setSortConfig] = useState({key: null, direction: 'ascending'})
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchFirestoreData('reservierung_cafe')
      setReservations(data)
      setSortedReservations(data.slice(0, ITEMS_PER_PAGE)) // Initialize with first page
    }
    fetchData()
  }, [])

  useEffect(() => {
    let sortedData = [...reservations]
    if (sortConfig.key) {
      sortedData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1
        }
        return 0
      })
    }
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const paginatedData = sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE)
    setSortedReservations(paginatedData)
  }, [reservations, sortConfig, currentPage]) // Including currentPage in the dependency array

  const requestSort = (key) => {
    const isAsc = sortConfig.key === key && sortConfig.direction === 'ascending'
    setSortConfig({
      key,
      direction: isAsc ? 'descending' : 'ascending',
    })
  }
  const handlePageChange = (page) => {
    setCurrentPage(page) // Now, this is enough to trigger a recalculation of displayed reservations
  }

  const handleDelete = async (id) => {
    const wasDeleted = await deleteReservation(id)
    if (wasDeleted) {
      console.log('The reservation was successfully deleted.')
      setReservations(reservations.filter((reservation) => reservation.id !== id))
      setModalOpen(false)
      // Perform additional actions on success, e.g., updating state to remove the reservation from the UI
    } else {
      console.log('There was a problem deleting the reservation.')
      // Handle the error case, e.g., show a message to the user
    }
  }

  // Render pages based on reservations length
  const totalPages = Math.ceil(reservations.length / ITEMS_PER_PAGE)
  const pages = Array.from({length: totalPages}, (_, i) => i + 1)

  return (
    <div style={{padding: '20px', fontFamily: 'Arial, sans-serif'}}>
      <h2 style={{color: '#333'}}>Cafe Reservations</h2>
      {reservations.length > 0 ? (
        <>
          <table className="bigTable" style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr>
                <th
                  className="font-bold text-pink-500 !text-2xl"
                  style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}
                >
                  Storno
                </th>
                <th
                  className="font-bold text-pink-500 !text-2xl"
                  onClick={() => requestSort('id')}
                  style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}
                >
                  ID
                </th>
                <th
                  onClick={() => requestSort('name')}
                  style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}
                >
                  Name
                </th>
                <th
                  onClick={() => requestSort('date')}
                  style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}
                >
                  Date
                </th>
                <th
                  onClick={() => requestSort('timeSlot')}
                  style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}
                >
                  Timeslot
                </th>
                <th
                  onClick={() => requestSort('guests')}
                  style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}
                >
                  Guests
                </th>
                <th
                  onClick={() => requestSort('kids')}
                  style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}
                >
                  Kids
                </th>
                <th style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}>Email</th>
                <th style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}>
                  Telephone
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedReservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>
                    <button
                      style={{
                        background: '#df3288',
                        border: 'none',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        setModalOpen(true)
                        setSelectedReservationId(reservation.id)
                      }}
                    >
                      Stornieren
                    </button>
                  </td>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>{reservation.id}</td>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>{reservation.name}</td>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>
                    {new Date(reservation.date).toLocaleDateString()}
                  </td>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>{reservation.timeSlot}</td>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>{reservation.guests}</td>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>{reservation.kids}</td>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>{reservation.email}</td>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>{reservation.telefon}</td>
                </tr>
              ))}
            </tbody>
          </table>{' '}
          <div
            style={{display: 'flex', justifyContent: 'center', width: '100%', padding: '1rem 0'}}
          >
            <button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              style={{margin: '0 0.25rem'}}
            >
              &lt; {/* Left Arrow */}
            </button>

            {pages
              .filter((page) => {
                // Show first 10 pages, last page, and current page range
                if (
                  page <= 10 || // First 10 pages
                  page === totalPages || // Last page
                  (page >= currentPage - 1 && page <= currentPage + 1) // Pages near current page
                ) {
                  return true
                }
                return false
              })
              .map((page, index, filteredPages) => {
                // Add "..." for skipped ranges
                const isEllipsis = index > 0 && page > (filteredPages[index - 1] || 0) + 1

                return isEllipsis ? (
                  <span key={`ellipsis-${index}`} style={{margin: '0 0.25rem'}}>
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    style={{
                      margin: '0 0.25rem',
                      fontWeight: currentPage === page ? 'bold' : 'normal',
                    }}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                )
              })}

            <button
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              style={{margin: '0 0.25rem'}}
            >
              &gt; {/* Right Arrow */}
            </button>
          </div>
          <ConfirmationModal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            selectedReservationId={selectedReservationId}
            onConfirm={() => handleDelete(selectedReservationId)}
          />
        </>
      ) : (
        <p>No reservations found.</p>
      )}
      {/* <button onClick={handleShowAll}>Show All Reservations</button> */}
    </div>
  )
}

export default CafeReservationsWidget
