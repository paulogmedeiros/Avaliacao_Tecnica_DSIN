# Leila — Sistema de Gerenciamento de Salão

Aplicação web desenvolvida para apoiar a operação do salão de beleza Leila. O sistema permite que clientes criem contas, consultem serviços, encontrem horários disponíveis e gerenciem seus próprios agendamentos. A área administrativa concentra a agenda completa do salão, a confirmação e atualização dos atendimentos, o gerenciamento individual dos serviços solicitados, o catálogo de serviços e os indicadores semanais de desempenho.

O projeto considera a operação de uma única profissional, portanto somente um agendamento pode ocupar determinado período. O salão funciona de segunda a sábado, possui intervalo de almoço e oferece horários iniciais em intervalos de 30 minutos, respeitando a duração total dos serviços escolhidos.

## Funcionalidades principais

### Área do cliente

- Cadastro público e autenticação.
- Consulta do catálogo de serviços ativos.
- Criação de agendamento com um ou vários serviços.
- Consulta de horários disponíveis conforme duração, expediente e agenda existente.
- Sugestão para concentrar serviços na mesma data quando já existir agendamento na semana.
- Histórico com filtro por período e detalhamento completo.
- Alteração e cancelamento online com antecedência mínima de 48 horas.

### Área administrativa

- Dashboard semanal com indicadores operacionais e financeiros.
- Listagem e detalhamento de todos os agendamentos.
- Alteração administrativa sem restrição de 48 horas.
- Confirmação e cancelamento de agendamentos.
- Atualização individual do status de cada serviço solicitado.
- Cadastro, consulta, edição, desativação e reativação de serviços.

## Tecnologias utilizadas

### Frontend

| Tecnologia | Versão do projeto | Utilização |
|---|---:|---|
| React | 19.2.8 | Construção da interface. |
| React DOM | 19.2.8 | Renderização da aplicação no navegador. |
| React Router DOM | 7.18.2 | Rotas públicas, de cliente e administrativas. |
| TanStack Query | 5.102.3 | Consultas, mutações e sincronização com a API. |
| Axios | 1.19.0 | Comunicação HTTP com o backend. |
| Zustand | 5.0.15 | Estado da autenticação e persistência da sessão. |
| Tailwind CSS | 4.3.3 | Infraestrutura de estilos disponível no projeto. |
| Vite | 8.2.2 | Servidor de desenvolvimento e build. |
| TypeScript | 6.0.2 | Tipagem estática. |

### Backend

| Tecnologia | Versão do projeto | Utilização |
|---|---:|---|
| Node.js | 22.12.0 | Ambiente utilizado no desenvolvimento. |
| NestJS | 11.x | API REST, módulos, validações e autorização. |
| Prisma ORM | 7.9.1 | Mapeamento e acesso ao banco de dados. |
| MySQL | 8.0 ou superior | Banco de dados relacional. |
| MariaDB Connector | 3.5.3 | Driver utilizado pelo adaptador Prisma. |
| JWT | 11.0.2 | Autenticação baseada em token. |
| bcrypt | 6.0.0 | Hash e verificação de senhas. |
| class-validator | 0.15.1 | Validação dos dados recebidos pela API. |
| Swagger | 11.4.7 | Documentação interativa dos endpoints. |
| Jest | 30.0.0 | Testes automatizados do backend. |
| TypeScript | 5.7.3 | Tipagem e compilação do backend. |


## Requisitos para o funcionamento

Antes de iniciar, instale:

- [Node.js](https://nodejs.org/) **22.12 ou superior**.
- npm **10 ou superior**.
- MySQL Server **8.0 ou superior**.
- Um cliente para executar scripts SQL, como MySQL Workbench, DBeaver ou o cliente mysql no terminal.

## Documentação do projeto

O diretório [`docs`](docs) contém a documentação funcional e de banco de dados:

- [Requisitos funcionais](docs/requisitos-funcionais.md): atores, regras de negócio, requisitos detalhados e rastreabilidade com a API.
- [Dicionário de dados](docs/dicionario-de-dados.md): tabelas, campos, tipos, restrições, enums e relacionamentos.
- [Diagrama de Entidades e Relacionamentos — DER](docs/Diagrama_de_entidades_e_relacionamentos.png): representação visual da estrutura do banco.

A API também disponibiliza a documentação interativa do Swagger em `http://localhost:3000/api` enquanto o backend estiver em execução.

## Estrutura principal

```text
.
├── backend/       # API NestJS
├── frontend/      # Aplicação React
├── docs/          # Requisitos, dicionário de dados e DER
├── db.sql         # Estrutura do banco e dados iniciais
└── README.md
```

## Instalação e execução

### 1. Obtenha o projeto

Clone o repositório ou baixe e extraia seus arquivos. Depois, abra um terminal na pasta raiz, onde estão `db.sql`, `frontend` e `backend`.

### 2. Crie e popule o banco de dados

O arquivo [`db.sql`](db.sql) cria o banco `dsin_db`, suas tabelas e os dados iniciais necessários, incluindo usuários, serviços e horários de funcionamento.

Em um banco MySQL local e novo, execute todo o conteúdo de `db.sql` pelo MySQL Workbench ou outro cliente SQL.

### 3. Instale e configure o frontend

Abra um terminal na raiz do projeto e acesse o frontend:

```bash
cd frontend
npm install
```

Crie o arquivo `.env` com base em `.env.example`.


Configure as variáveis:

```env
VITE_API_URL=http://localhost:3000
VITE_PORT=5173
```

| Variável | Obrigatória | Descrição |
|---|---|---|
| `VITE_API_URL` | Sim | Endereço base da API. |
| `VITE_PORT` | Não | Porta do frontend; utiliza `5173` quando não informada. |

Inicie o frontend:

```bash
npm run dev
```

A interface estará disponível normalmente em `http://localhost:5173`.

### 4. Instale e configure o backend

Abra outro terminal na raiz do projeto:

```bash
cd backend
npm install
```

Crie o arquivo `.env`

Configure o arquivo `.env`:

```env
DATABASE_URL="mysql://USUARIO:SENHA@localhost:3306/dsin_db"
PORT=3000
JWT_SECRET="substitua-por-uma-chave-secreta-forte"
FRONTEND_URL="http://localhost:5173"
```

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | Sim | URL de conexão com o banco `dsin_db`. |
| `JWT_SECRET` | Sim | Chave usada para assinar os tokens de autenticação. Use um valor longo e privado. |
| `PORT` | Não | Porta da API; utiliza `3000` por padrão. |
| `FRONTEND_URL` | Não | Origem liberada pelo CORS; utiliza `http://localhost:5173` por padrão. |

Se a senha do banco possuir caracteres especiais, eles devem ser codificados para utilização em URL.

Com o MySQL em execução e o `.env` configurado, sincronize o schema Prisma com o banco existente:

```bash
npx prisma db pull
```

Esse comando lê o banco criado por `db.sql` e atualiza o mapeamento da ORM.

Em seguida, gere o Prisma Client e suas tipagens:

```bash
npx prisma generate
```

Inicie o backend em modo de desenvolvimento:

```bash
npm run start:dev
```

A API estará disponível em `http://localhost:3000` e o Swagger em `http://localhost:3000/api`.

### 5. Acesse o sistema

Com o frontend e o backend ativos em terminais separados, abra:

```text
http://localhost:5173
```

## Usuários iniciais

O `db.sql` já inclui duas contas para demonstração:

| Perfil | E-mail | Senha |
|---|---|---|
| Administrador | `admin@salao.com` | `StrongPass123!` |
| Cliente | `maria.souza@example.com` | `StrongPass123!` |

## Comandos úteis

### Frontend

```bash
npm run dev      # inicia o servidor de desenvolvimento
npm run build    # gera o build de produção
```

### Backend

```bash
npm run start:dev  # inicia a API com recarregamento automático
npm run build      # compila o backend
npm run test       # executa os testes unitários
```
