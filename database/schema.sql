-- =====================================================
-- 考古发掘现场记录系统 数据库脚本
-- Database: excavation_field_record
-- =====================================================

CREATE DATABASE IF NOT EXISTS excavation_field_record
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE excavation_field_record;

-- =====================================================
-- 1. 用户表
-- =====================================================
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
    `id`              BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `username`        VARCHAR(50)  NOT NULL COMMENT '用户名',
    `password`        VARCHAR(100) NOT NULL COMMENT '密码（加密存储）',
    `real_name`       VARCHAR(50)  NOT NULL COMMENT '真实姓名',
    `role`            VARCHAR(20)  NOT NULL DEFAULT 'MEMBER' COMMENT '角色：ADMIN-管理员, LEADER-领队, MEMBER-队员',
    `phone`           VARCHAR(20)           DEFAULT NULL COMMENT '联系电话',
    `status`          TINYINT      NOT NULL DEFAULT 1 COMMENT '状态：1-启用, 0-禁用',
    `created_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted`      TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除, 1-已删除',
    `sync_status`     TINYINT      NOT NULL DEFAULT 0 COMMENT '同步状态：0-未同步, 1-已同步, 2-更新待同步',
    `sync_timestamp`  BIGINT                DEFAULT NULL COMMENT '同步时间戳',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- =====================================================
-- 2. 发掘遗址/地点表
-- =====================================================
DROP TABLE IF EXISTS `excavation_site`;
CREATE TABLE `excavation_site` (
    `id`              BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `site_code`       VARCHAR(50)  NOT NULL COMMENT '遗址编号',
    `site_name`       VARCHAR(100) NOT NULL COMMENT '遗址名称',
    `location`        VARCHAR(255) NOT NULL COMMENT '地理位置',
    `latitude`        DECIMAL(10,7)         DEFAULT NULL COMMENT '纬度',
    `longitude`       DECIMAL(10,7)         DEFAULT NULL COMMENT '经度',
    `start_date`      DATE                  DEFAULT NULL COMMENT '发掘开始日期',
    `end_date`        DATE                  DEFAULT NULL COMMENT '发掘结束日期',
    `leader_id`       BIGINT                DEFAULT NULL COMMENT '领队用户ID',
    `description`     TEXT                  DEFAULT NULL COMMENT '遗址描述',
    `status`          TINYINT      NOT NULL DEFAULT 1 COMMENT '状态：1-进行中, 0-已结束',
    `created_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted`      TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除, 1-已删除',
    `sync_status`     TINYINT      NOT NULL DEFAULT 0 COMMENT '同步状态：0-未同步, 1-已同步, 2-更新待同步',
    `sync_timestamp`  BIGINT                DEFAULT NULL COMMENT '同步时间戳',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_site_code` (`site_code`),
    KEY `idx_leader_id` (`leader_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='发掘遗址表';

-- =====================================================
-- 3. 探方表
-- =====================================================
DROP TABLE IF EXISTS `trench`;
CREATE TABLE `trench` (
    `id`              BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `trench_code`     VARCHAR(50)  NOT NULL COMMENT '探方编号，如T0301（第3行第1列）',
    `site_id`         BIGINT       NOT NULL COMMENT '所属遗址ID',
    `row_num`         INT          NOT NULL COMMENT '行号（探方编号中的行）',
    `col_num`         INT          NOT NULL COMMENT '列号（探方编号中的列）',
    `length`          DECIMAL(6,2) NOT NULL DEFAULT 5.00 COMMENT '探方长度（米），默认5米',
    `width`           DECIMAL(6,2) NOT NULL DEFAULT 5.00 COMMENT '探方宽度（米），默认5米',
    `start_depth`     DECIMAL(8,3) NOT NULL DEFAULT 0.000 COMMENT '起始深度（米）',
    `current_depth`   DECIMAL(8,3) NOT NULL DEFAULT 0.000 COMMENT '当前发掘深度（米）',
    `excavator_id`    BIGINT                DEFAULT NULL COMMENT '发掘负责人ID',
    `start_date`      DATE                  DEFAULT NULL COMMENT '开始发掘日期',
    `end_date`        DATE                  DEFAULT NULL COMMENT '结束发掘日期',
    `note`            TEXT                  DEFAULT NULL COMMENT '探方备注',
    `status`          TINYINT      NOT NULL DEFAULT 1 COMMENT '状态：1-发掘中, 0-已结束',
    `created_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted`      TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除, 1-已删除',
    `sync_status`     TINYINT      NOT NULL DEFAULT 0 COMMENT '同步状态：0-未同步, 1-已同步, 2-更新待同步',
    `sync_timestamp`  BIGINT                DEFAULT NULL COMMENT '同步时间戳',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_trench_code` (`trench_code`),
    KEY `idx_site_id` (`site_id`),
    KEY `idx_row_col` (`row_num`, `col_num`),
    KEY `idx_sync_status` (`sync_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='探方表';

-- =====================================================
-- 4. 出土文物/遗物表
-- =====================================================
DROP TABLE IF EXISTS `artifact`;
CREATE TABLE `artifact` (
    `id`              BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `artifact_code`   VARCHAR(50)  NOT NULL COMMENT '文物编号',
    `trench_id`       BIGINT       NOT NULL COMMENT '所属探方ID',
    `site_id`         BIGINT       NOT NULL COMMENT '所属遗址ID',
    `coord_x`         DECIMAL(8,3) NOT NULL COMMENT '相对坐标X（米，探方内相对坐标）',
    `coord_y`         DECIMAL(8,3) NOT NULL COMMENT '相对坐标Y（米，探方内相对坐标）',
    `depth`           DECIMAL(8,3) NOT NULL COMMENT '出土深度（米）',
    `layer_id`        BIGINT                DEFAULT NULL COMMENT '所属地层ID',
    `category`        VARCHAR(50)  NOT NULL COMMENT '文物类别：陶器、瓷器、石器、骨器、金属器等',
    `name`            VARCHAR(100) NOT NULL COMMENT '文物名称',
    `description`     TEXT                  DEFAULT NULL COMMENT '详细描述',
    `material`        VARCHAR(100)          DEFAULT NULL COMMENT '材质',
    `quantity`        INT          NOT NULL DEFAULT 1 COMMENT '数量',
    `associates`      TEXT                  DEFAULT NULL COMMENT '伴生物描述（同时出土的其他物品）',
    `condition`       VARCHAR(50)           DEFAULT NULL COMMENT '保存状况：完整、残损、破碎等',
    `storage_location` VARCHAR(100)         DEFAULT NULL COMMENT '存放位置',
    `discoverer_id`   BIGINT                DEFAULT NULL COMMENT '发现人ID',
    `discovery_time`  DATETIME              DEFAULT NULL COMMENT '发现时间',
    `created_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted`      TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除, 1-已删除',
    `sync_status`     TINYINT      NOT NULL DEFAULT 0 COMMENT '同步状态：0-未同步, 1-已同步, 2-更新待同步',
    `sync_timestamp`  BIGINT                DEFAULT NULL COMMENT '同步时间戳',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_artifact_code` (`artifact_code`),
    KEY `idx_trench_id` (`trench_id`),
    KEY `idx_site_id` (`site_id`),
    KEY `idx_layer_id` (`layer_id`),
    KEY `idx_category` (`category`),
    KEY `idx_sync_status` (`sync_status`),
    KEY `idx_coord` (`coord_x`, `coord_y`, `depth`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='出土文物表';

-- =====================================================
-- 5. 文物照片表
-- =====================================================
DROP TABLE IF EXISTS `artifact_photo`;
CREATE TABLE `artifact_photo` (
    `id`              BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `artifact_id`     BIGINT       NOT NULL COMMENT '所属文物ID',
    `photo_path`      VARCHAR(500) NOT NULL COMMENT '照片存储路径/URL',
    `thumbnail_path`  VARCHAR(500)          DEFAULT NULL COMMENT '缩略图路径',
    `photo_name`      VARCHAR(100)          DEFAULT NULL COMMENT '照片名称',
    `description`     VARCHAR(500)          DEFAULT NULL COMMENT '照片描述/拍摄说明',
    `shoot_time`      DATETIME              DEFAULT NULL COMMENT '拍摄时间',
    `shoot_by`        BIGINT                DEFAULT NULL COMMENT '拍摄人ID',
    `sort_order`      INT          NOT NULL DEFAULT 0 COMMENT '排序号',
    `created_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted`      TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除, 1-已删除',
    `sync_status`     TINYINT      NOT NULL DEFAULT 0 COMMENT '同步状态：0-未同步, 1-已同步, 2-更新待同步',
    `sync_timestamp`  BIGINT                DEFAULT NULL COMMENT '同步时间戳',
    PRIMARY KEY (`id`),
    KEY `idx_artifact_id` (`artifact_id`),
    KEY `idx_sync_status` (`sync_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='文物照片表';

-- =====================================================
-- 6. 地层表（剖面图）
-- =====================================================
DROP TABLE IF EXISTS `stratigraphy`;
CREATE TABLE `stratigraphy` (
    `id`              BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `stratigraphy_code` VARCHAR(50) NOT NULL COMMENT '地层剖面编号',
    `trench_id`       BIGINT       NOT NULL COMMENT '所属探方ID',
    `site_id`         BIGINT       NOT NULL COMMENT '所属遗址ID',
    `wall_direction`  VARCHAR(10)  NOT NULL COMMENT '剖面方向：NORTH-北壁, SOUTH-南壁, EAST-东壁, WEST-西壁',
    `record_depth`    DECIMAL(8,3) NOT NULL COMMENT '记录时的发掘深度（米）',
    `draw_date`       DATE                  DEFAULT NULL COMMENT '绘制日期',
    `drafter_id`      BIGINT                DEFAULT NULL COMMENT '绘制人ID',
    `reviewer_id`     BIGINT                DEFAULT NULL COMMENT '审核人ID',
    `description`     TEXT                  DEFAULT NULL COMMENT '剖面整体描述',
    `sketch_path`     VARCHAR(500)          DEFAULT NULL COMMENT '剖面示意图路径/URL',
    `status`          TINYINT      NOT NULL DEFAULT 0 COMMENT '状态：0-草稿, 1-已审核',
    `created_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted`      TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除, 1-已删除',
    `sync_status`     TINYINT      NOT NULL DEFAULT 0 COMMENT '同步状态：0-未同步, 1-已同步, 2-更新待同步',
    `sync_timestamp`  BIGINT                DEFAULT NULL COMMENT '同步时间戳',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_trench_wall_depth` (`trench_id`, `wall_direction`, `record_depth`),
    KEY `idx_site_id` (`site_id`),
    KEY `idx_sync_status` (`sync_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='地层剖面图表';

-- =====================================================
-- 7. 地层分层明细表
-- =====================================================
DROP TABLE IF EXISTS `stratigraphy_layer`;
CREATE TABLE `stratigraphy_layer` (
    `id`              BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `stratigraphy_id` BIGINT       NOT NULL COMMENT '所属地层剖面ID',
    `layer_number`    VARCHAR(20)  NOT NULL COMMENT '层位号，如①、②A、②B等',
    `top_depth`       DECIMAL(8,3) NOT NULL COMMENT '层顶深度（米）',
    `bottom_depth`    DECIMAL(8,3) NOT NULL COMMENT '层底深度（米）',
    `thickness`       DECIMAL(8,3) NOT NULL COMMENT '土层厚度（米）',
    `soil_color`      VARCHAR(100) NOT NULL COMMENT '土色描述，如：浅灰褐色',
    `soil_texture`    VARCHAR(100) NOT NULL COMMENT '土质描述，如：疏松、致密、粘土质、沙质等',
    `soil_structure`  VARCHAR(100)          DEFAULT NULL COMMENT '土壤结构：团粒状、块状、柱状等',
    `inclusions`      TEXT                  DEFAULT NULL COMMENT '包含物：陶片、红烧土、炭粒、动物骨骼等',
    `artifact_count`  INT          NOT NULL DEFAULT 0 COMMENT '该层出土文物数量',
    `layer_note`      TEXT                  DEFAULT NULL COMMENT '层位备注说明',
    `sort_order`      INT          NOT NULL DEFAULT 0 COMMENT '从上到下的排序号',
    `created_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted`      TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除, 1-已删除',
    `sync_status`     TINYINT      NOT NULL DEFAULT 0 COMMENT '同步状态：0-未同步, 1-已同步, 2-更新待同步',
    `sync_timestamp`  BIGINT                DEFAULT NULL COMMENT '同步时间戳',
    PRIMARY KEY (`id`),
    KEY `idx_stratigraphy_id` (`stratigraphy_id`),
    KEY `idx_sort_order` (`sort_order`),
    KEY `idx_sync_status` (`sync_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='地层分层明细表';

-- =====================================================
-- 8. 地层剖面照片表
-- =====================================================
DROP TABLE IF EXISTS `stratigraphy_photo`;
CREATE TABLE `stratigraphy_photo` (
    `id`              BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `stratigraphy_id` BIGINT       NOT NULL COMMENT '所属地层剖面ID',
    `photo_path`      VARCHAR(500) NOT NULL COMMENT '照片存储路径/URL',
    `thumbnail_path`  VARCHAR(500)          DEFAULT NULL COMMENT '缩略图路径',
    `photo_name`      VARCHAR(100)          DEFAULT NULL COMMENT '照片名称',
    `description`     VARCHAR(500)          DEFAULT NULL COMMENT '照片描述',
    `shoot_time`      DATETIME              DEFAULT NULL COMMENT '拍摄时间',
    `shoot_by`        BIGINT                DEFAULT NULL COMMENT '拍摄人ID',
    `sort_order`      INT          NOT NULL DEFAULT 0 COMMENT '排序号',
    `created_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    `is_deleted`      TINYINT      NOT NULL DEFAULT 0 COMMENT '逻辑删除：0-未删除, 1-已删除',
    `sync_status`     TINYINT      NOT NULL DEFAULT 0 COMMENT '同步状态：0-未同步, 1-已同步, 2-更新待同步',
    `sync_timestamp`  BIGINT                DEFAULT NULL COMMENT '同步时间戳',
    PRIMARY KEY (`id`),
    KEY `idx_stratigraphy_id` (`stratigraphy_id`),
    KEY `idx_sync_status` (`sync_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='地层剖面照片表';

-- =====================================================
-- 9. 同步记录表（追踪数据同步状态）
-- =====================================================
DROP TABLE IF EXISTS `sync_record`;
CREATE TABLE `sync_record` (
    `id`              BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `device_id`       VARCHAR(100) NOT NULL COMMENT '设备标识（移动端唯一ID）',
    `user_id`         BIGINT                DEFAULT NULL COMMENT '操作用户ID',
    `table_name`      VARCHAR(50)  NOT NULL COMMENT '同步的表名',
    `record_id`       BIGINT       NOT NULL COMMENT '同步记录的主键ID',
    `operation_type`  VARCHAR(20)  NOT NULL COMMENT '操作类型：INSERT-新增, UPDATE-更新, DELETE-删除',
    `sync_direction`  VARCHAR(20)  NOT NULL COMMENT '同步方向：UP-上传(本地->服务端), DOWN-下载(服务端->本地)',
    `sync_status`     TINYINT      NOT NULL DEFAULT 0 COMMENT '同步状态：0-待同步, 1-同步中, 2-同步成功, 3-同步失败',
    `retry_count`     INT          NOT NULL DEFAULT 0 COMMENT '重试次数',
    `error_message`   TEXT                  DEFAULT NULL COMMENT '失败错误信息',
    `last_attempt_at` DATETIME              DEFAULT NULL COMMENT '最后尝试同步时间',
    `completed_at`    DATETIME              DEFAULT NULL COMMENT '同步完成时间',
    `batch_id`        VARCHAR(50)           DEFAULT NULL COMMENT '批次号（用于批量同步）',
    `created_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `updated_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    KEY `idx_device_table` (`device_id`, `table_name`),
    KEY `idx_sync_status` (`sync_status`, `sync_direction`),
    KEY `idx_table_record` (`table_name`, `record_id`),
    KEY `idx_batch_id` (`batch_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='同步记录表';

-- =====================================================
-- 10. 操作日志表
-- =====================================================
DROP TABLE IF EXISTS `operation_log`;
CREATE TABLE `operation_log` (
    `id`              BIGINT       NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `user_id`         BIGINT                DEFAULT NULL COMMENT '操作用户ID',
    `username`        VARCHAR(50)           DEFAULT NULL COMMENT '用户名（冗余）',
    `operation_type`  VARCHAR(50)  NOT NULL COMMENT '操作类型：CREATE, UPDATE, DELETE, LOGIN, SYNC等',
    `module_name`     VARCHAR(50)  NOT NULL COMMENT '模块名称：TRENCH, ARTIFACT, STRATIGRAPHY等',
    `target_id`       BIGINT                DEFAULT NULL COMMENT '操作对象ID',
    `target_name`     VARCHAR(200)          DEFAULT NULL COMMENT '操作对象名称（冗余）',
    `detail`          TEXT                  DEFAULT NULL COMMENT '操作详情（JSON格式，变更前后数据）',
    `ip_address`      VARCHAR(50)           DEFAULT NULL COMMENT 'IP地址',
    `device_id`       VARCHAR(100)          DEFAULT NULL COMMENT '设备标识',
    `created_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
    PRIMARY KEY (`id`),
    KEY `idx_user_id` (`user_id`),
    KEY `idx_module_target` (`module_name`, `target_id`),
    KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';

-- =====================================================
-- 初始化数据
-- =====================================================

-- 默认管理员用户（密码: admin123，需在应用启动时使用BCrypt加密）
INSERT INTO `user` (`username`, `password`, `real_name`, `role`, `status`, `sync_status`) VALUES
('admin', 'admin123', '系统管理员', 'ADMIN', 1, 1);

-- 示例遗址
INSERT INTO `excavation_site` (`site_code`, `site_name`, `location`, `leader_id`, `status`, `sync_status`) VALUES
('YZ-2024-001', '李家村遗址', '陕西省汉中市城固县博望镇李家村', 1, 1, 1);

-- 示例探方（T0301 = 第3行第1列）
INSERT INTO `trench` (`trench_code`, `site_id`, `row_num`, `col_num`, `length`, `width`, `start_depth`, `current_depth`, `excavator_id`, `sync_status`) VALUES
('T0301', 1, 3, 1, 5.00, 5.00, 0.000, 0.800, 1, 1),
('T0302', 1, 3, 2, 5.00, 5.00, 0.000, 0.650, 1, 1),
('T0401', 1, 4, 1, 5.00, 5.00, 0.000, 0.400, 1, 1);

-- 示例文物
INSERT INTO `artifact` (`artifact_code`, `trench_id`, `site_id`, `coord_x`, `coord_y`, `depth`, `category`, `name`, `description`, `material`, `quantity`, `associates`, `discoverer_id`, `discovery_time`, `sync_status`) VALUES
('T0301-W001', 1, 1, 2.350, 1.800, 0.450, '陶器', '红陶钵残片', '泥质红陶，轮制，器形为钵，残损严重，口沿部分尚存', '泥质红陶', 1, '与少量红烧土颗粒共出', 1, '2024-06-15 09:30:00', 1),
('T0301-S001', 1, 1, 3.100, 2.650, 0.620, '石器', '磨制石斧', '青石质，通体磨光，器形规整，刃部锋利', '青石', 1, '与炭粒、陶片共存于第②层', 1, '2024-06-15 14:20:00', 1),
('T0302-W001', 2, 1, 1.500, 4.200, 0.380, '瓷器', '青花瓷片', '青花瓷，釉色莹润，绘缠枝莲纹', '高岭土', 3, '出土于扰土层，伴出近现代瓷片', 1, '2024-06-16 10:15:00', 1);

-- 示例地层剖面（T0301北壁，深度0.800米）
INSERT INTO `stratigraphy` (`stratigraphy_code`, `trench_id`, `site_id`, `wall_direction`, `record_depth`, `draw_date`, `drafter_id`, `description`, `status`, `sync_status`) VALUES
('T0301-N-080', 1, 1, 'NORTH', 0.800, '2024-06-15', 1, 'T0301北壁剖面，地层堆积清晰，共分4层，未见打破关系。', 1, 1);

-- 示例地层分层
INSERT INTO `stratigraphy_layer` (`stratigraphy_id`, `layer_number`, `top_depth`, `bottom_depth`, `thickness`, `soil_color`, `soil_texture`, `inclusions`, `artifact_count`, `layer_note`, `sort_order`, `sync_status`) VALUES
(1, '①耕土层', 0.000, 0.150, 0.150, '浅黄褐色', '疏松，多植物根系', '现代垃圾残片、少量近现代瓷片', 0, '现代耕土层，含大量植物根系', 1, 1),
(1, '②扰土层', 0.150, 0.350, 0.200, '黄褐色', '较疏松，含少量料姜石', '近现代瓷片、砖瓦碎块、铁钉', 1, '明清以来扰土层，文化内涵混杂', 2, 1),
(1, '③A层', 0.350, 0.580, 0.230, '灰褐色', '较致密，粘土质', '少量泥质陶片、红烧土颗粒', 1, '龙山文化时期堆积，陶片以红陶为主', 3, 1),
(1, '③B层', 0.580, 0.800, 0.220, '深灰褐色', '致密，粘土质略沙', '较多夹砂陶片、炭粒、兽骨残片、石器', 1, '龙山文化晚期，文化内涵丰富，出土遗物较多', 4, 1);

-- 完成信息
SELECT '数据库创建完成！共创建 10 张数据表。' AS status;
