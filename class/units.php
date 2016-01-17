<?php
namespace BusMadrid;

class units
{
  // http://www.geodatasource.com/developers/php
  public static function distance($lat1, $lon1, $lat2, $lon2)
  {
      $theta = $lon1 - $lon2;
      $dist = sin(deg2rad($lat1)) * sin(deg2rad($lat2)) +  cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * cos(deg2rad($theta));
      $dist = acos($dist);
      $dist = rad2deg($dist);
      $meter = round($dist * 111189.57696);

      return $meter;
  }

    public static function humanDistance($meter)
    {
        if ($meter < 500) {
            $distance = $meter . ' metros';
        } else {
            $distance = number_format($meter/1000, 2, ',', '.'). ' kilómetros';
        }
        return $distance;
    }
}
