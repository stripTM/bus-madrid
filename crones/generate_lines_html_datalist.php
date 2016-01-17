<?php
namespace BusMadrid;
$generateApp = true;
putenv('GENERATE_APP=1');
require(dirname(__FILE__).'/../conf.php');

$bus = new bus_do();

$dStart = time();
header('Content-Type: text/plain');
echo "Inicio\n".

$bus->loadListLines();
$lines = $bus->getListLines(true);

$result = "<datalist id='lineasBus'>\n";
foreach ($lines['resultValues'] as $key => $value) {
    $lineLabel = $value['label'];
    $result .= "<option value='".$value['label']."'/>\n";
}
$result .= "</datalist>\n";

$fp = fopen(DIR_DATA.'/lines_datalist.inc', 'w');
fwrite($fp, $result);
fclose($fp);

$totalTime = time() - $dStart;
echo "Fin en $totalTime segundos\n";
echo "$result\n";
