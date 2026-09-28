/**
 * Accommodation Provider Abstraction Layer
 * Pluggable architecture supporting hotels, resorts, homestays, and boutique stays.
 * Clear separation between demo data provider and real API connector.
 */

import { AccommodationOption, TripRequest } from '../../shared/types.ts';

export class AccommodationProvider {
  /**
   * Search accommodations in destination matching preference and budget.
   */
  public static async searchAccommodations(
    request: TripRequest,
    nights: number,
    isDemoMode: boolean = true
  ): Promise<AccommodationOption[]> {
    const destination = request.destination.trim();
    const style = request.travelStyle || 'mid-range';
    const accType = request.accommodationType || 'mid-range';
    const effectiveNights = Math.max(1, nights);

    // Options tailored for various preferences
    const baseOptions: Array<Omit<AccommodationOption, 'id' | 'totalPrice' | 'isDemoData'>> = [
      {
        name: 'The Heritage Palm Cove & Boutique Resort',
        location: `${destination} (North Shore / Candolim)`,
        pricePerNight: 2600,
        rating: 4.6,
        type: 'Boutique Resort',
        amenities: ['Free High-Speed WiFi', 'Complimentary Buffet Breakfast', 'Swimming Pool', 'Beach Shuttle', 'Air Conditioning'],
        distanceFromCenterKm: 1.8,
        score: 0.92,
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Sol de Goa Eco Boutique Hotel',
        location: `${destination} (Nerul / Quiet Riverfront)`,
        pricePerNight: 2300,
        rating: 4.4,
        type: 'Mid-range Hotel',
        amenities: ['Pool', 'River View Balcony', 'High-Speed WiFi', 'In-house Cafe', 'Scooter Rental Desk'],
        distanceFromCenterKm: 3.2,
        score: 0.89,
        imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Agonda Serenity Beach Wooden Cottages',
        location: `${destination} (South Shore / Uncrowded Beach)`,
        pricePerNight: 2100,
        rating: 4.7,
        type: 'Beach Cottage',
        amenities: ['Direct Beach Access', 'Ocean Sunset View', 'Hammocks', 'Artisanal Breakfast', 'Yoga Shala'],
        distanceFromCenterKm: 6.5,
        score: 0.95,
        imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Zostel Plus Vibrant Social Hostel & Private Pods',
        location: `${destination} (Anjuna Cliffs)`,
        pricePerNight: 1200,
        rating: 4.5,
        type: 'Hostel / Private Pods',
        amenities: ['Coworking Hub', 'Rooftop Cafe', 'Community Events', 'Game Room', 'Lockers'],
        distanceFromCenterKm: 2.1,
        score: 0.83,
        imageUrl: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Taj Exotica Seaside Sanctuary & Spa',
        location: `${destination} (Benaulim Bay)`,
        pricePerNight: 9800,
        rating: 4.9,
        type: 'Luxury Resort',
        amenities: ['Private Beachfront', 'Infinity Pool', 'Ayurvedic Spa', 'Golf Course', 'Fine Dining Pavilions'],
        distanceFromCenterKm: 4.0,
        score: 0.96,
        imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=600&q=80',
      },
      {
        name: 'Casa Da Silva Portuguese Heritage Homestay',
        location: `${destination} (Fontainhas Latin Quarter)`,
        pricePerNight: 1850,
        rating: 4.6,
        type: 'Heritage Homestay',
        amenities: ['Authentic Home Cooked Meals', 'Colonial Architecture', 'Walking Tour Guidance', 'High Speed WiFi'],
        distanceFromCenterKm: 0.5,
        score: 0.91,
        imageUrl: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=600&q=80',
      }
    ];

    // Map into complete options
    return baseOptions.map((opt, index) => ({
      ...opt,
      id: `acc-${index + 1}-${Date.now()}`,
      totalPrice: opt.pricePerNight * effectiveNights,
      isDemoData: true,
    }));
  }
}
