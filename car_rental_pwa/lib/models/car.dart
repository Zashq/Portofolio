class Car {
  final String id;
  final String name;
  final String brand;
  final String type;
  final double pricePerDay;
  final int seats;
  final String transmission;
  final String fuelType;
  final double rating;
  final String imageUrl;
  final List<String> features;
  final bool isAvailable;

  Car({
    required this.id,
    required this.name,
    required this.brand,
    required this.type,
    required this.pricePerDay,
    required this.seats,
    required this.transmission,
    required this.fuelType,
    required this.rating,
    required this.imageUrl,
    required this.features,
    this.isAvailable = true,
  });

  // Sample data
  static List<Car> getSampleCars() {
    return [
      Car(
        id: '1',
        name: 'Model S',
        brand: 'Tesla',
        type: 'Sedan',
        pricePerDay: 120.0,
        seats: 5,
        transmission: 'Automatic',
        fuelType: 'Electric',
        rating: 4.8,
        imageUrl:
            'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800',
        features: ['Autopilot', 'Premium Audio', 'Heated Seats', 'GPS'],
      ),
      Car(
        id: '2',
        name: 'Civic',
        brand: 'Honda',
        type: 'Sedan',
        pricePerDay: 45.0,
        seats: 5,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        rating: 4.5,
        imageUrl:
            'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800',
        features: ['Bluetooth', 'Backup Camera', 'Cruise Control', 'AC'],
      ),
      Car(
        id: '3',
        name: 'X5',
        brand: 'BMW',
        type: 'SUV',
        pricePerDay: 95.0,
        seats: 7,
        transmission: 'Automatic',
        fuelType: 'Diesel',
        rating: 4.7,
        imageUrl:
            'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800',
        features: ['Panoramic Roof', 'Leather Seats', 'Apple CarPlay', '4WD'],
      ),
      Car(
        id: '4',
        name: 'Mustang',
        brand: 'Ford',
        type: 'Sports',
        pricePerDay: 110.0,
        seats: 4,
        transmission: 'Manual',
        fuelType: 'Petrol',
        rating: 4.9,
        imageUrl:
            'https://images.unsplash.com/photo-1588127333419-b9d7de223dcf?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1169',
        features: ['Sport Mode', 'Premium Sound', 'Performance Package', 'GPS'],
      ),
      Car(
        id: '5',
        name: 'Corolla',
        brand: 'Toyota',
        type: 'Sedan',
        pricePerDay: 40.0,
        seats: 5,
        transmission: 'Automatic',
        fuelType: 'Petrol',
        rating: 4.4,
        imageUrl:
            'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=800',
        features: ['Bluetooth', 'Backup Camera', 'Fuel Efficient', 'AC'],
      ),
      Car(
        id: '6',
        name: 'Range Rover',
        brand: 'Land Rover',
        type: 'SUV',
        pricePerDay: 150.0,
        seats: 7,
        transmission: 'Automatic',
        fuelType: 'Diesel',
        rating: 4.8,
        imageUrl:
            'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800',
        features: [
          'Luxury Interior',
          'Off-Road Mode',
          'Massage Seats',
          'Premium Audio',
        ],
      ),
    ];
  }
}
