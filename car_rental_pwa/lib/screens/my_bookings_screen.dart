import 'package:flutter/material.dart';
import '../models/booking.dart';
import '../models/car.dart';
import '../widgets/responsive_wrapper.dart';

class MyBookingsScreen extends StatefulWidget {
  const MyBookingsScreen({super.key});

  @override
  State<MyBookingsScreen> createState() => _MyBookingsScreenState();
}

class _MyBookingsScreenState extends State<MyBookingsScreen> {
  late List<Booking> bookings;

  @override
  void initState() {
    super.initState();
    _loadBookings();
  }

  void _loadBookings() {
    final cars = Car.getSampleCars();
    bookings = [
      Booking(
        id: '1',
        car: cars[0],
        startDate: DateTime.now().add(const Duration(days: 3)),
        endDate: DateTime.now().add(const Duration(days: 8)),
        pickupLocation: 'Downtown Center',
        dropoffLocation: 'Airport Terminal',
        totalPrice: 600.0,
        status: BookingStatus.confirmed,
        createdAt: DateTime.now().subtract(const Duration(days: 2)),
      ),
      Booking(
        id: '2',
        car: cars[2],
        startDate: DateTime.now().subtract(const Duration(days: 10)),
        endDate: DateTime.now().subtract(const Duration(days: 6)),
        pickupLocation: 'Airport Terminal',
        dropoffLocation: 'Airport Terminal',
        totalPrice: 380.0,
        status: BookingStatus.completed,
        createdAt: DateTime.now().subtract(const Duration(days: 15)),
      ),
    ];
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Bookings'),
        elevation: 0,
      ),
      body: bookings.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.event_busy,
                    size: 80,
                    color: Colors.grey[400],
                  ),
                  const SizedBox(height: 20),
                  Text(
                    'No bookings yet',
                    style: TextStyle(
                      fontSize: 20,
                      color: Colors.grey[600],
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            )
          : ResponsiveWrapper(
              maxWidth: 800,
              child: ListView.builder(
                padding: EdgeInsets.symmetric(
                  horizontal: ResponsiveConstraints.getHorizontalPadding(context),
                  vertical: 20,
                ),
                itemCount: bookings.length,
                itemBuilder: (context, index) {
                  return _buildBookingCard(bookings[index]);
                },
              ),
            ),
    );
  }

  Widget _buildBookingCard(Booking booking) {
    return Card(
      margin: const EdgeInsets.only(bottom: 20),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.network(
                    booking.car.imageUrl,
                    width: 100,
                    height: 70,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        width: 100,
                        height: 70,
                        color: Colors.grey[300],
                        child: const Icon(Icons.directions_car),
                      );
                    },
                  ),
                ),
                const SizedBox(width: 15),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${booking.car.brand} ${booking.car.name}',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 5),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: _getStatusColor(booking.status),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          booking.status.displayName,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 15),
            const Divider(),
            const SizedBox(height: 10),
            Text('Pick-up: ${booking.startDate.day}/${booking.startDate.month}/${booking.startDate.year}'),
            Text('Drop-off: ${booking.endDate.day}/${booking.endDate.month}/${booking.endDate.year}'),
            const SizedBox(height: 10),
            Text('Total: \$${booking.totalPrice.toStringAsFixed(2)}',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Color _getStatusColor(BookingStatus status) {
    switch (status) {
      case BookingStatus.confirmed:
        return Colors.blue;
      case BookingStatus.completed:
        return Colors.grey;
      default:
        return Colors.orange;
    }
  }
}
