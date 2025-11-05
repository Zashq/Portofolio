import 'package:flutter/material.dart';
import '../models/car.dart';
import '../widgets/car_card.dart';
import '../widgets/responsive_wrapper.dart';

class BrowseCarsScreen extends StatefulWidget {
  const BrowseCarsScreen({super.key});

  @override
  State<BrowseCarsScreen> createState() => _BrowseCarsScreenState();
}

class _BrowseCarsScreenState extends State<BrowseCarsScreen> {
  List<Car> cars = Car.getSampleCars();
  List<Car> filteredCars = [];
  String selectedType = 'All';
  final List<String> carTypes = ['All', 'Economy', 'Electric', 'Luxory', 'Sedan', 'SUV', 'Sports'];

  @override
  void initState() {
    super.initState();
    filteredCars = cars;
  }

  void filterCars(String type) {
    setState(() {
      selectedType = type;
      if (type == 'All') {
        filteredCars = cars;
      } else {
        filteredCars = cars.where((car) => car.type == type).toList();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Car Rental', style: TextStyle(fontWeight: FontWeight.bold)),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.bookmark_outline),
            onPressed: () {
              Navigator.pushNamed(context, '/my-bookings');
            },
          ),
          IconButton(
            icon: const Icon(Icons.account_circle_outlined),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Profile feature coming soon!')),
              );
            },
          ),
        ],
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            decoration: BoxDecoration(
              color: Theme.of(context).primaryColor,
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(30),
                bottomRight: Radius.circular(30),
              ),
            ),
            child: ResponsiveWrapper(
              child: Padding(
                padding: EdgeInsets.symmetric(
                  horizontal: ResponsiveConstraints.getHorizontalPadding(context),
                  vertical: 20,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Find Your Perfect Car',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Choose from ${cars.length} available vehicles',
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(height: 20),
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(15),
                      ),
                      child: TextField(
                        decoration: InputDecoration(
                          hintText: 'Search for a car...',
                          prefixIcon: const Icon(Icons.search),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(15),
                            borderSide: BorderSide.none,
                          ),
                          filled: true,
                          fillColor: Colors.white,
                        ),
                        onChanged: (value) {
                          setState(() {
                            filteredCars = cars.where((car) {
                              final searchLower = value.toLowerCase();
                              return car.name.toLowerCase().contains(searchLower) ||
                                  car.brand.toLowerCase().contains(searchLower) ||
                                  car.type.toLowerCase().contains(searchLower);
                            }).toList();
                          });
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 20),
          ResponsiveWrapper(
            child: Padding(
              padding: EdgeInsets.symmetric(
                horizontal: ResponsiveConstraints.getHorizontalPadding(context),
              ),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: carTypes.map((type) {
                    final isSelected = selectedType == type;
                    return Padding(
                      padding: const EdgeInsets.only(right: 10),
                      child: FilterChip(
                        label: Text(type),
                        selected: isSelected,
                        onSelected: (selected) => filterCars(type),
                        selectedColor: Theme.of(context).primaryColor,
                        labelStyle: TextStyle(
                          color: isSelected ? Colors.white : Colors.black87,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ),
          ),
          const SizedBox(height: 10),
          Expanded(
            child: filteredCars.isEmpty
                ? const Center(
                    child: Text(
                      'No cars found',
                      style: TextStyle(fontSize: 18, color: Colors.grey),
                    ),
                  )
                : ResponsiveConstraints.isDesktop(context)
                    ? ResponsiveWrapper(
                        maxWidth: 1400,
                        child: GridView.builder(
                          padding: EdgeInsets.symmetric(
                            horizontal: ResponsiveConstraints.getHorizontalPadding(context),
                            vertical: 20,
                          ),
                          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: ResponsiveConstraints.getCrossAxisCount(context),
                            crossAxisSpacing: 20,
                            mainAxisSpacing: 20,
                            childAspectRatio: 0.85,
                          ),
                          itemCount: filteredCars.length,
                          itemBuilder: (context, index) {
                            return CarCard(
                              car: filteredCars[index],
                              onTap: () {
                                Navigator.pushNamed(
                                  context,
                                  '/car-details',
                                  arguments: filteredCars[index],
                                );
                              },
                            );
                          },
                        ),
                      )
                    : ResponsiveWrapper(
                        child: ListView.builder(
                          padding: EdgeInsets.symmetric(
                            horizontal: ResponsiveConstraints.getHorizontalPadding(context),
                            vertical: 20,
                          ),
                          itemCount: filteredCars.length,
                          itemBuilder: (context, index) {
                            return CarCard(
                              car: filteredCars[index],
                              onTap: () {
                                Navigator.pushNamed(
                                  context,
                                  '/car-details',
                                  arguments: filteredCars[index],
                                );
                              },
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}
