import { useState, useCallback } from 'react'
import { supabase } from '../Auth/SupabaseClient'

export const initialRoom = {
  room_number: '',
  capacity: '',
  current_occupancy: '',
  notes: '',
  image: null,
  image_file: null,
}

async function uploadRoomImage(file, roomNumber) {
  const clean = roomNumber.trim().replace(/\s+/g, '_')
  const ext = file.name.split('.').pop()
  const path = `${clean}_${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('rooms')
    .upload(path, file, { upsert: true })

  if (error) throw new Error('Image upload failed: ' + error.message)
  return path
}

export function useRooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchRooms = useCallback(async () => {
    setLoading(true)
    const { data, error: fetchErr } = await supabase
      .from('rooms')
      .select('*')
      .order('room_number', { ascending: true })

    if (fetchErr) setError(fetchErr.message)
    else setRooms(data || [])
    setLoading(false)
  }, [])

  const addRoom = async (form) => {
    setError('')
    setSuccess('')

    if (!form.room_number || !form.capacity) {
      setError('Room number and capacity are required')
      return false
    }

    let imagePath = null
    if (form.image_file) {
      try {
        imagePath = await uploadRoomImage(form.image_file, form.room_number)
      } catch (err) {
        setError(err.message)
        return false
      }
    }

    const payload = {
      room_number: form.room_number.trim(),
      capacity: Number(form.capacity),
      current_occupancy: Number(form.current_occupancy) || 0,
      notes: form.notes || null,
      image: imagePath,
    }

    const { error: insertErr } = await supabase.from('rooms').insert([payload])
    if (insertErr) {
      setError(insertErr.message)
      return false
    }

    setSuccess('Room added successfully')
    await fetchRooms()
    return true
  }

  const updateRoom = async (form) => {
    setError('')
    setSuccess('')

    if (!form.room_number || !form.capacity) {
      setError('Room number and capacity are required')
      return false
    }

    let imagePath = form.image // keep existing
    if (form.image_file) {
      try {
        imagePath = await uploadRoomImage(form.image_file, form.room_number)
      } catch (err) {
        setError(err.message)
        return false
      }
    }

    const payload = {
      room_number: form.room_number.trim(),
      capacity: Number(form.capacity),
      current_occupancy: Number(form.current_occupancy) || 0,
      notes: form.notes || null,
      image: imagePath || null,
    }

    const { error: updateErr } = await supabase.from('rooms').update(payload).eq('id', form.id)
    if (updateErr) {
      setError(updateErr.message)
      return false
    }

    setSuccess('Room updated successfully')
    await fetchRooms()
    return true
  }

  const deleteRoom = async (id) => {
    setError('')
    const { error: delErr } = await supabase.from('rooms').delete().eq('id', id)
    if (delErr) {
      setError(delErr.message)
      return false
    }
    setSuccess('Room deleted')
    await fetchRooms()
    return true
  }

  return {
    rooms, loading, error, success,
    setError, setSuccess,
    fetchRooms, addRoom, updateRoom, deleteRoom,
  }
}
