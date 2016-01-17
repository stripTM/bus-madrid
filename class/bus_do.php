<?php
namespace BusMadrid;

class DirectionInvalidException extends \exception
{
}
class LineInvalidException extends \exception
{
}

class bus_do
{
    protected $emt_proxy;

    protected $idLine;

    protected $aStopLine;
    protected $aListLines;
    public function __construct()
    {
        $this->emt_proxy = new emt_proxy();
    }

    public function getLine()
    {
        return $this->idLine;
    }
    public function setLine($line)
    {
        $this->idLine = $line;
    }

    // Force refresh the cache
    public function forceRefreshCache($bRefreshCache)
    {
        $this->emt_proxy->forceRefreshCache($bRefreshCache);
    }
    public function loadStopLine($line, $direction)
    {
        $aDirection;
        switch ($direction) {
            case '1':
                $aDirection = array('1');
                break;
            case '2':
                $aDirection = array('2');
                break;
            case 'both':
                $aDirection = array('1', '2');
                break;
            default:
                throw new DirectionInvalidException("Invalid line bus direction $direction. Expected [1|2|both]");
                break;
        }

        $this->setLine($line);
        $this->aStopLine = array(); /* Result */
        foreach ($aDirection as $dir) {
            $this->aStopLine[$dir] = $this->emt_proxy->get(
                'GetStopsLine',
                array(
                    'line' => $line,
                    'direction' => $dir,
                    'cultureInfo' => 'ES'
                )
            );
        }
        return true;
    }

    public function loadListLines()
    {
        $this->aListLines = $this->emt_proxy->get(
            'GetListLines',
            array(
                'SelectDate' => date('j/m/Y')
            )
        );
    }



    public function getStopsLine()
    {
        return $this->aStopLine;
    }

    public function getListLines()
    {
        return $this->aListLines;
    }

    public function searchLine($line)
    {
        if ($this->getListLines() === null) {
            $this->loadListLines();
        }
        $normalizedLine = strtoupper($line);
        $normalizedLine = str_replace(' ', '', $normalizedLine); // extra spaces
        foreach ($this->aListLines['resultValues'] as $lineData) {
            if (strtoupper($lineData['label']) === $normalizedLine) {
                return $lineData['line'];
            }
        }

        // If don't find the bus line
        throw new LineInvalidException("Invalid line bus $line");
    }

    public function getLabel()
    {
        if ($this->getListLines() === null) {
            $this->loadListLines();
        }
        foreach ($this->aListLines['resultValues'] as $lineData) {
            if ($lineData['line'] === $this->idLine) {
                return $lineData['label'];
            }
        }
    }
}
