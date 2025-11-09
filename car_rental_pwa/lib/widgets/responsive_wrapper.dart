import 'package:flutter/material.dart';

class ResponsiveWrapper extends StatelessWidget {
  final Widget child;
  final double maxWidth;
  final bool useCenter;

  const ResponsiveWrapper({
    super.key,
    required this.child,
    this.maxWidth = 1000,
    this.useCenter = true,
  });

  @override
  Widget build(BuildContext context) {
    final constrainedChild = ConstrainedBox(
      constraints: BoxConstraints(maxWidth: maxWidth),
      child: child,
    );

    if (useCenter) {
      return Center(child: constrainedChild);
    }
    return Align(
      alignment: Alignment.topCenter,
      child: constrainedChild,
    );
  }
}

class ResponsiveConstraints {
  static const double mobileBreakpoint = 600;
  static const double tabletBreakpoint = 900;
  static const double desktopBreakpoint = 1200;

  // Desktop-first: reasonable content widths
  static const double maxContentWidth = 1000;
  static const double maxCardWidth = 900;
  static const double maxFormWidth = 700;

  static bool isMobile(BuildContext context) =>
      MediaQuery.of(context).size.width < mobileBreakpoint;

  static bool isTablet(BuildContext context) =>
      MediaQuery.of(context).size.width >= mobileBreakpoint &&
      MediaQuery.of(context).size.width < tabletBreakpoint;

  static bool isDesktop(BuildContext context) =>
      MediaQuery.of(context).size.width >= tabletBreakpoint;

  static double getHorizontalPadding(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    if (width < mobileBreakpoint) return 16;
    if (width < tabletBreakpoint) return 32;
    if (width < 1400) return 48;
    return 80; // Extra padding for very large screens
  }

  static int getCrossAxisCount(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    if (width < mobileBreakpoint) return 1;
    if (width < tabletBreakpoint) return 2;
    return 3; // Desktop shows 3 cards in a row
  }

  static double getImageHeight(BuildContext context) {
    if (isMobile(context)) return 180;
    if (isTablet(context)) return 220;
    return 280; // Larger images on desktop
  }
}
