import { useState } from 'react'
import { supabase } from '../Auth/SupabaseClient'
import { initialStudent } from '../constants/student'
import { backupStudentRecord } from './useLocalBackup'

/** Builds the storage path and uploads a student image. Returns the path to store in DB. */
async function uploadStudentImage(file, name, fatherName, serialNo) {
  const cleanName = (name || 'Unknown').trim().replace(/\s+/g, '_')
  const cleanFather = (fatherName || 'Unknown').trim().replace(/\s+/g, '_')
  const serialPart = serialNo?.trim() ? `_${serialNo.trim().replace(/\s+/g, '_')}` : ''
  const ext = file.name.split('.').pop()
  // This is the path inside the bucket (no bucket name prefix)
  const storagePath = `images/${cleanName}_${cleanFather}${serialPart}.${ext}`

  const { data, error } = await supabase.storage
    .from('Darul-Uloom-Students')
    .upload(storagePath, file, { upsert: true })

  if (error) throw new Error('Image upload failed: ' + error.message)

  // data.path is the path inside the bucket; data.fullPath includes the bucket name.
  // We always want just the bucket-relative path for getPublicUrl() to work correctly.
  // Use our calculated storagePath as the canonical value since we control it.
  return storagePath
}

/** Strips file field and coerces numeric/date fields before DB insert/update */
function prepareRecord(formData) {
  const record = {
    ...formData,
    source_row: formData.source_row ? Number(formData.source_row) : null,
    dob: formData.dob || null,
    tareekh_daakhla: formData.tareekh_daakhla || null,
    tareekh_ijaara: formData.tareekh_ijaara || null,
    // Store null instead of empty string so getPublicUrl checks work correctly
    student_image: formData.student_image || null,
  }
  delete record.student_image_file
  return record
}

export function useStudentForm({ onSuccess }) {
  const [form, setForm] = useState(initialStudent)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (name, file) => {
    setForm(prev => ({ ...prev, [name]: file }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.name || !form.cnic || !form.district) {
      setError('Name, CNIC, and District are required')
      return
    }

    const record = prepareRecord(form)

    if (form.student_image_file) {
      try {
        record.student_image = await uploadStudentImage(
          form.student_image_file, form.name, form.father_name, form.serial_no
        )
        console.log('[ADD] student_image path to save:', record.student_image)
      } catch (err) {
        setError(err.message)
        return
      }
    }

    delete record.id
    console.log('[ADD] inserting record:', record)

    const { data: insertData, error: insertErr } = await supabase.from('students').insert([record]).select()
    console.log('[ADD] insert result:', insertData, insertErr)
    if (insertErr) {
      setError(insertErr.message)
      return
    }

    // Back up the newly inserted record locally
    if (insertData?.[0]) backupStudentRecord(insertData[0])

    setSuccess('Student added successfully')
    setForm(initialStudent)
    onSuccess?.()
  }

  return { form, setForm, error, success, handleChange, handleFileChange, handleSubmit }
}

export function useStudentEdit({ onSuccess }) {
  const [editForm, setEditForm] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleEditChange = e => {
    const { name, value } = e.target
    setEditForm(prev => ({ ...prev, [name]: value }))
  }

  const handleEditFileChange = (name, file) => {
    setEditForm(prev => ({ ...prev, [name]: file }))
  }

  const handleUpdate = async e => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!editForm.name || !editForm.district) {
      setError('Name and District are required')
      return
    }

    const record = prepareRecord(editForm)

    if (editForm.student_image_file) {
      try {
        record.student_image = await uploadStudentImage(
          editForm.student_image_file, editForm.name, editForm.father_name, editForm.serial_no
        )
        console.log('[EDIT] student_image path to save:', record.student_image)
      } catch (err) {
        setError(err.message)
        return
      }
    }

    console.log('[EDIT] updating record id:', record.id, 'student_image:', record.student_image)

    const { data: updateData, error: updateErr } = await supabase.from('students').update(record).eq('id', record.id).select()
    console.log('[EDIT] update result:', updateData, updateErr)
    if (updateErr) {
      setError(updateErr.message)
      return
    }

    // Back up the updated record locally
    if (updateData?.[0]) backupStudentRecord(updateData[0])

    setSuccess('Student updated successfully')
    setEditForm(null)
    onSuccess?.()
  }

  return { editForm, setEditForm, error, success, handleEditChange, handleEditFileChange, handleUpdate }
}
