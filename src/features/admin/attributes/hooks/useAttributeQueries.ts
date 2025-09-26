import { useQuery } from '@tanstack/react-query';
import { attributeService } from '../services/attributeService';
import { GetAttributesQuery } from '../types';

export const useAttributesQuery = (params?: GetAttributesQuery) => {
  return useQuery({
    queryKey: ['attributes', params],
    queryFn: () => attributeService.getAttributes(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAttributeByIdQuery = (id: string) => {
  return useQuery({
    queryKey: ['attribute', id],
    queryFn: () => attributeService.getAttributeById(id),
    enabled: !!id,
  });
};

export const useAttributesBySubcategoryQuery = (subcategoryId: string | undefined) => {
  return useQuery({
    queryKey: ['subcategory-attributes', subcategoryId],
    queryFn: () => attributeService.getAttributesBySubcategory(subcategoryId!),
    enabled: !!subcategoryId,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook to get attributes for multiple subcategories
export const useAttributesBySubcategoriesQuery = (subcategoryIds: string[]) => {
  return useQuery({
    queryKey: ['subcategories-attributes', subcategoryIds],
    queryFn: async () => {
      if (subcategoryIds.length === 0) return { data: [] };

      // Fetch attributes for all selected subcategories in parallel
      const promises = subcategoryIds.map((id) => attributeService.getAttributesBySubcategory(id));

      const results = await Promise.all(promises);

      // Combine and deduplicate attributes by _id
      const allAttributes = results.flatMap((r) => r.data);
      const uniqueAttributes = Array.from(
        new Map(allAttributes.map((attr) => [attr._id, attr])).values()
      );

      return { data: uniqueAttributes };
    },
    enabled: subcategoryIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });
};
