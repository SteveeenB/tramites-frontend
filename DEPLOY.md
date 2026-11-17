# Frontend deployment check

This guide builds and runs the frontend container from a clean Docker build. The frontend image does not include or start the backend.

## Requirements

- Docker Desktop running
- PowerShell in the `tramites-frontend` directory
- The backend at `http://localhost:8080` only if you want to test API-backed workflows

## Clean build

```powershell
docker build --no-cache --build-arg REACT_APP_DEMO_MODE=false -t tramites-frontend:tp210 .
if ($LASTEXITCODE -ne 0) { throw 'Docker build failed' }
```

The image uses Node 22 to build React and unprivileged nginx to serve the static files.

## Run locally

```powershell
docker run --rm -d --name tramites-frontend-deploy-check -p 8081:8080 -e API_URL=http://localhost:8080/api tramites-frontend:tp210
```

Open <http://localhost:8081>. The `API_URL` value is read when the container starts; changing it does not require rebuilding the image. For deployment, replace it with the public backend URL.

## Verify

```powershell
curl.exe -fsS -o NUL -w "Home HTTP %{http_code}`n" http://localhost:8081/
curl.exe -fsS -o NUL -w "Direct /tramites HTTP %{http_code}`n" http://localhost:8081/tramites
$config = curl.exe -fsS http://localhost:8081/config.js
$configText = $config -join "`n"
$configText
if ($configText -notmatch 'http://localhost:8080/api') { throw 'API_URL was not injected at container startup' }
docker inspect --format '{{.Config.User}}' tramites-frontend-deploy-check
```

Expected results: both routes return HTTP 200, `config.js` contains the supplied API URL, and the configured container user is `nginx`.

To stop and remove the test container:

```powershell
docker stop tramites-frontend-deploy-check
```

## Configuration

- `API_URL`: runtime URL of the backend API.
- `GOOGLE_CLIENT_ID`: optional runtime Google OAuth client ID.
- `REACT_APP_DEMO_MODE`: build-time setting. Keep it `false` for production so demo user data is excluded from the bundle.
