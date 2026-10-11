#!/usr/bin/env bash
# remote-deploy.sh <version>  - runs on the Contabo server for HOTEL-SITE frontend.
# Pulls the exact tag, records it in .env.frontend, restarts ONLY the frontend service,
# health-checks nginx, rolls back on failure. Prints DEPLOY_OK <version> last on success.
set -u

VERSION="$1"
IMAGE="geofrey2025/hotelsystem-frontend:${VERSION}"
SERVICE="frontend"
ENV_VAR="FRONTEND_VERSION"
TIMEOUT=60    # nginx inaanza haraka

say() { echo "[hotel-frontend] $*"; }

# --- Deployment dir: /root/hotelsystem -------------------------------------
DIR=""
CID_OLD=$(docker ps -q --filter "label=com.docker.compose.project=hotelsystem" --filter "label=com.docker.compose.service=$SERVICE" | head -1)
if [ -n "$CID_OLD" ]; then
    DIR=$(docker inspect -f '{{index .Config.Labels "com.docker.compose.project.working_dir"}}' "$CID_OLD" 2>/dev/null)
    [ -n "$DIR" ] && say "Deployment dir (kutoka container inayorun): $DIR"
fi
if [ -z "$DIR" ]; then
    for d in /root/hotelsystem /opt/hotelsystem /srv/hotelsystem /home/*/hotelsystem; do
        for f in docker-compose.yml docker-compose.yaml compose.yml compose.yaml; do
            if [ -f "$d/$f" ]; then DIR="$d"; say "Deployment dir (imepatikana kwa kutafuta): $DIR"; break 2; fi
        done
    done
fi
if [ -z "$DIR" ] || [ ! -d "$DIR" ]; then
    say "FATAL: sijaona /root/hotelsystem yenye docker-compose.yml."
    exit 1
fi

ENV_FILE="$DIR/.env.frontend"
cd "$DIR" || { echo "[hotel-frontend] FATAL: $DIR haipo"; exit 1; }

COMPOSE="docker compose"
for ef in .env .env.backend .env.frontend; do
    [ -f "$ef" ] && COMPOSE="$COMPOSE --env-file $ef"
done
say "Compose env files: $COMPOSE"

PREV=""
if [ -f "$ENV_FILE" ]; then
    PREV=$(grep -E "^${ENV_VAR}=" "$ENV_FILE" | tail -1 | cut -d= -f2 | tr -d '[:space:]')
fi
say "Toleo la sasa: ${PREV:-<none>}  ->  $VERSION"

say "docker pull $IMAGE"
if ! docker pull -q "$IMAGE" >/dev/null; then
    say "FATAL: pull imeshindwa - image haipo Docker Hub au hakuna network. Hakuna kilichobadilishwa."
    exit 1
fi

# Health check: container running + nginx inajibu HTTP ndani (busybox wget iko nginx:alpine).
wait_healthy() {
    local cid="$1" waited=0
    while [ "$waited" -lt "$TIMEOUT" ]; do
        local state
        state=$(docker inspect -f '{{.State.Status}}' "$cid" 2>/dev/null || echo "gone")
        case "$state" in
            gone|exited|dead) return 1 ;;
        esac
        if docker exec "$cid" wget -q -O /dev/null http://127.0.0.1/ 2>/dev/null; then
            return 0
        fi
        sleep 2; waited=$((waited + 2))
    done
    return 1
}

printf '%s=%s\n' "$ENV_VAR" "$VERSION" > "$ENV_FILE"
say "Recreating $SERVICE ..."
if ! $COMPOSE up -d --force-recreate "$SERVICE" >/dev/null; then
    say "FATAL: compose up imeshindwa."
else
    CID=$($COMPOSE ps -q "$SERVICE" 2>/dev/null | head -1)
    if [ -n "$CID" ] && wait_healthy "$CID"; then
        say "container $CID imekubalika"
        docker logs "$CID" --tail 15 2>&1 | sed 's/^/    /'
        echo "DEPLOY_OK $VERSION"
        exit 0
    fi
    say "Health check IMESHINDWA - nginx haijajibu http://127.0.0.1/ ndani ya ${TIMEOUT}s."
    [ -n "$CID" ] && docker logs "$CID" --tail 40 2>&1 | sed 's/^/    /'
fi

if [ -z "$PREV" ]; then
    say "Hakuna toleo la awali la kurejesha (rollback haiwezekani)."
    exit 1
fi
say "ROLLBACK -> $PREV ..."
printf '%s=%s\n' "$ENV_VAR" "$PREV" > "$ENV_FILE"
if $COMPOSE up -d --force-recreate "$SERVICE" >/dev/null; then
    CID=$($COMPOSE ps -q "$SERVICE" 2>/dev/null | head -1)
    if [ -n "$CID" ] && wait_healthy "$CID"; then
        say "ROLLBACK_OK - server imerudi kwenye $PREV"
    else
        say "ROLLBACK_IMESHINDWA - container ya $PREV pia haikuwa healthy. Kagua kwa mkono!"
    fi
else
    say "ROLLBACK_IMESHINDWA - compose up ya $PREV imeshindwa. Kagua kwa mkono!"
fi
exit 1
