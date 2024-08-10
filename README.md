## Descrição

Exemplo de aplicação para autorização de transações. Onde se deve processar a transação, validando a disponibilidade de saldo da conta de origem.

Cada transação possui uma tipagem, definido pelo código MCC, assim o saldo a ser levado em consideração na autorização deve ser o referente aquele tipo.

Há um tipo principal, onde o mesmo pode ser usado fallback para caso transações sem disponibilidade de saldo de outros tipos.

### Installation

```bash
$ yarn install
```

### Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

### Test

```bash
# unit tests
$ yarn run test

# test coverage
$ yarn run test:cov
```

### Database Setup

```bash

# initialize postgres 
$ docker-compose up -d

# migrate database schema
$ yarn run setup:database:migrate

# seed database
$ yarn run setup:database:seed
```

## Definições da aplicação

### Definição do endpoint
```json
POST /transactions/authorize
BODY {
  id: string, // id da transação
  account: string, // id da conta de origem da transação
  amount: number, // valor da transação
  mcc: string, // 4 dígitos
  merchant: string, // estabelecimento da transação
}
RESPONSES
{"code": "00"} // autorização com sucesso
{"code": "51"} // falta de saldo
{"code": "07"} // erro na autorização
```

### Relação Tipo x MCC
```
{
  food: ["5411", "5412"],
  meal: ["5811", "5812"],
  cash: any
}
```

### Ferramentas utilizadas
- **NestJs**: Framework Node + Typescript, fornecendo boilerplate da aplicação, trazendo injeção de dependência, controle de testes, estrutura de módulos, entre outros.
- **Knex**: Query builder para uso na integração com a base de dados, permitindo maior controle/flexibilidade que ORMs.
- **Postgres**: Base de dados utilizada no projeto.
- **K6**: Utilizado durante o desenvolvimento da aplicação para realização de testes de performance x carga e para simulação de paralelismo.

### Decisões

#### Estrutura do projeto
Uso de injeção de dependência e abstração da camada de aplicação (repositories/integraçao com base de dados), permitindo maior flexibilidade na mudança de ferramentas.

#### Domínio x Repository
A regra de negócio da aplicação foi implementada na camada de domínio, assim mantendo suas regras centralizadas. Ou seja, regra de autorização, incluindo validação e cálculo de saldo, decisão de resposta e retentativas de autorização realizadas na camada de domínio (_UseCase_ e Entidades).

A implementação do respository é _responsável_ apenas para controlar a integração com o banco de dados, sendo buscas, inserções e atualização de novos dados e controle de _transactions_.

#### Controle de concorrência de transações de mesma conta
A realização da atualização do saldo e formalização da compra é realizada em _transactions_, que bloqueiam o uso do dado de conta (uso ___forUpdate___). Como toda a regra de cálculo é realizada na camada de domínio, é realizado uma checagem da consistência do dado da conta durante a execução da _transaction_, caso o dado esteja incossistente a _transaction_ é abortada emitindo erro. Assim o próprio _useCase_ se encarrega a decisão de realizar o retry, reprocessando a compra.

#### Clusterização da aplicação
Dado que o NodeJs é _single-threading_, para algumas aplicação de dependem de maior performance, poder ser oportuno o uso da solução de _Cluster_ oferecido pela ferramenta. Assim é possível executar a mesma como _multi-threading_

### Possíveis melhorias no projeto
Dado um projeto de exemplo e para estudo, alguns pontos não foram contemplados. Assim possíveis melhorias são:
- Melhoria na tipagem dos valores númericos, seguindo o formato de moeda e controlando melhor os cálculos feitos. 
- Criação de uma tabela específica para o saldo de uma conta por tipo, sendo um relação Conta 1:N SaldoTipo. Assim, o bloqueio realizado durante a autorização será feito apenas no saldo de um tipo da conta, permitindo mais execuções em paralelo, até mesmo considerando a mesma conta, podemos melhorar a performance da aplicação.
- Criação dos relacionamentos dentro das tabelas, permitindo queries mais complexas na base de dados. Dado a simplicidade do projeto e o contexto, essa relação foi considerada apenas na própria implementação do código.
- Criação de um cache para estabalecimentos, diminuindo a quantidade de chamadas ao banco pra busca dos mesmos, melhorando a performance da aplicação.
- Emissão de eventos durante o fluxo de autorização, criando uma arquitetura mais _event-driven_, disponibilizando os resultados para outros serviços.
- Adição de logs, ferramentas de observabilidade e _health checks_.
