import { useMutation, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  productService,
  CreateProductPayload,
  UpdateProductPayload,
  SaveDraftPayload,
} from '../services/productService';
import { queryClient } from '@/lib/queryClient';

export const PRODUCTS_QUERY_KEY = ['products'];
export const PRODUCT_QUERY_KEY = (slug: string) => ['product', slug];

interface CreateProductWithFiles extends Omit<CreateProductPayload, 'images'> {
  imageFiles: File[];
  variantFiles?: Array<{ variantId: string; variantIndex: number; files: File[] }>;
}

interface SaveDraftWithFiles {
  id?: string; // For updating existing products
  title: string;
  imageFiles: File[];
  existingImages?: string[]; // For editing existing products
  price?: number;
  description?: string;
  category?: string;
  subCategory?: string;
  quantity?: number;
  brand?: string;
  color?: string;
  locationIds?: string[];
  productTag?: string[];
  variants?: Array<{
    color: string;
    quantity: number;
    price: number;
    discount: {
      discountType: 'none' | 'flat' | 'percentage';
      discountValue?: number;
    };
    existingImages?: string[];
  }>;
  marketplaceOptions?: {
    pickup?: boolean;
    shipping?: boolean;
    delivery?: boolean;
  };
  pickupHours?: string;
  shippingPrice?: number;
  readyByDate?: string;
  readyByTime?: string;
  dimensions?: {
    width?: string;
    length?: string;
    height?: string;
  };
  discount?: {
    discountType: 'none' | 'flat' | 'percentage';
    discountValue?: number;
  };
  variantFiles?: Array<{ variantId: string; variantIndex: number; files: File[] }>;
}

interface UpdateProductWithFiles extends Omit<UpdateProductPayload, 'images' | 'id'> {
  imageFiles?: File[];
  existingImages?: string[];
  variantFiles?: Array<{ variantId: string; variantIndex?: number; files: File[] }>;
}

export function useCreateProductMutation() {
  return useMutation({
    mutationFn: async (data: CreateProductWithFiles) => {
      let imageUrls: string[] = [];

      // Upload main product images in parallel (if needed)
      if (data.imageFiles && data.imageFiles.length > 0) {
        // If productService.uploadProductImages already uploads all files in parallel, this is sufficient.
        // If you want to upload each file individually in parallel, use Promise.all:
        imageUrls = await Promise.all(
          data.imageFiles.map((file) =>
            productService
              .uploadProductImages([file])
              .then((urls) => urls[0])
              .catch((error) => {
                console.error('Failed to upload product image:', error);
                toast.error('Failed to upload product image');
                throw error;
              })
          )
        );
      }

      // Upload variant images if any
      let variants = data.variants;

      if (data.variantFiles && data.variantFiles.length > 0 && variants) {
        // Create a map of variant images indexed by their position
        const variantImagesByIndex = new Map<number, string[]>();

        // Upload images for each variant
        for (const variantFile of data.variantFiles) {
          if (variantFile.files.length > 0) {
            try {
              console.log('Uploading images for variant at index:', variantFile.variantIndex);
              const uploadedUrls = await productService.uploadProductImages(variantFile.files);
              // Use the variantIndex to map the images correctly
              variantImagesByIndex.set(variantFile.variantIndex, uploadedUrls);
            } catch (error) {
              console.error('Failed to upload variant images:', error);
              toast.error('Failed to upload variant images');
              throw error;
            }
          }
        }

        // Now update the variants with their uploaded images using the index
        variants = variants.map((variant, index) => {
          const images = variantImagesByIndex.get(index);
          if (images) {
            console.log(`Adding ${images.length} images to variant at index ${index}`);
            return { ...variant, images };
          }
          return variant;
        });
      }

      // Remove the file fields and add the URLs
      const { imageFiles, variantFiles, ...productData } = data;

      // Convert string values to numbers where needed
      const payload: CreateProductPayload = {
        ...productData,
        price: Number(productData.price),
        quantity: Number(productData.quantity),
        shippingPrice: productData.shippingPrice ? Number(productData.shippingPrice) : undefined,
        discount: {
          ...productData.discount,
          discountValue: productData.discount.discountValue
            ? Number(productData.discount.discountValue)
            : undefined,
        },
        variants: variants?.map((v) => ({
          ...v,
          price: Number(v.price),
          quantity: Number(v.quantity),
          discount: {
            ...v.discount,
            discountValue: v.discount.discountValue ? Number(v.discount.discountValue) : undefined,
          },
        })),
        images: imageUrls,
      };

      return await productService.createProduct(payload);
    },
    onSuccess: (response) => {
      // Invalidate products list to refetch
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      toast.success(response.message || 'Product created successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to create product';
      toast.error(message);
      console.error('Create product error:', error);
    },
  });
}

export function useUpdateProductMutation() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProductWithFiles }) => {
      let imageUrls: string[] = data.existingImages || [];

      // Upload new product images if any
      if (data.imageFiles && data.imageFiles.length > 0) {
        try {
          const newImageUrls = await productService.uploadProductImages(data.imageFiles);
          imageUrls = [...imageUrls, ...newImageUrls];
        } catch (error) {
          console.error('Failed to upload product images:', error);
          toast.error('Failed to upload product images');
          throw error;
        }
      }

      // Upload variant images if any
      let variants = data.variants;
      if (data.variantFiles && data.variantFiles.length > 0 && variants) {
        // Create a map of variant images indexed by their position
        const variantImagesByIndex = new Map<number, string[]>();

        for (const variantFile of data.variantFiles) {
          if (variantFile.files.length > 0) {
            try {
              const variantImageUrls = await productService.uploadProductImages(variantFile.files);

              // If variantIndex is provided, use it; otherwise try to match by variantId
              if (variantFile.variantIndex !== undefined) {
                variantImagesByIndex.set(variantFile.variantIndex, variantImageUrls);
              } else {
                // Fallback: Update the corresponding variant with the uploaded image URLs
                variants = variants.map((v) => {
                  if (v.color === variantFile.variantId) {
                    return { ...v, images: [...(v.images || []), ...variantImageUrls] };
                  }
                  return v;
                });
              }
            } catch (error) {
              console.error('Failed to upload variant images:', error);
              toast.error('Failed to upload variant images');
              throw error;
            }
          }
        }

        // Apply images by index if we have any
        if (variantImagesByIndex.size > 0) {
          variants = variants.map((variant, index) => {
            const newImages = variantImagesByIndex.get(index);
            if (newImages) {
              return { ...variant, images: [...(variant.images || []), ...newImages] };
            }
            return variant;
          });
        }
      }

      // Remove the file fields and add the URLs
      const { imageFiles, variantFiles, existingImages, ...productData } = data;

      // Convert string values to numbers where needed
      const payload: Partial<CreateProductPayload> = {
        ...productData,
        price: productData.price !== undefined ? Number(productData.price) : undefined,
        quantity: productData.quantity !== undefined ? Number(productData.quantity) : undefined,
        shippingPrice: productData.shippingPrice ? Number(productData.shippingPrice) : undefined,
        discount: productData.discount
          ? {
              ...productData.discount,
              discountValue: productData.discount.discountValue
                ? Number(productData.discount.discountValue)
                : undefined,
            }
          : undefined,
        variants: variants?.map((v) => ({
          ...v,
          price: Number(v.price),
          quantity: Number(v.quantity),
          discount: {
            ...v.discount,
            discountValue: v.discount.discountValue ? Number(v.discount.discountValue) : undefined,
          },
        })),
        images: imageUrls,
      };

      return await productService.updateProduct(id, payload);
    },
    onSuccess: (response, variables) => {
      // Invalidate both the specific product and the list
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['product'] });
      // Also invalidate the specific product by ID query
      queryClient.invalidateQueries({ queryKey: ['product', 'id', variables.id] });
      toast.success(response.message || 'Product updated successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update product';
      toast.error(message);
      console.error('Update product error:', error);
    },
  });
}

export function useSaveDraftMutation() {
  return useMutation({
    mutationFn: async (data: SaveDraftWithFiles) => {
      let imageUrls: string[] = data.existingImages || [];

      // Upload main product images if there are new files
      if (data.imageFiles && data.imageFiles.length > 0) {
        const newImageUrls = await Promise.all(
          data.imageFiles.map((file) =>
            productService
              .uploadProductImages([file])
              .then((urls) => urls[0])
              .catch((error) => {
                console.error('Failed to upload product image:', error);
                toast.error('Failed to upload product image');
                throw error;
              })
          )
        );
        imageUrls = [...imageUrls, ...newImageUrls];
      }

      // Upload variant images if any
      let variants = data.variants;
      if (data.variantFiles && data.variantFiles.length > 0 && variants) {
        const variantImagesByIndex = new Map<number, string[]>();

        for (const variantFile of data.variantFiles) {
          if (variantFile.files.length > 0) {
            try {
              const uploadedUrls = await productService.uploadProductImages(variantFile.files);
              variantImagesByIndex.set(variantFile.variantIndex, uploadedUrls);
            } catch (error) {
              console.error('Failed to upload variant images:', error);
              // For drafts, we can continue without variant images
            }
          }
        }

        variants = variants.map((variant, index) => {
          const images = variantImagesByIndex.get(index);
          if (images) {
            return { ...variant, images };
          }
          return variant;
        });
      }

      const { imageFiles, variantFiles, existingImages, id, ...draftData } = data;

      // Convert string values to numbers where provided
      const payload: SaveDraftPayload = {
        title: draftData.title,
        images: imageUrls,
        isDraft: true,
        ...(draftData.price && { price: Number(draftData.price) }),
        ...(draftData.description && { description: draftData.description }),
        ...(draftData.category && { category: draftData.category }),
        ...(draftData.subCategory && { subCategory: draftData.subCategory }),
        ...(draftData.quantity !== undefined && { quantity: Number(draftData.quantity) }),
        ...(draftData.brand && { brand: draftData.brand }),
        ...(draftData.color && { color: draftData.color }),
        ...(draftData.locationIds && { locationIds: draftData.locationIds }),
        ...(draftData.productTag && { productTag: draftData.productTag }),
        ...(draftData.marketplaceOptions && { marketplaceOptions: draftData.marketplaceOptions }),
        ...(draftData.pickupHours && { pickupHours: draftData.pickupHours }),
        ...(draftData.shippingPrice && { shippingPrice: Number(draftData.shippingPrice) }),
        ...(draftData.readyByDate && { readyByDate: draftData.readyByDate }),
        ...(draftData.readyByTime && { readyByTime: draftData.readyByTime }),
        ...(draftData.dimensions && {
          dimensions: {
            width: draftData.dimensions.width ? Number(draftData.dimensions.width) : undefined,
            length: draftData.dimensions.length ? Number(draftData.dimensions.length) : undefined,
            height: draftData.dimensions.height ? Number(draftData.dimensions.height) : undefined,
          },
        }),
        ...(draftData.discount && {
          discount: {
            ...draftData.discount,
            discountValue: draftData.discount.discountValue
              ? Number(draftData.discount.discountValue)
              : undefined,
          },
        }),
        ...(variants && {
          variants: variants.map((v) => ({
            ...v,
            price: Number(v.price),
            quantity: Number(v.quantity),
            discount: {
              ...v.discount,
              discountValue: v.discount.discountValue
                ? Number(v.discount.discountValue)
                : undefined,
            },
          })),
        }),
      };

      // If id is present, update existing product as draft
      if (id) {
        return await productService.updateDraft(id, payload);
      } else {
        // Otherwise create a new draft
        return await productService.saveDraft(payload);
      }
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      // If updating an existing draft, also invalidate the specific product query
      if (variables.id) {
        queryClient.invalidateQueries({ queryKey: ['product', 'id', variables.id] });
      }
      toast.success(response.message || 'Draft saved successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to save draft';
      toast.error(message);
      console.error('Save draft error:', error);
    },
  });
}

export function useDeleteProductMutation() {
  return useMutation({
    mutationFn: (id: string) => productService.deleteProduct(id),
    onSuccess: (response) => {
      // Invalidate products list to refetch
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      toast.success(response.message || 'Product deleted successfully');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete product';
      toast.error(message);
      console.error('Delete product error:', error);
    },
  });
}

export function useToggleProductStatusMutation() {
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'inactive' }) =>
      productService.toggleProductStatus(id, status),
    onMutate: async ({ id, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: PRODUCTS_QUERY_KEY });

      // Snapshot the previous value
      const previousProducts = queryClient.getQueryData(PRODUCTS_QUERY_KEY);

      // Optimistically update the product status
      queryClient.setQueryData(PRODUCTS_QUERY_KEY, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            products: old.data.products?.map((product: any) =>
              product._id === id || product.id === id ? { ...product, status } : product
            ),
          },
        };
      });

      // Return a context object with the snapshotted value
      return { previousProducts };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousProducts) {
        queryClient.setQueryData(PRODUCTS_QUERY_KEY, context.previousProducts);
      }
      const message = (err as any).response?.data?.message || 'Failed to update product status';
      toast.error(message);
    },
    onSuccess: () => {
      toast.success('Product status updated successfully');
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
    },
  });
}

export function useUpdateProductStockMutation() {
  return useMutation({
    mutationFn: ({ 
      id, 
      quantity, 
      variants 
    }: { 
      id: string; 
      quantity: number; 
      variants?: Array<{ index: number; quantity: number }> 
    }) =>
      productService.updateProductStock(id, { quantity, variants }),
    onMutate: async ({ id, quantity }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: PRODUCTS_QUERY_KEY });

      // Snapshot the previous value
      const previousProducts = queryClient.getQueryData(PRODUCTS_QUERY_KEY);

      // Optimistically update the product quantity and status
      queryClient.setQueryData(PRODUCTS_QUERY_KEY, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            products: old.data.products?.map((product: any) => {
              if (product._id === id || product.id === id) {
                const newStatus = quantity === 0 ? 'out_of_stock' : 
                                 product.status === 'out_of_stock' ? 'active' : product.status;
                return { ...product, quantity, status: newStatus };
              }
              return product;
            }),
          },
        };
      });

      // Return a context object with the snapshotted value
      return { previousProducts };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousProducts) {
        queryClient.setQueryData(PRODUCTS_QUERY_KEY, context.previousProducts);
      }
      const message = (err as any).response?.data?.message || 'Failed to update product stock';
      toast.error(message);
    },
    onSuccess: () => {
      toast.success('Product stock updated successfully');
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['product'] });
    },
  });
}

export function useProductsQuery(params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  location?: string;
  [key: string]: any;
}) {
  return useQuery({
    queryKey: [...PRODUCTS_QUERY_KEY, params],
    queryFn: () => productService.getProducts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useProductQuery(slug: string) {
  console.log('slug-1', slug);
  return useQuery({
    queryKey: PRODUCT_QUERY_KEY(slug),
    queryFn: () => productService.getProductBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useProductByIdQuery(id: string) {
  return useQuery({
    queryKey: ['product', 'id', id],
    queryFn: () => productService.getProductById(id),
    enabled: !!id,
 
  });
}
