"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppOrderEntity = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const entity_base_1 = require("../base/entity.base");
const sequelize_1 = require("@midwayjs/sequelize");
const app_user_entity_1 = require("./app-user.entity");
let AppOrderEntity = class AppOrderEntity extends entity_base_1.EntityBase {
};
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => app_user_entity_1.AppUserEntity),
    (0, sequelize_typescript_1.Column)({
        comment: "用户id",
    }),
    __metadata("design:type", String)
], AppOrderEntity.prototype, "appUserId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        comment: "业务编码权限用",
    }),
    __metadata("design:type", String)
], AppOrderEntity.prototype, "businessCode", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        comment: "消息队列id",
    }),
    __metadata("design:type", String)
], AppOrderEntity.prototype, "msgId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        comment: "订单金额分",
    }),
    __metadata("design:type", Number)
], AppOrderEntity.prototype, "orderAmount", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        comment: "三方支付订单id",
    }),
    __metadata("design:type", String)
], AppOrderEntity.prototype, "otherId", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        comment: "备注",
    }),
    __metadata("design:type", String)
], AppOrderEntity.prototype, "remark", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        comment: "订单状态",
    }),
    __metadata("design:type", String)
], AppOrderEntity.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        comment: "BaseTable.version",
    }),
    __metadata("design:type", Number)
], AppOrderEntity.prototype, "version", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => app_user_entity_1.AppUserEntity, "app_user_id"),
    __metadata("design:type", typeof (_a = typeof app_user_entity_1.AppUserEntity !== "undefined" && app_user_entity_1.AppUserEntity) === "function" ? _a : Object)
], AppOrderEntity.prototype, "AppUserIdObj", void 0);
AppOrderEntity = __decorate([
    (0, sequelize_1.BaseTable)({ tableName: "app_order" })
], AppOrderEntity);
exports.AppOrderEntity = AppOrderEntity;
//# sourceMappingURL=app-order.entity.js.map