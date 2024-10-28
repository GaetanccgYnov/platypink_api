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

# Tattoo Artist

## Add tattoo POST

```
http://localhost:5000/api/tattoo-artist/add-flash
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
http://localhost:5000/api/tattoo-artist/manage-flash/:id
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
http://localhost:5000/api/tattoo-artist/manage-flash/:id
```


