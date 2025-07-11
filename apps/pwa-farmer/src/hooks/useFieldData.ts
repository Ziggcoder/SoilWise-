import { useQuery, useMutation, useQueryClient } from 'react-query'
import { db } from '@/database'
import type { Field, FieldFormData } from '@/types'

export const useFieldData = () => {
  const queryClient = useQueryClient()

  // Fetch all fields
  const {
    data: fields = [],
    isLoading: isLoadingFields,
    error: fieldsError
  } = useQuery('fields', () => db.fields.toArray())

  // Fetch field by ID
  const useField = (id: number) => {
    return useQuery(['field', id], () => db.fields.get(id), {
      enabled: !!id
    })
  }

  // Create field mutation
  const createField = useMutation({
    mutationFn: async (fieldData: FieldFormData) => {
      const field: Omit<Field, 'id'> = {
        farmId: 1, // Default farm for now
        name: fieldData.name,
        size: fieldData.size,
        cropType: fieldData.cropType,
        plantingDate: new Date(fieldData.plantingDate),
        harvestDate: fieldData.harvestDate ? new Date(fieldData.harvestDate) : undefined,
        location: {
          lat: 0, // Will be filled by GPS
          lng: 0,
          polygon: []
        },
        soilType: fieldData.soilType,
        syncStatus: 'pending',
        lastModified: new Date(),
        notes: fieldData.notes
      }

      return await db.fields.add(field)
    },
    onSuccess: () => {
      queryClient.invalidateQueries('fields')
    }
  })

  // Update field mutation
  const updateField = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Field> }) => {
      return await db.fields.update(id, {
        ...updates,
        lastModified: new Date(),
        syncStatus: 'pending'
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries('fields')
    }
  })

  // Delete field mutation
  const deleteField = useMutation({
    mutationFn: async (id: number) => {
      return await db.fields.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries('fields')
    }
  })

  // Get field statistics
  const useFieldStats = () => {
    return useQuery('field-stats', async () => {
      const fields = await db.fields.toArray()
      
      return {
        totalFields: fields.length,
        totalArea: fields.reduce((sum, field) => sum + field.size, 0),
        activeCrops: new Set(fields.map(field => field.cropType)).size,
        avgFieldSize: fields.length > 0 ? fields.reduce((sum, field) => sum + field.size, 0) / fields.length : 0
      }
    })
  }

  return {
    // Data
    fields,
    isLoadingFields,
    fieldsError,
    
    // Hooks
    useField,
    useFieldStats,
    
    // Mutations
    createField,
    updateField,
    deleteField
  }
}
