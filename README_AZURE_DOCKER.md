# Deploying CraftYourCoffee (Next.js) to Azure with Docker

This guide will help you build and deploy your Dockerized Next.js app to Azure Web App for Containers.

---

## Prerequisites
- Azure account ([sign up free](https://azure.com/free))
- Azure CLI installed (`brew install azure-cli` or [docs](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli))
- Docker installed and running
- (Optional) Azure Container Registry (ACR) or Docker Hub account

---

## 1. Build the Docker Image

```
docker build -t craftyourcoffee .
```

## 2. Test Locally (Optional)

```
docker run -p 3000:3000 craftyourcoffee
```
Visit http://localhost:3000 to verify.

---

## 3. Push Image to a Registry

### Option A: Azure Container Registry (Recommended)
1. Login to Azure:
   ```
az login
   ```
2. Create a resource group (if needed):
   ```
az group create --name coffee-rg --location eastus
   ```
3. Create an Azure Container Registry:
   ```
az acr create --resource-group coffee-rg --name coffeeregistry --sku Basic
   ```
4. Login to ACR:
   ```
az acr login --name coffeeregistry
   ```
5. Tag and push your image:
   ```
ACR_NAME=coffeeregistry
IMAGE=craftyourcoffee
az acr repository list --name $ACR_NAME
# Tag
IMAGE_TAG=$ACR_NAME.azurecr.io/$IMAGE:latest
docker tag $IMAGE $IMAGE_TAG
# Push
docker push $IMAGE_TAG
   ```

### Option B: Docker Hub
1. Login:
   ```
docker login
   ```
2. Tag and push:
   ```
docker tag craftyourcoffee <your-dockerhub-username>/craftyourcoffee:latest
docker push <your-dockerhub-username>/craftyourcoffee:latest
   ```

---

## 4. Deploy to Azure Web App for Containers

1. Create the Web App:
   ```
az webapp create --resource-group coffee-rg --plan coffee-app-service --name coffee-crafters-app --deployment-container-image-name coffeeregistry.azurecr.io/craftyourcoffee:latest
   ```
   - For Docker Hub, use: `<dockerhub-username>/craftyourcoffee:latest`
2. Configure environment variables (if needed):
   ```
az webapp config appsettings set --resource-group coffee-rg --name coffee-crafters-app --settings NEXT_PUBLIC_API_URL=... DATABASE_URL=... ADOBE_CLIENT_ID=... ADOBE_CLIENT_SECRET=...
   ```
3. Restart the app:
   ```
az webapp restart --resource-group coffee-rg --name coffee-crafters-app
   ```
4. Browse to your app:
   ```
az webapp browse --resource-group coffee-rg --name coffee-crafters-app
   ```

---

## Notes
- Update `DATABASE_URL` and other secrets in Azure Portal or CLI.
- For persistent storage, use Azure Database for PostgreSQL and update your env vars.
- For custom domains/SSL, configure in Azure Portal.

---

## Troubleshooting
- Check logs:
  ```
az webapp log tail --resource-group coffee-rg --name coffee-crafters-app
  ```
- If you see build errors, make sure your Dockerfile is correct and all env vars are set.

---

For more, see Azure Web App for Containers docs: https://learn.microsoft.com/en-us/azure/app-service/containers/
