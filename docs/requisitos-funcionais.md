# Requisitos Funcionais

## 1. Objetivo

Este documento descreve os requisitos funcionais do sistema de gerenciamento do salão Leila. O escopo contempla cadastro e autenticação de clientes, agendamentos, operação administrativa, catálogo de serviços e acompanhamento semanal.


## 2. Atores

| Ator | Descrição |
|---|---|
| Visitante | Pessoa ainda não autenticada, autorizada somente a criar uma conta de cliente e acessar o login. |
| Cliente | Usuário autenticado com perfil `CLIENT`, responsável por consultar serviços e administrar os próprios agendamentos. |
| Administrador | Usuário autenticado com perfil `ADMIN`, responsável pela operação do salão, catálogo, agendamentos e relatório semanal. |

## 3. Regras gerais do negócio

- O salão possui uma única profissional e só pode atender um agendamento por vez.
- O expediente ocorre de segunda-feira a sábado, sempre a partir das 08:00.
- De segunda a sexta-feira, o encerramento ocorre às 18:00; aos sábados, às 15:00.
- O intervalo de almoço ocorre diariamente das 12:00 às 13:00.
- Os horários iniciais são oferecidos em intervalos de 30 minutos.
- A duração real de um agendamento corresponde à soma da duração de seus serviços e pode terminar em um minuto que não seja múltiplo de 30.
- Datas e horas recebidas pela API devem informar explicitamente o fuso horário. Os instantes são tratados de forma consistente pelo backend e apresentados no fuso do salão.
- Agendamentos com status `COMPLETED` ou `CANCELED` são terminais e não podem ser alterados.
- Registros históricos não devem ser apagados. Serviços são desativados e usuários possuem campo de exclusão lógica.

## 4. Requisitos funcionais detalhados

### Módulo 0 — Autenticação e contas

### RF01 — Cadastro público de cliente

**Ator:** Visitante.

**Descrição:** O sistema deve permitir a criação pública de uma conta exclusivamente com perfil de cliente.

**Dados de entrada:** nome completo, e-mail, telefone e senha.

**Regras:**

- O campo de perfil não deve ser solicitado nem aceito como decisão do visitante; o backend deve atribuir `CLIENT` automaticamente.
- O nome deve possuir de 2 a 100 caracteres.
- O e-mail deve ser válido, possuir no máximo 100 caracteres e não pode estar associado a outra conta.
- O telefone deve conter 10 ou 11 dígitos.
- A senha deve possuir pelo menos 8 caracteres, incluindo letra maiúscula, letra minúscula, número e caractere especial permitido.
- A senha deve ser armazenada de forma protegida, nunca em texto puro.

**Resultado:** uma conta de cliente é criada e o visitante pode realizar login.

### RF02 — Autenticação de usuários

**Atores:** Cliente e administrador.

**Descrição:** O sistema deve autenticar usuários por e-mail e senha e direcioná-los à área correspondente ao perfil.

**Regras:**

- Credenciais inválidas não devem iniciar sessão.
- Após a autenticação, a API deve fornecer um token de acesso.
- A sessão do frontend pode ser mantida no armazenamento local.
- Clientes devem ser direcionados ao histórico de agendamentos.
- Administradores devem ser direcionados ao painel semanal.
- O usuário deve poder encerrar a sessão.

**Resultado:** sessão autenticada com permissões de `CLIENT` ou `ADMIN`.


### Módulo 1 — Área do cliente

### RF03 — Agendamento múltiplo de serviços

**Ator:** Cliente.

**Descrição:** O cliente deve poder criar um único agendamento contendo um ou mais serviços ativos.

**Fluxo principal:** selecionar serviços, escolher data, consultar horários, escolher horário e confirmar.

**Regras:**

- Deve ser selecionado ao menos um serviço.
- O mesmo serviço não pode ser repetido dentro do mesmo agendamento.
- Apenas serviços ativos podem ser utilizados.
- A duração e o preço total devem considerar todos os serviços escolhidos.
- O horário deve estar no futuro e começar em um intervalo válido de 30 minutos.
- Todo o atendimento deve caber no mesmo período de expediente, sem atravessar o intervalo de almoço ou o encerramento.
- O sistema deve impedir sobreposição com qualquer agendamento pendente ou confirmado.
- A disponibilidade deve ser revalidada no momento da gravação para evitar reserva concorrente do mesmo horário.

**Resultado:** agendamento criado com status `PENDING` e itens de serviço também iniciados como `PENDING`.

### RF04 — Sugestão de data na mesma semana

**Ator:** Cliente.

**Descrição:** Ao consultar a disponibilidade, o sistema deve verificar se o cliente já possui outro agendamento futuro na mesma semana.

**Regras:**

- A semana do salão deve ser considerada de segunda-feira a domingo para a busca, embora o atendimento só ocorra de segunda a sábado.
- Agendamentos cancelados não devem gerar sugestão.
- A sugestão deve informar a data do agendamento existente e permitir que o cliente a selecione.
- A decisão final permanece com o cliente.

**Resultado:** sugestão opcional de agrupamento dos serviços na data já agendada.

### RF05 — Alteração de agendamento pelo cliente

**Ator:** Cliente.

**Descrição:** O cliente deve poder alterar a data, o horário e a composição de serviços dos próprios agendamentos.

**Regras:**

- A alteração deve ocorrer com pelo menos 48 horas exatas de antecedência.
- Apenas agendamentos `PENDING` ou `CONFIRMED` podem ser alterados.
- As regras de serviços ativos, expediente, duração, intervalo de 30 minutos e conflito de horário devem ser revalidadas.
- Serviços mantidos no agendamento devem preservar seus dados históricos; novos serviços devem gerar novos registros históricos.
- O cliente só pode modificar agendamentos pertencentes à própria conta.

**Resultado:** agendamento atualizado sem perder seu histórico básico.

### RF06 — Bloqueio de alteração ou cancelamento com pouca antecedência

**Ator:** Cliente.

**Descrição:** O sistema deve bloquear alterações e cancelamentos online quando faltarem menos de 48 horas para o atendimento.

**Regras:**

- O limite deve ser calculado pela diferença exata entre o instante atual e o início agendado.
- Exatamente 48 horas devem permitir a operação.
- O bloqueio deve orientar o cliente a entrar em contato por telefone.
- A restrição deve ser aplicada tanto na interface quanto no backend.

**Resultado:** operação recusada com orientação clara de atendimento telefônico.

### RF07 — Consulta do histórico de agendamentos

**Ator:** Cliente.

**Descrição:** O cliente deve visualizar somente os próprios agendamentos e poder filtrá-los por período.

**Filtros:** data inicial e data final, no formato `YYYY-MM-DD` na API.

**Regras:**

- Os limites do período são opcionais.
- A data final deve ser considerada de forma inclusiva para o usuário.
- Um período cuja data inicial não seja anterior ao limite final deve ser recusado.
- Agendamentos cancelados e concluídos devem permanecer visíveis no histórico.

**Resultado:** lista dos agendamentos do cliente no período informado.

### RF08 — Detalhamento do agendamento

**Atores:** Cliente e administrador.

**Descrição:** O sistema deve exibir os dados completos de um agendamento selecionado.

**Dados exibidos:** identificação, cliente quando aplicável, data, horário inicial e final, duração, status geral, serviços, preço e duração históricos de cada serviço e status individual.

**Regras:**

- O cliente só pode consultar os próprios agendamentos.
- O administrador pode consultar qualquer agendamento.
- Um identificador inexistente ou não autorizado deve ser tratado como não encontrado.

### Módulo 2 — Operação administrativa

### RF09 — Cadastro de serviços

**Ator:** Administrador.

**Descrição:** O administrador deve cadastrar serviços no catálogo.

**Dados de entrada:** nome, descrição opcional, preço e duração em minutos.

**Regras:**

- O nome deve possuir de 2 a 100 caracteres e ser único.
- O preço não pode ser negativo e aceita no máximo duas casas decimais.
- A duração deve ser um número inteiro maior ou igual a 1 minuto.
- O serviço deve ser criado como ativo.

### RF10 — Consulta de serviços

**Atores:** Cliente e administrador.

**Descrição:** Usuários autenticados devem consultar o catálogo de serviços.

**Regras:**

- Clientes devem receber apenas serviços ativos.
- Administradores devem receber serviços ativos e inativos.
- A interface administrativa deve permitir pesquisa por nome ou descrição e filtro por situação.

### RF11 — Atualização de serviços

**Ator:** Administrador.

**Descrição:** O administrador deve atualizar nome, descrição e situação de um serviço existente.

**Regras:**

- O novo nome deve continuar respeitando tamanho e unicidade.
- A descrição pode ser alterada ou removida.
- Preço e duração não são editáveis no escopo atual, preservando a definição utilizada após o cadastro.
- Alterações no catálogo não devem modificar os snapshots presentes em agendamentos anteriores.

### RF12 — Desativação e reativação de serviços

**Ator:** Administrador.

**Descrição:** O administrador deve retirar um serviço do catálogo por desativação lógica e deve poder reativá-lo posteriormente.

**Regras:**

- O registro não deve ser apagado.
- Um serviço inativo não deve aparecer para clientes nem ser aceito em novos agendamentos ou alterações.
- Agendamentos antigos devem continuar exibindo nome, preço e duração registrados na ocasião.

### RF13 — Alteração administrativa de agendamento

**Ator:** Administrador.

**Descrição:** O administrador deve alterar data, horário e serviços de qualquer agendamento ativo, sem a restrição de 48 horas.

**Regras:**

- Somente agendamentos `PENDING` ou `CONFIRMED` podem ser alterados.
- A exceção administrativa remove apenas a antecedência mínima; expediente, disponibilidade, duração e conflitos continuam obrigatórios.
- Serviços podem ser adicionados ou removidos enquanto o agendamento estiver ativo.
- Um cancelamento administrativo deve mudar o agendamento e todos os seus serviços para `CANCELED`.

### RF14 — Listagem administrativa de agendamentos

**Ator:** Administrador.

**Descrição:** O administrador deve visualizar todos os agendamentos recebidos, independentemente do cliente ou status.

**Informações resumidas:** cliente, data, horário, serviços, valor e status.

**Recursos de interface:** pesquisa por cliente ou código, filtro por período, filtro por status e acesso ao detalhamento.

### RF15 — Confirmação de agendamento

**Ator:** Administrador.

**Descrição:** O administrador deve confirmar um agendamento pendente.

**Regras:**

- Apenas agendamentos `PENDING` podem ser confirmados.
- A confirmação deve alterar o status geral para `CONFIRMED`.
- Os serviços pendentes do agendamento devem ser confirmados em conjunto.

**Resultado:** horário reservado e agendamento confirmado para atendimento.

### RF16 — Gestão individual do status dos serviços

**Ator:** Administrador.

**Descrição:** O administrador deve atualizar separadamente o status de cada serviço solicitado.

**Status permitidos:** `PENDING`, `CONFIRMED`, `COMPLETED` e `CANCELED`.

**Regras:**

- O serviço deve pertencer ao agendamento informado.
- Serviços de agendamentos concluídos ou cancelados não podem ser alterados.
- Um serviço já concluído ou cancelado não pode voltar a outro estado.
- O agendamento geral só pode ser marcado como `COMPLETED` quando todos os seus serviços estiverem `COMPLETED`.
- Ao cancelar o agendamento, todos os serviços ainda relacionados devem ficar `CANCELED`.

### Módulo 3 — Visão gerencial

### RF17 — Acompanhamento semanal de desempenho

**Ator:** Administrador.

**Descrição:** O administrador deve consultar indicadores do salão para uma semana selecionada e navegar entre semanas.

**Indicadores apresentados na interface:** total de agendamentos, receita estimada, pendentes, confirmados, concluídos, cancelados, quantidade de serviços previstos e taxa de ocupação.

**Dados calculados pela API:**

- Quantidade de agendamentos e serviços por status.
- Taxa de cancelamento.
- Receita concluída, estimada e perdida por cancelamento.
- Minutos disponíveis, agendados e concluídos.
- Taxa de ocupação.
- Clientes únicos agendados, clientes atendidos e novos clientes.
- Cinco serviços mais solicitados.
- Comparação percentual com a semana anterior.

**Regras:**

- A semana deve ser determinada a partir da data de referência informada.
- A capacidade disponível deve considerar os horários de funcionamento e descontar o almoço.
- Agendamentos cancelados não devem compor os minutos ocupados.
- Valores financeiros devem usar os preços históricos dos serviços agendados.

## 5. Matriz de rastreabilidade das operações

| Requisito | Operação principal da API | Acesso |
|---|---|---|
| RF01 | `POST /user` | Público |
| RF02 | `POST /auth/login` | Público |
| RF03 | `POST /appointment` | Autenticado |
| RF04 | `GET /appointment/availability` | Autenticado |
| RF05 | `PATCH /appointment/:id` | Cliente proprietário |
| RF06 | `PATCH /appointment/:id` e `PATCH /appointment/:id/cancel` | Cliente proprietário |
| RF07 | `GET /appointment/history` | Cliente autenticado |
| RF08 | `GET /appointment/:id` | Proprietário ou administrador |
| RF09 | `POST /service` | Administrador |
| RF10 | `GET /service` e `GET /service/admin` | Autenticado / administrador |
| RF11–RF12 | `PATCH /service/:id` | Administrador |
| RF13 | `PATCH /appointment/admin/:id` | Administrador |
| RF14 | `GET /appointment/admin` | Administrador |
| RF15 | `PATCH /appointment/admin/:id/status` | Administrador |
| RF16 | `PATCH /appointment/admin/:appointmentId/services/:appointmentServiceId/status` | Administrador |
| RF17 | `GET /report/weekly` | Administrador |
