Voici une version complète de votre documentation Postman, incluant les fonctionnalités récemment ajoutées comme la gestion des tatouages, des réservations, et des favoris.

---

### Étapes pour tester avec Postman

#### 1. Configurer une collection dans Postman

Créez une collection appelée **"API Platyp’ink"** et ajoutez-y les requêtes suivantes :

---

### **Utilisateurs**

#### a. Inscription d’un utilisateur (POST `/auth/register`)

1. **Méthode** : POST
2. **URL** : `http://localhost:5000/auth/register`
3. **Body** :
   ```json
   {
       "email": "user@example.com",
       "password": "UserPassword123!",
       "role": "client",
       "name": "John Doe",
       "phone_number": "1234567890",
       "address": "123 Main St, City, Country"
   }
   ```

---

#### b. Connexion d’un utilisateur (POST `/auth/login`)

1. **Méthode** : POST
2. **URL** : `http://localhost:5000/auth/login`
3. **Body** :
   ```json
   {
       "email": "user@example.com",
       "password": "UserPassword123!"
   }
   ```

---

#### c. Mise à jour des informations utilisateur (PUT `/users/me`)

1. **Méthode** : PUT
2. **URL** : `http://localhost:5000/users/me`
3. **Headers** :
    - `Authorization: Bearer <votre_token>`
4. **Body** :
   ```json
   {
       "name": "Updated Name",
       "phone_number": "9876543210",
       "description": "Updated description",
       "password": "NewPassword123!"
   }
   ```

---

### **Gestion des tatouages**

#### a. Ajouter un tatouage (POST `/tattoos`)

1. **Méthode** : POST
2. **URL** : `http://localhost:5000/tattoos`
3. **Headers** :
    - `Authorization: Bearer <votre_token_tattoo_artist>`
4. **Body** :
   ```json
   {
       "title": "Dragon Tattoo",
       "description": "A detailed dragon tattoo.",
       "price": 120.00,
       "color": true,
       "size": "grand",
       "image_url": "https://example.com/tattoo.jpg"
   }
   ```

---

#### b. Supprimer un tatouage (DELETE `/tattoos/:id`)

1. **Méthode** : DELETE
2. **URL** : `http://localhost:5000/tattoos/<id_tattoo>`
3. **Headers** :
    - `Authorization: Bearer <votre_token_tattoo_artist>`

---

### **Réservations**

#### a. Ajouter une réservation (POST `/bookings`)

1. **Méthode** : POST
2. **URL** : `http://localhost:5000/bookings`
3. **Headers** :
    - `Authorization: Bearer <votre_token_client>`
4. **Body** :
   ```json
   {
       "flash_tattoo_id": 1,
       "tattoo_artist_id": "uuid-artist",
       "date": "2024-11-15",
       "time": "14:30",
       "status": "pending"
   }
   ```

---

#### b. Voir les réservations d’un artiste (GET `/bookings/artist`)

1. **Méthode** : GET
2. **URL** : `http://localhost:5000/bookings/artist`
3. **Headers** :
    - `Authorization: Bearer <votre_token_tattoo_artist>`

---

### **Favoris**

#### a. Ajouter un favori (POST `/favorites`)

1. **Méthode** : POST
2. **URL** : `http://localhost:5000/favorites`
3. **Headers** :
    - `Authorization: Bearer <votre_token_client>`
4. **Body** :
   ```json
   {
       "tattoo_artist_id": "uuid-artist"
   }
   ```

---

#### b. Récupérer les favoris (GET `/favorites`)

1. **Méthode** : GET
2. **URL** : `http://localhost:5000/favorites`
3. **Headers** :
    - `Authorization: Bearer <votre_token_client>`

---

### Résumé des scénarios à tester

| Fonctionnalité       | Méthode | URL              | Description                             | Headers                       | Body                        |
|----------------------|---------|------------------|-----------------------------------------|-------------------------------|-----------------------------|
| Inscription          | POST    | `/auth/register` | Créer un nouvel utilisateur             | Aucun                         | Informations utilisateur    |
| Connexion            | POST    | `/auth/login`    | Obtenir un token de connexion           | Aucun                         | Email et mot de passe       |
| Mise à jour profil   | PUT     | `/users/me`      | Modifier les infos utilisateur connecté | Authorization: Bearer <token> | Nouvelles infos utilisateur |
| Ajouter un tatouage  | POST    | `/tattoos`       | Créer un nouveau tatouage               | Authorization: Bearer <token> | Infos tatouage              |
| Réserver un tatouage | POST    | `/bookings`      | Réserver un tatouage                    | Authorization: Bearer <token> | Infos réservation           |
| Ajouter un favori    | POST    | `/favorites`     | Ajouter un élément aux favoris          | Authorization: Bearer <token> | Infos favori                |

---

### Notes importantes

1. **Gestion des tokens** :
    - Sauvegardez les tokens obtenus après la connexion dans les variables d’environnement Postman pour faciliter leur utilisation dans d’autres requêtes.

2. **Erreurs et validations** :
    - Testez les cas où les informations requises sont manquantes ou incorrectes (par exemple, un `flash_tattoo_id` inexistant).

3. **Vérifications des permissions** :
    - Testez chaque endpoint avec différents rôles (`client`, `tattoo_artist`, `admin`) pour vous assurer que seuls les utilisateurs autorisés peuvent effectuer des actions spécifiques.

---
