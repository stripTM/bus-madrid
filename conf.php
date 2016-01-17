<?php
namespace busmadrid;

spl_autoload_register(function ($class_name) {
    $parts = explode('\\', $class_name);
    //d(debug_backtrace());
    require 'class/'.end($parts).'.php';
});
require('conf.private.php');
// Set locale to Spain
date_default_timezone_set('Europe/Madrid');

// System path
define('DIR_BASE', dirname(__FILE__));
define('DIR_DATA', DIR_BASE.'/data');
define('DIR_CACHE', DIR_BASE.'/cache');

// Ajax server
$generateApp = getenv('GENERATE_APP') || (isset($_GET['v']) && ($_GET['v'] === 'prod'));
if ($generateApp) {
    define('HOST_DOMAIN', 'https://bus-madrid.striptm.com/');
} else {
    define('HOST_DOMAIN', 'http://'.$_SERVER['HTTP_HOST'].'/');
}

// Api rest service
define('EMT_SERVER', 'https://openbus.emtmadrid.es:9443/emt-proxy-server/last/');

/* Debug */
if (file_exists(DIR_BASE.'/../../www/tools/kint/Kint.class.php')) {
    require DIR_BASE.'/../../www/tools/kint/Kint.class.php';
}
