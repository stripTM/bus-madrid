<?php
namespace BusMadrid;

class NearbyInvalidException extends \exception
{
}

class nearby_do
{
    protected $emt_proxy;

    //protected $latitude;
    //protected $longitude;

    //protected $aStopLine;
    //protected $aListLines;
    public function __construct()
    {
        $this->emt_proxy = new emt_proxy();
    }

    public function getLine()
    {
        return $this->idLine;
    }
    public function setCoords($line)
    {
        $this->idLine = $line;
    }

    // Force refresh the cache
    public function forceRefreshCache($bRefreshCache)
    {
        $this->emt_proxy->forceRefreshCache($bRefreshCache);
    }
    public function loadNearlyStop($latitude, $logitude, $radius)
    {
        $this->aStopLine = $this->emt_proxy->get(
                'getStopsFromXY',
                array(
                    'latitude' => $latitude,
                    'longitude' => $logitude,
                    'Radius' => $radius
                )
            );

        return true;
    }
    public function getStopsLine()
    {
        return $this->aStopLine;
    }
}
