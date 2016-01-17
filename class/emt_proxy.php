<?php
namespace BusMadrid;

class ServiceInvalidException extends \exception
{
}
class NotResponseRemoteServiceException extends \exception
{
}

class emt_proxy
{
    private $commonData;
    private $aCacheTimeService;
    private $bRefreshCache;
    public function __construct()
    {
        $this->commonData = array(
            'idClient' => EMT_ID_CLIENT,
            'passKey' => EMT_PASS_KEY,
        );
        // Force not use cache by apache env configuration
        // SetEnv DISABLE_PROXY_CACHE 1
        if (getenv('DISABLE_PROXY_CACHE')) {
          $this->bRefreshCache = true;
        }
        $this->setCacheTimeToServices();
    }

    private function setCacheTimeToServices()
    {
        $this->aCacheTimeService = array(
            'GetArriveStop' => 10,
            'GetEstimatesIncident' => 10,
            'GetNodesLines' => 21600, // 6h
            'GetStopsLine' => 86400, // 24h 3600, // 1h
            'GetListLines' => 21600, // 6h
            'getStopsFromXY' => 21600, // 6h
            );
    }
    private function getCacheTimeToServices($idService)
    {
        // If forced to reload set cachetime to -1
        return $this->bRefreshCache ? -1 : $this->aCacheTimeService[$idService];
    }
    // Force refresh the cache
    public function forceRefreshCache($bRefreshCache)
    {
        $this->bRefreshCache = $bRefreshCache;
    }

    protected function urlService($idService)
    {
        switch ($idService) {
            case 'GetArriveStop':
                $urlService = 'geo/GetArriveStop.php'; // me sugieren usar media/GetEstimatesIncident.php
                break;
            case 'GetEstimatesIncident': // Tiempos de llegada
                $urlService = 'media/GetEstimatesIncident.php';
                break;
            case 'GetNodesLines': // Datos de una parada, si no se le pasa nada devuelve todas las paradas
                $urlService = 'bus/GetNodesLines.php';
                break;
            case 'GetStopsLine': // Paradas de una línea
                $urlService = 'geo/GetStopsLine.php';
                break;
            case 'GetListLines':
                $urlService = 'bus/GetListLines.php';
                break;
            case 'getStopsFromXY': // Cercanas a unas coordenadas
                $urlService = 'geo/GetStopsFromXY.php';
                break;
            default:
                throw new ServiceInvalidException('Invalid idService]');
                break;
        }

        return EMT_SERVER.$urlService;
    }

    public function get($idService, $params)
    {
        //dd($this->getCacheTimeToServices($idService));
        $cache = new cache();
        $idCache = $idService.var_export($params, true);
        $result = $cache->get($idCache, $this->getCacheTimeToServices($idService));
        if (is_null($result)) {
            $data = array_merge($this->commonData, $params);

            $url = $this->urlService($idService);
            // use key 'http' even if you send the request to https://...
            $options = array(
                'http' => array(
                    'header' => "Content-type: application/x-www-form-urlencoded\r\n",
                    'method' => 'POST',
                    'content' => http_build_query($data),
                ),
                // Parche por certificado erroneo
                'ssl' => array(
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                ),
            );
            $context = stream_context_create($options);
            $result = file_get_contents($url, false, $context);
            //d($url,$data);
            //dd($result);
            if ($result === false) {
                throw new NotResponseRemoteServiceException("The remote service [$idService] is not responding. Fail read content $url");
            }
            //header('Content-Type: application/json'); echo($result);die();
            $result = json_decode($result, 1);

            switch ($idService) {
                case 'GetEstimatesIncident':
                    /* Parche GetEstimatesIncident cuando en stop/stopLines/data llega un único elemento y no llega como array */
                    if (isset($result['stop']) && is_array($result['stop']['stopLines']['data']) && !isset($result['stop']['stopLines']['data'][0])) {
                        $tmp = $result['stop']['stopLines']['data'];
                        unset($result['stop']['stopLines']['data']);
                        $result['stop']['stopLines']['data'] = array($tmp);
                    }

                    // Llegadas
                    if (isset($result['arrives']) && is_array($result['arrives']['arriveEstimationList']['arrive']) && is_null($result['arrives']['arriveEstimationList']['arrive'][0])) {
                        $tmp = $result['arrives']['arriveEstimationList']['arrive'];
                        unset($result['arrives']['arriveEstimationList']['arrive']);
                        $result['arrives']['arriveEstimationList']['arrive'] = array($tmp);
                    }
                    break;

                    case 'GetArriveStop':
                        /* Parche GetArriveStop cuando sólo llega un único elemento y no llega como array, sustituido por GetEstimatesIncident*/
                        if (is_array($result['arrives']) && is_null($result['arrives'][0])) {
                            $tmp = $result['arrives'];
                            unset($result['arrives']);
                            $result['arrives'] = array($tmp);
                        }
                        break;
                case 'getStopsFromXY':
                    /* Parche getStopsFromXY cuando en lines sólo llega un único elemento y no llega como array */
                    if (is_array($result['stop'])) {
                        foreach ($result['stop'] as $key => $stop) {
                            if (!isset($stop['line'][0]['line'])) {
                                $tmp = $stop['line'];
                                unset($result['stop'][$key]['line']);
                                $result['stop'][$key]['line'] = array($tmp);
                            }
                        }
                    }

                    /* Precalcular distancias */
                    if (is_array($result['stop'])) {
                        foreach ($result['stop'] as $key => $stop) {
                            $result['stop'][$key]['distance'] = units::distance($result['latitude'], $result['longitude'], $stop['latitude'], $stop['longitude']);
                        }
                    }
                    # code...
                    break;
            }

            if ($this->getCacheTimeToServices($idService) != 0) { // -1 force refresh cache
                $cache->set($idCache, serialize($result));
            }
        } else {
            $result = unserialize($result);
        }
        // Add timestamp info
        $result['timestamp'] = $cache->getTimeStamp(); //echo (date(DATE_ATOM, $cache->getTimeStamp()));

        //d($result);
        return $result;
    }
}
