# Hosting your portfolio from your Windows laptop

Prepared for Davin — 3 October 2026.

This is a setup guide for a two-week demo. The examples below have not been installed or tested in your project. Creating this guide has not changed the website or published anything.

The proposed setup is **Docker Desktop + Docker Compose + Nginx + a Cloudflare Quick Tunnel**. No rented server or purchased domain is required. Your costs are your existing internet and electricity.

## 1. The complete picture

There are two separate flows: building the website and serving visitors.

```text
BUILD (when you release a change)
Your source + package-lock.json
  -> Docker build runs Node/npm and Next.js
  -> Next.js exports HTML, CSS, JavaScript and images into out/
  -> Docker packages those files with Nginx into an image

RUN (while the website is online)
Visitor's browser
  -> public HTTPS address supplied by Cloudflare
  -> Cloudflare's network
  -> encrypted tunnel connection initiated by cloudflared on your laptop
  -> http://127.0.0.1:8080 on your laptop
  -> Docker forwards the request to container port 80
  -> Nginx returns the exported files
  -> the browser renders the page and runs GSAP/WebGL animations
```

Node and npm are needed during the build. They are not needed inside the final serving container for this static export. Your current preview has `output: "export"` and `trailingSlash: true` in `next.config.ts`. [Next.js static exports](https://nextjs.org/docs/app/guides/static-exports).

## 2. Each component's responsibility

| Component or term | Responsibility | Why you need it |
| --- | --- | --- |
| Host | The computer running the containers: your laptop now, a Linux server later | Supplies CPU, RAM, storage and network connectivity |
| WSL 2 | Runs a Linux environment on Windows | Provides the Linux backend used by Docker Desktop in this setup |
| Docker Desktop / Engine | Builds images and manages running containers | Runs the website's Linux environment on your Windows laptop |
| Dockerfile | The recipe for building an image | Makes dependency installation, compilation and packaging repeatable |
| Build context | Files Docker is allowed to use during a build | The project directory supplies source, lockfile, assets and local libraries |
| .dockerignore | Excludes files from that context | Keeps local dependencies, generated files and secrets out of the build input |
| Image | A packaged filesystem and startup configuration | Holds Nginx plus one built version of your website |
| Container | A running instance of an image | Actually serves HTTP requests; rebuilding an image alone does not replace it |
| Nginx | The HTTP server inside the container | Returns HTML, JavaScript, CSS, images and your 404 page |
| Compose | Reads a YAML definition and manages the application's containers | Records build settings, ports, restart policy and health checks so you do not retype them |
| Port mapping | Connects a host port to a container port | Makes laptop port 8080 reach Nginx port 80 |
| Health check | Periodically tests the container's HTTP response | Shows whether Nginx is responding; it does not prove the public tunnel works |
| cloudflared | A separate process on your Windows laptop | Opens an outbound tunnel and forwards incoming website requests locally |
| DNS / hostname | Maps the public website name to the service | Cloudflare supplies the temporary name for this demo |
| HTTPS / TLS | Encrypts traffic and authenticates the website endpoint | Cloudflare supplies HTTPS for the public URL; the local loopback connection uses HTTP |
| Registry | Stores images for other computers to download | Optional locally; useful when moving to a server or pipeline |
| Volume | Persistent storage mounted into a container | Not needed here because the portfolio only serves files baked into its image |

Compose is optional for one container, but useful for learning and keeping setup in source control. It manages containers on one host. It does not provide a domain, HTTPS, cloud hosting or Kubernetes-style scheduling. [How Compose works](https://docs.docker.com/compose/intro/compose-application-model/).

## 3. Install the prerequisites

1. Install **Docker Desktop for Windows**, using its WSL 2 backend and Linux containers. Follow the installer and restart Windows if prompted. Check virtualization/WSL requirements if installation fails. Docker Desktop is free for personal use; company use has separate licensing terms. [Windows installation guide](https://docs.docker.com/desktop/setup/install/windows-install/).
2. Start Docker Desktop and wait for its engine to be running.
3. Install the **Windows cloudflared executable** using the official download instructions. Make it available in your PATH, or run it by its full executable path. [Cloudflared downloads](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/downloads/).
4. In a new PowerShell window, verify:

```powershell
docker version
docker compose version
cloudflared --version
```

`docker version` should show both client and server information. A client-only response with a connection error usually means Docker Desktop is not running.

## 4. Start from the correct source

The portfolio source, dependencies and Git history are now directly at `C:\Workspace\Carstens Workspace\carstens-devfolio`. The current cleanup, dependency upgrade and 3D ribbon changes are uncommitted. The **devfolio-preview** checkout remains separate for the existing private Sites preview.

For this exercise, use the original repository. The example Docker setup below has not been implemented yet.

The proposed deployment files would be:

```text
carstens-devfolio/
  Dockerfile
  .dockerignore
  deploy/
    compose.yaml
    nginx/
      default.conf
```

These files are examples to add when we implement the setup. They have not been created by this guide.

## 5. Define how the image is built

Example root `Dockerfile`:

```dockerfile
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine AS runtime
COPY deploy/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/out /usr/share/nginx/html
EXPOSE 80
```

This is a **multi-stage build**: Node produces the website, then only the exported files enter the Nginx image. `EXPOSE` documents the container port; Compose publishes it. Pin exact base-image versions or digests when establishing a reproducible release process. [Docker multi-stage builds](https://docs.docker.com/build/building/multi-stage/).

Example root `.dockerignore`:

```text
.git
**/node_modules
.next
out
.npm-cache
.env*
.openai
.codex-remote-attachments
```

The build requires internet access for packages, base images and the Google fonts used by Next.js. Keep any future API secrets out of browser code and the exported files.

## 6. Define how Nginx serves the files

Example `deploy/nginx/default.conf`:

```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    error_page 404 /404.html;
    location = /404.html {
        internal;
    }
}
```

Next.js exports each route as files. With trailing slashes enabled, `/contact/` resolves to the contact directory's `index.html`. Unknown routes return the exported 404 page with a 404 status. This must work when a visitor opens a page directly or refreshes it.

## 7. Define how Compose runs the container

Example `deploy/compose.yaml`:

```yaml
name: devfolio
services:
  website:
    image: devfolio:local
    build:
      context: ..
      dockerfile: Dockerfile
    ports:
      - "127.0.0.1:8080:80"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://127.0.0.1/"]
      interval: 30s
      timeout: 5s
      retries: 3
```

`context: ..` points from `deploy/` to the project root. The port mapping binds only to your laptop's loopback address; cloudflared runs on that same laptop and can reach it. You do not need router port forwarding.

`restart: unless-stopped` restarts an exited container while Docker is running. It cannot wake the laptop, start Docker Desktop, restart cloudflared or repair an unhealthy process that is still running.

## 8. Build and verify locally first

In PowerShell, change to the original repository:

```powershell
Set-Location 'C:\Workspace\Carstens Workspace\carstens-devfolio'
docker compose -f deploy/compose.yaml config
docker compose -f deploy/compose.yaml build
docker compose -f deploy/compose.yaml up -d
docker compose -f deploy/compose.yaml ps
```

`config` validates/resolves the Compose definition. `build` produces the image. `up -d` starts the service in the background. `ps` shows container state and health.

Open `http://127.0.0.1:8080` on the laptop. Verify home, projects, contact, page refreshes, an unknown URL, images, menu and motion controls. To inspect server output:

```powershell
docker compose -f deploy/compose.yaml logs --tail 100 website
```

This serves the compiled website. `npm run dev` and `next start` are not the serving commands for this static-export setup.

## 9. Make it accessible from your phone

Leave Docker running. In another PowerShell window, start:

```powershell
cloudflared tunnel --url http://127.0.0.1:8080
```

Cloudflared prints a random HTTPS address ending in `trycloudflare.com`. Open that address on your phone, preferably using mobile data to verify access from outside your home network. Your phone's `localhost` refers to the phone, not the laptop.

Quick Tunnels require no account or purchased domain. Anyone with the URL can visit the exposed site. The URL stops working when cloudflared stops, and a new tunnel gets a new hostname. Quick Tunnels are intended for testing, have no uptime guarantee, allow 200 concurrent in-flight requests and do not support SSE. These limits fit a small portfolio demo. DuckDNS is unnecessary with this approach. [Cloudflare Quick Tunnels](https://developers.cloudflare.com/tunnel/get-started/quick-tunnels/).

## 10. Keep it available for the demo

Keep the laptop plugged in, internet connected, Docker running and the tunnel process open. Temporarily disable sleep while plugged in and check what closing the lid does. Turning off the display is fine if the laptop stays awake. Restore your preferred power settings afterward.

A restart, sleep, internet outage or stopping either service makes the site unavailable. After a restart, start Docker, bring the Compose service up, start the tunnel and share its new URL. A stable address is a later step using a named tunnel and an appropriate domain.

## 11. Update and stop: the rest of the lifecycle

After changing content or code, rebuild the image and recreate the website container:

```powershell
docker compose -f deploy/compose.yaml up -d --build
```

Verify locally and through the public URL. The running tunnel can remain open because the local port stays the same. A brief interruption is possible during replacement. Browser caching can require a refresh. This static site needs a rebuild for content changes; editing source does not alter files already inside the container.

To end the demo, press **Ctrl+C** in the cloudflared terminal, then run:

```powershell
docker compose -f deploy/compose.yaml down
```

`down` removes this Compose application's container and network. Source and the built image remain. Avoid global Docker cleanup commands because they can affect your other projects.

## 12. Diagnose the failing layer

| Symptom | First place to check |
| --- | --- |
| Docker commands cannot connect | Docker Desktop/Engine |
| Image does not build | Build output, packages, local libs and network access |
| Local port 8080 does not respond | Compose `ps`, port conflicts and container logs |
| Home works but refresh on `/contact/` fails | Exported route files and Nginx configuration |
| Local website works but public URL fails | Tunnel terminal, current URL, laptop sleep and internet |
| Page loads but motion fails | Browser console/WebGL support and reduced-motion preference |

Work outward: **container -> laptop URL -> tunnel -> phone**. This separates application failures from hosting/network failures.

## 13. How this carries over to your Scriptex-style deployment learning

The portable unit is the **image**. Later, a pipeline can build/test it, tag it with a release or commit ID and push it to a registry. A Linux server can pull and run that image with Compose. Keep previous release tags to support rollback; `devfolio:local` alone is not a release history.

If you then move to Kubernetes, a **Deployment** manages desired replicas, a **Service** routes to those replicas, an **Ingress** routes external HTTP traffic, and a **Helm chart** packages their configuration. That is the next layer of responsibility; the Dockerfile still builds the image. Exact alignment with your existing Scriptex pipeline/chart conventions should be checked against the specific repository when implementing that stage.

For the first milestone, success means: the compiled portfolio runs in Docker, works through a public tunnel on your phone, and you understand how to rebuild it and shut it down.
