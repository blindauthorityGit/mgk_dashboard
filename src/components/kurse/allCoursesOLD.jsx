import React, {useState, useEffect} from 'react'
import {fetchFirestoreData, deleteBuchung} from '../../../config/firebase' // Ensure you have a delete function
import '../../../css/index.css' // Import your Tailwind CSS file

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

const ITEMS_PER_PAGE = 300

const AllCoursesOLD = () => {
  const [reservations, setReservations] = useState([])
  const [filteredReservations, setFilteredReservations] = useState([])

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedReservationId, setSelectedReservationId] = useState(null)

  const [sortedReservations, setSortedReservations] = useState([])
  const [sortConfig, setSortConfig] = useState({key: 'createdAt', direction: 'descending'})
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchFirestoreData('anmeldung_kurse')

      // Convert Firestore timestamps into JavaScript Date objects or set default date
      const transformedData = data.map((item) => {
        return {
          ...item,
          createdAt: item.createdAt?.seconds
            ? new Date(item.createdAt.seconds * 1000)
            : new Date('2000-01-01'), // Default date for undefined createdAt
        }
      })

      setReservations(transformedData.filter((e) => e.name !== 'Johannes Buchner'))
      setFilteredReservations(transformedData.filter((e) => e.name !== 'Johannes Buchner'))
      setSortedReservations(transformedData.slice(0, ITEMS_PER_PAGE)) // Initialize with first page

      console.log('Transformed Data: ', transformedData)
    }
    fetchData()
  }, [])

  useEffect(() => {
    let sortedData = [...reservations]

    if (sortConfig.key) {
      sortedData.sort((a, b) => {
        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]

        if (sortConfig.key === 'createdAt') {
          // Compare Date objects directly (the default '2000-01-01' will automatically come last)
          aValue = a[sortConfig.key]
          bValue = b[sortConfig.key]

          if (aValue < bValue) {
            return sortConfig.direction === 'ascending' ? -1 : 1
          }
          if (aValue > bValue) {
            return sortConfig.direction === 'ascending' ? 1 : -1
          }
          return 0
        } else {
          // For other fields, handle string comparison
          aValue = a[sortConfig.key]?.toString().trim().toLowerCase()
          bValue = b[sortConfig.key]?.toString().trim().toLowerCase()

          if (aValue < bValue) {
            return sortConfig.direction === 'ascending' ? -1 : 1
          }
          if (aValue > bValue) {
            return sortConfig.direction === 'ascending' ? 1 : -1
          }
          return 0
        }
      })
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const paginatedData = sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE)
    setFilteredReservations(paginatedData)
  }, [reservations, sortConfig, currentPage])

  const requestSort = (key) => {
    console.log(key)
    const isAsc = sortConfig.key === key && sortConfig.direction === 'ascending'
    setSortConfig({
      key,
      direction: isAsc ? 'descending' : 'ascending',
    })
    console.log(sortConfig)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page) // Now, this is enough to trigger a recalculation of displayed reservations
  }

  const handleDelete = async (id) => {
    const wasDeleted = await deleteBuchung(id)
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

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase()
    setSearchQuery(query)
    if (query) {
      const filteredData = reservations.filter((reservation) => {
        return Object.values(reservation).some((value) =>
          value.toString().toLowerCase().includes(query),
        )
      })
      console.log(filteredData)
      setFilteredReservations(filteredData)
      setCurrentPage(1) // Reset to the first page
    } else {
      setFilteredReservations(reservations)
    }
  }

  // Render pages based on reservations length
  const totalPages = Math.ceil(reservations.length / ITEMS_PER_PAGE)
  const pages = Array.from({length: totalPages}, (_, i) => i + 1)

  return (
    <div style={{padding: '20px', fontFamily: 'Arial, sans-serif'}}>
      <div className="flex" style={{display: 'flex', justifyContent: 'space-between'}}>
        <h2 className="inline-block" style={{color: '#333'}}>
          Buchungen
        </h2>
        <h2 style={{color: '#333'}}>{`${filteredReservations.length} / ${reservations.length}`}</h2>
      </div>
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={handleSearch}
        style={{
          padding: '8px',
          marginBottom: '20px',
          border: '1px solid #ddd',
          width: '100%',
          boxSizing: 'border-box',
        }}
      />
      {filteredReservations.length > 0 ? (
        <>
          <table className="bigTable" style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr>
                <th
                  className="font-bold text-pink-500 !text-2xl"
                  onClick={() => requestSort('createdAt')}
                  style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}
                >
                  CreatedAt
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
                  Datum
                </th>
                <th
                  onClick={() => requestSort('kurs')}
                  style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}
                >
                  Kurs
                </th>
                <th
                  onClick={() => requestSort('trainer')}
                  style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}
                >
                  Trainer
                </th>
                <th
                  onClick={() => requestSort('name')}
                  style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}
                >
                  Name
                </th>
                <th style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}>Email</th>
                <th style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}>
                  Telephone
                </th>
                <th
                  onClick={() => requestSort('wohnort')}
                  style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}
                >
                  Wohnort
                </th>
                <th style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}>
                  Geburtsdatum / ET
                </th>
                <th style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}>
                  Geschwister
                </th>
                <th style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}>
                  Zwillinge
                </th>
                <th style={{border: '1px solid #ddd', padding: '8px', textAlign: 'left'}}>
                  Nachricht
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>
                    {reservation.createdAt
                      ? reservation.createdAt
                          .toLocaleString('de-DE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                          .replace(',', '')
                      : 'No timestamp found'}
                  </td>

                  <td style={{border: '1px solid #ddd', padding: '8px'}}>{reservation.id}</td>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>{reservation.name}</td>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>
                    {new Date(reservation.date).toLocaleDateString()}
                  </td>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>{reservation.kurs}</td>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>{reservation.trainer}</td>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>{reservation.name}</td>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>{reservation.email}</td>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>{reservation.phone}</td>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>{reservation.wohnort}</td>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>
                    {reservation.birthDate}
                  </td>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>{reservation.siblings}</td>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>{reservation.twins}</td>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>{reservation.message}</td>
                  <td style={{border: '1px solid #ddd', padding: '8px'}}>
                    <button
                      style={{
                        background: '#df3288',
                        border: 'none',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        setModalOpen(true)
                        setSelectedReservationId(reservation.id)
                      }}
                    >
                      Löschen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>{' '}
          <div
            style={{display: 'flex', justifyContent: 'center', width: '100%', padding: '1rem 0'}}
          >
            {pages.map((page) => (
              <button
                style={{margin: ' 0 0.25rem'}}
                key={page}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
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

export default AllCoursesOLD
