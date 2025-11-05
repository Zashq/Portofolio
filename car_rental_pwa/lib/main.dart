import 'package:car_rental_pwa/screens/landing_screen.dart';
import 'package:flutter/material.dart';
import 'package:car_rental_pwa/screens/browse_cars.dart';
import 'package:car_rental_pwa/screens/car_details_screen.dart';
import 'package:car_rental_pwa/screens/booking_screen.dart';
import 'package:car_rental_pwa/screens/my_bookings_screen.dart';

class CarRentalApp extends StatelessWidget {
  const CarRentalApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Car Rental',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.blue,
        primaryColor: const Color(0xFF2196F3),
        scaffoldBackgroundColor: const Color(0xFFF5F5F5),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF2196F3),
          brightness: Brightness.light,
        ),
        useMaterial3: true,
        cardTheme: CardThemeData(
          elevation: 2,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
      initialRoute: '/',
      routes: {
        '/': (context) => const LandingScreen(),
        '/car-details': (context) => const CarDetailsScreen(),
        '/booking': (context) => const BookingScreen(),
        '/my-bookings': (context) => const MyBookingsScreen(),
        '/browse-cars': (context) => const BrowseCarsScreen(),
      },
    );
  }
}

void main() => runApp(const CarRentalApp());
