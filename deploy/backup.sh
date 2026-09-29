#!/bin/sh
# Backup diário do banco, mantendo as 14 cópias mais recentes.
# crontab do usuário mfb:  15 3 * * * /opt/mfb-interactive/app/deploy/backup.sh
set -eu
DIR=/var/lib/mfb/backups
mkdir -p "$DIR"
sqlite3 /var/lib/mfb/app.db ".backup '$DIR/app-$(date +%F).db'"
ls -1t "$DIR"/app-*.db | tail -n +15 | xargs -r rm --
