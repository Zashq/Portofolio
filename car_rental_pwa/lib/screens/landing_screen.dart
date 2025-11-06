import 'package:flutter/material.dart';

class LandingScreen extends StatefulWidget {
  const LandingScreen({super.key});

  @override
  State<LandingScreen> createState() => _LandingScreenState();
}

class _LandingScreenState extends State<LandingScreen> {
  int _selectedIndex = 0;
  final ScrollController _scrollController = ScrollController();
  final GlobalKey _aboutKey = GlobalKey();
  final GlobalKey _servicesKey = GlobalKey();
  final GlobalKey _contactKey = GlobalKey();

  void _scrollToSection(GlobalKey key) {
    final context = key.currentContext;
    if (context != null) {
      Scrollable.ensureVisible(
        context,
        duration: const Duration(milliseconds: 800),
        curve: Curves.easeInOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        controller: _scrollController,
        slivers: [
          // App Bar with Navigation
          SliverAppBar(
            expandedHeight: 60,
            floating: true,
            pinned: true,
            backgroundColor: const Color(0xFF1a237e),
            elevation: 0,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF1a237e), Color(0xFF283593)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
              ),
            ),
            title: Row(
              children: [
                const Icon(Icons.local_airport, size: 32),
                const SizedBox(width: 12),
                Text(
                  'AirportRent',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.2,
                  ),
                ),
              ],
            ),
            actions: [
              _buildNavButton(
                'Home',
                0,
                () => setState(() => _selectedIndex = 0),
              ),
              _buildNavButton('About', 1, () {
                setState(() => _selectedIndex = 1);
                _scrollToSection(_aboutKey);
              }),
              _buildNavButton('Services', 2, () {
                setState(() => _selectedIndex = 2);
                _scrollToSection(_servicesKey);
              }),
              _buildNavButton('Contact', 3, () {
                setState(() => _selectedIndex = 3);
                _scrollToSection(_contactKey);
              }),
              const SizedBox(width: 20),
              Padding(
                padding: const EdgeInsets.symmetric(
                  vertical: 12,
                  horizontal: 16,
                ),
                child: ElevatedButton(
                  onPressed: () {
                    Navigator.pushNamed(context, '/browse-cars');
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.amber,
                    foregroundColor: const Color(0xFF1a237e),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 32,
                      vertical: 16,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: const Text(
                    'Book Now',
                    style: TextStyle(
                      color: Colors.black,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 20),
            ],
          ),

          // Hero Section
          SliverToBoxAdapter(child: _buildHeroSection()),

          // Features Section
          SliverToBoxAdapter(child: _buildFeaturesSection()),

          // About Section
          SliverToBoxAdapter(child: _buildAboutSection()),

          // Services Section
          SliverToBoxAdapter(child: _buildServicesSection()),

          // Contact Section
          SliverToBoxAdapter(child: _buildContactSection()),

          // Footer
          SliverToBoxAdapter(child: _buildFooter()),
        ],
      ),
    );
  }

  Widget _buildNavButton(String label, int index, VoidCallback onPressed) {
    final isSelected = _selectedIndex == index;
    return TextButton(
      onPressed: onPressed,
      style: TextButton.styleFrom(
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        minimumSize: const Size(0, kToolbarHeight),
        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 16,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            ),
          ),
          const SizedBox(height: 6),
          if (isSelected)
            Container(
              height: 2,
              width: 40,
              decoration: BoxDecoration(
                color: Colors.amber,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildHeroSection() {
    return Container(
      height: 600,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            const Color(0xFF1a237e).withOpacity(0.9),
            const Color(0xFF283593).withOpacity(0.9),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Stack(
        children: [
          // Background pattern
          Positioned.fill(
            child: Opacity(
              opacity: 0.1,
              child: Image.network(
                'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200',
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) =>
                    Container(color: Colors.transparent),
              ),
            ),
          ),

          // Content
          Center(
            child: Container(
              constraints: const BoxConstraints(maxWidth: 1200),
              padding: const EdgeInsets.symmetric(horizontal: 40),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Welcome to Airport Rent',
                          style: TextStyle(
                            color: Colors.amber,
                            fontSize: 20,
                            fontWeight: FontWeight.w500,
                            letterSpacing: 2,
                          ),
                        ),
                        const SizedBox(height: 20),
                        const Text(
                          'Premium Car Rental\nAt Your Airport',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 56,
                            fontWeight: FontWeight.bold,
                            height: 1.2,
                          ),
                        ),
                        const SizedBox(height: 24),
                        const Text(
                          'Convenient, reliable, and affordable car rentals right at the airport.\nStart your journey with comfort and style.',
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 18,
                            height: 1.6,
                          ),
                        ),
                        const SizedBox(height: 40),
                        Row(
                          children: [
                            ElevatedButton(
                              onPressed: () {
                                Navigator.pushNamed(context, '/browse-cars');
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.amber,
                                foregroundColor: const Color(0xFF1a237e),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 48,
                                  vertical: 24,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                elevation: 8,
                              ),
                              child: const Text(
                                'Explore Fleet',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                            const SizedBox(width: 20),
                            OutlinedButton(
                              onPressed: () => _scrollToSection(_contactKey),
                              style: OutlinedButton.styleFrom(
                                foregroundColor: Colors.white,
                                side: const BorderSide(
                                  color: Colors.white,
                                  width: 2,
                                ),
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 48,
                                  vertical: 24,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(8),
                                ),
                              ),
                              child: const Text(
                                'Contact Us',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 80),
                  Expanded(
                    child: Container(
                      height: 400,
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.3),
                            blurRadius: 30,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(20),
                        child: Image.network(
                          'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800',
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) =>
                              Container(
                                color: Colors.white10,
                                child: const Icon(
                                  Icons.directions_car,
                                  size: 100,
                                  color: Colors.white30,
                                ),
                              ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeaturesSection() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 100, horizontal: 40),
      color: Colors.grey[50],
      child: Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 1200),
          child: Column(
            children: [
              const Text(
                'Why Choose AirportRent?',
                style: TextStyle(
                  fontSize: 40,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1a237e),
                ),
              ),
              const SizedBox(height: 60),
              Row(
                children: [
                  Expanded(
                    child: _buildFeatureCard(
                      Icons.flight_land,
                      'Airport Pickup',
                      'Convenient pickup and drop-off right at the airport terminal',
                    ),
                  ),
                  const SizedBox(width: 30),
                  Expanded(
                    child: _buildFeatureCard(
                      Icons.verified_user,
                      'Trusted Service',
                      '24/7 customer support and roadside assistance',
                    ),
                  ),
                  const SizedBox(width: 30),
                  Expanded(
                    child: _buildFeatureCard(
                      Icons.attach_money,
                      'Best Prices',
                      'Competitive rates with no hidden fees',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 30),
              Row(
                children: [
                  Expanded(
                    child: _buildFeatureCard(
                      Icons.directions_car,
                      'Premium Fleet',
                      'Wide selection of well-maintained vehicles',
                    ),
                  ),
                  const SizedBox(width: 30),
                  Expanded(
                    child: _buildFeatureCard(
                      Icons.speed,
                      'Quick Process',
                      'Fast and easy booking and pickup process',
                    ),
                  ),
                  const SizedBox(width: 30),
                  Expanded(
                    child: _buildFeatureCard(
                      Icons.cleaning_services,
                      'Clean & Safe',
                      'Thoroughly sanitized vehicles after every rental',
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFeatureCard(IconData icon, String title, String description) {
    return Container(
      padding: const EdgeInsets.all(30),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: const Color(0xFF1a237e).withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 48, color: const Color(0xFF1a237e)),
          ),
          const SizedBox(height: 20),
          Text(
            title,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1a237e),
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 12),
          Text(
            description,
            style: TextStyle(
              fontSize: 16,
              color: Colors.grey[600],
              height: 1.5,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildAboutSection() {
    return Container(
      key: _aboutKey,
      padding: const EdgeInsets.symmetric(vertical: 100, horizontal: 40),
      color: Colors.white,
      child: Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 1200),
          child: Row(
            children: [
              Expanded(
                child: Container(
                  height: 500,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.1),
                        blurRadius: 30,
                        offset: const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(20),
                    child: Image.network(
                      'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800',
                      fit: BoxFit.cover,
                      errorBuilder: (context, error, stackTrace) => Container(
                        color: Colors.grey[300],
                        child: const Icon(
                          Icons.image,
                          size: 100,
                          color: Colors.grey,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 80),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'About Us',
                      style: TextStyle(
                        fontSize: 40,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1a237e),
                      ),
                    ),
                    const SizedBox(height: 30),
                    Text(
                      'Your Trusted Airport Car Rental Partner',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.w600,
                        color: Colors.grey[800],
                      ),
                    ),
                    const SizedBox(height: 20),
                    Text(
                      'We specialize in providing premium car rental services directly at the airport, making your travel experience seamless and hassle-free. With over 10 years of experience, we\'ve served thousands of satisfied customers.',
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.grey[600],
                        height: 1.8,
                      ),
                    ),
                    const SizedBox(height: 20),
                    Text(
                      'Our mission is to provide reliable, affordable, and convenient transportation solutions for both business and leisure travelers. We maintain a diverse fleet of vehicles to meet every need and budget.',
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.grey[600],
                        height: 1.8,
                      ),
                    ),
                    const SizedBox(height: 40),
                    Row(
                      children: [
                        _buildStatCard('10K+', 'Happy Customers'),
                        const SizedBox(width: 30),
                        _buildStatCard('50+', 'Premium Cars'),
                        const SizedBox(width: 30),
                        _buildStatCard('24/7', 'Support'),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard(String number, String label) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: const Color(0xFF1a237e).withOpacity(0.05),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Text(
              number,
              style: const TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: Color(0xFF1a237e),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(fontSize: 14, color: Colors.grey[600]),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildServicesSection() {
    return Container(
      key: _servicesKey,
      padding: const EdgeInsets.symmetric(vertical: 100, horizontal: 40),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            const Color(0xFF1a237e).withOpacity(0.05),
            const Color(0xFF283593).withOpacity(0.05),
          ],
        ),
      ),
      child: Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 1200),
          child: Column(
            children: [
              const Text(
                'Our Services',
                style: TextStyle(
                  fontSize: 40,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1a237e),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                'Comprehensive car rental solutions for every traveler',
                style: TextStyle(fontSize: 18, color: Colors.grey[600]),
              ),
              const SizedBox(height: 60),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: _buildServiceCard(
                      Icons.business_center,
                      'Business Rentals',
                      'Professional vehicles for corporate travel with flexible rental terms and invoicing options.',
                    ),
                  ),
                  const SizedBox(width: 30),
                  Expanded(
                    child: _buildServiceCard(
                      Icons.beach_access,
                      'Leisure Travel',
                      'Comfortable and spacious vehicles perfect for family vacations and weekend getaways.',
                    ),
                  ),
                  const SizedBox(width: 30),
                  Expanded(
                    child: _buildServiceCard(
                      Icons.timer,
                      'Long-term Rentals',
                      'Special rates for extended rentals with monthly and weekly packages available.',
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 30),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: _buildServiceCard(
                      Icons.local_shipping,
                      'SUV & Vans',
                      'Large vehicles for groups, families, or cargo transportation needs.',
                    ),
                  ),
                  const SizedBox(width: 30),
                  Expanded(
                    child: _buildServiceCard(
                      Icons.electric_car,
                      'Luxury Fleet',
                      'Premium and luxury vehicles for special occasions and executive travel.',
                    ),
                  ),
                  const SizedBox(width: 30),
                  Expanded(
                    child: _buildServiceCard(
                      Icons.support_agent,
                      '24/7 Assistance',
                      'Round-the-clock customer support and emergency roadside assistance.',
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildServiceCard(IconData icon, String title, String description) {
    return Container(
      padding: const EdgeInsets.all(30),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 20,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.amber.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, size: 40, color: Colors.amber[700]),
          ),
          const SizedBox(height: 20),
          Text(
            title,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1a237e),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            description,
            style: TextStyle(
              fontSize: 16,
              color: Colors.grey[600],
              height: 1.6,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContactSection() {
    final TextEditingController nameController = TextEditingController();
    final TextEditingController emailController = TextEditingController();
    final TextEditingController phoneController = TextEditingController();
    final TextEditingController messageController = TextEditingController();

    return Container(
      key: _contactKey,
      padding: const EdgeInsets.symmetric(vertical: 100, horizontal: 40),
      color: Colors.white,
      child: Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 1200),
          child: Column(
            children: [
              const Text(
                'Contact Us',
                style: TextStyle(
                  fontSize: 40,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1a237e),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                'Get in touch with us for any inquiries or booking assistance',
                style: TextStyle(fontSize: 18, color: Colors.grey[600]),
              ),
              const SizedBox(height: 60),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Contact Information
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildContactInfo(
                          Icons.location_on,
                          'Airport Terminal',
                          'Main Terminal, Ground Floor\nAirport City, 12345',
                        ),
                        const SizedBox(height: 30),
                        _buildContactInfo(
                          Icons.phone,
                          'Phone',
                          '+1 (555) 123-4567\n+1 (555) 765-4321',
                        ),
                        const SizedBox(height: 30),
                        _buildContactInfo(
                          Icons.email,
                          'Email',
                          'info@airportrent.com\nsupport@airportrent.com',
                        ),
                        const SizedBox(height: 30),
                        _buildContactInfo(
                          Icons.schedule,
                          'Working Hours',
                          'Open 24/7\nAll days of the week',
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 80),
                  // Contact Form
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.all(40),
                      decoration: BoxDecoration(
                        color: Colors.grey[50],
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.05),
                            blurRadius: 30,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: Column(
                        children: [
                          TextField(
                            controller: nameController,
                            decoration: InputDecoration(
                              labelText: 'Full Name',
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              filled: true,
                              fillColor: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 20),
                          TextField(
                            controller: emailController,
                            decoration: InputDecoration(
                              labelText: 'Email Address',
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              filled: true,
                              fillColor: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 20),
                          TextField(
                            controller: phoneController,
                            decoration: InputDecoration(
                              labelText: 'Phone Number',
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              filled: true,
                              fillColor: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 20),
                          TextField(
                            controller: messageController,
                            maxLines: 5,
                            decoration: InputDecoration(
                              labelText: 'Message',
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              filled: true,
                              fillColor: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 30),
                          SizedBox(
                            width: double.infinity,
                            child: ElevatedButton(
                              onPressed: () {
                                if (nameController.text.trim().isEmpty ||
                                    emailController.text.trim().isEmpty ||
                                    phoneController.text.trim().isEmpty ||
                                    messageController.text.trim().isEmpty) {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text(
                                        'Please fill in all fields',
                                      ),
                                      backgroundColor: Colors.red,
                                    ),
                                  );
                                } else {
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    const SnackBar(
                                      content: Text(
                                        'Thank you! We will contact you soon.',
                                      ),
                                      backgroundColor: Colors.green,
                                    ),
                                  );
                                  nameController.clear();
                                  emailController.clear();
                                  phoneController.clear();
                                  messageController.clear();
                                }
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF1a237e),
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(
                                  vertical: 20,
                                ),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                              child: const Text(
                                'Send Message',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildContactInfo(IconData icon, String title, String details) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0xFF1a237e).withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(icon, color: const Color(0xFF1a237e), size: 30),
        ),
        const SizedBox(width: 20),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1a237e),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                details,
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey[600],
                  height: 1.5,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildFooter() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 60, horizontal: 40),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [const Color(0xFF1a237e), const Color(0xFF283593)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Center(
        child: Container(
          constraints: const BoxConstraints(maxWidth: 1200),
          child: Column(
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: const [
                            Icon(
                              Icons.local_airport,
                              color: Colors.amber,
                              size: 32,
                            ),
                            SizedBox(width: 12),
                            Text(
                              'AirportRent',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 24,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),
                        Text(
                          'Your trusted partner for airport car rentals.\nMaking your journey comfortable and memorable.',
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 16,
                            height: 1.6,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 80),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Quick Links',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 20),
                        _buildFooterLink('About Us'),
                        _buildFooterLink('Our Fleet'),
                        _buildFooterLink('Booking'),
                        _buildFooterLink('Contact'),
                      ],
                    ),
                  ),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Services',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 20),
                        _buildFooterLink('Business Rentals'),
                        _buildFooterLink('Leisure Travel'),
                        _buildFooterLink('Long-term Rentals'),
                        _buildFooterLink('Luxury Fleet'),
                      ],
                    ),
                  ),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Support',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 20),
                        _buildFooterLink('FAQs'),
                        _buildFooterLink('Terms & Conditions'),
                        _buildFooterLink('Privacy Policy'),
                        _buildFooterLink('Help Center'),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 40),
              const Divider(color: Colors.white24),
              const SizedBox(height: 30),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    '© 2024 AirportRent. All rights reserved.',
                    style: TextStyle(color: Colors.white70, fontSize: 14),
                  ),
                  Row(
                    children: [
                      _buildSocialIcon(Icons.facebook),
                      const SizedBox(width: 15),
                      _buildSocialIcon(Icons.telegram),
                      const SizedBox(width: 15),
                      _buildSocialIcon(Icons.link),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFooterLink(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () {},
        child: Text(
          text,
          style: const TextStyle(color: Colors.white70, fontSize: 16),
        ),
      ),
    );
  }

  Widget _buildSocialIcon(IconData icon) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1),
        shape: BoxShape.circle,
      ),
      child: Icon(icon, color: Colors.white, size: 20),
    );
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }
}
