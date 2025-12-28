#!/bin/bash
set -e
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DB_BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql"
REDIS_BACKUP_FILE="$BACKUP_DIR/redis_backup_$TIMESTAMP.rdb"
mkdir -p $BACKUP_DIR
echo "Backing up PostgreSQL..."
docker-compose -f infra/docker/docker-compose.yml exec -T db pg_dump -U nora_user nora_tycoon > $DB_BACKUP_FILE
echo "Backing up Redis..."
docker-compose -f infra/docker/docker-compose.yml exec -T redis redis-cli SAVE
docker cp nora_redis:/data/dump.rdb $REDIS_BACKUP_FILE
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.rdb" -mtime +7 -delete
echo "Backup completed!"
