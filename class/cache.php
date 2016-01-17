<?php
namespace BusMadrid;

class cache
{
    protected $basePath;
    protected $timeStamp;

    public function __construct()
    {
        $this->basePath = DIR_CACHE;
    }

    protected function setTimeStamp($tm = null)
    {
        /* Put the time stamp, if is empty put the system time */
        $this->timeStamp = $tm ? $tm : time();
    }
    public function getTimeStamp()
    {
        return $this->timeStamp;
    }
    protected function getPathFromId($id)
    {
        $normalizeId = sha1($id);
        $path = $this->basePath.'/'.substr($normalizeId, 0, 3).'/'.substr($normalizeId, 3);

        return $path;
    }

    public function set($id, $data)
    {
        $cachefile = $this->getPathFromId($id);
        $dir = dirname($cachefile);
        if (!is_dir($dir)) {
            mkdir($dir);
            @chmod($dir, 0777);
        }
        file_put_contents($cachefile, $data);
        @chmod($cachefile, 0666);
    }

    public function get($id, $cachetime)
    {
        if ($cachetime > 0) {
            $cachefile = $this->getPathFromId($id);
            $timeLimit = time() - $cachetime;
            if (file_exists($cachefile) && ($timeLimit < ($fts = filemtime($cachefile)))) {
                $this->setTimeStamp($fts);
                return file_get_contents($cachefile);
            }
        }

        $this->setTimeStamp();
        return null;
    }
}
