# CRUD de serviços — Especificação de design

## Objetivo

Implementar no backend NestJS o gerenciamento do catálogo de serviços do salão, seguindo a separação já adotada no módulo de usuários entre controller, service, repository, DTOs, entidade e módulo.

O catálogo terá uma consulta de serviços ativos para qualquer usuário autenticado e uma consulta completa, incluindo inativos, exclusiva para administradores. Administradores também poderão criar serviços e alterar somente nome, descrição e situação.

## Escopo

### Incluído

- Listar serviços ativos para clientes e administradores autenticados.
- Listar serviços ativos e inativos para administradores.
- Criar serviço como administrador.
- Atualizar `name`, `description` e `isActive` como administrador.
- Validar os contratos de entrada.
- Traduzir serviço inexistente para HTTP 404.
- Traduzir conflito de nome para HTTP 409.
- Documentar as rotas no Swagger.
- Criar testes unitários no padrão NestJS, com arquivos `.spec.ts` ao lado dos arquivos testados.

### Fora do escopo

- Exclusão física ou rota `DELETE`.
- Alteração de `price` e `durationMinutes` depois da criação.
- Paginação, busca textual ou ordenação configurável.
- Rotas públicas sem autenticação.
- Mudanças no schema Prisma ou criação de migration, pois a tabela `services` já foi adicionada pelo usuário.

## Contrato HTTP

| Método | Rota | Acesso | Resultado |
| --- | --- | --- | --- |
| `GET` | `/service` | Usuário autenticado | Lista somente serviços com `isActive = true` |
| `GET` | `/service/admin` | Administrador | Lista todos os serviços, ativos e inativos |
| `POST` | `/service` | Administrador | Cria um serviço ativo |
| `PATCH` | `/service/:id` | Administrador | Altera nome, descrição e/ou situação |

O guard global existente exige autenticação por padrão. As três operações administrativas usarão `@Roles(UserRole.ADMIN)`. Todas as rotas terão documentação Bearer no Swagger.

## Estrutura

```text
src/service/
├── dto/
│   ├── create-service.dto.ts
│   └── update-service.dto.ts
├── entities/
│   └── service.entity.ts
├── service.controller.ts
├── service.controller.spec.ts
├── service.service.ts
├── service.service.spec.ts
├── service.repository.ts
└── service.module.ts
```

`AppModule` importará `ServiceModule`.

## DTO de criação

Campos aceitos:

- `name`: texto obrigatório, entre 2 e 100 caracteres.
- `description`: texto opcional.
- `price`: número obrigatório maior ou igual a zero, com no máximo duas casas decimais.
- `durationMinutes`: inteiro obrigatório maior que zero.

`isActive` não será aceito. O serviço será criado ativo pela entidade/regra de criação e pelo valor padrão do banco.

## DTO de atualização

Campos opcionais aceitos:

- `name`: texto entre 2 e 100 caracteres.
- `description`: texto ou `null`, permitindo remover uma descrição existente.
- `isActive`: booleano.

`price` e `durationMinutes` não farão parte do DTO. O `ValidationPipe` global, configurado com `forbidNonWhitelisted`, rejeitará esses campos quando enviados.

O corpo de atualização precisa conter pelo menos um dos três campos permitidos; um objeto vazio será rejeitado com HTTP 400.

## Regras de negócio

- O nome será normalizado com `trim()` antes da persistência.
- Um nome já utilizado não poderá ser criado novamente.
- Na atualização, manter o próprio nome será permitido.
- Na atualização, usar o nome de outro serviço produzirá conflito.
- `description` ausente significa não alterar; `description: null` remove a descrição.
- Desativar um serviço preserva seu registro e seu futuro vínculo com históricos de agendamentos.
- Consultas retornarão os campos persistidos do serviço; não há dados sensíveis nesse recurso.

## Persistência

O repository encapsulará o Prisma e oferecerá operações específicas:

- selecionar ativos;
- selecionar todos;
- selecionar por ID;
- selecionar por nome;
- inserir;
- atualizar os campos permitidos.

A listagem será ordenada por nome em ordem crescente para produzir resposta determinística.

Conflitos da restrição única também serão traduzidos para HTTP 409, evitando erro 500 em cadastros concorrentes.

## Erros HTTP

- `400 Bad Request`: DTO inválido ou atualização vazia.
- `401 Unauthorized`: ausência ou invalidade do token.
- `403 Forbidden`: usuário autenticado sem perfil administrativo.
- `404 Not Found`: ID de serviço inexistente.
- `409 Conflict`: nome já utilizado por outro serviço.

## Testes

Os testes ficarão junto do código em arquivos `.spec.ts`, sem diretório separado.

### Controller e DTOs

- Confirma o encaminhamento da listagem de ativos.
- Confirma o encaminhamento da listagem administrativa.
- Valida que o DTO de criação não aceita `isActive` no pipeline global.
- Valida que o DTO de atualização não aceita `price` nem `durationMinutes`.
- Confirma os metadados de autorização administrativa das rotas protegidas.

### Service

- Cria um serviço ativo com UUID.
- Rejeita nome duplicado.
- Lista somente ativos pela operação comum.
- Lista todos pela operação administrativa.
- Atualiza somente os campos permitidos.
- Retorna 404 para ID inexistente.
- Permite conservar o próprio nome.
- Rejeita nome pertencente a outro serviço.
- Permite remover a descrição com `null`.

As dependências do banco serão substituídas no limite do repository. As regras reais do service, entidade e DTOs permanecerão em execução.

## Critérios de conclusão

- As quatro rotas estão registradas com a autorização definida.
- Os contratos rejeitam campos não permitidos.
- O build do backend passa.
- Os testes novos passam.
- A análise estática dos arquivos criados e alterados passa.
- Nenhuma alteração é feita no schema ou na migration já criada pelo usuário.
