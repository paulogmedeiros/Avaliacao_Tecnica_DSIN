import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development')
          .messages({
            'any.only':
              'NODE_ENV deve ser development, production ou test',
          }),

        PORT: Joi.number()
          .port()
          .default(3000)
          .messages({
            'number.base': 'PORT deve ser um número',
            'number.port': 'PORT deve ser uma porta válida entre 0 e 65535',
          }),

        DATABASE_URL: Joi.string()
          .uri()
          .required()
          .messages({
            'string.empty': 'DATABASE_URL não pode estar vazio',
            'string.uri': 'DATABASE_URL deve ser uma URL válida, verifique se o formato está correto, se está com algum caracter especial que precisa ser codificado, ou se está faltando algum parâmetro',
            'any.required': 'DATABASE_URL é obrigatório',
          }),
      }),
    }),
  ],
})
export class AppModule { }
