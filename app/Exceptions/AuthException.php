<?php

namespace App\Exceptions;

use Exception;

class AuthException extends Exception
{
    public static function string($string): self
    {
        return new self($string);
    }
  
}
