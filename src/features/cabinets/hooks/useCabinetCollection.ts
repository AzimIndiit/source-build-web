import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CabinetProduct, AssemblyOption } from '../types';

export const useCabinetCollection = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<CabinetProduct | null>(null);

  const handleProductClick = useCallback((product: CabinetProduct) => {
    console.log(`Shopping for ${product.name} (ID: ${product.id})`);
    setSelectedProduct(product);
    setShowModal(true);
  }, []);

  const handleAssemblyOption = useCallback(
    (option: AssemblyOption) => {
      if (selectedProduct) {
        console.log(`Selected assembly option: ${option} for ${selectedProduct.name}`);
        navigate(`/cabinets-collection/${selectedProduct.id}`, {
          state: { assemblyOption: option, product: selectedProduct },
        });
      }
      setShowModal(false);
    },
    [selectedProduct, navigate]
  );

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  return {
    showModal,
    selectedProduct,
    handleProductClick,
    handleAssemblyOption,
    closeModal,
  };
};
