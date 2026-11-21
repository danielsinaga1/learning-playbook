#!/bin/bash
set -e
# Replica dibangun dari salinan primary (pg_basebackup), lalu mengikuti WAL secara streaming.
if [ ! -s "$PGDATA/PG_VERSION" ]; then
  until PGPASSWORD="$REPLICATOR_PASSWORD" pg_isready -h "$PRIMARY_HOST" -U replicator -d postgres; do
    echo "menunggu primary..."; sleep 2
  done
  chown postgres:postgres "$PGDATA"
  until PGPASSWORD="$REPLICATOR_PASSWORD" gosu postgres pg_basebackup \
        -h "$PRIMARY_HOST" -U replicator -D "$PGDATA" -R -X stream -C -S replica1; do
    echo "pg_basebackup belum bisa, coba lagi..."; rm -rf "${PGDATA:?}"/*; sleep 2
  done
  chmod 700 "$PGDATA"
fi
exec docker-entrypoint.sh postgres
