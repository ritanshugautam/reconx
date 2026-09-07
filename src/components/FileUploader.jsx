import { useRef, useState } from 'react'

export default function FileUploader({ label, onParsed, fileName, onClear }) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  function handleFile(file) {
    if (!file) return
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      alert('Please upload a CSV file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File too large. Max 5MB.')
      return
    }
    window.Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete(results) {
        if (results.data.length === 0) {
          alert('CSV appears to be empty')
          return
        }
        onParsed(results.data, file.name)
      },
      error(err) {
        alert('Could not parse CSV: ' + err.message)
      },
    })
  }

  function onDrop(e) {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  const zoneClass = [
    'upload-zone',
    dragOver ? 'drag-over' : '',
    fileName ? 'has-file' : '',
  ].filter(Boolean).join(' ')

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files[0])}
      />
      <div
        className={zoneClass}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !fileName && inputRef.current.click()}
      >
        {!fileName ? (
          <>
            <div className="upload-icon">📂</div>
            <p><strong>{label}</strong></p>
            <p>Drop CSV here or click to browse</p>
          </>
        ) : (
          <>
            <div className="upload-icon">✅</div>
            <p className="filename">{fileName}</p>
            <button
              className="btn-ghost"
              style={{ marginTop: '0.5rem' }}
              onClick={e => { e.stopPropagation(); onClear() }}
            >
              Remove
            </button>
          </>
        )}
      </div>
    </>
  )
}
