Pour tester les modifications d’utilisateurs via Postman, il vous faudra plusieurs éléments :

1. **Créer des collections et des requêtes dans Postman** pour chaque endpoint (connexion, inscription, mise à jour du profil).
2. **Configurer les en-têtes d’autorisation** pour chaque requête nécessitant un token.
3. **Envoyer des requêtes avec des exemples de données** pour vérifier les réponses de l'API.

---

### Étapes pour tester avec Postman

#### 1. Créer les collections et les requêtes

Créez une collection dans Postman, par exemple nommée **"API Platyp’ink"**. Ajoutez-y les requêtes suivantes :

##### a. Inscription d’un utilisateur (POST `/auth/register`)

1. **Méthode** : POST
2. **URL** : `http://localhost:5000/auth/register`
3. **Body** : Choisissez `raw` et `JSON`, puis entrez les informations d’inscription :

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

4. **Envoyer la requête** : Si tout fonctionne, vous devriez recevoir une réponse avec l’utilisateur créé.

---

##### b. Connexion d’un utilisateur (POST `/auth/login`)

1. **Méthode** : POST
2. **URL** : `http://localhost:5000/auth/login`
3. **Body** : Choisissez `raw` et `JSON`, puis entrez les informations de connexion :

   ```json
   {
       "email": "user@example.com",
       "password": "UserPassword123!"
   }
   ```

4. **Envoyer la requête** : Vous recevrez un `token` de connexion si les informations sont correctes. Sauvegardez ce token, car vous en aurez besoin pour les autres requêtes.

---

#### 2. Tester les modifications de profil utilisateur

##### a. Mise à jour des informations de l’utilisateur connecté (PUT `/users/me`)

1. **Méthode** : PUT
2. **URL** : `http://localhost:5000/users/me`
3. **Headers** :
    - Ajoutez un header `Authorization` avec la valeur `Bearer <votre_token>`.
4. **Body** : Choisissez `raw` et `JSON`, puis entrez les nouvelles informations à mettre à jour (par exemple) :

   ```json
   {
       "name": "John Updated",
       "phone_number": "0987654321",
       "description": "Tattoo enthusiast",
       "password": "NewPassword123!"
   }
   ```

5. **Envoyer la requête** : Vous devriez recevoir une réponse confirmant la mise à jour des informations.

---

##### b. Mise à jour des informations d’un autre utilisateur (PUT `/users/:id`)

> **Note** : Cette requête nécessite que l’utilisateur soit un **administrateur**.

1. **Méthode** : PUT
2. **URL** : `http://localhost:5000/users/<id_utilisateur>`
3. **Headers** :
    - Ajoutez un header `Authorization` avec la valeur `Bearer <votre_token_admin>`.
4. **Body** : Choisissez `raw` et `JSON`, puis entrez les informations à modifier :

   ```json
   {
       "name": "User Updated by Admin",
       "role": "tattoo_artist",
       "address": "456 New St, New City"
   }
   ```

5. **Envoyer la requête** : Si les permissions et le token sont corrects, vous recevrez une réponse confirmant la mise à jour de cet utilisateur.

---

#### 3. Tester d'autres scénarios

Voici quelques cas que vous pouvez également tester :

- **Token invalide** : Essayez d’envoyer une requête avec un token incorrect ou expiré pour voir si l’API répond avec une erreur d’autorisation.
- **Rôles non autorisés** : Essayez d'accéder à la route `/users/:id` avec un utilisateur qui n’est pas admin pour vérifier si l’API renvoie bien une erreur de permission.
- **Champs manquants** : Enlevez un champ requis (comme `name` ou `role`) et vérifiez si l’API retourne un message d’erreur approprié.

---

### Résumé des requêtes dans Postman

| Méthode | URL              | Description                                | Headers                       | Body                       |
|---------|------------------|--------------------------------------------|-------------------------------|----------------------------|
| POST    | `/auth/register` | Inscription d’un nouvel utilisateur        | Aucun                         | Informations d'inscription |
| POST    | `/auth/login`    | Connexion de l’utilisateur                 | Aucun                         | Email et mot de passe      |
| PUT     | `/users/me`      | Mise à jour des infos utilisateur connecté | Authorization: Bearer <token> | Nouvelles informations     |
| PUT     | `/users/:id`     | Mise à jour d’un utilisateur (Admin)       | Authorization: Bearer <token> | Informations utilisateur   |

