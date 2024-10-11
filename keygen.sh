# JWT SECRET KEY GENERATOR

# Generate a random secret key and remove padding '=' characters
SECRET_KEY=$(openssl rand -base64 32 | tr -d '=')

# Append the new secret key to the .env file
echo "JWT_SECRET=$SECRET_KEY" >> .env
