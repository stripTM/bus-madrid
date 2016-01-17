<?php
namespace BusMadrid;

class KeyInvalidException extends exception
{
}
class KeyhasUseException extends exception
{
}
class collection
{
    public static $elements;

    public function __construct()
    {
        $this->elements = array(); /* Create empty structure */
    }

    public function hasKey($key)
    {
        return isset($this->elements[$key]);
    }

    public function add($element, $key = null)
    {
        if ($key == null) {
            $this->elements[] = $element;
        } else {
            if ($this->hasKey($key)) {
                throw new KeyHasUseException("Key $key already in use.");
            } else {
                $this->elements[$key] = $element;
            }
        }
    }

    public function set($element, $key)
    {
        $this->elements[$key] = $element;
    }

    public function remove($key)
    {
        if (isset($this->elements[$key])) {
            unset($this->elements[$key]);
        } else {
            throw new KeyInvalidException("Invalid key $key.");
        }
    }

    public function get($key)
    {
        if (isset($this->elements[$key])) {
            return $this->elements[$key];
        } else {
            throw new KeyInvalidException("Invalid key $key.");
        }
    }

    public function keys()
    {
        return array_keys($this->elements);
    }
    public function length()
    {
        return count($this->elements);
    }
}
