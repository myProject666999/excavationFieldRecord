-- =====================================================
-- 考古发掘现场记录系统 SQLite 数据库脚本
-- 适用于移动端本地数据库
-- 适配说明：
--   DATETIME -> TEXT (ISO8601格式: YYYY-MM-DDTHH:MM:SS)
--   DATE     -> TEXT (YYYY-MM-DD)
--   DECIMAL  -> REAL
--   BOOLEAN  -> INTEGER (0/1)
--   主键     -> INTEGER PRIMARY KEY AUTOINCREMENT
-- =====================================================

PRAGMA foreign_keys = ON;

-- =====================================================
-- 1. 用户表
-- =====================================================
CREATE TABLE IF NOT EXISTS user (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    username        TEXT    NOT NULL,
    password        TEXT    NOT NULL,
    real_name       TEXT    NOT NULL,
    role            TEXT    NOT NULL DEFAULT 'MEMBER',
    phone           TEXT,
    status          INTEGER NOT NULL DEFAULT 1,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
    is_deleted      INTEGER NOT NULL DEFAULT 0,
    sync_status     INTEGER NOT NULL DEFAULT 0,
    sync_timestamp  INTEGER
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_username ON user(username);
CREATE INDEX IF NOT EXISTS idx_user_sync_status ON user(sync_status);

-- =====================================================
-- 2. 发掘遗址/地点表
-- =====================================================
CREATE TABLE IF NOT EXISTS excavation_site (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    site_code       TEXT    NOT NULL,
    site_name       TEXT    NOT NULL,
    location        TEXT    NOT NULL,
    latitude        REAL,
    longitude       REAL,
    start_date      TEXT,
    end_date        TEXT,
    leader_id       INTEGER,
    description     TEXT,
    status          INTEGER NOT NULL DEFAULT 1,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
    is_deleted      INTEGER NOT NULL DEFAULT 0,
    sync_status     INTEGER NOT NULL DEFAULT 0,
    sync_timestamp  INTEGER
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_excavation_site_code ON excavation_site(site_code);
CREATE INDEX IF NOT EXISTS idx_excavation_site_leader ON excavation_site(leader_id);
CREATE INDEX IF NOT EXISTS idx_excavation_site_sync_status ON excavation_site(sync_status);

-- =====================================================
-- 3. 探方表
-- =====================================================
CREATE TABLE IF NOT EXISTS trench (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    trench_code     TEXT    NOT NULL,
    site_id         INTEGER NOT NULL,
    row_num         INTEGER NOT NULL,
    col_num         INTEGER NOT NULL,
    length          REAL    NOT NULL DEFAULT 5.00,
    width           REAL    NOT NULL DEFAULT 5.00,
    start_depth     REAL    NOT NULL DEFAULT 0.000,
    current_depth   REAL    NOT NULL DEFAULT 0.000,
    excavator_id    INTEGER,
    start_date      TEXT,
    end_date        TEXT,
    note            TEXT,
    status          INTEGER NOT NULL DEFAULT 1,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
    is_deleted      INTEGER NOT NULL DEFAULT 0,
    sync_status     INTEGER NOT NULL DEFAULT 0,
    sync_timestamp  INTEGER
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_trench_code ON trench(trench_code);
CREATE INDEX IF NOT EXISTS idx_trench_site_id ON trench(site_id);
CREATE INDEX IF NOT EXISTS idx_trench_row_col ON trench(row_num, col_num);
CREATE INDEX IF NOT EXISTS idx_trench_sync_status ON trench(sync_status);

-- =====================================================
-- 4. 出土文物/遗物表
-- =====================================================
CREATE TABLE IF NOT EXISTS artifact (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    artifact_code     TEXT    NOT NULL,
    trench_id         INTEGER NOT NULL,
    site_id           INTEGER NOT NULL,
    coord_x           REAL    NOT NULL,
    coord_y           REAL    NOT NULL,
    depth             REAL    NOT NULL,
    layer_id          INTEGER,
    category          TEXT    NOT NULL,
    name              TEXT    NOT NULL,
    description       TEXT,
    material          TEXT,
    quantity          INTEGER NOT NULL DEFAULT 1,
    associates        TEXT,
    condition         TEXT,
    storage_location  TEXT,
    discoverer_id     INTEGER,
    discovery_time    TEXT,
    created_at        TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
    updated_at        TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
    is_deleted        INTEGER NOT NULL DEFAULT 0,
    sync_status       INTEGER NOT NULL DEFAULT 0,
    sync_timestamp    INTEGER
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_artifact_code ON artifact(artifact_code);
CREATE INDEX IF NOT EXISTS idx_artifact_trench_id ON artifact(trench_id);
CREATE INDEX IF NOT EXISTS idx_artifact_site_id ON artifact(site_id);
CREATE INDEX IF NOT EXISTS idx_artifact_layer_id ON artifact(layer_id);
CREATE INDEX IF NOT EXISTS idx_artifact_category ON artifact(category);
CREATE INDEX IF NOT EXISTS idx_artifact_sync_status ON artifact(sync_status);
CREATE INDEX IF NOT EXISTS idx_artifact_coord ON artifact(coord_x, coord_y, depth);

-- =====================================================
-- 5. 文物照片表
-- =====================================================
CREATE TABLE IF NOT EXISTS artifact_photo (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    artifact_id     INTEGER NOT NULL,
    photo_path      TEXT    NOT NULL,
    thumbnail_path  TEXT,
    photo_name      TEXT,
    description     TEXT,
    shoot_time      TEXT,
    shoot_by        INTEGER,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
    is_deleted      INTEGER NOT NULL DEFAULT 0,
    sync_status     INTEGER NOT NULL DEFAULT 0,
    sync_timestamp  INTEGER
);

CREATE INDEX IF NOT EXISTS idx_artifact_photo_artifact_id ON artifact_photo(artifact_id);
CREATE INDEX IF NOT EXISTS idx_artifact_photo_sync_status ON artifact_photo(sync_status);

-- =====================================================
-- 6. 地层表（剖面图）
-- =====================================================
CREATE TABLE IF NOT EXISTS stratigraphy (
    id                 INTEGER PRIMARY KEY AUTOINCREMENT,
    stratigraphy_code  TEXT    NOT NULL,
    trench_id          INTEGER NOT NULL,
    site_id            INTEGER NOT NULL,
    wall_direction     TEXT    NOT NULL,
    record_depth       REAL    NOT NULL,
    draw_date          TEXT,
    drafter_id         INTEGER,
    reviewer_id        INTEGER,
    description        TEXT,
    sketch_path        TEXT,
    status             INTEGER NOT NULL DEFAULT 0,
    created_at         TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
    updated_at         TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
    is_deleted         INTEGER NOT NULL DEFAULT 0,
    sync_status        INTEGER NOT NULL DEFAULT 0,
    sync_timestamp     INTEGER
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_stratigraphy_trench_wall_depth ON stratigraphy(trench_id, wall_direction, record_depth);
CREATE INDEX IF NOT EXISTS idx_stratigraphy_site_id ON stratigraphy(site_id);
CREATE INDEX IF NOT EXISTS idx_stratigraphy_sync_status ON stratigraphy(sync_status);

-- =====================================================
-- 7. 地层分层明细表
-- =====================================================
CREATE TABLE IF NOT EXISTS stratigraphy_layer (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    stratigraphy_id   INTEGER NOT NULL,
    layer_number      TEXT    NOT NULL,
    top_depth         REAL    NOT NULL,
    bottom_depth      REAL    NOT NULL,
    thickness         REAL    NOT NULL,
    soil_color        TEXT    NOT NULL,
    soil_texture      TEXT    NOT NULL,
    soil_structure    TEXT,
    inclusions        TEXT,
    artifact_count    INTEGER NOT NULL DEFAULT 0,
    layer_note        TEXT,
    sort_order        INTEGER NOT NULL DEFAULT 0,
    created_at        TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
    updated_at        TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
    is_deleted        INTEGER NOT NULL DEFAULT 0,
    sync_status       INTEGER NOT NULL DEFAULT 0,
    sync_timestamp    INTEGER
);

CREATE INDEX IF NOT EXISTS idx_stratigraphy_layer_stratigraphy_id ON stratigraphy_layer(stratigraphy_id);
CREATE INDEX IF NOT EXISTS idx_stratigraphy_layer_sort_order ON stratigraphy_layer(sort_order);
CREATE INDEX IF NOT EXISTS idx_stratigraphy_layer_sync_status ON stratigraphy_layer(sync_status);

-- =====================================================
-- 8. 地层剖面照片表
-- =====================================================
CREATE TABLE IF NOT EXISTS stratigraphy_photo (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    stratigraphy_id INTEGER NOT NULL,
    photo_path      TEXT    NOT NULL,
    thumbnail_path  TEXT,
    photo_name      TEXT,
    description     TEXT,
    shoot_time      TEXT,
    shoot_by        INTEGER,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
    is_deleted      INTEGER NOT NULL DEFAULT 0,
    sync_status     INTEGER NOT NULL DEFAULT 0,
    sync_timestamp  INTEGER
);

CREATE INDEX IF NOT EXISTS idx_stratigraphy_photo_stratigraphy_id ON stratigraphy_photo(stratigraphy_id);
CREATE INDEX IF NOT EXISTS idx_stratigraphy_photo_sync_status ON stratigraphy_photo(sync_status);

-- =====================================================
-- 9. 同步记录表（追踪数据同步状态）
-- =====================================================
CREATE TABLE IF NOT EXISTS sync_record (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id       TEXT    NOT NULL,
    user_id         INTEGER,
    table_name      TEXT    NOT NULL,
    record_id       INTEGER NOT NULL,
    operation_type  TEXT    NOT NULL,
    sync_direction  TEXT    NOT NULL,
    sync_status     INTEGER NOT NULL DEFAULT 0,
    retry_count     INTEGER NOT NULL DEFAULT 0,
    error_message   TEXT,
    last_attempt_at TEXT,
    completed_at    TEXT,
    batch_id        TEXT,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
    updated_at      TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE INDEX IF NOT EXISTS idx_sync_record_device_table ON sync_record(device_id, table_name);
CREATE INDEX IF NOT EXISTS idx_sync_record_status_direction ON sync_record(sync_status, sync_direction);
CREATE INDEX IF NOT EXISTS idx_sync_record_table_record ON sync_record(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_sync_record_batch_id ON sync_record(batch_id);

-- =====================================================
-- 10. 操作日志表
-- =====================================================
CREATE TABLE IF NOT EXISTS operation_log (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER,
    username        TEXT,
    operation_type  TEXT    NOT NULL,
    module_name     TEXT    NOT NULL,
    target_id       INTEGER,
    target_name     TEXT,
    detail          TEXT,
    ip_address      TEXT,
    device_id       TEXT,
    created_at      TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
);

CREATE INDEX IF NOT EXISTS idx_operation_log_user_id ON operation_log(user_id);
CREATE INDEX IF NOT EXISTS idx_operation_log_module_target ON operation_log(module_name, target_id);
CREATE INDEX IF NOT EXISTS idx_operation_log_created_at ON operation_log(created_at);
