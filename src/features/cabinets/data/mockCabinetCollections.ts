import { CabinetCollection } from '../types';
import windowImage from '@/assets/images/window.jpg';

export const mockCabinetCollections: CabinetCollection[] = [
  {
    categoryName: 'Shaker',
    products: [
      {
        id: 1,
        name: 'Shaker White',
        image: windowImage,
        available: true,
        isNew: false,
      },
      {
        id: 2,
        name: 'Shaker Antique White',
        image: windowImage,
        available: false,
        isNew: false,
      },
      {
        id: 3,
        name: 'Shaker Dove',
        image: windowImage,
        available: true,
        isNew: false,
      },
      {
        id: 4,
        name: 'Shaker Grey',
        image: windowImage,
        available: true,
        isNew: false,
      },
      {
        id: 5,
        name: 'Shaker Cinder',
        image: windowImage,
        available: false,
        isNew: false,
      },
      {
        id: 6,
        name: 'Shaker Black',
        image: windowImage,
        available: true,
        isNew: true,
      },
      {
        id: 7,
        name: 'Shaker Navy',
        image: windowImage,
        available: true,
        isNew: false,
      },
      {
        id: 8,
        name: 'Shaker Honey',
        image: windowImage,
        available: false,
        isNew: true,
      },
    ],
  },
  {
    categoryName: 'Edgeline',
    products: [
      {
        id: 9,
        name: 'Edgeline White',
        image: windowImage,
        available: false,
        isNew: true,
      },
    ],
  },
  {
    categoryName: 'Oxford',
    products: [
      {
        id: 10,
        name: 'Oxford Sage',
        image: windowImage,
        available: false,
        isNew: true,
      },
      {
        id: 11,
        name: 'Oxford White',
        image: windowImage,
        available: false,
        isNew: true,
      },
      {
        id: 12,
        name: 'Oxford Mist',
        image: windowImage,
        available: true,
        isNew: false,
      },
      {
        id: 13,
        name: 'Oxford Toffee',
        image: windowImage,
        available: true,
        isNew: false,
      },
    ],
  },
  {
    categoryName: 'Torrance',
    products: [
      {
        id: 14,
        name: 'Torrance White',
        image: windowImage,
        available: false,
        isNew: false,
      },
    ],
  },
  {
    categoryName: 'Casselberry',
    products: [
      {
        id: 15,
        name: 'Casselberry Antique White',
        image: windowImage,
        available: false,
        isNew: false,
      },
      {
        id: 16,
        name: 'Casselberry Saddle',
        image: windowImage,
        available: true,
        isNew: false,
      },
    ],
  },
];
