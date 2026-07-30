#!/usr/bin/env bash
# Synchronise dist/ vers le site static.evaneos.dev : pousse chaque fichier, en
# sautant ceux dont le contenu est inchangé (comparaison des ETag).
#
# Usage : npm run build && STATIC_SITES_TOKEN=<token> ./sync-static.sh [site] [dossier]
# Token : https://static.evaneos.dev (login Google Evaneos)
set -euo pipefail

SITE="${1:-moving-motivators}"
[[ "${SITE}" =~ ^[a-z0-9][a-z0-9-]*$ ]] ||
  {
    echo "nom de site invalide (label DNS : minuscules, chiffres, tirets)" >&2
    exit 1
  }
DIR="${2:-dist}"
DIR="${DIR%/}"
BASE="https://static.evaneos.dev/api/sites/${SITE}"

# Calcul du MD5 d'un fichier : md5sum (Linux) ou md5 -q (macOS/BSD).
if command -v md5sum >/dev/null 2>&1; then
  file_md5() { md5sum "$1" | cut -d' ' -f1; }
elif command -v md5 >/dev/null 2>&1; then
  file_md5() { md5 -q "$1"; }
else
  echo "ni md5sum ni md5 disponible pour calculer les ETag" >&2
  exit 1
fi

# Token hors de la ligne de commande (sinon lisible via ps) : config curl en 600.
CONF="$(mktemp)"
REMOTE="$(mktemp)"
chmod 600 "${CONF}"
trap 'rm -f "${CONF}" "${REMOTE}"' EXIT
printf 'header = "Authorization: Bearer %s"\n' \
  "${STATIC_SITES_TOKEN:?export STATIC_SITES_TOKEN avant (cf https://static.evaneos.dev)}" >"${CONF}"

# ETags distants : <chemin>\t<etag>, un par ligne. Site inexistant → tout est poussé.
curl -fsS --config "${CONF}" "${BASE}" 2>/dev/null |
  jq -r '.files[]? | "\(.path)\t\(.etag)"' >"${REMOTE}" || true

find "${DIR}" -type f -not -path '*/.*' -print0 | while IFS= read -r -d '' file; do
  rel="${file#"${DIR}"/}"
  local_etag="\"$(file_md5 "${file}")\""
  remote_etag=$(awk -F'\t' -v p="${rel}" '$1==p{print $2; exit}' "${REMOTE}")
  if [ "${remote_etag}" = "${local_etag}" ]; then
    echo "= ${rel}"
    continue
  fi
  code=$(curl -sS --config "${CONF}" -X PUT --data-binary @"${file}" \
    -o /dev/null -w '%{http_code}' "${BASE}/${rel}" 2>/dev/null) || true
  case "${code}" in
  2??) echo "^ ${rel}" ;;
  401 | 403)
    echo "! ${rel} (auth refusée [${code}] : session expirée ? ouvre https://static.evaneos.dev)" >&2
    ;;
  *)
    echo "! ${rel} (refusé par le serveur [${code}])" >&2
    ;;
  esac
done

# Fallback SPA : /reveal doit servir index.html (vue-router en history mode).
curl -fsS --config "${CONF}" -X PATCH "${BASE}" -d '{"spa": true}' >/dev/null &&
  echo "spa: on"
