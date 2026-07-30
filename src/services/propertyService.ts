import { getFromStorage, setToStorage, KEYS } from './db';
import type { Property } from '../types';

export const PropertyService = {
  getProperties(): Property[] {
    return getFromStorage<Property[]>(KEYS.PROPERTIES);
  },

  getPropertyById(id: string): Property | undefined {
    const properties = this.getProperties();
    return properties.find(p => p.id === id);
  },

  addProperty(property: Omit<Property, 'id' | 'ownerAddress' | 'ownerName' | 'ownerRating' | 'verified'>): Property {
    const properties = this.getProperties();
    const newProperty: Property = {
      ...property,
      id: `p_${Date.now()}`,
      ownerAddress: 'GDWPNBABP2XCEA5X6W76YOBXHIQ2M5DY2WATOIK3F24UCNHN5MQN3RU3',
      ownerName: 'James D.',
      ownerRating: 5.0,
      verified: true
    };
    properties.unshift(newProperty);
    setToStorage(KEYS.PROPERTIES, properties);
    return newProperty;
  },

  updatePropertyStatus(id: string, status: Property['status']): void {
    const properties = this.getProperties();
    const index = properties.findIndex(p => p.id === id);
    if (index !== -1) {
      properties[index].status = status;
      setToStorage(KEYS.PROPERTIES, properties);
    }
  }
};
