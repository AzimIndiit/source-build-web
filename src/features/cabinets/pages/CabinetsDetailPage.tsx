import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { BreadcrumbWrapper } from '@/components/ui';
import { CabinetSection, FilterOption } from '../types';
import HeroSection from '../components/HeroSection';
import FiltersCard from '../components/FiltersCard';
import AssemblySelector from '../components/AssemblySelector';
import ProductTable from '../components/ProductTable';
import ProductCard from '../components/ProductCard';
import windowImage from '@/assets/images/window.jpg';
import window1Image from '@/assets/images/window1.jpg';
// Use existing images as placeholders for missing ones
import shakerDoveImage from '@/assets/images/shakerdove.jpg';
import trayImage from '@/assets/images/tray.png';

const CabinetsDetailPage = () => {
  const { id } = useParams();
  console.log('Cabinet ID:', id); // Keep for potential future use

  // Features list
  const features = [
    'Framed Cabinet with Full Overlay Doors and Drawers',
    'Under Mount Full Extension Soft Close Drawer Glides',
    'Concealed European Style Hinges with Soft Close Feature',
    'Five Piece HDF Door',
    '1/2" Plywood Box with UV Coated Matching Exterior',
    'Glue & Staple or Metal Clip Assembly',
    'UV Coated Natural Interior',
  ];

  // Filter options
  const filterOptionsData: FilterOption[] = [
    { id: 'base', label: 'Base Cabinets', checked: true },
    { id: 'wall', label: 'Wall Cabinets', checked: false },
    { id: 'tall', label: 'Tall Cabinets', checked: false },
    { id: 'vanities', label: 'Vanities', checked: false },
    { id: 'fillers', label: 'Fillers & Panels', checked: false },
    { id: 'mouldings', label: 'Mouldings', checked: false },
    { id: 'accessories', label: 'Accessories', checked: false },
  ];

  // Cabinet products data
  const cabinetProductsData: CabinetSection[] = [
    {
      section: 'Tray Base',
      note: null,
      products: [
        {
          id: 'SD-BT9',
          model: 'SD-BT9',
          description: 'Shaker Dove Tray Base Cabinet - 9"W x 34-1/2"H x 24"D -1D',
          price: 394,
          inStock: true,
          assembly: 'rta',
          quantity: 1,
          image: windowImage,
        },
      ],
    },
    {
      section: 'Single Full Height Door Bases',
      note: 'Note: Two boxes will be received when ordering this cabinet kit.',
      products: [
        {
          id: 'SD-B12FH',
          model: 'SD-B12FH',
          description: 'Shaker Dove Full Height Door Base Cabinet - 12"W x 34-1/2"H x 24"D -1D-1S',
          price: 763,
          inStock: true,
          assembly: 'rta',
          quantity: 0,
          image: windowImage,
        },
        {
          id: 'SD-B15FH',
          model: 'SD-B15FH',
          description: 'Shaker Dove Full Height Door Base Cabinet - 15"W x 34-1/2"H x 24"D -1D-1S',
          price: 858,
          inStock: true,
          assembly: 'rta',
          quantity: 0,
          image: windowImage,
        },
        {
          id: 'SD-B18FH',
          model: 'SD-B18FH',
          description: 'Shaker Dove Full Height Door Base Cabinet - 18"W x 34-1/2"H x 24"D -1D-1S',
          price: 950,
          inStock: true,
          assembly: 'rta',
          quantity: 0,
          image: windowImage,
        },
        {
          id: 'SD-B21FH',
          model: 'SD-B21FH',
          description: 'Shaker Dove Full Height Door Base Cabinet - 21"W x 34-1/2"H x 24"D -1D-1S',
          price: 1042,
          inStock: true,
          assembly: 'rta',
          quantity: 0,
          image: windowImage,
        },
      ],
    },
  ];

  const [products, setProducts] = useState(cabinetProductsData);
  const [filters, setFilters] = useState(filterOptionsData);
  const [assemblyType, setAssemblyType] = useState<'rta' | 'assembled'>('rta');
  const [showAssemblyLabels, setShowAssemblyLabels] = useState(true);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Cabinets Collection', href: '/cabinets-collection' },
    { label: 'Shaker Dove', isCurrentPage: true },
  ];

  const updateQuantity = (sectionIndex: number, productIndex: number, newQuantity: number) => {
    const updatedProducts = [...products];
    if (newQuantity >= 0) {
      updatedProducts[sectionIndex].products[productIndex].quantity = newQuantity;
      setProducts(updatedProducts);
    }
  };

  const updateAssembly = (
    sectionIndex: number,
    productIndex: number,
    assemblyType: 'rta' | 'assembled'
  ) => {
    const updatedProducts = [...products];
    updatedProducts[sectionIndex].products[productIndex].assembly = assemblyType;
    setProducts(updatedProducts);
  };

  const addToCart = (product: CabinetSection['products'][0]) => {
    console.log('Added to cart:', product);
    // Add your cart logic here
  };

  const handleFilterChange = (filterId: string) => {
    const updatedFilters = filters.map((filter) =>
      filter.id === filterId ? { ...filter, checked: true } : { ...filter, checked: false }
    );
    setFilters(updatedFilters);
  };

  const clearFilters = () => {
    const clearedFilters = filters.map((filter) => ({
      ...filter,
      checked: false,
    }));
    setFilters(clearedFilters);
  };

  return (
    <div className="w-full py-4 sm:py-6 md:py-8 px-2 sm:px-4 md:px-6 lg:px-8">
      <div className="mb-6 border-b border-gray-200 pb-4">
        <BreadcrumbWrapper items={breadcrumbItems} />
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Shaker Dove</h1>
      </div>

      {/* Hero Section using reusable component */}
      <HeroSection
        mainImage={shakerDoveImage}
        mainImageAlt="Shaker Dove Kitchen"
        secondaryImage={window1Image}
        secondaryImageAlt="Cabinet Door Sample"
        features={features}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Filters Sidebar using reusable component */}
        <div className="xl:col-span-3">
          <FiltersCard
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
          />
        </div>

        {/* Products Section */}
        <div className="xl:col-span-9">
          {/* Assembly Options */}
          <div className="space-y-4 mb-6">
            <AssemblySelector assemblyType={assemblyType} onAssemblyChange={setAssemblyType} />
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showLabels"
                checked={showAssemblyLabels}
                onChange={(e) => setShowAssemblyLabels(e.target.checked)}
                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="showLabels" className="text-sm text-gray-600">
                Show assembly labels on switches
              </label>
            </div>
          </div>

          {/* Products List */}
          {products.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-8">
              <h3 className="text-xl font-semibold mb-3">{section.section}</h3>
              {section.note && <p className="text-gray-600 mb-4">{section.note}</p>}

              {/* Desktop View using reusable ProductTable */}
              <div className="hidden md:block">
                <ProductTable
                  products={section.products}
                  sectionImage={trayImage}
                  onQuantityChange={(productIndex, newQuantity) =>
                    updateQuantity(sectionIndex, productIndex, newQuantity)
                  }
                  onAssemblyChange={(productIndex, assemblyType) =>
                    updateAssembly(sectionIndex, productIndex, assemblyType)
                  }
                  onAddToCart={addToCart}
                  showAssemblyLabels={showAssemblyLabels}
                />
              </div>

              {/* Mobile View using reusable ProductCard */}
              <div className="md:hidden space-y-4">
                {section.products.map((product, productIndex) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    productImage={trayImage}
                    onQuantityChange={(newQuantity) =>
                      updateQuantity(sectionIndex, productIndex, newQuantity)
                    }
                    onAssemblyChange={(assemblyType) =>
                      updateAssembly(sectionIndex, productIndex, assemblyType)
                    }
                    onAddToCart={addToCart}
                    showAssemblyLabels={showAssemblyLabels}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CabinetsDetailPage;
