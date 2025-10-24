import 'dart:convert';
import 'package:http/http.dart' as http;

class WeatherService {
  // <-- IDE ÍRD BE A TE WORKERED ALAP URL-JÉT
  static const String baseUrl = 'https://weather-proxy.weatherapp.workers.dev/api/weather';

  Future<Map<String, dynamic>> getWeather(String city) async {
    final uri = Uri.parse('$baseUrl?city=$city');
    final res = await http.get(uri);

    if (res.statusCode == 200) {
      return json.decode(res.body) as Map<String, dynamic>;
    } else {
      throw Exception('Hiba: ${res.statusCode} ${res.body}');
    }
  }
}
