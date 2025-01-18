# Charon [![Frontend Unit Tests](https://github.com/Dominic-github/charon/actions/workflows/frontend.yml/badge.svg)](https://github.com/Dominic-github/charon/actions/workflows/frontend.yml) [![Kofi Badge](https://img.shields.io/badge/-Kofi-ff5f5f?style=flat-square&logo=Kofi&logoColor=white)](https://ko-fi.com/dominic_kofi) [![Patreon Badge](https://img.shields.io/badge/-Patreon-ffffff?style=flat-square&logo=Patreon&logoColor=ff424d)](https://www.patreon.com/user?u=57078534)

<p align="center"><a href="https://github.com/Dominic-github/charon"><img width="400" src="./.github/img/charon.png" alt="Charon"></a></p>

<br/>

## Requirements

- Php >= 8.1
- nodejs >= 20
- composer

## 🚀 Install

```bash
  git clone https://github.com/dominic-github/charon
  cd charon
  composer install
  php artisan charon:init

  # Follow the step by step instructions and run
  php artisan serve
```

### Default Account Administrator
- email: admin@charon.dev
- password: admin


## ⚙️ Settings

### Php

Dowload [cacert.pem](https://curl.se/ca/cacert.pem)

```ini
  ; Extension
  extension=gd
  extension=exif
  extension=fileinfo
  extension=intl
  extension=xsl
  extension=sodium
  extension=pdo_sqlite

  ; Curl
  [curl]
  curl.cainfo = "C:\xampp\php\extras\ssl\cacert.pem"
  ; Openssl
  [openssl]
  openssl.cafile = "C:\xampp\php\extras\ssl\cacert.pem"

  ; Maximum allowed size for uploaded files.
  upload_max_filesize = 1000M

  ; Maximum size of POST data that PHP will accept.
  post_max_size = 1000M
```

## ❤️ Support

- If you like this project can support me

[![kofi](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/Dominic_kofi)
[![paypal](https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/DominicPPal)
[![patreon](https://img.shields.io/badge/Patreon-F96854?style=for-the-badge&logo=patreon&logoColor=white)](https://www.patreon.com/Dominic_patreon)

## License

[MIT license](https://opensource.org/licenses/MIT).
