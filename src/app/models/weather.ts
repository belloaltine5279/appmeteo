import { HourlyWeather } from "./hourly";

export interface WeatherDay {
    date: Date;
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    latitude: number;
    longitude: number;
    icon: string;
    hourlyData: HourlyWeather[];
  }