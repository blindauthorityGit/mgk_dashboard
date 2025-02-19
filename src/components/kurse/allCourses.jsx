import React, {useState, useEffect} from 'react'
import {fetchFirestoreData, deleteBuchung} from '../../../config/firebase'
import '../../../css/index.css'

const ConfirmationModal = ({isOpen, onClose, onConfirm, selectedReservationId}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-md">
        <p className="mb-4">Wollen Sie diesen Termin wirklich Stornieren?</p>
        <p className="mb-4">{selectedReservationId}</p>
        <div className="flex justify-end space-x-4">
          <button
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
            onClick={onConfirm}
          >
            JA
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            onClick={onClose}
          >
            NEIN
          </button>
        </div>
      </div>
    </div>
  )
}

const ITEMS_PER_PAGE = 300

const AllCourses = () => {
  const [reservations, setReservations] = useState([])
  const [filteredReservations, setFilteredReservations] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedReservationId, setSelectedReservationId] = useState(null)
  const [sortConfig, setSortConfig] = useState({key: 'createdAt', direction: 'descending'})
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [courseFilter, setCourseFilter] = useState('')

  // Define all possible columns with a label.
  const columns = [
    {key: 'createdAt', label: 'CreatedAt', alwaysShow: true},
    {key: 'id', label: 'ID', alwaysShow: true},
    {key: 'name', label: 'Name', alwaysShow: true},
    {key: 'date', label: 'Datum', alwaysShow: true},
    {key: 'kurs', label: 'Kurs', alwaysShow: true},
    {key: 'trainer', label: 'Trainer', alwaysShow: true},
    {key: 'email', label: 'Email', alwaysShow: true},
    {key: 'phone', label: 'Telephone', alwaysShow: true},
    {key: 'wohnort', label: 'Wohnort'},
    {key: 'birthDate', label: 'Geburtsdatum / ET'},
    {key: 'preferredDays', label: 'Wahldatum'},
    {key: 'siblings', label: 'Geschwister'},
    {key: 'twins', label: 'Zwillinge'},
    {key: 'message', label: 'Nachricht'},
    {key: 'actions', label: 'Aktionen', alwaysShow: true},
  ]

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchFirestoreData('anmeldung_kurse')

      // Transform the data (convert createdAt and apply PEKIP transformations)
      const transformedData = data.map((item) => {
        const createdAtDate = item.createdAt?.seconds
          ? new Date(item.createdAt.seconds * 1000)
          : new Date('2000-01-01')

        if (item.parentName || item.babyNameBirthday || item.babyNameBirthdate) {
          return {
            ...item,
            name: item.parentName || item.name,
            birthDate: item.babyNameBirthday || item.babyNameBirthdate,
            kurs: 'PEKIP',
            isPekip: true,
            createdAt: createdAtDate,
          }
        }

        return {
          ...item,
          createdAt: createdAtDate,
        }
      })

      // Optionally filter out any unwanted entries
      const filteredData = transformedData.filter((e) => e.name !== 'Johannes Buchner')

      setReservations(filteredData)
      setFilteredReservations(filteredData)
      console.log('Transformed Data: ', transformedData)
    }

    fetchData()
  }, [])

  // Apply sorting, pagination, and course filter
  useEffect(() => {
    let sortedData = [...reservations]

    if (courseFilter) {
      sortedData = sortedData.filter((reservation) => reservation.kurs === courseFilter)
    }

    if (sortConfig.key) {
      sortedData.sort((a, b) => {
        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]

        if (sortConfig.key === 'createdAt') {
          if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1
          if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1
          return 0
        } else {
          aValue = a[sortConfig.key]?.toString().trim().toLowerCase()
          bValue = b[sortConfig.key]?.toString().trim().toLowerCase()
          if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1
          if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1
          return 0
        }
      })
    }

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const paginatedData = sortedData.slice(startIndex, startIndex + ITEMS_PER_PAGE)
    setFilteredReservations(paginatedData)
  }, [reservations, sortConfig, currentPage, courseFilter])

  const requestSort = (key) => {
    const isAsc = sortConfig.key === key && sortConfig.direction === 'ascending'
    setSortConfig({key, direction: isAsc ? 'descending' : 'ascending'})
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleDelete = async (id) => {
    const wasDeleted = await deleteBuchung(id)
    if (wasDeleted) {
      console.log('The reservation was successfully deleted.')
      setReservations(reservations.filter((reservation) => reservation.id !== id))
      setModalOpen(false)
    } else {
      console.log('There was a problem deleting the reservation.')
    }
  }

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase()
    setSearchQuery(query)
    if (query) {
      const filteredData = reservations.filter((reservation) =>
        Object.values(reservation).some((value) => value.toString().toLowerCase().includes(query)),
      )
      setFilteredReservations(filteredData)
      setCurrentPage(1)
    } else {
      setFilteredReservations(reservations)
    }
  }

  // Extract unique courses from the data for filtering buttons
  const uniqueCourses = Array.from(new Set(reservations.map((r) => r.kurs))).filter(Boolean)

  // Determine which columns should be visible based on the filtered data.
  const visibleColumns = columns.filter((col) => {
    if (col.alwaysShow) return true
    return filteredReservations.some((r) => {
      const value = r[col.key]
      if (value instanceof Date) {
        return value.toString().trim() !== ''
      }
      return value != null && value.toString().trim() !== ''
    })
  })

  // Helper to render cell content (with some formatting for dates)
  const renderCell = (reservation, colKey) => {
    if (colKey === 'createdAt') {
      return reservation.createdAt
        ? reservation.createdAt
            .toLocaleString('de-DE', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
            .replace(',', '')
        : 'No timestamp found'
    }
    if (colKey === 'date') {
      return new Date(reservation.date).toLocaleDateString()
    }
    if (colKey === 'actions') {
      return (
        <button
          onClick={() => {
            setModalOpen(true)
            setSelectedReservationId(reservation.id)
          }}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Löschen
        </button>
      )
    }
    return reservation[colKey]
  }

  return (
    <div className="p-6 font-sans">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl text-gray-800 font-bold">Buchungen</h2>
        <h2 className="text-gray-700">{`${filteredReservations.length} / ${reservations.length}`}</h2>
      </div>

      {/* Search input */}
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={handleSearch}
        className="w-full p-3 mb-6 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
      />

      {/* Course filter buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => setCourseFilter('')}
          className={`px-4 py-2 rounded-md shadow-sm transition duration-200 ${
            courseFilter === ''
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
          }`}
        >
          Alle Kurse
        </button>
        {uniqueCourses.map((course) => (
          <button
            key={course}
            onClick={() => setCourseFilter(course)}
            className={`px-4 py-2 rounded-md shadow-sm transition duration-200 ${
              courseFilter === course
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            {course}
          </button>
        ))}
      </div>

      {filteredReservations.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  {visibleColumns.map((col) => (
                    <th
                      key={col.key}
                      className="py-3 px-4 border border-gray-200 text-left text-sm font-medium text-gray-700 cursor-pointer select-none"
                      onClick={() => col.key !== 'actions' && requestSort(col.key)}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map((reservation) => (
                  <tr key={reservation.id} className="even:bg-gray-50 hover:bg-gray-100">
                    {visibleColumns.map((col) => (
                      <td
                        key={col.key}
                        className="py-3 px-4 border border-gray-200 text-sm text-gray-700"
                      >
                        {renderCell(reservation, col.key)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex justify-center mt-6 space-x-3">
            {Array.from(
              {length: Math.ceil(reservations.length / ITEMS_PER_PAGE)},
              (_, i) => i + 1,
            ).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-4 py-2 rounded-md transition duration-200 ${
                  currentPage === page
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
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
        <p className="text-center text-gray-600">No reservations found.</p>
      )}
    </div>
  )
}

export default AllCourses
