import { BreadcrumbWrapper } from '@/components/ui';
import CabinetCollectionGrid from '../components/CabinetCollectionGrid';
import AssemblyOptionsModal from '../components/AssemblyOptionsModal';
import { useCabinetCollection } from '../hooks/useCabinetCollection';
import { mockCabinetCollections } from '../data/mockCabinetCollections';

const CabinetsCollectionPage = () => {
  const { showModal, handleProductClick, handleAssemblyOption, closeModal } =
    useCabinetCollection();

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Cabinets Collection', isCurrentPage: true },
  ];

  return (
    <>
      <div className="w-full py-4 sm:py-6 md:py-8 px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="mb-6 border-b border-gray-200 pb-4">
          <BreadcrumbWrapper items={breadcrumbItems} />
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Cabinets Collection</h1>
        </div>

        <CabinetCollectionGrid
          collections={mockCabinetCollections}
          onProductClick={handleProductClick}
          gridClassName="grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
        />

        <AssemblyOptionsModal
          isOpen={showModal}
          onClose={closeModal}
          onSelectOption={handleAssemblyOption}
        />
      </div>
    </>
  );
};

export default CabinetsCollectionPage;
