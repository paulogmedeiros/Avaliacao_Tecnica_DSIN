import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service.js";
import { UserEntity } from "./entities/user.entity.js";

@Injectable()
export class UserRepository {
    constructor(private prisma: PrismaService) { }

    async selectById(id: UserEntity['id']) {
        return await this.prisma.user.findUnique({
            where: {
                id,
            },
        });
    }

    async selectUsers() {
        return await this.prisma.user.findMany({
            where: {
                deletedAt: null,
            },
        });
    }

    async selectByEmail(email: UserEntity['email']) {
        return await this.prisma.user.findUnique({
            where: {
                email,
            },
        });
    }

    async insert(data: UserEntity): Promise<void> {
        await this.prisma.user.create({
            data,
        });
    }

    async updateUser(id: UserEntity['id'], data: UserEntity) {
        return await this.prisma.user.update({
            where: {
                id,
            },
            data: data,
        });
    }

    async softDeleteUser(id: UserEntity['id']) {
        return await this.prisma.user.update({
            where: {
                id,
            },
            data: {
                deletedAt: new Date(),
            },
        });
    }

}
