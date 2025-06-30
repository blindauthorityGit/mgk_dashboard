import React, { useState, useEffect } from 'react'
import { fetchFirestoreData, deleteBuchung } from '../../../config/firebase'
import '../../../css/index.css'

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white p-6 rounded shadow-md" onClick={e => e.stopPropagation()}>
        <p className="mb-4">{message}</p>
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
  const [searchQuery, setSearchQuery] = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'descending' })
  const [currentPage, setCurrentPage] = useState(1)

  // Selection state
  const [selectedIds, setSelectedIds] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [bulkModalOpen, setBulkModalOpen] = useState(false)
  const [singleModal, setSingleModal] = useState({ isOpen: false, id: null })

  // Columns definition
  const columns = [
    { key: 'createdAt', label: 'CreatedAt', alwaysShow: true },
    { key: 'id', label: 'ID', alwaysShow: true },
    { key: 'name', label: 'Name', alwaysShow: true },
    { key: 'date', label: 'Datum', alwaysShow: true },
    { key: 'kurs', label: 'Kurs', alwaysShow: true },
    { key: 'trainer', label: 'Trainer', alwaysShow: true },
    { key: 'email', label: 'Email', alwaysShow: true },
    { key: 'phone', label: 'Telephone', alwaysShow: true },
    { key: 'wohnort', label: 'Wohnort' },
    { key: 'birthDate', label: 'Geburtsdatum / ET' },
    { key: 'preferredDays', label: 'Wahldatum' },
    { key: 'siblings', label: 'Geschwister' },
    { key: 'twins', label: 'Zwillinge' },
    { key: 'message', label: 'Nachricht' },
    { key: 'actions', label: 'Aktionen', alwaysShow: true }
  ]

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchFirestoreData('anmeldung_kurse')
      const transformed = data.map(item => {
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
            createdAt: createdAtDate
          }
        }
        return { ...item, createdAt: createdAtDate }
      })
      const filtered = transformed.filter(e => e.name !== 'Johannes Buchner')
      setReservations(filtered)
      setFilteredReservations(filtered)
    }
    fetchData()
  }, [])

  // Compute which columns are visible *once* based on filteredReservations
  const visibleColumns = columns.filter(col => {
    if (col.alwaysShow) return true
    return filteredReservations.some(r => {
      const v = r[col.key]
      return v != null && v.toString().trim() !== ''
    })
  })

  // Apply search, filter, sort, pagination
  useEffect(() => {
    let data = [...reservations]
    if (courseFilter) data = data.filter(r => r.kurs === courseFilter)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      data = data.filter(r =>
        Object.values(r).some(v => v?.toString().toLowerCase().includes(q))
      )
    }
    if (sortConfig.key) {
      data.sort((a, b) => {
        let aVal = a[sortConfig.key]
        let bVal = b[sortConfig.key]
        if (sortConfig.key === 'createdAt') {
          return sortConfig.direction === 'ascending' ? aVal - bVal : bVal - aVal
        }
        aVal = aVal?.toString().toLowerCase() || ''
        bVal = bVal?.toString().toLowerCase() || ''
        return aVal < bVal
          ? (sortConfig.direction === 'ascending' ? -1 : 1)
          : aVal > bVal
            ? (sortConfig.direction === 'ascending' ? 1 : -1)
            : 0
      })
    }
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    setFilteredReservations(data.slice(start, start + ITEMS_PER_PAGE))
  }, [reservations, courseFilter, searchQuery, sortConfig, currentPage])

  // Handlers
  const requestSort = key => {
    const isAsc = sortConfig.key === key && sortConfig.direction === 'ascending'
    setSortConfig({ key, direction: isAsc ? 'descending' : 'ascending' })
  }
  const handleSearch = e => { setSearchQuery(e.target.value); setCurrentPage(1) }
  const handleSelectAll = e => {
    if (e.target.checked) setSelectedIds(filteredReservations.map(r => r.id))
    else setSelectedIds([])
  }
  const toggleSelect = id => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }
  const handleMouseDown = id => { setIsDragging(true); toggleSelect(id) }
  const handleMouseEnter = id => { if (isDragging) toggleSelect(id) }
  const handleMouseUp = () => setIsDragging(false)
  const confirmSingleDelete = id => setSingleModal({ isOpen: true, id })
  const doSingleDelete = async () => {
    await deleteBuchung(singleModal.id)
    setReservations(r => r.filter(x => x.id !== singleModal.id))
    setSelectedIds(s => s.filter(x => x !== singleModal.id))
    setSingleModal({ isOpen: false, id: null })
  }
  const confirmBulkDelete = () => setBulkModalOpen(true)
  const doBulkDelete = async () => {
    await Promise.all(selectedIds.map(id => deleteBuchung(id)))
    setReservations(r => r.filter(x => !selectedIds.includes(x.id)))
    setSelectedIds([])
    setBulkModalOpen(false)
  }

  // Unique courses for filter
  const uniqueCourses = Array.from(new Set(reservations.map(r => r.kurs))).filter(Boolean)
  const totalPages = Math.ceil(reservations.length / ITEMS_PER_PAGE)

  return (
    <div className="p-6 font-sans" onMouseUp={handleMouseUp}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl text-gray-800 font-bold">Buchungen</h2>
        <h2 className="text-gray-700">{`${filteredReservations.length} / ${reservations.length}`}</h2>
      </div>

      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={handleSearch}
        className="w-full p-3 mb-6 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300"
      />

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
        {uniqueCourses.map(course => (
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
                  <th className="py-3 px-4 border border-gray-200">
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={filteredReservations.length > 0 && selectedIds.length === filteredReservations.length}
                    />
                  </th>
                  {visibleColumns.map(col => (
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
                {filteredReservations.map(r => (
                  <tr
                    key={r.id}
                    className={`even:bg-gray-50 hover:bg-gray-100 ${selectedIds.includes(r.id) ? 'bg-blue-100' : ''}`}
                    onMouseDown={() => handleMouseDown(r.id)}
                    onMouseEnter={() => handleMouseEnter(r.id)}
                  >
                    <td className="py-3 px-4 border border-gray-200">
                      <input type="checkbox" checked={selectedIds.includes(r.id)} readOnly />
                    </td>
                    {visibleColumns.map(col => (
                      <td key={col.key} className="py-3 px-4 border border-gray-200 text-sm text-gray-700">
                        {col.key === 'createdAt'
                          ? r.createdAt.toLocaleString('de-DE', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            }).replace(',', '')
                          : col.key === 'date'
                          ? new Date(r.date).toLocaleDateString()
                          : col.key === 'actions'
                          ? (
                              <button
                                onClick={() => confirmSingleDelete(r.id)}
                                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                              >
                                Löschen
                              </button>
                            )
                          : r[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center mt-6 space-x-3">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 rounded-md transition duration-200 ${
                  currentPage === page ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          {selectedIds.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-inner flex justify-between items-center">
              <span>{selectedIds.length} ausgewählt</span>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                onClick={confirmBulkDelete}
              >
                Löschen ausgewählte
              </button>
            </div>
          )}

          <ConfirmationModal
            isOpen={singleModal.isOpen}
            onClose={() => setSingleModal({ isOpen: false, id: null })}
            onConfirm={doSingleDelete}
            message={`Wollen Sie diesen Termin (${singleModal.id}) wirklich stornieren?`}
          />
          <ConfirmationModal
            isOpen={bulkModalOpen}
            onClose={() => setBulkModalOpen(false)}
            onConfirm={doBulkDelete}
            message={`Wollen Sie die ausgewählten ${selectedIds.length} Termine wirklich stornieren?`}
          />
        </>
      ) : (
        <p className="text-center text-gray-600">No reservations found.</p>
      )}
    </div>
  )
}

export default AllCourses
