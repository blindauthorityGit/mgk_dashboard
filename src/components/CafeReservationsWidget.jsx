import React, { useState, useEffect } from 'react'
import { fetchFirestoreData, deleteReservation } from '../../config/firebase'
import '../../css/index.css'

const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
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
      onClick={onClose}
    >
      <div
        style={{ background: 'white', padding: '20px', borderRadius: '5px' }}
        onClick={e => e.stopPropagation()}
      >
        <p className="mb-4">{message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onConfirm} style={{ padding: '0.5rem', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            JA
          </button>
          <button onClick={onClose} style={{ padding: '0.5rem', background: '#F44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            NEIN
          </button>
        </div>
      </div>
    </div>
  )
}

const ITEMS_PER_PAGE = 50

const CafeReservationsWidget = () => {
  const [reservations, setReservations] = useState([])
  const [displayed, setDisplayed] = useState([])
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' })
  const [currentPage, setCurrentPage] = useState(1)

  // Selection state
  const [selectedIds, setSelectedIds] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [bulkModalOpen, setBulkModalOpen] = useState(false)
  const [singleModal, setSingleModal] = useState({ isOpen: false, id: null })

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchFirestoreData('reservierung_cafe')
      setReservations(data)
    }
    fetchData()
  }, [])

  // Sort & paginate
  useEffect(() => {
    let data = [...reservations]
    if (sortConfig.key) {
      data.sort((a, b) => {
        const aVal = a[sortConfig.key]
        const bVal = b[sortConfig.key]
        if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1
        if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1
        return 0
      })
    }
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    setDisplayed(data.slice(start, start + ITEMS_PER_PAGE))
  }, [reservations, sortConfig, currentPage])

  const requestSort = key => {
    const isAsc = sortConfig.key === key && sortConfig.direction === 'ascending'
    setSortConfig({ key, direction: isAsc ? 'descending' : 'ascending' })
  }

  const totalPages = Math.ceil(reservations.length / ITEMS_PER_PAGE)
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  // Selection handlers
  const handleSelectAll = e => {
    if (e.target.checked) setSelectedIds(displayed.map(r => r.id))
    else setSelectedIds([])
  }
  const toggleSelect = id => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }
  const handleMouseDown = id => {
    setIsDragging(true)
    toggleSelect(id)
  }
  const handleMouseEnter = id => {
    if (isDragging) toggleSelect(id)
  }
  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Delete logic
  const confirmSingle = id => setSingleModal({ isOpen: true, id })
  const doSingleDelete = async () => {
    await deleteReservation(singleModal.id)
    setReservations(prev => prev.filter(r => r.id !== singleModal.id))
    setSelectedIds(prev => prev.filter(i => i !== singleModal.id))
    setSingleModal({ isOpen: false, id: null })
  }
  const confirmBulk = () => setBulkModalOpen(true)
  const doBulkDelete = async () => {
    await Promise.all(selectedIds.map(id => deleteReservation(id)))
    setReservations(prev => prev.filter(r => !selectedIds.includes(r.id)))
    setSelectedIds([])
    setBulkModalOpen(false)
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }} onMouseUp={handleMouseUp}>
      <h2 style={{ color: '#333' }}>Cafe Reservations</h2>
      {reservations.length > 0 ? (
        <>
          <table className="bigTable" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={displayed.length > 0 && selectedIds.length === displayed.length}
                  />
                </th>
             
                <th
                  style={{ border: '1px solid #ddd', padding: '8px', cursor: 'pointer' }}
                  onClick={() => requestSort('name')}
                >
                  Name
                </th>
                <th
                  style={{ border: '1px solid #ddd', padding: '8px', cursor: 'pointer' }}
                  onClick={() => requestSort('date')}
                >
                  Date
                </th>
                <th
                  style={{ border: '1px solid #ddd', padding: '8px', cursor: 'pointer' }}
                  onClick={() => requestSort('timeSlot')}
                >
                  Timeslot
                </th>
                <th
                  style={{ border: '1px solid #ddd', padding: '8px', cursor: 'pointer' }}
                  onClick={() => requestSort('guests')}
                >
                  Guests
                </th>
                <th
                  style={{ border: '1px solid #ddd', padding: '8px', cursor: 'pointer' }}
                  onClick={() => requestSort('kids')}
                >
                  Kids
                </th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Email</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Telephone</th>
               <th
                  className="font-bold text-pink-500 !text-2xl"
                  style={{ border: '1px solid #ddd', padding: '8px', cursor: 'pointer' }}
                  onClick={() => requestSort('id')}
                >
                  ID
                </th>  </tr>
            </thead>
            <tbody>
              {displayed.map(r => (
                <tr
                  key={r.id}
                  style={selectedIds.includes(r.id) ? { backgroundColor: '#eef' } : {}}
                  onMouseDown={() => handleMouseDown(r.id)}
                  onMouseEnter={() => handleMouseEnter(r.id)}
                >
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <input type="checkbox" checked={selectedIds.includes(r.id)} readOnly />
                  </td>
              
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{r.name}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{new Date(r.date).toLocaleDateString()}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{r.timeSlot}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{r.guests}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{r.kids}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{r.email}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{r.telefon}</td>    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{r.id}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0' }}>
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} style={{ margin: '0 0.25rem' }}>&lt;</button>
            {pages.map((p, i, arr) => (
              (p <= 10 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) ? (
                <React.Fragment key={p}>
                  {i>0 && p>arr[i-1]+1 && <span style={{margin:'0 0.25rem'}}>...</span>}
                  <button
                    onClick={() => setCurrentPage(p)}
                    style={{ margin: '0 0.25rem', fontWeight: currentPage===p?'bold':'normal' }}
                  >{p}</button>
                </React.Fragment>
              ) : null
            ))}
            <button disabled={currentPage===totalPages} onClick={() => setCurrentPage(currentPage+1)} style={{ margin: '0 0.25rem' }}>&gt;</button>
          </div>

          {/* Sticky bulk bar */}
          {selectedIds.length > 0 && (
            <div style={{
              position: 'fixed', bottom: 0, left: 0, right: 0,
              backgroundColor: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', boxShadow: '0 -2px 5px rgba(0,0,0,0.1)'
            }}>
              <span>{selectedIds.length} ausgewählt</span>
              <button onClick={confirmBulk} style={{ padding: '0.5rem', background: '#F44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Löschen ausgewählte
              </button>
            </div>
          )}

          {/* Modals */}
          <ConfirmationModal
            isOpen={singleModal.isOpen}
            onClose={() => setSingleModal({ isOpen: false, id: null })}
            onConfirm={doSingleDelete}
            message={`Wollen Sie diese Reservierung (${singleModal.id}) wirklich stornieren?`}
          />
          <ConfirmationModal
            isOpen={bulkModalOpen}
            onClose={() => setBulkModalOpen(false)}
            onConfirm={doBulkDelete}
            message={`Wollen Sie die ausgewählten ${selectedIds.length} Reservierungen wirklich stornieren?`}
          />
        </>
      ) : (
        <p>No reservations found.</p>
      )}
    </div>
  )
}

export default CafeReservationsWidget
