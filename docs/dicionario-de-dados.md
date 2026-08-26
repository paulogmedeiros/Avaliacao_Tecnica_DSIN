# Dicionário de Dados

## 1. Objetivo

Este documento descreve a estrutura persistente do sistema de gerenciamento do salão Leila com base no schema Prisma atual.

## 2. Estrutura de dados

### 2.1 Convenções

| Símbolo | Significado |
|---|---|
| PK | Chave primária. |
| FK | Chave estrangeira. |
| UK | Restrição de unicidade. |
| NN | Campo obrigatório, não aceita `NULL`. |
| AI | Valor autoincrementado. |
| Snapshot | Cópia histórica que não deve acompanhar mudanças futuras no cadastro original. |

### 2.2 Tabela `users`

Armazena clientes e administradores autorizados a acessar o sistema.

| Campo Prisma | Coluna física | Tipo | Restrições/default | Descrição |
|---|---|---|---|---|
| `id` | `id` | `VARCHAR(36)` | PK, NN | Identificador UUID do usuário. |
| `name` | `name` | `VARCHAR(255)` | NN | Nome do usuário. A entrada pública é validada entre 2 e 100 caracteres. |
| `email` | `email` | `VARCHAR(255)` | UK, NN | E-mail utilizado na autenticação. |
| `password` | `password` | `VARCHAR(255)` | NN | Hash da senha; não deve armazenar a senha em texto puro. |
| `phone` | `phone` | `VARCHAR(20)` | NN | Telefone do usuário, recebido com 10 ou 11 dígitos. |
| `role` | `role` | `ENUM UserRole` | NN, default `CLIENT` | Perfil de autorização do usuário. |
| `createdAt` | `created_at` | `TIMESTAMP(0)` | NN, default atual | Data e hora de criação. |
| `updatedAt` | `updated_at` | `TIMESTAMP(0)` | NN, atualização automática | Data e hora da última alteração. |
| `deletedAt` | `deleted_at` | `TIMESTAMP(0)` | Opcional | Momento da exclusão lógica do usuário. |

**Relacionamento:** um usuário pode possuir zero ou muitos registros em `appointments`.

### 2.3 Tabela `services`

Armazena o catálogo de serviços oferecidos pelo salão.

| Campo Prisma | Coluna física | Tipo | Restrições/default | Descrição |
|---|---|---|---|---|
| `id` | `id` | `VARCHAR(36)` | PK, NN | Identificador UUID do serviço. |
| `name` | `name` | `VARCHAR(100)` | UK, NN | Nome único do serviço. |
| `description` | `description` | `TEXT` | Opcional | Descrição apresentada no catálogo. |
| `price` | `price` | `DECIMAL(10,2)` | NN | Preço atual do serviço. Deve ser maior ou igual a zero. |
| `durationMinutes` | `duration_minutes` | `INT` | NN | Duração atual em minutos, com valor mínimo 1. |
| `isActive` | `is_active` | `BOOLEAN` | NN, default `TRUE` | Indica se o serviço pode ser usado em novos agendamentos. |
| `createdAt` | `createdAt` | `TIMESTAMP(0)` | NN, default atual | Data e hora de criação. |
| `updatedAt` | `updatedAt` | `TIMESTAMP(0)` | NN, atualização automática | Data e hora da última alteração. |

**Índice:** composto por `is_active` e `name`, utilizado para listar o catálogo ativo.

**Relacionamento:** um serviço pode aparecer em zero ou muitos registros de `appointment_services`.

### 2.4 Tabela `business_hours`

Armazena a configuração do expediente para cada dia atendido.

| Campo Prisma | Coluna física | Tipo | Restrições/default | Descrição |
|---|---|---|---|---|
| `id` | `id` | `INT` | PK, AI, NN | Identificador interno da configuração. |
| `dayOfWeek` | `day_of_week` | `ENUM DayOfWeek` | UK, NN | Dia da semana. Existe no máximo uma configuração por dia. |
| `openingTime` | `opening_time` | `TIME(0)` | NN | Horário de abertura. |
| `lunchStart` | `lunch_start` | `TIME(0)` | NN | Início da pausa para almoço. |
| `lunchEnd` | `lunch_end` | `TIME(0)` | NN | Fim da pausa para almoço. |
| `closingTime` | `closing_time` | `TIME(0)` | NN | Horário de encerramento. |
| `createdAt` | `created_at` | `DATETIME(0)` | NN, default atual | Data e hora de criação. |
| `updatedAt` | `updated_at` | `DATETIME(0)` | NN, atualização automática | Data e hora da última alteração. |

**Configuração funcional atual:** segunda a sexta, 08:00–12:00 e 13:00–18:00; sábado, 08:00–12:00 e 13:00–15:00. Domingo não possui registro.

### 2.5 Tabela `appointments`

Representa o agendamento geral realizado por um cliente.

| Campo Prisma | Coluna física | Tipo | Restrições/default | Descrição |
|---|---|---|---|---|
| `id` | `id` | `VARCHAR(36)` | PK, NN | Identificador UUID do agendamento. |
| `clientId` | `client_id` | `VARCHAR(36)` | FK → `users.id`, NN | Cliente proprietário do agendamento. |
| `startAt` | `start_at` | `DATETIME(0)` | NN | Instante de início do atendimento. |
| `endAt` | `end_at` | `DATETIME(0)` | NN | Instante calculado pelo início mais a soma das durações. |
| `status` | `status` | `ENUM AppointmentStatus` | NN, default `PENDING` | Estado geral do agendamento. |
| `createdAt` | `created_at` | `DATETIME(0)` | NN, default atual | Data e hora de criação. |
| `updatedAt` | `updated_at` | `DATETIME(0)` | NN, atualização automática | Data e hora da última alteração. |

**Índices:**

- `client_id, start_at`: histórico e busca semanal do cliente.
- `start_at, end_at, status`: verificação de conflitos e consultas por período.

**Relacionamentos:** pertence a um usuário e possui um ou muitos itens em `appointment_services`.

### 2.6 Tabela `appointment_services`

Tabela associativa e histórica entre agendamentos e serviços. Cada linha representa um serviço solicitado dentro de um agendamento.

| Campo Prisma | Coluna física | Tipo | Restrições/default | Descrição |
|---|---|---|---|---|
| `id` | `id` | `VARCHAR(36)` | PK, NN | Identificador UUID do item agendado. |
| `appointmentId` | `appointment_id` | `VARCHAR(36)` | FK → `appointments.id`, NN | Agendamento ao qual o item pertence. |
| `serviceId` | `service_id` | `VARCHAR(36)` | FK → `services.id`, NN | Serviço original utilizado como referência. |
| `sequence` | `sequence` | `UNSIGNED SMALLINT` | NN | Ordem de execução/apresentação dentro do agendamento. |
| `serviceNameSnapshot` | `service_name_snapshot` | `VARCHAR(100)` | NN, snapshot | Nome do serviço no momento da inclusão. |
| `servicePriceSnapshot` | `service_price_snapshot` | `DECIMAL(10,2)` | NN, snapshot | Preço do serviço no momento da inclusão. |
| `serviceDurationSnapshot` | `service_duration_snapshot` | `INT` | NN, snapshot | Duração do serviço no momento da inclusão. |
| `status` | `status` | `ENUM AppointmentStatus` | NN, default `PENDING` | Estado individual do serviço solicitado. |
| `createdAt` | `created_at` | `DATETIME(0)` | NN, default atual | Data e hora de inclusão. |
| `updatedAt` | `updated_at` | `DATETIME(0)` | NN, atualização automática | Data e hora da última alteração. |

**Restrições:**

- `appointment_id, service_id` é único: o mesmo serviço não pode aparecer duas vezes no mesmo agendamento.
- `appointment_id, sequence` é único: duas etapas não podem ocupar a mesma posição.
- Existem índices individuais para `service_id` e `status`.

**Relacionamentos:** cada item pertence a exatamente um agendamento e referencia exatamente um serviço do catálogo.

### 2.7 Enum `UserRole`

| Valor | Significado |
|---|---|
| `CLIENT` | Cliente autorizado a gerenciar somente os próprios agendamentos. |
| `ADMIN` | Operador autorizado a acessar funções administrativas e gerenciais. |

### 2.8 Enum `DayOfWeek`

| Valor | Significado |
|---|---|
| `MONDAY` | Segunda-feira. |
| `TUESDAY` | Terça-feira. |
| `WEDNESDAY` | Quarta-feira. |
| `THURSDAY` | Quinta-feira. |
| `FRIDAY` | Sexta-feira. |
| `SATURDAY` | Sábado. |

O enum não possui domingo porque o salão não funciona nesse dia.

### 2.9 Enum `AppointmentStatus`

| Valor | Significado | Natureza |
|---|---|---|
| `PENDING` | Aguardando confirmação administrativa. | Ativo |
| `CONFIRMED` | Confirmado e com horário reservado. | Ativo |
| `COMPLETED` | Atendimento ou serviço concluído. | Terminal |
| `CANCELED` | Agendamento ou serviço cancelado, mantido no histórico. | Terminal |

## 3. Relacionamentos resumidos

```text
users (1) ──────── (N) appointments
                         │
                         │ 1
                         │
                         N
                appointment_services
                         N
                         │
                         │ 1
                      services

business_hours: configuração independente usada para calcular disponibilidade
```

