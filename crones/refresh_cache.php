<?php
namespace BusMadrid;

putenv('GENERATE_APP=1');
require(dirname(__FILE__).'/../conf.php');

$bus = new bus_do();
$dStart = time();
header('Content-Type: text/plain; charset=iso-8859-1');
echo "Inicio\n";

try {
    $bus->forceRefreshCache(true);
    $bus->loadListLines();
    $lines = $bus->getListLines();

    //d($lines['resultValues']);
    //$bus->loadStopLine('100', 'both');
    echo 'Loading lines: ';
    foreach ($lines['resultValues'] as $key => $value) {
        try {
            $line = $value['line'];
            echo "$line, ";
            $bus->loadStopLine($line, 'both');
        } catch (DirectionInvalidException $e) {
            echo "Load line '$line' failed: ",  $e->getMessage(), "\n";
        }
    }
    echo "\n";

    $totalTime = time() - $dStart;
    $minutes = floor($totalTime/60);
    $seconds = $totalTime % 60;
    echo "Todas la líneas cargadas en $minutes minutos $seconds segundos\n";
} catch (DirectionInvalidException $e) {
    echo "Load list of lines failed: ",  $e->getMessage(), "\n";
}

// Purge old files / dirs
function purgeDir($dir, $timeOld)
{
    if ($handle = opendir($dir)) {
        $countProcessed = 0;
        while (false !== ($file = readdir($handle))) {
            if ($file  != '.' && $file != '..') {
                $newPath = $dir.'/'.$file;
                $filelastmodified = filemtime($newPath);
                if (is_dir($newPath)) {
                    $countProcessed += purgeDir($newPath, $timeOld);
                    if ((time() - $filelastmodified) > $timeOld) {
                        @rmdir($newPath); // Remove posible warning in non empty dirs.
                    }
                }

                if (is_file($newPath) && (time() - $filelastmodified) > $timeOld) {
                    unlink($newPath);
                    $countProcessed++;
                }
            }
        }
        closedir($handle);
    }
    return $countProcessed;
}

$totProcessed = purgeDir(DIR_CACHE, 24*60*60);
echo "Eliminados $totProcessed archivo/s de cache que estaban caducados.\n";
