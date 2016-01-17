<?php
namespace BusMadrid;

class StopInvalidException extends \exception
{
}

class stop_do
{
    protected $emt_proxy;
    protected $idStop;
    protected $aArriveStop;
    public function __construct()
    {
        $this->emt_proxy = new emt_proxy();
    }

    public function getStop()
    {
        return $this->idStop;
    }
    public function setStop($stop)
    {
        $this->idStop = $stop;
    }
    public function getDescription()
    {
        return $this->aArriveStop['stop']['description'];
    }
    public function setDescription($description)
    {
        return $this->aArriveStop['stop']['description'] = $description;
    }
    public function getDirection()
    {
        //d($this->aStopLine);
        return $this->aArriveStop['stop']['direction'];
    }
    public function getTimeLeft()
    {
        return $this->aArriveStop;
    }
    public function setStopLines($aStopLines)
    {
        $this->aArriveStop['stop']['stopLines']['data']  = $aStopLines;
    }
    public function getStopLines()
    {
        if ($this->aArriveStop['stop']['stopLines']['data'] === null) {
            return array();
        } else {
            return $this->aArriveStop['stop']['stopLines']['data'];
        }
    }
    // Force refresh the cache
    public function forceRefreshCache($bRefreshCache)
    {
        $this->emt_proxy->forceRefreshCache($bRefreshCache);
    }
    public function loadArriveStop($idStop, $cultureInfo = 'ES')
    {
        $this->setStop($idStop);
/*
        $this->aArriveStop = $this->emt_proxy->get(
                'GetArriveStop',
                array(
                    'idStop' => $idStop,
                    'cultureInfo' => $cultureInfo
                )
            );
*/
        $this->aArriveStop = $this->emt_proxy->get(
                'GetEstimatesIncident',
                array(
                    'idStop' => $idStop,
                    'Text_StopRequired_YN' => 'Y',
                    'Audio_StopRequired_YN' => 'N',
                    'Text_EstimationsRequired_YN' => 'Y',
                    'Audio_EstimationsRequired_YN' => 'N',
                    'Text_IncidencesRequired_YN' => 'Y',
                    'Audio_IncidencesRequired_YN' => 'N',
                    'cultureInfo' => $cultureInfo
                )
            );
        $bStopFound = true;
        if ($this->aArriveStop['errorCode'] == -1) {
            // No hay información (probablemente en horario nocturno)
            // Estos datos deben estar precargados
            $bStopFound = false;
            $tmpStopDate = $this->emt_proxy->get(
                'GetNodesLines',
                //array('Nodes' => $idStop)
                array() // Cargando todos nos aseguramos que este cacheado y no haya que ir a por los datos
            );
            $tmpListLines = $this->emt_proxy->get(
                'GetListLines',
                array(
                    'SelectDate' => date('j/m/Y')
                )
            );
            //d($tmpStopDate);
            //d($tmpStopDate['resultValues']);
            // Search stop node
            $aStopLines = array();
            $aIdStopUsed = array(); // Control  to avoid duplicates

            foreach ($tmpStopDate['resultValues'] as $stopNode) {
                if ($stopNode['node'] == $idStop) {
                    $bStopFound = true;
                    $this->setDescription($stopNode['name']);
                    foreach ($stopNode['lines'] as $lineIdRaw) {
                        // Obtain ids as "521/1" transform to  "126" "MINISTERIOS - BARRIO DEL PILAR"
                        $lineId = substr($lineIdRaw, 0, strpos($lineIdRaw, '/'));
                        // prevent duplicates
                        if (in_array($lineId, $aIdStopUsed) === false) {
                            foreach ($tmpListLines['resultValues'] as $lineData) {
                                // line - label - nameA - nameB
                                if ($lineData['line'] == $lineId) {
                                    $label = $lineData['label'];
                                    $description = $lineData['nameA'].' - '.$lineData['nameB'];
                                }
                            }
                            unset($aStopLinesData);
                            $aStopLinesData = array(
                                'lineId' => $lineId,
                                'label' => $label,
                                'description' => $description
                            );
                            $aStopLines[] = $aStopLinesData;
                            $aIdStopUsed[] = $lineId;
                        }
                    }
                }
            }
            $this->setStopLines($aStopLines);
        }

        // Id stop not found
        if (!$bStopFound) {
            throw new StopInvalidException("Invalid stop bus $idStop");
        }
    }
}
