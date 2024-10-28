# General

## Login POST

```
http://localhost:5000/api/auth/login
```

### Request

```json
{
    "email": "",
    "password": ""
}
```

## Register POST

```
http://localhost:5000/api/auth/register
```

```json
{
    "email": "",
    "password": "",
    "role": "",
    "name": "",
    "phone_number": "",
    "address": ""
}
```

## Get all tattoo GET

```
http://localhost:5000/api/flashes
```

## Get tattoo by id GET

```
http://localhost:5000/api/flashes/:id
```

# Tattoo Artist

## Add tattoo POST

```
http://localhost:5000/api/tattoo-artist/flashes
```

### Request

```json
{
    "title": "",
    "description": "",
    "image_url": "",
    "price": ""
}
```

## Modify tattoo PUT

```
http://localhost:5000/api/tattoo-artist/flashes/:id
```

### Request

```json
{
    "title": "",
    "description": "",
    "image_url": "",
    "price": ""
}
```

## Delete tattoo DELETE

```
http://localhost:5000/api/tattoo-artist/flashes/:id
```


