export type InputType = 'text' | 'number' | 'dropdown' | 'multiselect' | 'boolean' | 'radio'

export interface AttributeValue {
  value: string
  order?: number
}

export interface Attribute {
  _id: string
  name: string
  subcategory: {
    _id: string
    name: string
    category?: {
      _id: string
      name: string
    }
  } | string
  inputType: InputType
  required?: boolean
  values?: AttributeValue[]
  order?: number
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateAttributeDto {
  name: string
  subcategory: string
  inputType: InputType
  required?: boolean
  values?: AttributeValue[]
  order?: number
  isActive?: boolean
}

export interface UpdateAttributeDto {
  name?: string
  subcategory?: string
  inputType?: InputType
  required?: boolean
  values?: AttributeValue[]
  order?: number
  isActive?: boolean
}

export interface GetAttributesQuery {
  page?: number
  limit?: number
  search?: string
  subcategory?: string
  inputType?: InputType
  isActive?: 'true' | 'false'
  sortBy?: 'name' | 'order' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}

export interface AttributesResponse {
  data: Attribute[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
  message: string
}