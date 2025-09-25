import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { attributeService } from '../services/attributeService'
import { CreateAttributeDto, UpdateAttributeDto } from '../types'
import { AxiosError } from 'axios'
import { queryClient } from '@/lib/queryClient'

export const useAttributeMutations = () => {
   

  const createAttributeMutation = useMutation({
    mutationFn: (data: CreateAttributeDto) => attributeService.createAttribute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attributes'] })
      queryClient.invalidateQueries({ queryKey: ['subcategory-attributes'] })
      toast.success('Attribute created successfully')
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || 'Failed to create attribute')
    }
  })

  const updateAttributeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAttributeDto }) => 
      attributeService.updateAttribute(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attributes'] })
      queryClient.invalidateQueries({ queryKey: ['subcategory-attributes'] })
      toast.success('Attribute updated successfully')
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || 'Failed to update attribute')
    }
  })

  const toggleStatusMutation = useMutation({
    mutationFn: (id: string) => attributeService.toggleAttributeStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attributes'] })
      queryClient.invalidateQueries({ queryKey: ['subcategory-attributes'] })
      toast.success('Attribute status updated successfully')
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || 'Failed to update attribute status')
    }
  })

  const deleteAttributeMutation = useMutation({
    mutationFn: (id: string) => attributeService.deleteAttribute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attributes'] })
      queryClient.invalidateQueries({ queryKey: ['subcategory-attributes'] })
      toast.success('Attribute deleted successfully')
    },
    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message || 'Failed to delete attribute')
    }
  })

  return {
    createAttributeMutation,
    updateAttributeMutation,
    toggleStatusMutation,
    deleteAttributeMutation
  }
}